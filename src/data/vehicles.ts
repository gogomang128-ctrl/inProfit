// inProfit — قاعدة بيانات المركبات في مصر (Egypt Vehicle Database)
// القيم: متوسطات استهلاك واقعية من مواصفات الشركات وتجارب القيادة داخل مصر.
// km_per_liter_avg تُحسب برمجيًا بدقة: 100 / liters_per_100km_avg (دائرتان عشريتان)

export type VehicleType = "car" | "motorcycle";
export type VehicleCategory = "ridehail" | "chinese" | "suv" | "motorcycle";
export type FuelOctane = "80" | "92" | "95";

export interface RawVehicle {
  id: string;
  type: VehicleType;
  category: VehicleCategory;
  brand_ar: string;
  brand_en: string;
  model: string;
  years: string;
  engine_cc: number;
  fuel_type: FuelOctane;
  liters_per_100km_city: number;
  liters_per_100km_highway: number;
  liters_per_100km_avg: number;
  tank_capacity_liters: number;
  note: string;
}

export interface Vehicle extends RawVehicle {
  km_per_liter_avg: number;
}

const RAW: RawVehicle[] = [
  // ═══════════════ 1) سيارات النقل الذكي (سيدان اقتصادية) ═══════════════
  {
    id: "nissan_sunny_n16", type: "car", category: "ridehail",
    brand_ar: "نيسان", brand_en: "Nissan", model: "صني N16", years: "2005-2012",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.6, liters_per_100km_highway: 6.2, liters_per_100km_avg: 7.5,
    tank_capacity_liters: 47, note: "مانيوال — متينة وتتحمل الشغل اليومي",
  },
  {
    id: "nissan_sunny_n17", type: "car", category: "ridehail",
    brand_ar: "نيسان", brand_en: "Nissan", model: "صني N17", years: "2012-2019",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 9.0, liters_per_100km_highway: 6.3, liters_per_100km_avg: 7.7,
    tank_capacity_liters: 47, note: "أوتوماتيك CVT — الأكثر استخدامًا في النقل الذكي",
  },
  {
    id: "nissan_sentra", type: "car", category: "ridehail",
    brand_ar: "نيسان", brand_en: "Nissan", model: "سنترا", years: "2013-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.2, liters_per_100km_highway: 6.5, liters_per_100km_avg: 7.9,
    tank_capacity_liters: 50, note: "مساحة أكبر من الصني واستهلاك مماثل",
  },
  {
    id: "chevrolet_optra", type: "car", category: "ridehail",
    brand_ar: "شيفروليه", brand_en: "Chevrolet", model: "أوبترا", years: "2005-2016",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.6, liters_per_100km_highway: 6.9, liters_per_100km_avg: 8.3,
    tank_capacity_liters: 53, note: "1.6 أوطو/مانيوال — قوية في التكييف",
  },
  {
    id: "chevrolet_aveo", type: "car", category: "ridehail",
    brand_ar: "شيفروليه", brand_en: "Chevrolet", model: "أفيو", years: "2005-2020",
    engine_cc: 1400, fuel_type: "92",
    liters_per_100km_city: 8.8, liters_per_100km_highway: 6.2, liters_per_100km_avg: 7.5,
    tank_capacity_liters: 48, note: "خفة وسهولة صيانة قطعها",
  },
  {
    id: "chevrolet_lanos", type: "car", category: "ridehail",
    brand_ar: "شيفروليه", brand_en: "Chevrolet", model: "لانوس", years: "2004-2013",
    engine_cc: 1400, fuel_type: "80",
    liters_per_100km_city: 9.4, liters_per_100km_highway: 6.6, liters_per_100km_avg: 8.0,
    tank_capacity_liters: 50, note: "تشتغل على 80 بدون مشاكل — اقتصادية مستعملة",
  },
  {
    id: "hyundai_accent_rb", type: "car", category: "ridehail",
    brand_ar: "هيونداي", brand_en: "Hyundai", model: "أكسنت RB", years: "2011-2017",
    engine_cc: 1400, fuel_type: "92",
    liters_per_100km_city: 8.6, liters_per_100km_highway: 5.9, liters_per_100km_avg: 7.2,
    tank_capacity_liters: 43, note: "من أقل السيارات استهلاكًا في الفئة",
  },
  {
    id: "hyundai_elantra_hd", type: "car", category: "ridehail",
    brand_ar: "هيونداي", brand_en: "Hyundai", model: "إلنترا HD", years: "2006-2010",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.2, liters_per_100km_highway: 6.5, liters_per_100km_avg: 7.8,
    tank_capacity_liters: 52, note: "1.6 أوتوماتيك — راحة عالية للرحلات الطويلة",
  },
  {
    id: "hyundai_elantra_ad", type: "car", category: "ridehail",
    brand_ar: "هيونداي", brand_en: "Hyundai", model: "إلنترا AD", years: "2016-2020",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.7, liters_per_100km_highway: 6.1, liters_per_100km_avg: 7.3,
    tank_capacity_liters: 50, note: "هيكل أخف و cvt موفرة",
  },
  {
    id: "hyundai_elantra_cn7", type: "car", category: "ridehail",
    brand_ar: "هيونداي", brand_en: "Hyundai", model: "إلنترا CN7", years: "2021-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.3, liters_per_100km_highway: 5.8, liters_per_100km_avg: 7.0,
    tank_capacity_liters: 50, note: "الجيل الأحدث — أفضل توازن بين الفخامة والاقتصاد",
  },
  {
    id: "hyundai_verna", type: "car", category: "ridehail",
    brand_ar: "هيونداي", brand_en: "Hyundai", model: "فيرنا", years: "2017-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.8, liters_per_100km_highway: 6.1, liters_per_100km_avg: 7.4,
    tank_capacity_liters: 43, note: "خليفة أكسنت — استهلاك منخفض",
  },
  {
    id: "toyota_corolla", type: "car", category: "ridehail",
    brand_ar: "تويوتا", brand_en: "Toyota", model: "كورولا (كل الأجيال)", years: "2005-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.9, liters_per_100km_highway: 6.2, liters_per_100km_avg: 7.5,
    tank_capacity_liters: 50, note: "E150/E170/E210 — أعلي تحملًا للمشاهدة والأجرة",
  },
  {
    id: "toyota_yaris", type: "car", category: "ridehail",
    brand_ar: "تويوتا", brand_en: "Toyota", model: "ياريس", years: "2012-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 7.9, liters_per_100km_highway: 5.5, liters_per_100km_avg: 6.7,
    tank_capacity_liters: 42, note: "من أوفر سيارات الفئة في الزحام",
  },
  {
    id: "suzuki_dzire", type: "car", category: "ridehail",
    brand_ar: "سوزوكي", brand_en: "Suzuki", model: "ديزاير", years: "2017-2026",
    engine_cc: 1200, fuel_type: "92",
    liters_per_100km_city: 6.9, liters_per_100km_highway: 4.9, liters_per_100km_avg: 5.9,
    tank_capacity_liters: 37, note: "الأوفر في السيارات الجديدة — ممتاز للنقل الذكي",
  },
  {
    id: "suzuki_ciaz", type: "car", category: "ridehail",
    brand_ar: "سوزوكي", brand_en: "Suzuki", model: "سياز", years: "2017-2026",
    engine_cc: 1400, fuel_type: "92",
    liters_per_100km_city: 7.6, liters_per_100km_highway: 5.3, liters_per_100km_avg: 6.5,
    tank_capacity_liters: 43, note: "سيدان واسعة باستهلاك اقتصادي",
  },
  {
    id: "suzuki_swift", type: "car", category: "ridehail",
    brand_ar: "سوزوكي", brand_en: "Suzuki", model: "سويفت", years: "2012-2026",
    engine_cc: 1200, fuel_type: "92",
    liters_per_100km_city: 7.5, liters_per_100km_highway: 5.2, liters_per_100km_avg: 6.4,
    tank_capacity_liters: 37, note: "خفيفة وسهلة في الزحام",
  },
  {
    id: "suzuki_alto", type: "car", category: "ridehail",
    brand_ar: "سوزوكي", brand_en: "Suzuki", model: "ألتو", years: "2012-2026",
    engine_cc: 800, fuel_type: "92",
    liters_per_100km_city: 6.6, liters_per_100km_highway: 4.6, liters_per_100km_avg: 5.7,
    tank_capacity_liters: 35, note: "أخف سيارة في الزحام وأقل تكلفة كيلومتر",
  },
  {
    id: "suzuki_espresso", type: "car", category: "ridehail",
    brand_ar: "سوزوكي", brand_en: "Suzuki", model: "إسبريسو", years: "2020-2026",
    engine_cc: 660, fuel_type: "92",
    liters_per_100km_city: 6.2, liters_per_100km_highway: 4.5, liters_per_100km_avg: 5.4,
    tank_capacity_liters: 30, note: "KEI كار — أوفر مركبة في مصر حاليًا",
  },
  {
    id: "kia_cerato", type: "car", category: "ridehail",
    brand_ar: "كيا", brand_en: "Kia", model: "سيراتو", years: "2013-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.9, liters_per_100km_highway: 6.2, liters_per_100km_avg: 7.5,
    tank_capacity_liters: 50, note: "الأكثر مبيعًا في مصر — قطع غيار وفيرة",
  },
  {
    id: "kia_rio", type: "car", category: "ridehail",
    brand_ar: "كيا", brand_en: "Kia", model: "ريو", years: "2011-2023",
    engine_cc: 1400, fuel_type: "92",
    liters_per_100km_city: 8.6, liters_per_100km_highway: 5.9, liters_per_100km_avg: 7.2,
    tank_capacity_liters: 43, note: "منافس أكسنت مباشرة",
  },
  {
    id: "kia_picanto", type: "car", category: "ridehail",
    brand_ar: "كيا", brand_en: "Kia", model: "بيكانتو", years: "2011-2026",
    engine_cc: 1250, fuel_type: "92",
    liters_per_100km_city: 7.3, liters_per_100km_highway: 5.1, liters_per_100km_avg: 6.2,
    tank_capacity_liters: 35, note: "مدينة صغيرة واقتصادية جدًا",
  },
  {
    id: "renault_logan", type: "car", category: "ridehail",
    brand_ar: "رينو", brand_en: "Renault", model: "لوجان", years: "2006-2024",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.0, liters_per_100km_highway: 6.2, liters_per_100km_avg: 7.6,
    tank_capacity_liters: 50, note: "مساحة أمتعة ضخمة — ممتازة للمطار",
  },
  {
    id: "renault_stepway", type: "car", category: "ridehail",
    brand_ar: "رينو", brand_en: "Renault", model: "ستيب واي", years: "2015-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.3, liters_per_100km_highway: 6.5, liters_per_100km_avg: 7.9,
    tank_capacity_liters: 50, note: "كروس أوفر مرتفعة تنفع للطرق الوعرة",
  },
  {
    id: "renault_megane", type: "car", category: "ridehail",
    brand_ar: "رينو", brand_en: "Renault", model: "ميجان", years: "2009-2022",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.5, liters_per_100km_highway: 6.6, liters_per_100km_avg: 8.1,
    tank_capacity_liters: 50, note: "راحة طريق السريع ممتازة",
  },
  {
    id: "renault_taliant", type: "car", category: "ridehail",
    brand_ar: "رينو", brand_en: "Renault", model: "تاليانت", years: "2021-2026",
    engine_cc: 1000, fuel_type: "92",
    liters_per_100km_city: 8.3, liters_per_100km_highway: 5.7, liters_per_100km_avg: 7.0,
    tank_capacity_liters: 45, note: "محرك TCe 1.0 جديد — استهلاك منخفض",
  },
  {
    id: "mitsubishi_lancer_buma", type: "car", category: "ridehail",
    brand_ar: "ميتسوبيشي", brand_en: "Mitsubishi", model: "لانسر بومة", years: "2007-2015",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.2, liters_per_100km_highway: 6.5, liters_per_100km_avg: 7.8,
    tank_capacity_liters: 55, note: "خزان كبير — تناسب الطرق الطويلة",
  },
  {
    id: "mitsubishi_lancer_shark", type: "car", category: "ridehail",
    brand_ar: "ميتسوبيشي", brand_en: "Mitsubishi", model: "لانسر شارك", years: "2016-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.9, liters_per_100km_highway: 6.3, liters_per_100km_avg: 7.6,
    tank_capacity_liters: 55, note: "هيكل أحدث باستهلاك أفضل قليلًا",
  },
  {
    id: "mitsubishi_attrage", type: "car", category: "ridehail",
    brand_ar: "ميتسوبيشي", brand_en: "Mitsubishi", model: "أتراج", years: "2013-2026",
    engine_cc: 1200, fuel_type: "92",
    liters_per_100km_city: 7.3, liters_per_100km_highway: 5.1, liters_per_100km_avg: 6.2,
    tank_capacity_liters: 42, note: "أوفر سيدان متوسطة في مصر",
  },
  {
    id: "fiat_tipo_manual", type: "car", category: "ridehail",
    brand_ar: "فيات", brand_en: "Fiat", model: "تيبو مانيوال", years: "2016-2026",
    engine_cc: 1400, fuel_type: "92",
    liters_per_100km_city: 8.6, liters_per_100km_highway: 5.9, liters_per_100km_avg: 7.2,
    tank_capacity_liters: 50, note: "مانيوال — استهلاك أقل من الأوطو",
  },
  {
    id: "fiat_tipo_auto", type: "car", category: "ridehail",
    brand_ar: "فيات", brand_en: "Fiat", model: "تيبو أوتوماتيك", years: "2016-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.4, liters_per_100km_highway: 6.5, liters_per_100km_avg: 8.0,
    tank_capacity_liters: 50, note: "أوتوماتيك — أعلى استهلاك من المانيوال",
  },
  {
    id: "fiat_punto", type: "car", category: "ridehail",
    brand_ar: "فيات", brand_en: "Fiat", model: "بونتو", years: "2005-2016",
    engine_cc: 1400, fuel_type: "92",
    liters_per_100km_city: 8.9, liters_per_100km_highway: 6.1, liters_per_100km_avg: 7.5,
    tank_capacity_liters: 45, note: "أوروبية خفيفة على البنزين",
  },
  {
    id: "fiat_shahin", type: "car", category: "ridehail",
    brand_ar: "فيات", brand_en: "Fiat", model: "شاهين", years: "2024-2026",
    engine_cc: 1500, fuel_type: "80",
    liters_per_100km_city: 8.5, liters_per_100km_highway: 5.9, liters_per_100km_avg: 7.2,
    tank_capacity_liters: 45, note: "المصرية الجديدة — تتحمل بنزين 80",
  },
  {
    id: "lada_granta", type: "car", category: "ridehail",
    brand_ar: "لادا", brand_en: "Lada", model: "جرانتا", years: "2013-2026",
    engine_cc: 1600, fuel_type: "80",
    liters_per_100km_city: 9.7, liters_per_100km_highway: 6.7, liters_per_100km_avg: 8.2,
    tank_capacity_liters: 50, note: "روسية بسيطة — صيانة رخيصة وتشتغل على 80",
  },

  // ═══════════════ 2) السيارات الصينية الحديثة ═══════════════
  {
    id: "byd_f3", type: "car", category: "chinese",
    brand_ar: "بي واي دي", brand_en: "BYD", model: "F3", years: "2013-2022",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.7, liters_per_100km_highway: 6.2, liters_per_100km_avg: 7.4,
    tank_capacity_liters: 50, note: "مانيوال/أوطو — استهلاك مقبول",
  },
  {
    id: "byd_l3", type: "car", category: "chinese",
    brand_ar: "بي واي دي", brand_en: "BYD", model: "L3", years: "2012-2020",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.5, liters_per_100km_highway: 6.0, liters_per_100km_avg: 7.3,
    tank_capacity_liters: 50, note: "تجهيز جيد مقابل سعرها",
  },
  {
    id: "chery_arizo_5", type: "car", category: "chinese",
    brand_ar: "شيري", brand_en: "Chery", model: "أريزو 5", years: "2017-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.1, liters_per_100km_highway: 5.8, liters_per_100km_avg: 6.9,
    tank_capacity_liters: 48, note: "من أوفر السيدان الصينية في مصر",
  },
  {
    id: "chery_tiggo_3", type: "car", category: "chinese",
    brand_ar: "شيري", brand_en: "Chery", model: "تيجو 3", years: "2016-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 9.3, liters_per_100km_highway: 6.8, liters_per_100km_avg: 8.0,
    tank_capacity_liters: 51, note: "SUV صغيرة اقتصادية",
  },
  {
    id: "chery_tiggo_7", type: "car", category: "chinese",
    brand_ar: "شيري", brand_en: "Chery", model: "تيجو 7", years: "2018-2026",
    engine_cc: 1500, fuel_type: "95",
    liters_per_100km_city: 9.6, liters_per_100km_highway: 6.9, liters_per_100km_avg: 8.3,
    tank_capacity_liters: 51, note: "توربو 1.5 — يُفضّل بنزين 95",
  },
  {
    id: "chery_tiggo_8", type: "car", category: "chinese",
    brand_ar: "شيري", brand_en: "Chery", model: "تيجو 8", years: "2020-2026",
    engine_cc: 1600, fuel_type: "95",
    liters_per_100km_city: 10.4, liters_per_100km_highway: 7.5, liters_per_100km_avg: 9.0,
    tank_capacity_liters: 58, note: "7 مقاعد — استهلاك أعلى بسبب الحجم",
  },
  {
    id: "mg_5", type: "car", category: "chinese",
    brand_ar: "إم جي", brand_en: "MG", model: "MG 5", years: "2021-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.3, liters_per_100km_highway: 5.9, liters_per_100km_avg: 7.1,
    tank_capacity_liters: 50, note: "CVT موفرة على الطرق",
  },
  {
    id: "mg_6", type: "car", category: "chinese",
    brand_ar: "إم جي", brand_en: "MG", model: "MG 6", years: "2019-2026",
    engine_cc: 1500, fuel_type: "95",
    liters_per_100km_city: 9.2, liters_per_100km_highway: 6.4, liters_per_100km_avg: 7.8,
    tank_capacity_liters: 55, note: "سبورت سيدان — أداء أعلى واستهلاك أكبر",
  },
  {
    id: "mg_zs", type: "car", category: "chinese",
    brand_ar: "إم جي", brand_en: "MG", model: "MG ZS", years: "2019-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 9.2, liters_per_100km_highway: 6.5, liters_per_100km_avg: 7.9,
    tank_capacity_liters: 45, note: "كروس أوفر مطلوبة للعائلات",
  },
  {
    id: "mg_rx5", type: "car", category: "chinese",
    brand_ar: "إم جي", brand_en: "MG", model: "MG RX5", years: "2017-2024",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 9.8, liters_per_100km_highway: 6.9, liters_per_100km_avg: 8.4,
    tank_capacity_liters: 55, note: "SUV متوسطة — تيربو 1.5",
  },
  {
    id: "dongfeng_shine", type: "car", category: "chinese",
    brand_ar: "دونج فينغ", brand_en: "Dongfeng", model: "شاين", years: "2023-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 7.7, liters_per_100km_highway: 5.4, liters_per_100km_avg: 6.6,
    tank_capacity_liters: 45, note: "محرك جديد اقتصادي — من الأوفر في الصينية",
  },
  {
    id: "geely_emgrand_7", type: "car", category: "chinese",
    brand_ar: "جيلي", brand_en: "Geely", model: "إمجراند 7", years: "2016-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.5, liters_per_100km_highway: 6.0, liters_per_100km_avg: 7.3,
    tank_capacity_liters: 50, note: "جودة تجميع جيدة واستهلاك متوازن",
  },
  {
    id: "geely_coolray", type: "car", category: "chinese",
    brand_ar: "جيلي", brand_en: "Geely", model: "كول راي", years: "2019-2026",
    engine_cc: 1500, fuel_type: "95",
    liters_per_100km_city: 9.4, liters_per_100km_highway: 6.6, liters_per_100km_avg: 8.0,
    tank_capacity_liters: 45, note: "SUV تيربو 1.5 — تحتاج 95",
  },
  {
    id: "changan_alsvin", type: "car", category: "chinese",
    brand_ar: "شانجان", brand_en: "Changan", model: "ألسفن", years: "2023-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 7.7, liters_per_100km_highway: 5.4, liters_per_100km_avg: 6.6,
    tank_capacity_liters: 45, note: "蓝鲸 محرك Blue Whale — اقتصادية ممتازة",
  },
  {
    id: "changan_eado", type: "car", category: "chinese",
    brand_ar: "شانجان", brand_en: "Changan", model: "إيدو", years: "2012-2023",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 8.7, liters_per_100km_highway: 6.1, liters_per_100km_avg: 7.4,
    tank_capacity_liters: 52, note: "سيدان متوسطة مستعملة شائعة",
  },
  {
    id: "proton_saga", type: "car", category: "chinese",
    brand_ar: "بروتون", brand_en: "Proton", model: "ساجا", years: "2019-2026",
    engine_cc: 1300, fuel_type: "92",
    liters_per_100km_city: 8.1, liters_per_100km_highway: 5.7, liters_per_100km_avg: 6.9,
    tank_capacity_liters: 40, note: "اقتصادية ماليزية خفيفة",
  },
  {
    id: "baic_u5_plus", type: "car", category: "chinese",
    brand_ar: "بايك", brand_en: "BAIC", model: "U5 Plus", years: "2021-2026",
    engine_cc: 1500, fuel_type: "92",
    liters_per_100km_city: 8.7, liters_per_100km_highway: 6.1, liters_per_100km_avg: 7.4,
    tank_capacity_liters: 50, note: "تجهيز إلكتروني وفير",
  },

  // ═══════════════ 3) SUV والكروس أوفر ═══════════════
  {
    id: "kia_sportage", type: "car", category: "suv",
    brand_ar: "كيا", brand_en: "Kia", model: "سبورتاج", years: "2016-2026",
    engine_cc: 1600, fuel_type: "95",
    liters_per_100km_city: 11.0, liters_per_100km_highway: 7.6, liters_per_100km_avg: 9.4,
    tank_capacity_liters: 58, note: "توربو 1.6 — تحتاج 95 لحماية المحرك",
  },
  {
    id: "hyundai_tucson", type: "car", category: "suv",
    brand_ar: "هيونداي", brand_en: "Hyundai", model: "توسان", years: "2015-2026",
    engine_cc: 1600, fuel_type: "95",
    liters_per_100km_city: 10.8, liters_per_100km_highway: 7.4, liters_per_100km_avg: 9.2,
    tank_capacity_liters: 62, note: "توسان TL/ NX4 — خزان كبير للطرق الطويلة",
  },
  {
    id: "nissan_qashqai", type: "car", category: "suv",
    brand_ar: "نيسان", brand_en: "Nissan", model: "قشقاي", years: "2014-2026",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.8, liters_per_100km_highway: 6.7, liters_per_100km_avg: 8.3,
    tank_capacity_liters: 55, note: "كروس أوفر الأكثر مبيعًا في مصر",
  },
  {
    id: "nissan_juke", type: "car", category: "suv",
    brand_ar: "نيسان", brand_en: "Nissan", model: "جوك", years: "2014-2024",
    engine_cc: 1600, fuel_type: "92",
    liters_per_100km_city: 9.6, liters_per_100km_highway: 6.6, liters_per_100km_avg: 8.1,
    tank_capacity_liters: 46, note: "صغيرة وخفة في المدينة",
  },
  {
    id: "toyota_corolla_cross", type: "car", category: "suv",
    brand_ar: "تويوتا", brand_en: "Toyota", model: "كورولا كروس", years: "2021-2026",
    engine_cc: 1800, fuel_type: "92",
    liters_per_100km_city: 9.2, liters_per_100km_highway: 6.5, liters_per_100km_avg: 7.9,
    tank_capacity_liters: 50, note: "هايبرد 1.8 — استهلاك ممتاز لحجمها",
  },

  // ═══════════════ 4) الموتوسيكلات (دليفري وركاب) ═══════════════
  {
    id: "vigorey_vlr_200", type: "motorcycle", category: "motorcycle",
    brand_ar: "فيجوري", brand_en: "Vigorey", model: "VLR 200", years: "2019-2026",
    engine_cc: 200, fuel_type: "92",
    liters_per_100km_city: 2.7, liters_per_100km_highway: 2.2, liters_per_100km_avg: 2.4,
    tank_capacity_liters: 16, note: "الأكثر انتشارًا في الدليفري — قوية واقتصادية",
  },
  {
    id: "vigorey_vlr_150", type: "motorcycle", category: "motorcycle",
    brand_ar: "فيجوري", brand_en: "Vigorey", model: "VLR 150", years: "2018-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.2, liters_per_100km_highway: 1.8, liters_per_100km_avg: 2.0,
    tank_capacity_liters: 14, note: "أخف على البنزين من الـ 200",
  },
  {
    id: "bajaj_boxer_150", type: "motorcycle", category: "motorcycle",
    brand_ar: "بجاج", brand_en: "Bajaj", model: "Boxer 150", years: "2010-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.0, liters_per_100km_highway: 1.6, liters_per_100km_avg: 1.8,
    tank_capacity_liters: 15, note: "الأوفر موتوسيكل في مصر — اقتصادية خرافية",
  },
  {
    id: "bajaj_pulsar_180", type: "motorcycle", category: "motorcycle",
    brand_ar: "بجاج", brand_en: "Bajaj", model: "Pulsar 180", years: "2012-2026",
    engine_cc: 180, fuel_type: "92",
    liters_per_100km_city: 2.7, liters_per_100km_highway: 2.2, liters_per_100km_avg: 2.4,
    tank_capacity_liters: 15, note: "أداء رياضي — استهلاك أعلى قليلًا",
  },
  {
    id: "haojiang_3", type: "motorcycle", category: "motorcycle",
    brand_ar: "هوجان", brand_en: "Haojiang", model: "Haojiang 3 (150cc)", years: "2015-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.4, liters_per_100km_highway: 2.0, liters_per_100km_avg: 2.2,
    tank_capacity_liters: 14, note: "شائعة جدًا في الشوارع المصرية",
  },
  {
    id: "haojiang_f250", type: "motorcycle", category: "motorcycle",
    brand_ar: "هوجان", brand_en: "Haojiang", model: "F250", years: "2017-2026",
    engine_cc: 250, fuel_type: "92",
    liters_per_100km_city: 3.2, liters_per_100km_highway: 2.7, liters_per_100km_avg: 2.9,
    tank_capacity_liters: 17, note: "250 سي سي — قوية للطرق الكبيرة",
  },
  {
    id: "haojiang_l250", type: "motorcycle", category: "motorcycle",
    brand_ar: "هوجان", brand_en: "Haojiang", model: "L250", years: "2018-2026",
    engine_cc: 250, fuel_type: "92",
    liters_per_100km_city: 3.3, liters_per_100km_highway: 2.8, liters_per_100km_avg: 3.0,
    tank_capacity_liters: 17, note: "نيكيد 250 — توازن بين القوة والاقتصاد",
  },
  {
    id: "dayun_4", type: "motorcycle", category: "motorcycle",
    brand_ar: "دايون", brand_en: "Dayun", model: "Dayun 4 (150cc)", years: "2016-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.3, liters_per_100km_highway: 1.9, liters_per_100km_avg: 2.1,
    tank_capacity_liters: 14, note: "عمل يومي موثوق وقطع غيار رخيصة",
  },
  {
    id: "dayun_6", type: "motorcycle", category: "motorcycle",
    brand_ar: "دايون", brand_en: "Dayun", model: "Dayun 6 (200cc)", years: "2018-2026",
    engine_cc: 200, fuel_type: "92",
    liters_per_100km_city: 2.7, liters_per_100km_highway: 2.3, liters_per_100km_avg: 2.5,
    tank_capacity_liters: 16, note: "200 سي سي — ممتازة للدليفري الطويل",
  },
  {
    id: "halawa_express_200", type: "motorcycle", category: "motorcycle",
    brand_ar: "حلاوة", brand_en: "Halawa", model: "Express 200", years: "2018-2026",
    engine_cc: 200, fuel_type: "92",
    liters_per_100km_city: 2.8, liters_per_100km_highway: 2.3, liters_per_100km_avg: 2.5,
    tank_capacity_liters: 16, note: "إكسبريس 200 — شكل رياضي واستهلاك معقول",
  },
  {
    id: "halawa_express_150", type: "motorcycle", category: "motorcycle",
    brand_ar: "حلاوة", brand_en: "Halawa", model: "Express 150", years: "2017-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.3, liters_per_100km_highway: 1.9, liters_per_100km_avg: 2.1,
    tank_capacity_liters: 14, note: "نسخة 150 أخف استهلاكًا",
  },
  {
    id: "benelli_vlr_150", type: "motorcycle", category: "motorcycle",
    brand_ar: "بينيلي", brand_en: "Benelli", model: "VLR 150", years: "2019-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.3, liters_per_100km_highway: 1.9, liters_per_100km_avg: 2.1,
    tank_capacity_liters: 14, note: "جودة إيطالية بسعر مصري",
  },
  {
    id: "benelli_vlm_200", type: "motorcycle", category: "motorcycle",
    brand_ar: "بينيلي", brand_en: "Benelli", model: "VLM 200", years: "2019-2026",
    engine_cc: 200, fuel_type: "92",
    liters_per_100km_city: 2.7, liters_per_100km_highway: 2.2, liters_per_100km_avg: 2.4,
    tank_capacity_liters: 16, note: "كروزر عملية للشغل اليومي",
  },
  {
    id: "benelli_tnt_150", type: "motorcycle", category: "motorcycle",
    brand_ar: "بينيلي", brand_en: "Benelli", model: "TNT 150", years: "2018-2026",
    engine_cc: 150, fuel_type: "92",
    liters_per_100km_city: 2.5, liters_per_100km_highway: 2.1, liters_per_100km_avg: 2.3,
    tank_capacity_liters: 16, note: "نيكيد رياضية — ثبات عالي",
  },
];

export const vehicles: Vehicle[] = RAW.map((v) => ({
  ...v,
  km_per_liter_avg: Math.round((100 / v.liters_per_100km_avg) * 100) / 100,
}));

export const categoryLabels: Record<VehicleCategory, string> = {
  ridehail: "سيارات النقل الذكي",
  chinese: "سيارات صينية حديثة",
  suv: "SUV وكروس أوفر",
  motorcycle: "موتوسيكلات",
};

export const getVehicle = (id: string): Vehicle | undefined =>
  vehicles.find((v) => v.id === id);

export const DEFAULT_VEHICLE_ID = "vigorey_vlr_200";
