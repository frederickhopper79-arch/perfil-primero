"use client";
import { useMediaQuery } from "./useMediaQuery";

export function useColorScheme(): "dark" | "light" {
  return useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light";
}
