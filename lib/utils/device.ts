// Device detection utilities (client-side only)

export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
}

export function isPWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function supportsWebShare(): boolean {
  return typeof navigator !== "undefined" && "share" in navigator;
}

export function supportsVibration(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function supportsNotifications(): boolean {
  return typeof Notification !== "undefined";
}

export function supportsServiceWorker(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function getDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return window.devicePixelRatio ?? 1;
}

export function getConnectionType(): string {
  if (typeof navigator === "undefined") return "unknown";
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return conn?.effectiveType ?? "unknown";
}

export function isSlowConnection(): boolean {
  const type = getConnectionType();
  return type === "2g" || type === "slow-2g";
}

export function getTouchPointCount(): number {
  if (typeof navigator === "undefined") return 0;
  return navigator.maxTouchPoints ?? 0;
}

export function isTouchDevice(): boolean {
  return getTouchPointCount() > 0;
}
