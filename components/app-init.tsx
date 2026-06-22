"use client";
import { useEffect } from "react";

// Inicialización client-side: Web Vitals + Service Worker
export function AppInit() {
  useEffect(() => {
    // Web Vitals reporting
    import("@/lib/utils/web-vitals").then(({ initWebVitals }) => {
      initWebVitals();
    }).catch(() => {});

    // Service Worker registration
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
  }, []);

  return null;
}
