"use client";
import { useId } from "react";
import { formatCLP } from "@/lib/utils/format";

interface SalaryRangeInputProps {
  minValue: number;
  maxValue: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  currency?: string;
  step?: number;
  min?: number;
  max?: number;
  error?: string;
}

export function SalaryRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  currency = "CLP",
  step = 50_000,
  min = 460_000,
  max = 20_000_000,
  error,
}: SalaryRangeInputProps) {
  const minId = useId();
  const maxId = useId();
  const errorId = useId();

  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-strong)", marginBottom: 10 }}>
        Rango de renta mensual bruta ({currency})
      </legend>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor={minId} style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
            Mínimo
          </label>
          <input
            id={minId}
            type="number"
            min={min}
            max={maxValue}
            step={step}
            value={minValue || ""}
            onChange={(e) => onMinChange(Number(e.target.value))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            placeholder="Ej: 800.000"
            style={{ width: "100%", minHeight: 44, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${error ? "var(--coral)" : "var(--line)"}`, fontSize: 14 }}
          />
          {minValue > 0 && (
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--muted)" }}>{formatCLP(minValue)}</p>
          )}
        </div>
        <div>
          <label htmlFor={maxId} style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
            Máximo
          </label>
          <input
            id={maxId}
            type="number"
            min={minValue || min}
            max={max}
            step={step}
            value={maxValue || ""}
            onChange={(e) => onMaxChange(Number(e.target.value))}
            placeholder="Ej: 1.200.000"
            style={{ width: "100%", minHeight: 44, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${error ? "var(--coral)" : "var(--line)"}`, fontSize: 14 }}
          />
          {maxValue > 0 && (
            <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--muted)" }}>{formatCLP(maxValue)}</p>
          )}
        </div>
      </div>
      {error && <p id={errorId} role="alert" className="fieldError" style={{ marginTop: 6 }}>{error}</p>}
      {minValue > 0 && maxValue > 0 && !error && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--muted-strong)", fontWeight: 600 }}>
          Rango: {formatCLP(minValue)} – {formatCLP(maxValue)}
        </p>
      )}
    </fieldset>
  );
}
