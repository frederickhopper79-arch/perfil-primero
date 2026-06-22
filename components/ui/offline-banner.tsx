"use client";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      role="alert"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998,
        background: "#1c1c1c", color: "#fff",
        textAlign: "center", padding: "10px 16px",
        fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      <span>Sin conexión a internet. Los cambios se guardarán cuando vuelvas a conectarte.</span>
    </div>
  );
}
