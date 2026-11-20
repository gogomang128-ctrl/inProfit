import type { Vehicle } from "@/data/vehicles";
import { getVehicle, vehicles } from "@/data/vehicles";
import type { TripResult } from "@/lib/calc";

export interface TripState {
  tripKm: number;
  pickupKm: number;
  fare: number;
  wearPercent: number;
}

interface Props {
  vehicle: Vehicle;
  l100: number;
  fuelPrice: number;
  result: TripResult;
  trip: TripState;
  setTrip: (t: TripState) => void;
  onVehicleChange: (v: Vehicle) => void;
}

const VERDICT_STYLE: Record<TripResult["verdict"], { title: string; ring: string; text: string; bg: string }> = {
  win: {
    title: "كسبان ✅ رحلة ممتازة",
    ring: "border-[#31C48D]/55",
    text: "text-[#31C48D]",
    bg: "from-[#31C48D]/14 to-transparent",
  },
  weak: {
    title: "هامش ضعيف ⚠️ فاوض",
    ring: "border-[#F2A900]/55",
    text: "text-[#F2A900]",
    bg: "from-[#F2A900]/14 to-transparent",
  },
  loss: {
    title: "خسران ❌ ارفض أو رفع السعر",
    ring: "border-[#F04438]/60",
    text: "text-[#FF7B72]",
    bg: "from-[#F04438]/16 to-transparent",
  },
};

export default function TripTab({ vehicle, l100, fuelPrice, result, trip, setTrip, onVehicleChange }: Props) {
  const style = VERDICT_STYLE[result.verdict];
  const isMoto = vehicle.type === "motorcycle";

  const upd = (patch: Partial<TripState>) => setTrip({ ...trip, ...patch });

  const numField = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    unit: string,
    step = 0.5,
    accent = false,
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-[#8FA39B]">{label}</span>
      <span className="relative block">
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={0}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className={`num w-full rounded-xl border border-[#1E2B26] bg-[#070B0A] py-2.5 pl-3 pr-12 text-left text-lg font-extrabold outline-none transition focus:border-[#F2A900] ${
            accent ? "text-[#F2A900]" : "text-white"
          }`}
          dir="ltr"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-bold text-[#6A7A73]">
          {unit}
        </span>
      </span>
    </label>
  );

  return (
    <div className="space-y-4">
      {/* اختيار المركبة مربوط مباشرة بقاعدة بيانات المركبات والحسابات */}
      <section className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5">
        <div className="flex items-end gap-3">
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-[11px] font-bold text-[#8FA39B]">
              المركبة المستخدمة في الرحلة
            </span>
            <select
              value={vehicle.id}
              onChange={(e) => {
                const selected = getVehicle(e.target.value);
                if (selected) onVehicleChange(selected);
              }}
              className="w-full rounded-xl border border-[#1E2B26] bg-[#070B0A] px-3 py-2.5 text-sm font-bold text-white outline-none transition focus:border-[#F2A900]"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand_ar} {v.model} — {v.liters_per_100km_avg} لتر/100كم
                </option>
              ))}
            </select>
          </label>
          <div className="shrink-0 rounded-xl border border-[#31C48D]/30 bg-[#31C48D]/8 px-3 py-2 text-left">
            <span className="block text-[9px] font-bold text-[#8FA39B]">كم/لتر فعلي</span>
            <span className="num block text-sm font-black text-[#31C48D]">
              {vehicle.km_per_liter_avg.toFixed(2)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[#6A7A73]">
          متوسط الاستهلاك: {l100.toFixed(2)} لتر/100كم • تكلفة الكيلو:{" "}
          {result.costPerKm.toFixed(3)} ج.م • سعر الوقود: {fuelPrice.toFixed(2)} ج.م/لتر
        </p>
      </section>

      {/* بيانات الرحلة */}
      <section className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5">
        <h2 className="mb-3 border-b border-[#1E2B26] pb-2.5 text-[13px] font-black text-white">
          بيانات الرحلة المعروضة
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {numField("مسافة الرحلة", trip.tripKm, (n) => upd({ tripKm: n }), "كم")}
          {numField("سعر الرحلة المطلوب", trip.fare, (n) => upd({ fare: n }), "ج.م", 1, true)}
          {numField("مسافة الوصول للعميل", trip.pickupKm, (n) => upd({ pickupKm: n }), "كم")}
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-[#8FA39B]">
              إهلاك وصيانة
            </span>
            <select
              value={trip.wearPercent}
              onChange={(e) => upd({ wearPercent: parseInt(e.target.value, 10) })}
              className="w-full rounded-xl border border-[#1E2B26] bg-[#070B0A] px-3 py-2.5 text-sm font-bold text-white outline-none transition focus:border-[#F2A900]"
            >
              <option value={0}>0% (بنزين فقط)</option>
              <option value={10}>10% (موصى به)</option>
              <option value={15}>15% (إهلاك مرتفع)</option>
              <option value={20}>20% (زحام شديد)</option>
            </select>
          </label>
        </div>
      </section>

      {/* القرار */}
      <section
        className={`rounded-2xl border-2 bg-gradient-to-b ${style.ring} ${style.bg} to-[#0D1412] p-4`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-[#8FA39B]">قرار المساعد الذكي</span>
            <h3 className={`mt-0.5 text-xl font-black leading-tight ${style.text}`}>
              {style.title}
            </h3>
          </div>
          <div className="shrink-0 rounded-xl border border-[#1E2B26] bg-[#070B0A]/80 px-3 py-2 text-left">
            <span className="block text-[10px] font-bold text-[#8FA39B]">صافي الربح</span>
            <span className={`num block text-2xl font-black ${style.text}`}>
              {result.net >= 0 ? "+" : ""}
              {result.net.toFixed(1)}
            </span>
            <span className="block text-[9px] font-bold text-[#6A7A73]">جنيه</span>
          </div>
        </div>

        <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-[#1E2B26] pt-3 text-center">
          <div className="rounded-xl bg-[#070B0A]/70 p-2.5">
            <span className="block text-[10px] font-bold text-[#8FA39B]">البنزين المستهلك</span>
            <span className="num mt-0.5 block text-sm font-extrabold text-white">
              {result.liters.toFixed(2)} لتر
            </span>
          </div>
          <div className="rounded-xl bg-[#070B0A]/70 p-2.5">
            <span className="block text-[10px] font-bold text-[#8FA39B]">تكلفة البنزين</span>
            <span className="num mt-0.5 block text-sm font-extrabold text-[#FF7B72]">
              {result.fuelCost.toFixed(1)} ج.م
            </span>
          </div>
          <div className="rounded-xl bg-[#070B0A]/70 p-2.5">
            <span className="block text-[10px] font-bold text-[#8FA39B]">ربح الكيلو</span>
            <span className={`num mt-0.5 block text-sm font-extrabold ${style.text}`}>
              {result.profitPerKm.toFixed(2)} ج/كم
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center justify-between rounded-lg border border-[#1E2B26] bg-[#070B0A]/70 px-2.5 py-2">
            <span className="font-bold text-[#8FA39B]">إجمالي المسافة</span>
            <span className="num font-extrabold text-white">{result.totalKm.toFixed(1)} كم</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#1E2B26] bg-[#070B0A]/70 px-2.5 py-2">
            <span className="font-bold text-[#8FA39B]">إهلاك وصيانة</span>
            <span className="num font-extrabold text-white">{result.wearCost.toFixed(1)} ج.م</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#070B0A] px-3 py-2.5">
          <span className="text-[11px] font-bold text-[#8FA39B]">
            أقل سعر عادل {isMoto ? "(موتوسيكل)" : "(سيارة)"}:
          </span>
          <span className="num text-base font-black text-[#F2A900]">
            {result.recommendedFare} ج.م
          </span>
        </div>
      </section>

      {/* ملخص الكفاءة */}
      <section className="rounded-2xl border border-[#1E2B26] bg-gradient-to-r from-[#0D1412] to-[#131C19] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-[11px] font-bold text-[#8FA39B]">
              تكلفة الكيلومتر بالبنزين
            </span>
            <span className="num block text-lg font-black text-[#31C48D]">
              {result.costPerKm.toFixed(3)} ج/كم
            </span>
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-bold text-[#8FA39B]">كفاءة اللتر</span>
            <span className="num block text-base font-extrabold text-white">
              {(100 / l100).toFixed(1)} كم/لتر
            </span>
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-bold text-[#8FA39B]">المعدل</span>
            <span className="num block text-base font-extrabold text-[#F2A900]">
              {l100.toFixed(2)} ل/100
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[#6A7A73]">
          محسوب من {vehicle.brand_ar} {vehicle.model} ({vehicle.engine_cc} سي سي) بسعر{" "}
          {fuelPrice} ج/لتر.
        </p>
      </section>
    </div>
  );
}
