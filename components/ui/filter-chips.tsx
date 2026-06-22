"use client";
import type { CSSProperties } from "react";

interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string[];
  onToggle: (id: string) => void;
  multiSelect?: boolean;
  style?: CSSProperties;
  label?: string;
}

export function FilterChips({ chips, selected, onToggle, multiSelect = true, style, label }: FilterChipsProps) {
  return (
    <div role="group" aria-label={label} style={style}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {chips.map((chip) => {
          const active = selected.includes(chip.id);
          return (
            <button
              key={chip.id}
              role="checkbox"
              aria-checked={active}
              onClick={() => onToggle(chip.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 999,
                border: `1.5px solid ${active ? "var(--blue, #0a66c2)" : "var(--line)"}`,
                background: active ? "var(--blue-soft, #dce6f1)" : "var(--surface)",
                color: active ? "var(--blue-dark, #004182)" : "var(--muted-strong)",
                fontWeight: active ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s ease",
                userSelect: "none",
              }}
            >
              {chip.label}
              {chip.count !== undefined && (
                <span style={{
                  fontSize: 11,
                  background: active ? "var(--blue, #0a66c2)" : "var(--line)",
                  color: active ? "white" : "var(--muted)",
                  borderRadius: 999,
                  padding: "0 5px",
                  fontWeight: 700,
                }}>
                  {chip.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
