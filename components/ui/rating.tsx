"use client";
import { useState } from "react";

interface RatingProps {
  value?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  max?: number;
}

export function Rating({ value = 0, onChange, readOnly = false, max = 5 }: RatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div
      role={readOnly ? undefined : "group"}
      aria-label={readOnly ? `Calificación: ${value} de ${max}` : "Selecciona una calificación"}
      style={{ display: "inline-flex", gap: 2 }}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = (hover || value) > i;
        return (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1} estrella${i > 0 ? "s" : ""}`}
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(i + 1)}
            onMouseEnter={() => !readOnly && setHover(i + 1)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{
              background: "none",
              border: "none",
              cursor: readOnly ? "default" : "pointer",
              padding: 1,
              fontSize: 20,
              color: filled ? "var(--amber)" : "var(--line-strong)",
              lineHeight: 1,
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
