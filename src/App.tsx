import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Intro from "@/components/Intro";
import Bubble from "@/components/Bubble";
import TripTab, { type TripState } from "@/components/TripTab";
import MapTab from "@/components/MapTab";
import GarageTab from "@/components/GarageTab";
import Logo from "@/components/Logo";
import { DEFAULT_VEHICLE_ID, getVehicle, type Vehicle } from "@/data/vehicles";
import { calcTrip } from "@/lib/calc";
import { useFuelPrices, type FuelGrade } from "@/lib/fuel";
import { beep, setAudioEnabled } from "@/lib/audio";
import {
  endSession,
  hasSession,
  loadSetting,
  loadUser,
  saveSetting,
  saveUser,
  type DriverUser,
} from "@/lib/store";

type Tab = "trip" | "map" | "garage";
interface Toast {
  id: number;
  title: string;
  msg: string;
  level: "info" | "warn" | "danger";
}

const ICONS: Record<Tab, ReactNode> = {
  trip: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M8 7h8M8 11.5h3M8 15.5h3M14.5 11.5h1.5M14.5 15.5h1.5" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s-6.5-5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 16 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  garage: (
    <>
      <path d="M4 15.5h16M6.5 15.5l1.7-5.2A2.4 2.4 0 0 1 10.5 8.6h3a2.4 2.4 0 0 1 2.3 1.7l1.7 5.2" />
      <path d="M4 15.5v3.2h2.6v-1.6M20 15.5v3.2h-2.6v-1.6" />
    </>
  ),
};

export default function App() {
  const [user, setUser] = useState<DriverUser | null>(() => loadUser());
  const [loggedIn, setLoggedIn] = useState<boolean>(() => !!loadUser() && hasSession());
  const [tab, setTab] = useState<Tab>("trip");
  const [toast, setToast] = useState<Toast | null>(null);

  const fuel = useFuelPrices();
  const [grade, setGrade] = useState<FuelGrade>(() => loadSetting<FuelGrade>("fuelGrade", "92"));
  const [vehicleId, setVehicleId] = useState<string>(() =>
    loadSetting<string>("vehicleId", DEFAULT_VEHICLE_ID),
  );
  const [customL100, setCustomL100] = useState<number | null>(null);
  const [audioOn, setAudioOn] = useState<boolean>(() => loadSetting("audio", true));
  const [trip, setTrip] = useState<TripState>(() =>
    loadSetting<TripState>("trip", { tripKm: 7.5, pickupKm: 1.2, fare: 85, wearPercent: 10 }),
  );

  const vehicle: Vehicle = getVehicle(vehicleId) ?? getVehicle(DEFAULT_VEHICLE_ID)!;
  const l100 = customL100 ?? vehicle.liters_per_100km_avg;
  const fuelPrice = fuel.prices[grade];

  const result = calcTrip({
    tripKm: trip.tripKm,
    pickupKm: trip.pickupKm,
    fare: trip.fare,
    wearPercent: trip.wearPercent,
    l100,
    fuelPrice,
    isMotorcycle: vehicle.type === "motorcycle",
  });

  /* إشعارات */
  const notify = useCallback((a: { title: string; msg: string; level: Toast["level"] }) => {
    setToast({ ...a, id: Date.now() + Math.random() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setAudioEnabled(audioOn);
    saveSetting("audio", audioOn);
  }, [audioOn]);
  useEffect(() => {
    saveSetting("trip", trip);
  }, [trip]);
  useEffect(() => {
    saveSetting("fuelGrade", grade);
  }, [grade]);

  /* تنبيه الرحلة الخاسرة (مرة واحدة عند تغيّر الحالة) */
  const lastVerdict = useRef(result.verdict);
  useEffect(() => {
    if (result.verdict !== lastVerdict.current) {
      const was = lastVerdict.current;
      lastVerdict.current = result.verdict;
      if (result.verdict === "loss") {
        notify({
          title: "رحلة خاسرة",
          msg: `التكلفة ${result.expense.toFixed(1)} ج مقابل سعر ${trip.fare} ج — اطلب على الأقل ${result.recommendedFare} ج.`,
          level: "danger",
        });
        beep("danger");
      } else if (result.verdict === "win" && was === "loss") {
        beep("info");
      }
    }
  }, [result, trip.fare, notify]);

  const handleLogin = (u: DriverUser) => {
    saveUser(u);
    setUser(u);
    setLoggedIn(true);
    beep("info");
  };

  const logout = () => {
    endSession();
    setLoggedIn(false);
    setTab("trip");
  };

  if (!loggedIn || !user) {
    return <Intro existing={user} onLogin={handleLogin} />;
  }

  const tabs: Array<{ k: Tab; label: string }> = [
    { k: "trip", label: "حاسبة الرحلة" },
    { k: "map", label: "الخريطة" },
    { k: "garage", label: "المركبة" },
  ];

  const toastColor =
    toast?.level === "danger"
      ? { border: "#F04438", text: "#FF7B72", bg: "rgba(240,68,56,0.12)" }
      : toast?.level === "warn"
        ? { border: "#F2A900", text: "#F2A900", bg: "rgba(242,169,0,0.12)" }
        : { border: "#31C48D", text: "#31C48D", bg: "rgba(49,196,141,0.12)" };

  return (
    <div className="min-h-[100dvh] bg-[#0A0F0D] pb-24 text-white">
      {/* الفقاعة العائمة فوق كل شيء */}
      <Bubble
        result={result}
        vehicleName={`${vehicle.brand_ar} ${vehicle.model}`}
        fuelPrice={fuelPrice}
        fuelGrade={`بنزين ${grade}`}
        audioOn={audioOn}
        active={tab === "map"}
        onToggleAudio={() => setAudioOn((v) => !v)}
        onOpenTrip={() => setTab("trip")}
      />

      {/* شريط علوي */}
      <header className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo size={38} />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-black leading-tight">
              أهلاً {user.name.split(" ")[0]}
            </h1>
            <p className="num truncate text-[10px] font-bold text-[#8FA39B]">
              {vehicle.brand_ar} {vehicle.model} • {l100.toFixed(2)} لتر/100كم
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-lg border border-[#1E2B26] bg-[#0D1412] px-2.5 py-1.5 text-[10px] font-black text-[#F2A900]">
          {fuelPrice.toFixed(2)} ج/لتر
        </span>
      </header>

      {/* إشعار ذكي */}
      {toast && (
        <div className="mx-auto mt-3 max-w-3xl px-4">
          <div
            className="flex items-start gap-2.5 rounded-xl border px-3 py-2.5 backdrop-blur"
            style={{
              borderColor: toastColor.border,
              background: toastColor.bg,
            }}
          >
            <span
              className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: toastColor.text }}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-[12px] font-black" style={{ color: toastColor.text }}>
                {toast.title}
              </h4>
              <p className="mt-0.5 text-[11px] leading-relaxed text-[#C9D4CF]">{toast.msg}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              aria-label="إغلاق التنبيه"
              className="shrink-0 text-[#8FA39B] hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* المحتوى */}
      <main className="mx-auto mt-4 max-w-3xl px-4">
        {tab === "trip" && (
          <TripTab
            vehicle={vehicle}
            l100={l100}
            fuelPrice={fuelPrice}
            result={result}
            trip={trip}
            setTrip={setTrip}
            onVehicleChange={(v) => {
              setVehicleId(v.id);
              setCustomL100(null);
              setGrade(v.fuel_type);
              saveSetting("vehicleId", v.id);
              saveSetting("fuelGrade", v.fuel_type);
            }}
          />
        )}

        {tab === "map" && (
          <MapTab
            vehicle={vehicle}
            l100={l100}
            fuelPrice={fuelPrice}
            active={tab === "map"}
            notify={notify}
          />
        )}

        {tab === "garage" && (
          <GarageTab
            vehicle={vehicle}
            onSelect={(v) => {
              setVehicleId(v.id);
              setCustomL100(null);
              saveSetting("vehicleId", v.id);
            }}
            prices={fuel.prices}
            grade={grade}
            setGrade={setGrade}
            user={user}
            onLogout={logout}
          />
        )}
      </main>

      {/* شريط التنقل السفلي */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1E2B26] bg-[#0A0F0D]/96 px-2 py-2 backdrop-blur-lg">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-1.5">
          {tabs.map((t) => {
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => {
                  setTab(t.k);
                  beep("info");
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition ${
                  active
                    ? "bg-[#F2A900]/12 text-[#F2A900]"
                    : "text-[#8FA39B] hover:text-white"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[t.k]}
                </svg>
                <span className="text-[10px] font-black">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
