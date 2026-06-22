"use client";
import { useEffect, useState } from "react";

type ScrollDir = "up" | "down" | "idle";

export function useScrollDirection(threshold = 10): ScrollDir {
  const [dir, setDir] = useState<ScrollDir>("idle");
  const lastY = { current: 0 };

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const diff = y - lastY.current;
      if (Math.abs(diff) < threshold) return;
      setDir(diff > 0 ? "down" : "up");
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return dir;
}
