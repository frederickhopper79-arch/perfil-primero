"use client";

type MemoryTier = "low" | "mid" | "high";

export function useDeviceMemory(): { gb: number | null; tier: MemoryTier } {
  const gb =
    typeof navigator !== "undefined" && "deviceMemory" in navigator
      ? (navigator as Navigator & { deviceMemory: number }).deviceMemory
      : null;

  let tier: MemoryTier = "high";
  if (gb !== null) {
    if (gb <= 1) tier = "low";
    else if (gb <= 4) tier = "mid";
  }

  return { gb, tier };
}
