"use client";
import { useState, useEffect } from "react";

interface BatteryState {
  level: number | null;
  charging: boolean | null;
  low: boolean;
}

export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>({ level: null, charging: null, low: false });

  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    let battery: { level: number; charging: boolean; addEventListener: Function; removeEventListener: Function } | null = null;

    function update() {
      if (!battery) return;
      setState({ level: battery.level, charging: battery.charging, low: battery.level < 0.2 && !battery.charging });
    }

    (navigator as Navigator & { getBattery(): Promise<typeof battery> })
      .getBattery()
      .then((b) => {
        if (!b) return;
        battery = b;
        update();
        b.addEventListener("levelchange", update);
        b.addEventListener("chargingchange", update);
      })
      .catch(() => {});

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", update);
        battery.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  return state;
}
