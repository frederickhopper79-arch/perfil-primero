"use client";
import { useEffect, useState } from "react";

type ConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";

interface NetworkStatus {
  online: boolean;
  connectionType: ConnectionType;
  saveData: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  function getStatus(): NetworkStatus {
    if (typeof navigator === "undefined") {
      return { online: true, connectionType: "unknown", saveData: false };
    }
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    return {
      online: navigator.onLine,
      connectionType: (conn?.effectiveType as ConnectionType) ?? "unknown",
      saveData: conn?.saveData ?? false,
    };
  }

  const [status, setStatus] = useState<NetworkStatus>(getStatus);

  useEffect(() => {
    const update = () => setStatus(getStatus());
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener("change", update);
    };
  }, []);

  return status;
}
