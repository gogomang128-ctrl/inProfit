import type { TripResult } from "@/lib/calc";

interface BubbleProps {
  result: TripResult;
  vehicleName: string;
  fuelPrice: number;
  fuelGrade: string;
  audioOn: boolean;
  onToggleAudio: () => void;
  onOpenTrip: () => void;
  active: boolean;
}

const VERDICT = {
  win: { label: "كسبان", sign: "✅", cls: "border-[#31C48D]/45 bg-[#31C48D]/12 text-[#31C48D]" },
  weak: { label: "هامش ضعيف", sign: "⚠️", cls: "border-[#F2A900]/45 bg-[#F2A900]/12 text-[#F2A900]" },
  loss: { label: "خسران", sign: "❌", cls: "border-[#F04438]/50 bg-[#F04438]/12 text-[#FF7B72]" },
} as const;

/** الفقاعة العائمة — تحاكي طبقة الـ Overlay فوق تطبيق إندرايف وتبقى ثابتة فوق كل التبويبات */
export default function Bubble({
  result,
  vehicleName,
  fuelPrice,
  fuelGrade,
  audioOn,
  onToggleAudio,
  onOpenTrip,
  active,
}: BubbleProps) {
  const v = VERDICT[result.verdict];

  return (
    <div className="sticky top-0 z-40 px-3 pt-3">
      <div
        className={`mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border bg-[#0D1412]/94 px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-300 ${v.cls}`}
      >
        <button
          onClick={onOpenTrip}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-right"
          aria-label="فتح حاسبة الرحلة"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-bold text-[#8FA39B]">
              {vehicleName} • {fuelGrade} {fuelPrice} ج/لتر
            </span>
            <span className="block truncate text-[13px] font-black">
              صافي: {result.net >= 0 ? "+" : ""}
              {result.net.toFixed(0)} ج.م — {v.label} {v.sign}
            </span>
          </span>
        </button>

        <span
          className={`hidden shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black sm:block ${v.cls}`}
        >
          {active ? "تتبع يعمل" : "جاهز"}
        </span>

        <button
          onClick={onToggleAudio}
          aria-label={audioOn ? "كتم التنبيهات" : "تشغيل التنبيهات"}
          className="shrink-0 rounded-lg border border-[#1E2B26] bg-[#070B0A] p-2 text-[#8FA39B] transition hover:border-[#F2A900]/50 hover:text-[#F2A900]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {audioOn ? (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </>
            ) : (
              <>
                <path d="M22 9l-6 6" />
                <path d="M16 9l6 6" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
