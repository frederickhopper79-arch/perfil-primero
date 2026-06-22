interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "neutral";
  size?: "sm" | "md";
}

const COLORS = {
  success: { bg: "#dcfce7", color: "#16a34a" },
  warning: { bg: "#fef9c3", color: "#ca8a04" },
  error:   { bg: "#fee2e2", color: "#dc2626" },
  info:    { bg: "#dbeafe", color: "#2563eb" },
  neutral: { bg: "#f3f4f6", color: "#6b7280" },
};

export function Badge({ label, variant = "neutral", size = "sm" }: BadgeProps) {
  const { bg, color } = COLORS[variant];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        borderRadius: 999,
        fontSize: size === "sm" ? 11 : 13,
        fontWeight: 600,
        background: bg,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function SemaphoreLight({ status }: { status: "green" | "yellow" | "red" | "none" }) {
  if (status === "none") return null;
  const colors = { green: "#16a34a", yellow: "#ca8a04", red: "#dc2626" };
  const labels = { green: "En tiempo", yellow: "Cerca del límite", red: "SLA vencido" };
  return (
    <span
      title={labels[status]}
      aria-label={labels[status]}
      style={{
        display: "inline-block",
        width: 10, height: 10, borderRadius: "50%",
        background: colors[status],
        flexShrink: 0,
      }}
    />
  );
}
