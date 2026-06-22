"use client";
import { useId, forwardRef, type InputHTMLAttributes, type CSSProperties } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "style"> {
  label?: string;
  hint?: string;
  error?: string;
  onChange?: (value: string) => void;
  prefix?: string;
  suffix?: string;
  style?: CSSProperties;
  wrapperStyle?: CSSProperties;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, onChange, prefix, suffix, style, wrapperStyle, required, ...rest },
  ref
) {
  const id = useId();
  const hintId = useId();
  const errorId = useId();

  return (
    <div style={wrapperStyle}>
      {label && (
        <label
          htmlFor={id}
          style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5, color: "var(--muted-strong)" }}
        >
          {label}
          {required && <span aria-hidden="true" style={{ color: "var(--coral, #cc1016)", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{ position: "absolute", left: 12, fontSize: 14, color: "var(--muted)", pointerEvents: "none" }}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          required={required}
          aria-required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={[hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined}
          onChange={(e) => onChange?.(e.target.value)}
          className={error ? "inputError" : undefined}
          style={{
            width: "100%",
            minHeight: 44,
            padding: `0 ${suffix ? "40px" : "12px"} 0 ${prefix ? "32px" : "12px"}`,
            borderRadius: 8,
            border: `1.5px solid ${error ? "var(--coral, #cc1016)" : "var(--line)"}`,
            fontSize: 14,
            color: "var(--text)",
            background: rest.disabled ? "var(--surface-muted)" : "var(--surface)",
            ...style,
          }}
          {...rest}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 12, fontSize: 14, color: "var(--muted)", pointerEvents: "none" }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="fieldError">{error}</p>
      )}
    </div>
  );
});
