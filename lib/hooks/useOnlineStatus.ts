"use client";
import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  // Inicia en true para coincidir con el HTML del build (SSR/export) y evitar
  // un mismatch de hidratación. El estado real se sincroniza tras montar.
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}
