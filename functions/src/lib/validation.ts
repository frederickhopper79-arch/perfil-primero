import { HttpsError } from "firebase-functions/v2/https";

// Helpers de validación y saneamiento — puros, testables.

/** Quita etiquetas HTML y `javascript:` de una entrada de texto (anti-XSS). */
export function sanitize(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").slice(0, maxLen).trim();
}

/** Exige un string no vacío; devuelve la versión saneada o lanza invalid-argument. */
export function assertString(val: unknown, field: string): string {
  if (typeof val !== "string" || !val.trim()) {
    throw new HttpsError("invalid-argument", `${field} es requerido.`);
  }
  return sanitize(val);
}

/** Exige un entero positivo o lanza invalid-argument. */
export function assertPositiveInt(val: unknown, field: string): number {
  const n = Number(val);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpsError("invalid-argument", `${field} debe ser un número entero positivo.`);
  }
  return n;
}

/** Valida un RUT chileno por dígito verificador (módulo 11). */
export function validateRutCl(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 8) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return dv === expected;
}
