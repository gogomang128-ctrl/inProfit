import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Vehicle } from "@/data/vehicles";
import { speedFactor } from "@/lib/calc";
import { beep, vibrate } from "@/lib/audio";
import { loadSetting, saveSetting } from "@/lib/store";

type Pt = [number, number];

interface Adapter {
  setView(lat: number, lng: number, zoom?: number): void;
  setMarker(lat: number, lng: number): void;
  clearMarker(): void;
  setRoute(pts: Pt[]): void;
  resize(): void;
  destroy(): void;
}

const CAIRO: Pt = [30.0444, 31.2357];
const EGYPT_OVERVIEW: Pt = [26.820553, 30.802498];

/* ───────────────────── Leaflet (افتراضي — بلا مفتاح) ───────────────────── */
function createLeafletAdapter(el: HTMLElement): Adapter {
  const map = L.map(el, {
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true,
    zoomSnap: 0.5,
    scrollWheelZoom: false, // لا يمنع تمرير الصفحة على سطح المكتب، والقرص يعمل باللمس
    tap: true,
  }).setView(EGYPT_OVERVIEW, 6);

  el.style.background =
    "radial-gradient(circle at 50% 38%, rgba(49,196,141,.12), transparent 22%), linear-gradient(135deg,#101917,#0A0F0D)";
  el.style.backgroundSize = "auto";

  const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    subdomains: "abc",
    detectRetina: false,
    crossOrigin: true,
  });

  let tileFailures = 0;
  const fallbackTiles = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      detectRetina: false,
      crossOrigin: true,
    },
  );

  tiles.on("tileerror", () => {
    tileFailures += 1;
    if (tileFailures >= 3 && !map.hasLayer(fallbackTiles)) {
      map.removeLayer(tiles);
      fallbackTiles.addTo(map);
    }
  });
  tiles.on("tileload", () => {
    el.classList.remove("map-offline");
  });
  fallbackTiles.on("tileload", () => el.classList.remove("map-offline"));
  fallbackTiles.on("tileerror", () => el.classList.add("map-offline"));
  tiles.addTo(map);
  L.control.zoom({ position: "bottomright" }).addTo(map);

  const line = L.polyline([], { color: "#31C48D", weight: 5, opacity: 0.9 }).addTo(map);
  const marker = L.circleMarker(CAIRO, {
    radius: 8,
    color: "#070B0A",
    weight: 3,
    fillColor: "#31C48D",
    fillOpacity: 1,
  });

  return {
    setView: (lat, lng, zoom = 16) => map.setView([lat, lng], zoom, { animate: true }),
    setMarker: (lat, lng) => {
      marker.setLatLng([lat, lng]);
      if (!map.hasLayer(marker)) marker.addTo(map);
    },
    clearMarker: () => marker.remove(),
    setRoute: (pts) => line.setLatLngs(pts),
    resize: () => map.invalidateSize({ animate: false }),
    destroy: () => {
      map.remove();
    },
  };
}

/* ───────────────────── Google Maps (اختياري بمفتاح المطوّر) ───────────────────── */
let gLoader: Promise<void> | null = null;
function loadGoogleScript(key: string): Promise<void> {
  if (gLoader) return gLoader;
  gLoader = new Promise<void>((resolve, reject) => {
    const w = window as unknown as { google?: { maps?: unknown } };
    if (w.google?.maps) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&language=ar&region=EG&v=weekly`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gLoader = null;
      reject(new Error("فشل تحميل Google Maps"));
    };
    document.head.appendChild(s);
    window.setTimeout(() => {
      if (!w.google?.maps) {
        gLoader = null;
        reject(new Error("انتهت مهلة تحميل Google Maps"));
      }
    }, 12000);
  });
  return gLoader;
}

function createGoogleAdapter(el: HTMLElement, key: string): Promise<Adapter> {
  return loadGoogleScript(key).then(() => {
    const g = (
      window as unknown as {
        google: {
          maps: {
            Map: new (
              el: HTMLElement,
              opts: unknown,
            ) => { setCenter: (c: unknown) => void; setZoom: (z: number) => void };
            Marker: new (opts: unknown) => {
              setPos?: never;
              setPosition: (p: unknown) => void;
              setMap: (m: unknown) => void;
            };
            Polyline: new (opts: unknown) => { setPath: (p: unknown[]) => void };
            SymbolPath: { CIRCLE: number };
            LatLng: new (lat: number, lng: number) => unknown;
          };
        };
      }
    ).google.maps;

    const map = new g.Map(el, {
      center: { lat: EGYPT_OVERVIEW[0], lng: EGYPT_OVERVIEW[1] },
      zoom: 6,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "greedy",
      backgroundColor: "#0D1412",
    });

    const marker = new g.Marker({
      position: { lat: EGYPT_OVERVIEW[0], lng: EGYPT_OVERVIEW[1] },
      clickable: false,
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#31C48D",
        fillOpacity: 1,
        strokeColor: "#070B0A",
        strokeWeight: 3,
      },
    });

    const line = new g.Polyline({
      map,
      path: [],
      strokeColor: "#31C48D",
      strokeWeight: 5,
      strokeOpacity: 0.9,
    });

    return {
      setView: (lat, lng, zoom = 16) => {
        map.setCenter({ lat, lng });
        map.setZoom(zoom);
      },
      setMarker: (lat, lng) => {
        marker.setPosition({ lat, lng });
        marker.setMap(map);
      },
      clearMarker: () => marker.setMap(null),
      setRoute: (pts) => line.setPath(pts.map(([a, b]) => ({ lat: a, lng: b }))),
      resize: () => {
        const w = el.getBoundingClientRect();
        if (w.width && w.height) {
          map.setCenter({ lat: CAIRO[0], lng: CAIRO[1] });
        }
      },
      destroy: () => {
        map.setCenter({ lat: 0, lng: 0 });
      },
    };
  });
}

/* ───────────────────── مساعدات ───────────────────── */
function haversineKm(a: Pt, b: Pt): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** مسار محاكاة على شارع النيل بالقاهرة (للاختبار بدون GPS) */
const SIM_PATH: Pt[] = [
  [30.0585, 31.226],
  [30.062, 31.2215],
  [30.066, 31.2185],
  [30.071, 31.216],
  [30.076, 31.2145],
  [30.081, 31.2135],
  [30.086, 31.213],
  [30.0915, 31.2135],
  [30.0965, 31.2155],
  [30.1015, 31.2185],
  [30.106, 31.2225],
  [30.1105, 31.227],
  [30.115, 31.2325],
  [30.1195, 31.2385],
];
const SIM_SPEEDS = [46, 54, 63, 71, 78, 86, 94, 97, 88, 76, 66, 58, 64, 72, 80, 91, 84, 69];

const segmentLens: number[] = [];
let pathTotal = 0;
for (let i = 1; i < SIM_PATH.length; i++) {
  const d = haversineKm(SIM_PATH[i - 1], SIM_PATH[i]);
  segmentLens.push(d);
  pathTotal += d;
}

function pointAt(km: number): Pt {
  let remaining = ((km % pathTotal) + pathTotal) % pathTotal;
  for (let i = 0; i < segmentLens.length; i++) {
    if (remaining <= segmentLens[i]) {
      const t = segmentLens[i] === 0 ? 0 : remaining / segmentLens[i];
      const a = SIM_PATH[i];
      const b = SIM_PATH[i + 1];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= segmentLens[i];
  }
  return SIM_PATH[0];
}

interface Props {
  vehicle: Vehicle;
  l100: number;
  fuelPrice: number;
  active: boolean;
  notify: (a: { title: string; msg: string; level: "info" | "warn" | "danger" }) => void;
}

type Mode = "idle" | "real" | "sim";
const GPS_MAX_ACCURACY_METERS = 50;
const GPS_TIMEOUT_MS = 10_000;

export default function MapTab({ vehicle, l100, fuelPrice, active, notify }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const adapterRef = useRef<Adapter | null>(null);
  const watchRef = useRef<number | null>(null);
  const simRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const lastPosRef = useRef<Pt | null>(null);
  const routeRef = useRef<Pt[]>([]);
  const distRef = useRef(0);
  const litersRef = useRef(0);
  const speedRef = useRef(0);
  const simKmRef = useRef(0);
  const simTickRef = useRef(0);
  const lastAlertRef = useRef(0);
  const tankWarnedRef = useRef(false);
  const startRef = useRef(0);
  const lastFixRef = useRef(0);
  const gpsAcceptedRef = useRef(false);

  const [mode, setMode] = useState<Mode>("idle");
  const [consent, setConsent] = useState(false);
  const [perm, setPerm] = useState<"unknown" | "granted" | "denied">("unknown");
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0);
  const [dist, setDist] = useState(0);
  const [liters, setLiters] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [limit, setLimit] = useState<number>(() => loadSetting("speedLimit", 80));
  const [gkey, setGkey] = useState<string>(() => loadSetting("gmapsKey", ""));
  const [showSettings, setShowSettings] = useState(false);
  const [engineName, setEngineName] = useState<"leaflet" | "google">("leaflet");
  const [mapError, setMapError] = useState<string | null>(null);

  const limitRef = useRef(limit);
  limitRef.current = limit;
  const l100Ref = useRef(l100);
  l100Ref.current = l100;
  const priceRef = useRef(fuelPrice);
  priceRef.current = fuelPrice;
  const tankRef = useRef(vehicle.tank_capacity_liters);
  tankRef.current = vehicle.tank_capacity_liters;

  /* ───── إنشاء الخريطة ───── */
  const buildAdapter = useCallback(async () => {
    const el = holderRef.current;
    if (!el) return;
    adapterRef.current?.destroy();
    adapterRef.current = null;
    setMapError(null);
    const key = loadSetting<string>("gmapsKey", "");
    if (key) {
      try {
        const a = await createGoogleAdapter(el, key);
        adapterRef.current = a;
        setEngineName("google");
        a.resize();
        return;
      } catch {
        setMapError("تعذّر تحميل Google Maps (مفتاح غير صالح أو بدون إنترنت) — تم استخدام الخريطة الأساسية.");
      }
    }
    adapterRef.current = createLeafletAdapter(el);
    setEngineName("leaflet");
    window.setTimeout(() => adapterRef.current?.resize(), 60);
  }, []);

  useEffect(() => {
    void buildAdapter();
    const el = holderRef.current;
    let ro: ResizeObserver | null = null;
    if (el && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => adapterRef.current?.resize());
      ro.observe(el);
    }
    return () => {
      ro?.disconnect();
      adapterRef.current?.destroy();
      adapterRef.current = null;
    };
  }, [buildAdapter]);

  useEffect(() => {
    if (active) window.setTimeout(() => adapterRef.current?.resize(), 80);
  }, [active]);

  /* ───── المؤقّت العام ───── */
  useEffect(() => {
    if (mode === "idle") return;
    startRef.current = startRef.current || Date.now();
    tickRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      setSpeed(speedRef.current);
      setDist(distRef.current);
      setLiters(litersRef.current);

      // تنبيه السرعة
      const now = Date.now();
      if (speedRef.current > limitRef.current && now - lastAlertRef.current > 8000) {
        lastAlertRef.current = now;
        notify({
          title: "تجاوز حد السرعة",
          msg: `سرعتك ${Math.round(speedRef.current)} كم/س تجاوزت ${limitRef.current} كم/س — زيادة الاستهلاك وخطر الرادار.`,
          level: "danger",
        });
        beep("danger");
        vibrate([120, 60, 120]);
      }

      // تنبيه انخفاض البنزين المتوقع
      const remaining = tankRef.current - litersRef.current;
      if (
        !tankWarnedRef.current &&
        remaining > 0 &&
        remaining / tankRef.current < 0.15
      ) {
        tankWarnedRef.current = true;
        notify({
          title: "البنزين المتوقع أقل من 15%",
          msg: `متبقي تقريبًا ${remaining.toFixed(1)} لتر من خزان ${tankRef.current} لتر — خطط لمحطة وقود.`,
          level: "warn",
        });
        beep("warn");
      }
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [mode, notify]);

  const pushFix = useCallback((pos: Pt, reportedKmh: number | null, accuracyMetres?: number) => {
    if (accuracyMetres !== undefined && accuracyMetres > GPS_MAX_ACCURACY_METERS) return;
    const now = Date.now();
    const last = lastPosRef.current;
    const dtSec = lastFixRef.current ? (now - lastFixRef.current) / 1000 : 0;
    let stepKm = 0;
    if (last) {
      stepKm = haversineKm(last, pos);
      // تجاهل القفزات غير المنطقية (أقل من 5 أمتار أو أكثر من 200 متر في ثانية)
      if (stepKm < 0.005 || stepKm > 0.2) stepKm = 0;
    }
    lastPosRef.current = pos;
    lastFixRef.current = now;
    // إن لم يُعطِ الجهاز قراءة سرعة نحسبها من المسافة ÷ الزمن
    const spd =
      reportedKmh !== null && reportedKmh > 0
        ? reportedKmh
        : dtSec > 0.4
          ? (stepKm / dtSec) * 3600
          : speedRef.current;
    speedRef.current = spd;
    distRef.current += stepKm;
    litersRef.current += ((stepKm * l100Ref.current) / 100) * speedFactor(spd);

    routeRef.current.push(pos);
    if (routeRef.current.length > 1200) routeRef.current.shift();
    adapterRef.current?.setMarker(pos[0], pos[1]);
    adapterRef.current?.setRoute(routeRef.current);
    if (routeRef.current.length % 3 === 0) adapterRef.current?.setView(pos[0], pos[1], 17);
  }, []);

  /* ───── GPS حقيقي ───── */
  const stopReal = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  }, []);

  const startReal = useCallback(() => {
    if (!window.isSecureContext) {
      const msg = "تحديد GPS الدقيق يعمل فقط عبر HTTPS أو localhost.";
      setGeoMsg(msg);
      notify({ title: "اتصال غير آمن", msg, level: "danger" });
      return;
    }
    if (!("geolocation" in navigator)) {
      setGeoMsg("المتصفح لا يدعم تحديد الموقع GPS.");
      notify({ title: "GPS غير مدعوم", msg: "المتصفح الحالي لا يدعم تحديد الموقع.", level: "danger" });
      return;
    }
    setGeoMsg(null);
    setConsent(false);
    startRef.current = Date.now();
    gpsAcceptedRef.current = false;
    adapterRef.current?.clearMarker();
    stopReal();

    navigator.geolocation.getCurrentPosition(
      (fix) => {
        if (!Number.isFinite(fix.coords.latitude) || !Number.isFinite(fix.coords.longitude)) {
          setGeoMsg("أعادت خدمة الموقع إحداثيات غير صالحة.");
          notify({ title: "إحداثيات غير صالحة", msg: "أعد تشغيل GPS ثم حاول مرة أخرى.", level: "danger" });
          return;
        }
        if (Date.now() - fix.timestamp > GPS_TIMEOUT_MS) {
          setGeoMsg("تم تجاهل قراءة GPS قديمة مخزنة مؤقتًا.");
          notify({
            title: "قراءة قديمة",
            msg: "لم يتم تحديث موقعك؛ انتظر GPS مباشرًا أو أعد تشغيل التتبع.",
            level: "warn",
          });
          return;
        }
        setPerm("granted");
        const firstAccuracy = Number.isFinite(fix.coords.accuracy) ? fix.coords.accuracy : null;
        setLocationAccuracy(firstAccuracy);
        const p: Pt = [fix.coords.latitude, fix.coords.longitude];

        if (firstAccuracy !== null && firstAccuracy <= GPS_MAX_ACCURACY_METERS) {
          gpsAcceptedRef.current = true;
          lastPosRef.current = p;
          routeRef.current = [p];
          adapterRef.current?.setView(p[0], p[1], 18);
          adapterRef.current?.setMarker(p[0], p[1]);
          adapterRef.current?.setRoute(routeRef.current);
          speedRef.current = fix.coords.speed ? fix.coords.speed * 3.6 : 0;
          setMode("real");
          notify({
            title: "تم تفعيل التتبع الذكي",
            msg: `الموقع الحالي موثوق بدقة تقريبية ${Math.round(firstAccuracy)} متر.`,
            level: "info",
          });
          beep("info");
        } else {
          adapterRef.current?.clearMarker();
          setGeoMsg(
            firstAccuracy !== null
              ? `إشارة الموقع ضعيفة حاليًا (${Math.round(firstAccuracy)} متر). التطبيق ينتظر قراءة بدقة ${GPS_MAX_ACCURACY_METERS} متر أو أقل ولا يعرض مكانًا غير موثوق.`
              : "تعذّر قراءة دقة GPS. فعّل الموقع الدقيق وانتظر قراءة موثوقة.",
          );
        }

        watchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const c = pos.coords;
            if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) return;
            if (Date.now() - pos.timestamp > GPS_TIMEOUT_MS) {
              setGeoMsg("تم تجاهل قراءة GPS قديمة؛ ينتظر التطبيق إشارة جديدة.");
              return;
            }
            setLocationAccuracy(Number.isFinite(c.accuracy) ? c.accuracy : null);
            if (!Number.isFinite(c.accuracy) || c.accuracy > GPS_MAX_ACCURACY_METERS) {
              setGeoMsg(
                Number.isFinite(c.accuracy)
                  ? `إشارة GPS ضعيفة حاليًا (${Math.round(c.accuracy)} متر). ينتظر التطبيق دقة ${GPS_MAX_ACCURACY_METERS} متر أو أقل ولا يحدث الموقع.`
                  : "تعذّر قراءة دقة GPS؛ ينتظر التطبيق إشارة دقيقة.",
              );
              return;
            }
            setGeoMsg(null);
            const spd = c.speed !== null && c.speed >= 0 ? c.speed * 3.6 : null;
            pushFix([c.latitude, c.longitude], spd, c.accuracy);
            if (!gpsAcceptedRef.current) {
              gpsAcceptedRef.current = true;
              setMode("real");
              notify({
                title: "تم الحصول على GPS موثوق",
                msg: `دقة الموقع تقريبية ${Math.round(c.accuracy)} متر.`,
                level: "info",
              });
              beep("info");
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setPerm("denied");
              setGeoMsg("تم رفض إذن الموقع أو تم إيقاف الموقع الدقيق.");
              notify({
                title: "إذن الموقع مطلوب",
                msg: "اسمح للموقع الدقيق للتطبيق من إعدادات المتصفح والهاتف، ثم أعد المحاولة.",
                level: "danger",
              });
              stopReal();
              setMode("idle");
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              setGeoMsg("يتعذر الحصول على GPS حاليًا. فعّل GPS والموقع الدقيق.");
              notify({
                title: "إشارة GPS غير متاحة",
                msg: "فعّل GPS عالي الدقة، افتح الموقع من مكان مكشوف، وتحقق من إعدادات الهاتف.",
                level: "warn",
              });
            } else if (err.code === err.TIMEOUT) {
              setGeoMsg("انتهت مهلة انتظار GPS. أعد المحاولة في مكان مفتوح.");
              notify({
                title: "مهلة GPS",
                msg: "لم تصل قراءة GPS دقيقة خلال 10 ثوانٍ.",
                level: "warn",
              });
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: GPS_TIMEOUT_MS },
        );
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPerm("denied");
          setGeoMsg("تم إغلاق إذن الموقع الدقيق.");
          notify({
            title: "الموقع الدقيق مغلق",
            msg: "افتح إعدادات المتصفح والهاتف، فعّل الموقع، واختر «دقة عالية» أو «موقع دقيق».",
            level: "danger",
          });
          beep("warn");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoMsg("المعالج لا يتلقى إشارة GPS. فعّل GPS والموقع الدقيق.");
          notify({
            title: "إشارة GPS ضعيفة",
            msg: "تأكد من تفعيل GPS والدقة العالية، وافتح الهاتف في مكان مكشوف.",
            level: "warn",
          });
        } else if (err.code === err.TIMEOUT) {
          setGeoMsg("انتهت مهلة انتظار GPS الدقيق. أعد المحاولة.");
          notify({
            title: "مهلة GPS",
            msg: "لم تصل قراءة بدقة 50 مترًا خلال 10 ثوانٍ.",
            level: "warn",
          });
        }
      },
      { enableHighAccuracy: true, timeout: GPS_TIMEOUT_MS, maximumAge: 0 },
    );
  }, [notify, pushFix, stopReal]);

  /* ───── محاكاة المسار ───── */
  const stopSim = useCallback(() => {
    if (simRef.current) {
      window.clearInterval(simRef.current);
      simRef.current = null;
    }
  }, []);

  const startSim = useCallback(() => {
    stopReal();
    startRef.current = Date.now();
    simKmRef.current = 0;
    simTickRef.current = 0;
    lastPosRef.current = null;
    routeRef.current = [SIM_PATH[0]];
    adapterRef.current?.setView(SIM_PATH[0][0], SIM_PATH[0][1], 15);
    adapterRef.current?.setMarker(SIM_PATH[0][0], SIM_PATH[0][1]);
    adapterRef.current?.setRoute(routeRef.current);
    setMode("sim");
    notify({
      title: "وضع المحاكاة الحية",
      msg: "مسار تجريبي على شارع النيل لتجربة القياسات قبل الخروج بالطلب الحقيقي.",
      level: "info",
    });
    beep("info");

    simRef.current = window.setInterval(() => {
      const i = simTickRef.current++;
      const spd = SIM_SPEEDS[i % SIM_SPEEDS.length];
      const stepKm = spd / 3600;
      simKmRef.current += stepKm;
      const pos = pointAt(simKmRef.current);
      const last = lastPosRef.current;
      const delta = last ? haversineKm(last, pos) : 0;
      lastPosRef.current = pos;
      speedRef.current = spd;
      distRef.current += delta;
      litersRef.current += ((stepKm * l100Ref.current) / 100) * speedFactor(spd);
      routeRef.current.push(pos);
      if (routeRef.current.length > 900) routeRef.current.shift();
      adapterRef.current?.setMarker(pos[0], pos[1]);
      adapterRef.current?.setRoute(routeRef.current);
      if (i % 3 === 0) adapterRef.current?.setView(pos[0], pos[1], 16);
    }, 1000);
  }, [notify, pushFix, stopReal, stopSim]);

  const stopAll = useCallback(() => {
    stopReal();
    stopSim();
    setMode("idle");
    setLocationAccuracy(null);
    gpsAcceptedRef.current = false;
    adapterRef.current?.clearMarker();
    speedRef.current = 0;
    setSpeed(0);
  }, [stopReal, stopSim]);

  useEffect(
    () => () => {
      stopReal();
      stopSim();
    },
    [stopReal, stopSim],
  );

  const resetTrip = () => {
    distRef.current = 0;
    litersRef.current = 0;
    speedRef.current = 0;
    simKmRef.current = 0;
    lastPosRef.current = null;
    routeRef.current = [];
    startRef.current = Date.now();
    tankWarnedRef.current = false;
    setDist(0);
    setLiters(0);
    setSpeed(0);
    setElapsed(0);
    adapterRef.current?.setRoute([]);
    if (mode === "idle") adapterRef.current?.clearMarker();
    notify({ title: "تم تصفير العدّاد", msg: "رحلة جديدة بدأت من الصفر.", level: "info" });
  };

  const cost = liters * fuelPrice;
  const remaining = Math.max(0, vehicle.tank_capacity_liters - liters);
  const rpmTag =
    speed > limit ? "تجاوز السرعة ⚠️" : speed > 90 ? "حرق مرتفع" : speed > 0 ? "حرق مثالي" : "متوقف";
  const rpmColor =
    speed > limit ? "#FF7B72" : speed > 90 ? "#F2A900" : speed > 0 ? "#31C48D" : "#8FA39B";

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60,
  ).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {/* قراءات حيّة */}
      <div className="grid grid-cols-3 gap-2.5">
        <div
          className="rounded-2xl border bg-[#0D1412] p-3 text-center transition-colors"
          style={{ borderColor: speed > limit ? "#F0443866" : "#1E2B26" }}
        >
          <span className="block text-[10px] font-bold text-[#8FA39B]">السرعة الحالية</span>
          <div className="mt-0.5 flex items-baseline justify-center gap-1">
            <span className="num text-3xl font-black" style={{ color: rpmColor }}>
              {Math.round(speed)}
            </span>
            <span className="text-[10px] font-bold text-[#6A7A73]">كم/س</span>
          </div>
          <span className="mt-1 block text-[10px] font-black" style={{ color: rpmColor }}>
            {rpmTag}
          </span>
        </div>

        <div className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3 text-center">
          <span className="block text-[10px] font-bold text-[#8FA39B]">المسافة المقطوعة</span>
          <div className="mt-0.5 flex items-baseline justify-center gap-1">
            <span className="num text-3xl font-black text-white">{dist.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-[#6A7A73]">كم</span>
          </div>
          <span className="mt-1 block text-[10px] font-bold text-[#6A7A73]">{mmss} دقيقة</span>
        </div>

        <div className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3 text-center">
          <span className="block text-[10px] font-bold text-[#8FA39B]">البنزين المستهلك</span>
          <div className="mt-0.5 flex items-baseline justify-center gap-1">
            <span className="num text-3xl font-black text-[#F2A900]">{cost.toFixed(1)}</span>
            <span className="text-[10px] font-bold text-[#6A7A73]">ج.م</span>
          </div>
          <span className="num mt-1 block text-[10px] font-bold text-[#8FA39B]">
            {liters.toFixed(3)} لتر
          </span>
        </div>
      </div>

      {/* الخريطة */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1E2B26] bg-[#0D1412]">
        <div
          ref={holderRef}
          className="h-[46vh] min-h-[300px] w-full bg-[#0D1412] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
        />

        {/* شريط الحالة فوق الخريطة */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <span className="rounded-lg border border-[#1E2B26] bg-[#070B0A]/90 px-2 py-1 text-[10px] font-black text-[#8FA39B] backdrop-blur">
            {engineName === "google" ? "Google Maps" : "خريطة تفاعلية"} •{" "}
            {mode === "real" ? "GPS حقيقي" : mode === "sim" ? "محاكاة" : "في الانتظار"}
            {mode === "real" && locationAccuracy !== null
              ? ` • دقة ${Math.round(locationAccuracy)} م`
              : ""}
          </span>
          <span className="num rounded-lg border border-[#1E2B26] bg-[#070B0A]/90 px-2 py-1 text-[10px] font-black text-[#31C48D] backdrop-blur">
            متبقي {remaining.toFixed(1)} لتر
          </span>
        </div>

        {mapError && (
          <div className="absolute inset-x-0 bottom-0 bg-[#F2A900]/15 px-3 py-2 text-[11px] font-bold text-[#F2A900] backdrop-blur">
            {mapError}
          </div>
        )}

        {mode === "idle" && !consent && perm !== "denied" && perm !== "granted" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070B0A]/80 px-6 text-center backdrop-blur-sm">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F2A900" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.6" />
            </svg>
            <p className="max-w-xs text-[12px] font-bold leading-relaxed text-white">
              الخريطة جاهزة — نحتاج إذنك بفتح الموقع لبدء قياس المسافة والسرعة.
            </p>
            <button
              onClick={() => setConsent(true)}
              className="rounded-xl bg-[#F2A900] px-5 py-2.5 text-xs font-black text-[#0A0F0D] transition active:scale-95"
            >
              تشغيل الخريطة الذكية
            </button>
          </div>
        )}

        {/* نافذة الموافقة على فتح الموقع */}
        {consent && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#070B0A]/88 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-4 text-right">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2A900]/15">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F2A900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                </span>
                <h3 className="text-sm font-black text-white">الموافقة على فتح الموقع GPS</h3>
              </div>
              <ul className="space-y-1.5 text-[11px] leading-relaxed text-[#8FA39B]">
                <li>• قياس المسافة المقطوعة فعلًا لحظة بلحظة.</li>
                <li>• حساب السرعة الحالية وتنبيهك عند تجاوز الحد.</li>
                <li>• تقدير البنزين المستهلك منذ بداية الرحلة.</li>
              </ul>
              <p className="mt-2 text-[10px] text-[#6A7A73]">
                لا تُرسل بيانات موقعك لأي خادم — كل الحسابات على جهازك.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConsent(false)}
                  className="rounded-xl border border-[#1E2B26] py-2.5 text-xs font-black text-[#8FA39B] transition active:scale-95"
                >
                  لاحقًا
                </button>
                <button
                  onClick={startReal}
                  className="rounded-xl bg-[#31C48D] py-2.5 text-xs font-black text-[#07110D] transition active:scale-95"
                >
                  السماح وبدء التتبع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* دليل إصلاح رفض الإذن */}
        {perm === "denied" && mode === "idle" && (
          <div className="absolute inset-0 overflow-auto bg-[#070B0A]/94 px-5 py-4 backdrop-blur-sm">
            <h3 className="text-sm font-black text-[#FF7B72]">لم يُسمح بالموقع</h3>
            <p className="mt-1 text-[11px] font-bold text-[#8FA39B]">فعّل إذن الموقع الدقيق ثم أعد المحاولة:</p>
            <ol className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-white">
              <li>1) اضغط على أيقونة القفل / ⓘ في شريط عنوان المتصفح.</li>
              <li>2) اختر «الأذونات» ← «الموقع» ← «السماح».</li>
              <li>3) فعّل «الوصول الدقيق / High accuracy» من إعدادات الموقع بالهاتف.</li>
              <li>4) ارجع للتطبيق واضغط «السماح وبدء التتبع».</li>
            </ol>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPerm("unknown")}
                className="rounded-xl border border-[#1E2B26] py-2.5 text-xs font-black text-[#8FA39B]"
              >
                إغلاق
              </button>
              <button
                onClick={startReal}
                className="rounded-xl bg-[#F2A900] py-2.5 text-xs font-black text-[#0A0F0D] active:scale-95"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}
      </div>

      {geoMsg && perm === "granted" && (
        <p className="rounded-xl border border-[#F2A900]/40 bg-[#F2A900]/10 px-3 py-2 text-[11px] font-bold text-[#F2A900]">
          {geoMsg}
        </p>
      )}

      {/* التحكم */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => (mode === "real" ? stopAll() : startReal())}
          className={`rounded-xl py-2.5 text-[11px] font-black transition active:scale-95 ${
            mode === "real"
              ? "bg-[#F04438] text-white"
              : "bg-[#31C48D] text-[#07110D]"
          }`}
        >
          {mode === "real" ? "إيقاف التتبع" : "تتبع GPS حقيقي"}
        </button>
        <button
          onClick={() => (mode === "sim" ? stopAll() : startSim())}
          className={`rounded-xl py-2.5 text-[11px] font-black transition active:scale-95 ${
            mode === "sim" ? "bg-[#F04438] text-white" : "bg-[#1B2A4A] text-[#9FC0FF]"
          }`}
        >
          {mode === "sim" ? "إيقاف المحاكاة" : "محاكاة حية"}
        </button>
        <button
          onClick={resetTrip}
          className="rounded-xl border border-[#1E2B26] bg-[#0D1412] py-2.5 text-[11px] font-black text-[#8FA39B] transition active:scale-95"
        >
          تصفير العدّاد
        </button>
      </div>

      {/* حد السرعة + إعدادات الخريطة */}
      <div className="rounded-2xl border border-[#1E2B26] bg-[#0D1412] p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black text-white">حد تنبيه السرعة</h4>
            <p className="mt-0.5 text-[10px] text-[#8FA39B]">
              تنبيه صوتي وبصري عند التجاوز — لتفادي الرادارات وحرق البنزين الزائد.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={30}
              max={180}
              step={5}
              value={limit}
              onChange={(e) => {
                const v = Math.min(180, Math.max(30, parseInt(e.target.value, 10) || 80));
                setLimit(v);
                saveSetting("speedLimit", v);
              }}
              className="num w-16 rounded-lg border border-[#1E2B26] bg-[#070B0A] px-2 py-1.5 text-center text-sm font-extrabold text-[#F2A900] outline-none focus:border-[#F2A900]"
              dir="ltr"
            />
            <span className="text-[10px] font-bold text-[#8FA39B]">كم/س</span>
          </div>
        </div>

        <button
          onClick={() => setShowSettings((s) => !s)}
          className="mt-3 w-full rounded-lg border border-[#1E2B26] py-2 text-[11px] font-black text-[#8FA39B]"
        >
          {showSettings ? "إخفاء إعدادات الخريطة" : "إعدادات الخريطة (Google Maps API)"}
        </button>

        {showSettings && (
          <div className="mt-2.5 space-y-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold text-[#8FA39B]">
                مفتاح Google Maps API (اختياري)
              </span>
              <input
                value={gkey}
                onChange={(e) => setGkey(e.target.value)}
                dir="ltr"
                placeholder="AIza..."
                className="w-full rounded-lg border border-[#1E2B26] bg-[#070B0A] px-3 py-2 text-left text-xs text-white outline-none focus:border-[#F2A900]"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  saveSetting("gmapsKey", gkey.trim());
                  setMapError(null);
                  void buildAdapter();
                }}
                className="rounded-lg bg-[#F2A900] py-2 text-[11px] font-black text-[#0A0F0D] active:scale-95"
              >
                تطبيق المفتاح
              </button>
              <button
                onClick={() => {
                  setGkey("");
                  saveSetting("gmapsKey", "");
                  void buildAdapter();
                }}
                className="rounded-lg border border-[#1E2B26] py-2 text-[11px] font-black text-[#8FA39B] active:scale-95"
              >
                استخدام الخريطة الأساسية
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-[#6A7A73]">
              بدون مفتاح تعمل الخريطة التفاعلية الكاملة فورًا. المفتاح يُحفظ على جهازك ويُحمَّل
              Google Maps بواجهة عربية.
            </p>
          </div>
        )}
      </div>

      {/* ملخص الرحلة */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { k: "المسافة", v: `${dist.toFixed(2)} كم`, c: "#ffffff" },
          { k: "اللتر المستهلك", v: `${liters.toFixed(3)} لتر`, c: "#F2A900" },
          { k: "تكلفة البنزين", v: `${cost.toFixed(1)} ج.م`, c: "#FF7B72" },
          { k: "تكلفة الكيلو", v: `${((liters / (dist || 1)) * fuelPrice).toFixed(2)} ج`, c: "#31C48D" },
        ].map((x) => (
          <div key={x.k} className="rounded-xl border border-[#1E2B26] bg-[#0D1412] p-2.5">
            <span className="block text-[10px] font-bold text-[#8FA39B]">{x.k}</span>
            <span className="num mt-0.5 block text-sm font-extrabold" style={{ color: x.c }}>
              {x.v}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-[#6A7A73]">
        {vehicle.brand_ar} {vehicle.model} • {l100.toFixed(2)} لتر/100كم • {fuelPrice} ج/لتر
      </p>
    </div>
  );
}
