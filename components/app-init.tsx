"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { requestPushPermission, savePushToken, onPushMessage } from "@/lib/firebase/notifications";

// Inicialización client-side: Web Vitals + Service Worker + Push notifications
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

    // Push notifications: solicitar permiso y guardar token cuando el usuario inicia sesión
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await requestPushPermission();
        if (token) await savePushToken(user.uid, token);
      } catch { /* sin bloquear */ }
    });

    // Escuchar mensajes push en foreground
    const unsubPush = onPushMessage((payload) => {
      if (!payload.notification) return;
      // Mostrar notificación nativa si la app está en foco y el sistema lo permite
      if (Notification.permission === "granted" && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title: payload.notification.title ?? "Perfil Primero",
          body: payload.notification.body ?? "",
          url: (payload.fcmOptions as Record<string,string> | undefined)?.link ?? "/"
        });
      }
    });

    return () => {
      unsub();
      if (unsubPush) unsubPush();
    };
  }, []);

  return null;
}
