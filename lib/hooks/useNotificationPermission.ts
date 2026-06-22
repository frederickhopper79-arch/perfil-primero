"use client";
import { useState, useEffect, useCallback } from "react";

type PermissionState = "granted" | "denied" | "default" | "unsupported";

interface UseNotificationPermissionReturn {
  permission: PermissionState;
  request: () => Promise<PermissionState>;
  supported: boolean;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
  const supported = typeof window !== "undefined" && "Notification" in window;

  const [permission, setPermission] = useState<PermissionState>(
    supported ? (Notification.permission as PermissionState) : "unsupported"
  );

  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission as PermissionState);
  }, [supported]);

  const request = useCallback(async (): Promise<PermissionState> => {
    if (!supported) return "unsupported";
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      return result as PermissionState;
    } catch {
      return "denied";
    }
  }, [supported]);

  return { permission, request, supported };
}
