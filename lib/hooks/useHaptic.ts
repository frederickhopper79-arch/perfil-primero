"use client";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

const PATTERNS: Record<HapticPattern, number[]> = {
  light:   [10],
  medium:  [30],
  heavy:   [60],
  success: [10, 50, 10],
  error:   [50, 30, 50],
};

export function useHaptic() {
  function vibrate(pattern: HapticPattern = "light") {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(PATTERNS[pattern]);
    }
  }
  return { vibrate };
}
