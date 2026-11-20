export interface TripInput {
  tripKm: number;
  pickupKm: number;
  fare: number;
  wearPercent: number;
  l100: number;
  fuelPrice: number;
  isMotorcycle: boolean;
}

export interface TripResult {
  totalKm: number;
  liters: number;
  fuelCost: number;
  wearCost: number;
  expense: number;
  net: number;
  profitPerKm: number;
  recommendedFare: number;
  costPerKm: number;
  verdict: "win" | "weak" | "loss";
}

/** حساب جدوى الرحلة: (المسافة × الاستهلاك ÷ 100) × السعر + الإهلاك */
export function calcTrip(t: TripInput): TripResult {
  const totalKm = Math.max(0, t.tripKm) + Math.max(0, t.pickupKm);
  const liters = (totalKm * t.l100) / 100;
  const fuelCost = liters * t.fuelPrice;
  const wearCost = fuelCost * (t.wearPercent / 100);
  const expense = fuelCost + wearCost;
  const net = t.fare - expense;
  const profitPerKm = t.tripKm > 0 ? net / t.tripKm : 0;
  const costPerKm = (t.l100 / 100) * t.fuelPrice;

  // حد أدنى عادل: لا تقل عن ضعف التكلفة ولا عن سعر الكيلومتر المعقول للفئة
  const minRatePerKm = t.isMotorcycle ? 3.5 : 6.5;
  const recommendedFare = Math.max(
    Math.ceil(expense * 2.2),
    Math.ceil(totalKm * minRatePerKm),
  );

  const weakThreshold = t.isMotorcycle ? 2.2 : 3.8;
  const verdict: TripResult["verdict"] =
    net <= 0 ? "loss" : profitPerKm < weakThreshold ? "weak" : "win";

  return {
    totalKm,
    liters,
    fuelCost,
    wearCost,
    expense,
    net,
    profitPerKm,
    recommendedFare,
    costPerKm,
    verdict,
  };
}

/** عامل الاحتكاك بالسرعة: فوق 90 كم/س يرتفع الاستهلاك ~15% */
export function speedFactor(speedKmh: number): number {
  if (speedKmh <= 90) return 1;
  if (speedKmh >= 140) return 1.3;
  return 1 + (speedKmh - 90) * 0.003;
}

export function litersForDistance(km: number, l100: number, speedKmh = 60): number {
  return ((km * l100) / 100) * speedFactor(speedKmh);
}

export function vehicleCostPerKm(v: { liters_per_100km_avg: number }, price: number): number {
  return (v.liters_per_100km_avg / 100) * price;
}

export const money = (n: number, digits = 1): string =>
  `${n.toFixed(digits)} ج.م`;

export const km2 = (n: number): string => `${n.toFixed(2)} كم`;
