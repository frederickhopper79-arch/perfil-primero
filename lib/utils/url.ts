// Utilidades de URL y parámetros para Perfil Primero

/** Parsea URLSearchParams a objeto tipado */
export function parseSearchParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => { result[key] = value; });
  return result;
}

/** Construye URL con query params, ignorando valores vacíos */
export function buildUrl(base: string, params: Record<string, string | number | boolean | null | undefined>): string {
  const url = new URL(base, typeof window !== "undefined" ? window.location.origin : "https://perfil-primero.web.app");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

/** Extrae UTM params de la URL actual */
export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value;
  });
  return utm;
}

/** Verifica si una URL es absoluta */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Obtiene el dominio de una URL */
export function getDomain(url: string): string {
  try { return new URL(url).hostname; }
  catch { return url; }
}

/** Genera URL de compartir para perfil worker (pública, sin datos) */
export function profileShareUrl(profileCode: string): string {
  return `https://perfil-primero.web.app/r?c=${encodeURIComponent(profileCode)}`;
}

/** Genera URL de referido */
export function referralUrl(referrerId: string): string {
  return `https://perfil-primero.web.app/?ref=${encodeURIComponent(referrerId)}`;
}

/** Elimina parámetros de tracking de URL para privacidad */
export function stripTrackingParams(url: string): string {
  try {
    const u = new URL(url);
    const trackingParams = ["fbclid", "gclid", "msclkid", "mc_eid", "ref", "_ga"];
    trackingParams.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch { return url; }
}
