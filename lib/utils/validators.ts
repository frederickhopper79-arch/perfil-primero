export function validateRut(raw: string): boolean {
  const cleaned = raw.replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  let sum = 0, factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rem = 11 - (sum % 11);
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  return dv === expected;
}

export function formatRut(raw: string): string {
  const cleaned = raw.replace(/[.\-\s]/g, "").toUpperCase();
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePhone(phone: string): boolean {
  return /^\+?[\d\s\-()]{7,20}$/.test(phone.trim());
}

export function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

export function validateSalaryRange(min: number, max: number): string | null {
  if (min > 0 && min < 350_000) return "La renta mínima no puede ser inferior al sueldo mínimo legal ($350.000).";
  if (min > 0 && max > 0 && min > max) return "La renta mínima no puede ser mayor que la renta máxima.";
  return null;
}
