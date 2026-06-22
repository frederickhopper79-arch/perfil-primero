"use client";
import { useState, useCallback } from "react";

export type PushStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export function usePushNotifications(uid?: string) {
  const [status, setStatus] = useState<PushStatus>(
    typeof Notification !== "undefined" ? "idle" : "unsupported"
  );
  const [token, setToken] = useState<string | null>(null);

  const request = useCallback(async () => {
    if (typeof Notification === "undefined") { setStatus("unsupported"); return; }
    setStatus("requesting");
    try {
      const { requestPushPermission, savePushToken } = await import("../firebase/notifications");
      const t = await requestPushPermission();
      if (t) {
        setToken(t);
        setStatus("granted");
        if (uid) await savePushToken(uid, t);
      } else {
        setStatus("denied");
      }
    } catch {
      setStatus("denied");
    }
  }, [uid]);

  return { status, token, request };
}
