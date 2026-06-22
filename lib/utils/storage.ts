const PREFIX = "pp_";

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}

export function storageHas(key: string): boolean {
  try { return localStorage.getItem(PREFIX + key) !== null; }
  catch { return false; }
}

export function storageClear(prefix?: string): void {
  try {
    const targetPrefix = prefix ? `pp_${prefix}` : PREFIX;
    Object.keys(localStorage)
      .filter((k) => k.startsWith(targetPrefix))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// Claves centralizadas de Perfil Primero
export const STORAGE_KEYS = {
  WORKER_TOUR_DONE: "pp_worker_tour_done",
  COMPANY_TOUR_DONE: "pp_company_tour_done",
  BIENVENIDA_CHECKS: "pp_bienvenida_checks",
  COOKIE_CONSENT: "pp_cookie_consent",
  COMPARISON_LIST: "pp_comparison_list",
  FILTER_PREFERENCES: "pp_filter_prefs",
  ONBOARDING_BANNER_DISMISSED: "pp_onboarding_banner_dismissed",
  SHORTCUTS_SEEN: "pp_shortcuts_seen",
  LAST_SEEN_ANNOUNCEMENT: "pp_last_announcement",
  THEME_OVERRIDE: "pp_theme_override",
  NOTIFICATION_PERMISSION_ASKED: "pp_notif_asked",
  REFERRAL_CODE: "pp_ref",
  UTM_PARAMS: "pp_utm",
  LAST_ACTIVE_TAB: "pp_last_tab",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
