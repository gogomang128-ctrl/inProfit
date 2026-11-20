import { useMemo, useState } from "react";
import {
  categoryLabels,
  vehicles,
  type FuelOctane,
  type Vehicle,
  type VehicleCategory,
  type VehicleType,
} from "@/data/vehicles";
import { FUEL_LABELS, OFFICIAL_PRICES, type FuelGrade } from "@/lib/fuel";
import { beep } from "@/lib/audio";
import type { DriverUser } from "@/lib/store";

interface Props {
  vehicle: Vehicle;
  onSelect: (v: Vehicle) => void;
  prices: Record<FuelGrade, number>;
  grade: FuelGrade;
  setGrade: (g: FuelGrade) => void;
  user: DriverUser;
  onLogout: () => void;
}

const downloadJson = () => {
  const payload = vehicles.map((v) => ({
    id: v.id,
    type: v.type,
    brand: { ar: v.brand_ar, en: v.brand_en },
    model: v.model,
    years: v.years,
    engine_cc: v.engine_cc,
    fuel_type: v.fuel_type,
    liters_per_100km_city: v.liters_per_100km_city,
    liters_per_100km_highway: v.liters_per_100km_highway,
    liters_per_100km_avg: v.liters_per_100km_avg,
    km_per_liter_avg: v.km_per_liter_avg,
    tank_capacity_liters: v.tank_capacity_liters,
    note: v.note,
  }));
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vehicles_egypt.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  beep("info");
};

export default function GarageTab({
  vehicle,
  onSelect,
  prices,
  grade,
  setGrade,
  user,
  onLogout,
}: Props) {
  const [type, setType] = useState<VehicleType>("car");
  const [cat, setCat] = useState<VehicleCategory | "all">("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (v.type !== type) return false;
      if (cat !== "all" && v.category !== cat) return false;
      if (!term) return true;
      return (
        v.brand_ar.includes(term) ||
        v.brand_en.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.id.includes(term)
      );
    });
  }, [type, cat, q]);

  const cats: Array<VehicleCategory | "all"> =
    type === "car"
      ? ["all", "ridehail", "chinese", "suv"]
      : ["all", "motorcycle"];

  const price = OFFICIAL_PRICES[grade];
  const perKm = (vehicle.liters_per_100km_avg / 100) * price;
  const rangeKm = (vehicle.km_per_liter_avg * vehicle.tank_capacity_liters).toFixed(0);
  const tankCost = (vehicle.tank_capacity_liters * price).toFixed(0);

  return (
    <div className="space-y-4">
      {/* الحساب */}
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5">
        <div className="min-w-0">
          <span className="block text-[10px] font-black tracking-widest text-[#8FA39B]">
            الكابتن
          </span>
          <span className="block truncate text-sm font-black text-white">{user.name}</span>
          <span className="num block text-[11px] font-bold text-[#F2A900]" dir="ltr">
            {user.phone}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 rounded-lg border border-[#1E2B26] px-3 py-2 text-[11px] font-black text-[#8FA39B] transition hover:border-[#F04438]/50 hover:text-[#FF7B72]"
        >
          تسجيل خروج
        </button>
      </section>

      {/* أسعار الوقود لايف */}
      <section className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-black text-white">سعر لتر البنزين في مصر</h2>
          <span className="flex items-center gap-1.5 rounded-md border border-[#31C48D]/35 bg-[#31C48D]/10 px-2 py-1 text-[9px] font-black text-[#31C48D]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#31C48D]" />
            تسعيرة رسمية
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(OFFICIAL_PRICES) as FuelGrade[]).map((g) => {
            const active = grade === g;
            return (
              <button
                key={g}
                onClick={() => {
                  setGrade(g);
                  beep("info");
                }}
                className={`rounded-xl border px-2 py-2.5 text-center transition active:scale-95 ${
                  active
                    ? "border-[#F2A900] bg-[#F2A900]/12"
                    : "border-[#1E2B26] bg-[#070B0A] hover:border-[#F2A900]/40"
                }`}
              >
                <span
                  className={`block text-[11px] font-black ${active ? "text-[#F2A900]" : "text-[#8FA39B]"}`}
                >
                  {FUEL_LABELS[g]}
                </span>
                <span className="num mt-0.5 block text-base font-extrabold text-white">
                  {prices[g].toFixed(2)}
                </span>
                <span className="block text-[9px] font-bold text-[#6A7A73]">
                  رسمي
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-[#6A7A73]">
          التسعيرة المعتمدة (لجنة التسعير التلقائي): 80 = {OFFICIAL_PRICES["80"]} ج • 92 ={" "}
          {OFFICIAL_PRICES["92"]} ج • 95 = {OFFICIAL_PRICES["95"]} ج.
        </p>
      </section>

      {/* المركبة */}
      <section className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5">
        <h2 className="text-[13px] font-black text-white">اختر مركبتك لتحديد الاستهلاك</h2>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#070B0A] p-1">
          {(
            [
              { k: "car", label: "سيارات", icon: "🚗" },
              { k: "motorcycle", label: "موتوسيكلات", icon: "🏍️" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              onClick={() => {
                setType(t.k);
                setCat("all");
              }}
              className={`rounded-lg py-2 text-xs font-black transition ${
                type === t.k
                  ? "bg-[#F2A900] text-[#0A0F0D]"
                  : "text-[#8FA39B] hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-black transition ${
                cat === c
                  ? "border-[#31C48D] bg-[#31C48D]/12 text-[#31C48D]"
                  : "border-[#1E2B26] text-[#8FA39B]"
              }`}
            >
              {c === "all" ? "الكل" : categoryLabels[c]}
            </button>
          ))}
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم الماركة أو الموديل…"
          className="mt-2.5 w-full rounded-xl border border-[#1E2B26] bg-[#070B0A] px-3 py-2.5 text-xs font-bold text-white outline-none placeholder:text-[#4C5B55] focus:border-[#F2A900]"
        />

        <div className="mt-3 max-h-[22rem] space-y-2 overflow-y-auto pl-1">
          {list.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#1E2B26] px-3 py-6 text-center text-[11px] font-bold text-[#6A7A73]">
              لا توجد نتائج مطابقة — جرّب اسمًا آخر مثل «صني» أو «VLR».
            </p>
          )}
          {list.map((v) => {
            const active = v.id === vehicle.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  onSelect(v);
                  beep("info");
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-right transition active:scale-[0.99] ${
                  active
                    ? "border-[#F2A900] bg-[#F2A900]/10"
                    : "border-[#1E2B26] bg-[#070B0A] hover:border-[#F2A900]/40"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-black text-white">
                    {v.brand_ar} {v.model}
                  </span>
                  <span className="num block text-[10px] font-bold text-[#8FA39B]" dir="ltr">
                    {v.engine_cc} cc • {v.years} • {v.fuel_type}
                  </span>
                </span>
                <span className="shrink-0 text-left">
                  <span className="num block text-xs font-extrabold text-[#F2A900]">
                    {v.liters_per_100km_avg} ل/100
                  </span>
                  <span className="num block text-[10px] font-bold text-[#31C48D]">
                    {v.km_per_liter_avg} كم/لتر
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ملخص المركبة */}
      <section className="rounded-2xl border border-[#31C48D]/30 bg-gradient-to-r from-[#0D1412] to-[#132019] p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black tracking-widest text-[#31C48D]">
              المركبة المختارة
            </span>
            <h3 className="mt-0.5 truncate text-base font-black text-white">
              {vehicle.brand_ar} {vehicle.model}
            </h3>
            <p className="num text-[11px] font-bold text-[#8FA39B]" dir="ltr">
              {vehicle.brand_en} • {vehicle.engine_cc} cc • {vehicle.years}
            </p>
          </div>
          <span className="shrink-0 rounded-lg border border-[#1E2B26] bg-[#070B0A] px-2 py-1 text-[10px] font-black text-[#F2A900]">
            {FUEL_LABELS[vehicle.fuel_type as FuelOctane]}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "المختلط", v: `${vehicle.liters_per_100km_avg} ل/100`, c: "#F2A900" },
            { k: "المدينة", v: `${vehicle.liters_per_100km_city} ل/100`, c: "#ffffff" },
            { k: "الطريق السريع", v: `${vehicle.liters_per_100km_highway} ل/100`, c: "#ffffff" },
            { k: "اللتر يمشي", v: `${vehicle.km_per_liter_avg} كم`, c: "#31C48D" },
          ].map((x) => (
            <div key={x.k} className="rounded-xl bg-[#070B0A]/70 p-2.5 text-center">
              <span className="block text-[10px] font-bold text-[#8FA39B]">{x.k}</span>
              <span className="num mt-0.5 block text-sm font-extrabold" style={{ color: x.c }}>
                {x.v}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-[#1E2B26] px-2 py-2">
            <span className="block text-[10px] font-bold text-[#8FA39B]">تكلفة الكم</span>
            <span className="num block text-sm font-black text-white">{perKm.toFixed(3)} ج</span>
          </div>
          <div className="rounded-lg border border-[#1E2B26] px-2 py-2">
            <span className="block text-[10px] font-bold text-[#8FA39B]">مدى الخزان</span>
            <span className="num block text-sm font-black text-white">{rangeKm} كم</span>
          </div>
          <div className="rounded-lg border border-[#1E2B26] px-2 py-2">
            <span className="block text-[10px] font-bold text-[#8FA39B]">تعبئة كاملة</span>
            <span className="num block text-sm font-black text-[#F2A900]">{tankCost} ج</span>
          </div>
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-[#6A7A73]">{vehicle.note}</p>
      </section>

      {/* التنزيلات */}
      <section className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={downloadJson}
          className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5 text-right transition hover:border-[#F2A900]/50 active:scale-[0.99]"
        >
          <span className="block text-[10px] font-black tracking-widest text-[#F2A900]">
            JSON • {vehicles.length} مركبة
          </span>
          <span className="mt-1 block text-sm font-black text-white">
            تنزيل قاعدة بيانات vehicles_egypt.json
          </span>
          <span className="mt-1 block text-[10px] leading-relaxed text-[#8FA39B]">
            حقول كاملة: استهلاك مدينة/طريق/مختلط + كم للتر + سعة الخزان — جاهزة للبرمجة.
          </span>
        </button>

        <a
          href="inProfit-v1.0.apk"
          download
          onClick={() => beep("info")}
          className="group relative overflow-hidden rounded-2xl border border-[#1E2B26] p-3.5 text-right transition hover:border-[#31C48D]/50 active:scale-[0.99]"
        >
          <img
            src="images/apk-mount.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-30 transition group-hover:opacity-40"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute inset-0 bg-gradient-to-l from-[#070B0A]/95 via-[#070B0A]/85 to-[#070B0A]/60" />
          <span className="relative block">
            <span className="block text-[10px] font-black tracking-widest text-[#31C48D]">
              ANDROID • APK
            </span>
            <span className="mt-1 block text-sm font-black text-white">
              تنزيل برنامج inProfit
            </span>
            <span className="mt-1 block text-[10px] leading-relaxed text-[#8FA39B]">
              نسخة أندرويد كاملة: فقاعة عائمة فوق إندرايف + قراءة تلقائية + تتبع GPS.
            </span>
          </span>
        </a>
      </section>
    </div>
  );
}
