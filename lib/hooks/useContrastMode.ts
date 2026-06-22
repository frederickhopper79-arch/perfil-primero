"use client";
import { useMediaQuery } from "./useMediaQuery";

export function useContrastMode(): "more" | "less" | "no-preference" {
  const more = useMediaQuery("(prefers-contrast: more)");
  const less = useMediaQuery("(prefers-contrast: less)");
  if (more) return "more";
  if (less) return "less";
  return "no-preference";
}
