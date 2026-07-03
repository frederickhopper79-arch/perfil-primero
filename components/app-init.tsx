"use client";
import { useEffect } from "react";

// Inicialización client-side: Web Vitals + Service Worker
// Push notifications se suscriben dentro de worker-onboarding via Web Push API + VAPID
export function AppInit() {
  useEffect(() => {
    // Web Vitals reporting
    import("@/lib/utils/web-vitals").then(({ initWebVitals }) => {
      initWebVitals();
    }).catch(() => {});

    // Service Worker registration (maneja push, cache y sync offline)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  return null;
}
