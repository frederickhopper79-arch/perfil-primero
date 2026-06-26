import type { FC } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "green" | "amber" | "coral";
  size?: "xs" | "sm" | "md";
  label?: string;
  showValue?: boolean;
  animate?: boolean;
}

const COLORS = {
  primary: "var(--color-primary)",
  green: "var(--green)",
  amber: "var(--amber)",
  coral: "var(--coral)",
};

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "primary",
  size = "sm",
  label,
  showValue = false,
  animate = false,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const height = size === "xs" ? 4 : size === "sm" ? 6 : 10;

  return (
    <div style={{ width: "100%" }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
          {label && <span style={{ color: "var(--muted)" }}>{label}</span>}
          {showValue && <span style={{ fontWeight: 700, color: COLORS[color] }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        style={{
          background: "var(--line)",
          borderRadius: height,
          height,
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          style={{
            background: COLORS[color],
            height: "100%",
            borderRadius: height,
            width: `${pct}%`,
            transition: animate ? "width 0.6s cubic-bezier(.4,0,.2,1)" : undefined,
          }}
        />
      </div>
    </div>
  );
};
