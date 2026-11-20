let ctx: AudioContext | null = null;
let enabled = true;

export const setAudioEnabled = (v: boolean) => {
  enabled = v;
};
export const isAudioEnabled = () => enabled;

const getCtx = (): AudioContext | null => {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

/** نقرة/تنبيه صوتي قصير عبر Web Audio API (بدون ملفات خارجية) */
export function beep(kind: "info" | "warn" | "danger" = "info"): void {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    const now = c.currentTime;

    if (kind === "danger") {
      osc.type = "square";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.26);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.31);
    } else if (kind === "warn") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(660, now + 0.09);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.21);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch {
    /* تمكين الصوت غير متاح */
  }
}

export function vibrate(pattern: number | number[] = 40): void {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* غير مدعوم */
  }
}
