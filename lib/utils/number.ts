// Utilidades numéricas

/** Clamp: mantiene valor entre min y max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Redondea a n decimales */
export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Mapea un valor de un rango a otro */
export function remap(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  const t = (value - fromMin) / (fromMax - fromMin);
  return lerp(toMin, toMax, t);
}

/** Porcentaje de a sobre b */
export function pct(a: number, b: number, decimals = 0): number {
  if (b === 0) return 0;
  return round((a / b) * 100, decimals);
}

/** Variación porcentual de a a b: (b-a)/a */
export function pctChange(from: number, to: number, decimals = 1): number {
  if (from === 0) return 0;
  return round(((to - from) / Math.abs(from)) * 100, decimals);
}

/** Formatea número con separador de miles chileno */
export function thousands(n: number): string {
  return n.toLocaleString("es-CL");
}

/** Convierte a entero seguro (NaN → 0) */
export function safeInt(value: unknown, fallback = 0): number {
  const n = parseInt(String(value), 10);
  return isNaN(n) ? fallback : n;
}

/** Convierte a float seguro (NaN → 0) */
export function safeFloat(value: unknown, fallback = 0): number {
  const n = parseFloat(String(value));
  return isNaN(n) ? fallback : n;
}

/** Verifica si es un número positivo */
export function isPositive(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

/** Estadísticas básicas de array numérico */
export function stats(arr: number[]): { min: number; max: number; mean: number; median: number; sum: number } {
  if (arr.length === 0) return { min: 0, max: 0, mean: 0, median: 0, sum: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const sum = arr.reduce((a, b) => a + b, 0);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return { min: sorted[0], max: sorted[sorted.length - 1], mean: sum / arr.length, median, sum };
}
