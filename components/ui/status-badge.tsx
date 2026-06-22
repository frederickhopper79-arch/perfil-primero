import type { CSSProperties } from "react";

type StatusLevel = "operational" | "degraded" | "outage" | "maintenance" | "unknown";

const STATUS_CONFIG: Record<StatusLevel, { label: string; color: string; bg: string; dot: string }> = {
  operational: { label: "Operacional", color: "#16a34a", bg: "#dcfce7", dot: "#22c55e" },
  degraded: { label: "Degradado", color: "#92400e", bg: "#fef9c3", dot: "#f59e0b" },
  outage: { label: "Interrupción", color: "#dc2626", bg: "#fee2e2", dot: "#ef4444" },
  maintenance: { label: "Mantenimiento", color: "#1d4ed8", bg: "#dbeafe", dot: "#3b82f6" },
  unknown: { label: "Desconocido", color: "#6b7280", bg: "#f3f4f6", dot: "#9ca3af" },
};

interface StatusBadgeProps {
  status: StatusLevel;
  label?: string;
  pulse?: boolean;
  style?: CSSProperties;
}

export function StatusBadge({ status, label, pulse = true, style }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const displayLabel = label ?? cfg.label;

  return (
    <span
      role="status"
      aria-label={`Estado: ${displayLabel}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 999,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
          animation: pulse && status === "operational" ? "pulseDot 2s ease infinite" : undefined,
        }}
      />
      {displayLabel}
    </span>
  );
}
