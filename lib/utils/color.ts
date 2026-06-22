// Utilidades de color para sistema de diseño

/** Convierte hex a RGB */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

/** Convierte RGB a hex */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Mezcla dos colores hex con un ratio (0 = hex1, 1 = hex2) */
export function mixColors(hex1: string, hex2: string, ratio = 0.5): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  if (!c1 || !c2) return hex1;
  return rgbToHex(
    Math.round(c1.r + (c2.r - c1.r) * ratio),
    Math.round(c1.g + (c2.g - c1.g) * ratio),
    Math.round(c1.b + (c2.b - c1.b) * ratio)
  );
}

/** Calcula luminosidad percibida (0=negro, 1=blanco) */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    const sRGB = v / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Retorna 'dark' o 'light' según el color de fondo para texto legible */
export function textOnBackground(bgHex: string): "dark" | "light" {
  return luminance(bgHex) > 0.179 ? "dark" : "light";
}

/** Genera variante más clara de un color hex */
export function lighten(hex: string, amount: number): string {
  return mixColors(hex, "#ffffff", amount);
}

/** Genera variante más oscura de un color hex */
export function darken(hex: string, amount: number): string {
  return mixColors(hex, "#000000", amount);
}

/** Agrega opacidad a color hex: hexAlpha("#0a66c2", 0.15) → "rgba(10,102,194,0.15)" */
export function hexAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

/** Paleta semántica de Perfil Primero */
export const BRAND_COLORS = {
  primary: "#0a66c2",
  primaryDark: "#004182",
  primaryLight: "#dce6f1",
  success: "#057642",
  successDark: "#04583a",
  successLight: "#e7f3ee",
  error: "#cc1016",
  errorLight: "#fee2e2",
  warning: "#f5a623",
  warningLight: "#fef9c3",
  neutral: "#647488",
  heading: "#0d1b2a",
  text: "#1c2837",
  muted: "#647488",
  line: "#d2d9e4",
  bg: "#f0f2f5",
  surface: "#ffffff",
} as const;
