// Utilidades de fecha para Chile

type FirestoreTimestamp = { seconds: number; nanoseconds?: number };
type DateLike = Date | FirestoreTimestamp | string | number | null | undefined;

/** Convierte cualquier representación de fecha a Date */
export function toDate(value: DateLike): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "object" && "seconds" in value) return new Date(value.seconds * 1000);
  const d = new Date(value as string | number);
  return isNaN(d.getTime()) ? null : d;
}

/** Días entre dos fechas (positivo si date2 > date1) */
export function daysBetween(date1: DateLike, date2: DateLike = new Date()): number {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  if (!d1 || !d2) return 0;
  return Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
}

/** Verifica si una fecha ya pasó */
export function isPast(date: DateLike): boolean {
  const d = toDate(date);
  return d ? d.getTime() < Date.now() : false;
}

/** Verifica si una fecha está en el futuro */
export function isFuture(date: DateLike): boolean {
  const d = toDate(date);
  return d ? d.getTime() > Date.now() : false;
}

/** Verifica si una fecha es hoy */
export function isToday(date: DateLike): boolean {
  const d = toDate(date);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

/** Agrega días a una fecha */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Inicio del día (00:00:00) */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Fin del día (23:59:59.999) */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Inicio del mes */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Fin del mes */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** Formatea como ISO date: "2026-06-22" */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Semana del año (1-53) */
export function weekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Formatea duración en ms como texto: "2h 30m" */
export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}
