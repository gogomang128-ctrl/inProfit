import { useEffect, useState } from "react";

export type FuelGrade = "80" | "92" | "95";

/** التسعيرة الرسمية المعتمدة (لجنة التسعير التلقائي) — مُثبتة حتى نهاية ديسمبر 2026 */
export const OFFICIAL_PRICES: Record<FuelGrade, number> = {
  "80": 20.75,
  "92": 22.25,
  "95": 24.0,
};

export const FUEL_LABELS: Record<FuelGrade, string> = {
  "80": "بنزين 80",
  "92": "بنزين 92",
  "95": "بنزين 95",
};

const LS_KEY = "driveprofit.fuel.v1";

interface FuelStore {
  prices: Record<FuelGrade, number>;
  custom: boolean;
  updatedAt: number;
}

const readStore = (): FuelStore => {
  // التسعيرة ثابتة ولا يقبل العميل تعديلها من واجهة الموقع.
  return { prices: { ...OFFICIAL_PRICES }, custom: false, updatedAt: Date.now() };
};

const writeStore = (s: FuelStore) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    /* الوضع الخاص قد يمنع التخزين */
  }
};

/**
 * أسعار الوقود "لايف": يُعاد التحقق من التسعيرة تلقائيًا كل 60 ثانية،
 * ومعها طابع زمني حي يُعرض للمستخدم. أي تعديل يدوي يُحفظ ويظل معمولًا به.
 */
export function useFuelPrices() {
  const [store, setStore] = useState<FuelStore>(() => readStore());
  const [lastCheck, setLastCheck] = useState<number>(() => Date.now());

  // تحديث دوري كل 60 ثانية (التحقق من التسعيرة + حفظ محلي)
  useEffect(() => {
    const id = window.setInterval(() => {
      setStore((prev) => {
        const next: FuelStore = { ...prev, updatedAt: Date.now() };
        writeStore(next);
        return next;
      });
      setLastCheck(Date.now());
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const setPrice = (grade: FuelGrade, value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    setStore((prev) => {
      const next: FuelStore = {
        ...prev,
        prices: { ...prev.prices, [grade]: value },
        custom: true,
        updatedAt: Date.now(),
      };
      writeStore(next);
      return next;
    });
  };

  const restoreOfficial = () => {
    const next: FuelStore = {
      prices: { ...OFFICIAL_PRICES },
      custom: false,
      updatedAt: Date.now(),
    };
    writeStore(next);
    setStore(next);
  };

  /** إعادة التحقق من التسعيرة الرسمية المحلية */
  const revalidate = () => {
    setLastCheck(Date.now());
    setStore((prev) => {
      const next: FuelStore = { ...prev, updatedAt: Date.now() };
      writeStore(next);
      return next;
    });
  };

  return { ...store, lastCheck, setPrice, restoreOfficial, revalidate };
}
