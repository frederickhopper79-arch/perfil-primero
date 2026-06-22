"use client";
import { useId, type CSSProperties } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  style?: CSSProperties;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  error,
  hint,
  style,
}: SelectFieldProps) {
  const id = useId();
  const hintId = useId();
  const errorId = useId();

  return (
    <div style={style}>
      {label && (
        <label
          htmlFor={id}
          style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5, color: "var(--muted-strong)" }}
        >
          {label}
          {required && <span aria-hidden="true" style={{ color: "var(--coral, #cc1016)", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={[hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
        className={error ? "inputError" : undefined}
        style={{
          width: "100%",
          minHeight: 44,
          padding: "0 36px 0 12px",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23647488' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          borderRadius: 8,
          border: `1.5px solid ${error ? "var(--coral, #cc1016)" : "var(--line)"}`,
          fontSize: 14,
          color: value ? "var(--text)" : "var(--muted)",
          background: disabled ? "var(--surface-muted)" : "var(--surface)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={hintId} style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="fieldError">{error}</p>
      )}
    </div>
  );
}
