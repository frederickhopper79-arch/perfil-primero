// Reglas de validación reutilizables para formularios

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/** Validación de email */
export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, message: "El email es obligatorio." };
  if (!re.test(email)) return { valid: false, message: "Ingresa un email válido." };
  return { valid: true };
}

/** Validación de contraseña */
export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: "La contraseña es obligatoria." };
  if (password.length < 8) return { valid: false, message: "La contraseña debe tener al menos 8 caracteres." };
  if (!/[A-Z]/.test(password)) return { valid: false, message: "Incluye al menos una letra mayúscula." };
  if (!/[0-9]/.test(password)) return { valid: false, message: "Incluye al menos un número." };
  return { valid: true };
}

/** Validación de RUT chileno */
export function validateRutField(rut: string): ValidationResult {
  if (!rut) return { valid: false, message: "El RUT es obligatorio." };
  const clean = rut.replace(/[^0-9kK]/g, "");
  if (clean.length < 7) return { valid: false, message: "El RUT es demasiado corto." };
  const dv = clean.slice(-1).toUpperCase();
  const body = clean.slice(0, -1);
  if (!/^\d+$/.test(body)) return { valid: false, message: "El cuerpo del RUT debe contener solo números." };
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  if (dv !== expected) return { valid: false, message: "El dígito verificador del RUT no es válido." };
  return { valid: true };
}

/** Validación de teléfono chileno */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) return { valid: false, message: "El teléfono es obligatorio." };
  const clean = phone.replace(/\D/g, "").replace(/^56/, "");
  if (clean.length !== 9 || !clean.startsWith("9")) {
    return { valid: false, message: "Ingresa un celular chileno válido (+56 9XXXXXXXX)." };
  }
  return { valid: true };
}

/** Validación de URL */
export function validateUrl(url: string): ValidationResult {
  if (!url) return { valid: true }; // Optional
  try { new URL(url); return { valid: true }; }
  catch { return { valid: false, message: "Ingresa una URL válida (incluye https://)." }; }
}

/** Validación de rango de salario */
export function validateSalaryRange(min: number, max: number): ValidationResult {
  if (min < 0) return { valid: false, message: "El salario mínimo no puede ser negativo." };
  if (max < min) return { valid: false, message: "El salario máximo debe ser mayor o igual al mínimo." };
  if (min < 460_000) return { valid: false, message: "El salario mínimo en Chile es $460.000 CLP (2026)." };
  if (max > 100_000_000) return { valid: false, message: "El salario parece inusualmente alto. Verifica el valor." };
  return { valid: true };
}

/** Longitud mínima y máxima */
export function validateLength(value: string, min: number, max: number, fieldName = "Campo"): ValidationResult {
  if (value.length < min) return { valid: false, message: `${fieldName} debe tener al menos ${min} caracteres.` };
  if (value.length > max) return { valid: false, message: `${fieldName} no puede superar ${max} caracteres.` };
  return { valid: true };
}

/** Obligatorio */
export function validateRequired(value: unknown, fieldName = "Este campo"): ValidationResult {
  const empty = value === null || value === undefined || String(value).trim() === "";
  return empty ? { valid: false, message: `${fieldName} es obligatorio.` } : { valid: true };
}

/** Combina múltiples validaciones — retorna primer error */
export function validate(...results: ValidationResult[]): ValidationResult {
  return results.find((r) => !r.valid) ?? { valid: true };
}
