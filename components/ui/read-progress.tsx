"use client";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

interface ReadProgressProps {
  height?: number;
  color?: string;
  position?: "top" | "bottom";
}

export function ReadProgress({ height = 3, color = "var(--blue, #0a66c2)", position = "top" }: ReadProgressProps) {
  const progress = useScrollProgress();

  return (
    <div
      role="progressbar"
      aria-label="Progreso de lectura"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: "fixed",
        [position]: 0,
        left: 0,
        zIndex: 9999,
        width: `${progress * 100}%`,
        height,
        background: color,
        transition: "width 0.1s linear",
        pointerEvents: "none",
      }}
    />
  );
}
