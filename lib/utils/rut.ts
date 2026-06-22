/**
 * Validates a Chilean RUT (Rol Único Tributario).
 * Accepts formats: 12345678-9, 12.345.678-9, 123456789
 */
export function validateRut(raw: string): boolean {
  const clean = raw.replace(/\./g, "").replace(/-/g, "").toUpperCase().trim();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const computed = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  return dv === computed;
}

/**
 * Formats a RUT string to canonical form: 12.345.678-9
 */
export function formatRut(raw: string): string {
  const clean = raw.replace(/\./g, "").replace(/-/g, "").toUpperCase().trim();
  if (clean.length < 2) return raw;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + dv;
}
