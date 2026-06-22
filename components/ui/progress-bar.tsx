interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
}

export function ProgressBar({
  value, max = 100, label, showPercent = true,
  color = "var(--primary,#2563eb)", height = 8,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ width: "100%" }}>
      {(label || showPercent) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, color: "var(--muted,#6b7280)" }}>
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ width: "100%", height, borderRadius: height, background: "var(--border,#e5e7eb)", overflow: "hidden" }}
      >
        <div
          style={{
            height: "100%", width: `${pct}%`,
            background: color,
            borderRadius: height,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
