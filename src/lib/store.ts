export interface DriverUser {
  name: string;
  phone: string;
  vehicleId: string;
  createdAt: number;
  lastLogin: number;
}

const USER_KEY = "driveprofit.user.v1";
const SESSION_KEY = "driveprofit.session.v1";

export const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("0020")) {
    const local = digits.slice(4);
    return local.startsWith("0") ? local : `0${local}`;
  }
  if (digits.startsWith("20")) {
    const local = digits.slice(2);
    return local.startsWith("0") ? local : `0${local}`;
  }
  return digits;
};

export const isValidEgyptianPhone = (raw: string): boolean => {
  const p = normalizePhone(raw);
  return /^01[0125]\d{8}$/.test(p);
};

export const saveUser = (user: DriverUser): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, String(Date.now()));
  } catch {
    /* تجاهل */
  }
};

export const loadUser = (): DriverUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as DriverUser;
    if (u && typeof u.name === "string" && typeof u.phone === "string") return u;
  } catch {
    /* تجاهل */
  }
  return null;
};

export const endSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* تجاهل */
  }
};

export const hasSession = (): boolean => {
  try {
    return !!localStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
};

/** حفظ إعدادات المركبة والتنبيهات محليًا لتسريع الدخول التالي */
export const saveSetting = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(`driveprofit.setting.${key}`, JSON.stringify(value));
  } catch {
    /* تجاهل */
  }
};

export const loadSetting = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`driveprofit.setting.${key}`);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    /* تجاهل */
  }
  return fallback;
};
