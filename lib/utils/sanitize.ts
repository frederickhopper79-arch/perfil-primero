const TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /javascript:/gi;

export function sanitizeText(input: string, maxLength = 2000): string {
  return input.replace(TAG_RE, "").replace(SCRIPT_RE, "").slice(0, maxLength).trim();
}

export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeRut(raw: string): string {
  return raw.replace(/[^0-9kK.\-]/g, "").toUpperCase().slice(0, 12);
}

export function sanitizePhone(raw: string): string {
  return raw.replace(/[^0-9+\s\-()]/g, "").slice(0, 20);
}
