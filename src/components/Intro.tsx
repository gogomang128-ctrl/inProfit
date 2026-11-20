import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { isValidEgyptianPhone, normalizePhone, type DriverUser } from "@/lib/store";
import { beep } from "@/lib/audio";

interface IntroProps {
  existing: DriverUser | null;
  onLogin: (user: DriverUser) => void;
}

const COUNTS = [
  { to: 7, suffix: "لتر/100كم" },
  { to: 22.25, suffix: "ج/لتر 92", digits: 2 },
  { to: 41.67, suffix: "كم/لتر", digits: 2 },
];

function useCountUp(target: number, digits = 0, run: boolean, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVal(target);
      return;
    }
    let raf = 0;
    let start = 0;
    const dur = 900;
    const timer = window.setTimeout(() => {
      const step = (t: number) => {
        if (!start) start = t;
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(target * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, run, delay]);
  return val.toFixed(digits);
}

export default function Intro({ existing, onLogin }: IntroProps) {
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"splash" | "form">(existing ? "form" : "splash");
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const c1 = useCountUp(COUNTS[0].to, 1, phase === "splash", 200);
  const c2 = useCountUp(COUNTS[1].to, 2, phase === "splash", 380);
  const c3 = useCountUp(COUNTS[2].to, 2, phase === "splash", 560);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("form"), existing ? 300 : 1900);
    return () => window.clearTimeout(t);
  }, [existing]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (n.length < 2) {
      setError("اكتب اسمك كامل (حرفين على الأقل).");
      beep("warn");
      nameRef.current?.focus();
      return;
    }
    if (!isValidEgyptianPhone(phone)) {
      setError("رقم هاتف مصري غير صحيح — مثال: 01012345678");
      beep("warn");
      return;
    }
    setError(null);
    setBusy(true);
    beep("info");
    onLogin({
      name: n,
      phone: normalizePhone(phone),
      vehicleId: existing?.vehicleId ?? "vigorey_vlr_200",
      createdAt: existing?.createdAt ?? Date.now(),
      lastLogin: Date.now(),
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-[#070B0A]">
      <div className="login-motion-bg absolute inset-0 z-0" aria-hidden="true">
        <div className="login-grid" />
        <svg className="login-route" viewBox="0 0 600 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path
            d="M-40 720C90 660 84 540 214 510C334 482 305 352 420 318C510 292 528 170 650 118"
            stroke="rgba(49,196,141,.22)"
            strokeWidth="2"
          />
          <path
            className="login-route-dash"
            d="M-40 720C90 660 84 540 214 510C334 482 305 352 420 318C510 292 528 170 650 118"
            stroke="#31C48D"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 18"
          />
          <circle cx="214" cy="510" r="5" fill="#F2A900" className="login-route-point" />
          <circle cx="420" cy="318" r="5" fill="#31C48D" className="login-route-point" />
        </svg>
        <span className="login-particle login-particle-one" />
        <span className="login-particle login-particle-two" />
        <span className="login-particle login-particle-three" />
        <span className="login-particle login-particle-four" />
        <span className="login-road login-road-one" />
        <span className="login-road login-road-two" />
        <span className="login-glow login-glow-one" />
        <span className="login-glow login-glow-two" />
      </div>
      {phase === "splash" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#070B0A]">
          <div className="flex flex-col items-center">
            <Logo size={220} className="animate-[logo-in_900ms_ease-out_both] drop-shadow-[0_16px_40px_rgba(49,196,141,.12)]" />
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 py-8">
        {/* الشعار + العدّاد الترحيبي */}
        <div
          className={`transition-all duration-700 ${
            phase === "splash"
              ? "translate-y-0 opacity-100"
              : "-translate-y-2 opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <Logo size={54} />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                in<span className="text-[#F2A900]">Profit</span>
              </h1>
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#8FA39B]">
                مساعد الكابتن الذكي
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {/* شريط القراءات المتحركة */}
          <div
            className={`grid grid-cols-3 gap-2 transition-all duration-700 delay-100 ${
              phase === "splash"
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-70"
            }`}
          >
            {[
              { v: c1, s: COUNTS[0].suffix },
              { v: c2, s: COUNTS[1].suffix },
              { v: c3, s: COUNTS[2].suffix },
            ].map((x) => (
              <div
                key={x.s}
                className="rounded-xl border border-[#1E2B26] bg-[#0D1412]/85 px-2 py-2.5 text-center backdrop-blur-sm"
              >
                <div className="num text-xl font-extrabold text-[#F2A900]">{x.v}</div>
                <div className="mt-0.5 text-[9px] font-bold text-[#8FA39B]">{x.s}</div>
              </div>
            ))}
          </div>

          {/* نموذج الدخول */}
          <div
            className={`mt-4 rounded-2xl border border-[#1E2B26] bg-[#0D1412]/92 p-4 backdrop-blur-md transition-all duration-500 ${
              phase === "form"
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-6 opacity-0"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-black text-white">
                {existing ? `مرحبًا بعودتك، ${existing.name}` : "تسجيل دخول سريع"}
              </h2>
              <span className="rounded-md bg-[#F2A900]/12 px-2 py-1 text-[10px] font-black text-[#F2A900]">
                يُحفظ على جهازك
              </span>
            </div>

            <form onSubmit={submit} className="space-y-3" noValidate>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold text-[#8FA39B]">
                  الاسم بالكامل
                </span>
                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمود عبد الله"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[#1E2B26] bg-[#070B0A] px-3.5 py-3 text-sm font-bold text-white outline-none transition placeholder:font-medium placeholder:text-[#4C5B55] focus:border-[#F2A900]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold text-[#8FA39B]">
                  رقم التلفون (مصر)
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
                        .replace(/[^\d+]/g, ""),
                    )
                  }
                  inputMode="tel"
                  pattern="[0-9+٠-٩]*"
                  maxLength={14}
                  dir="ltr"
                  placeholder="01012345678"
                  autoComplete="tel"
                  className="num w-full rounded-xl border border-[#1E2B26] bg-[#070B0A] px-3.5 py-3 text-left text-sm font-bold tracking-widest text-white outline-none transition placeholder:tracking-normal placeholder:text-[#4C5B55] focus:border-[#F2A900]"
                />
              </label>

              {error && (
                <p className="rounded-lg border border-[#F04438]/40 bg-[#F04438]/10 px-3 py-2 text-[11px] font-bold text-[#FF8A80]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-[#F2A900] py-3 text-sm font-black text-[#0A0F0D] transition active:scale-[0.98] disabled:opacity-70"
              >
                {busy ? "جارٍ التحضير…" : existing ? "دخول سريع" : "دخول وبدء الحساب"}
              </button>
            </form>

            <p className="mt-2.5 text-center text-[10px] leading-relaxed text-[#6A7A73]">
              بياناتك تُحفظ محليًا على جهازك فقط لتسهيل الدخول مرة أخرى بسرعة.
            </p>

            <a
              href="inProfit-v1.0.apk"
              download
              className="mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-[#31C48D]/40 bg-[#31C48D]/10 py-2.5 text-[11px] font-black text-[#31C48D] transition active:scale-[0.98]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11" />
                <path d="M7.5 11.5 12 16l4.5-4.5" />
                <path d="M5 19.5h14" />
              </svg>
              تنزيل برنامج inProfit APK — نسخة أندرويد
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
