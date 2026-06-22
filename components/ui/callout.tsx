import type { ReactNode, CSSProperties } from "react";

type CalloutVariant = "info" | "tip" | "warning" | "danger" | "success";

const VARIANTS: Record<CalloutVariant, { border: string; bg: string; icon: string; label: string }> = {
  info: { border: "#3b82f6", bg: "#eff6ff", icon: "ℹ️", label: "Información" },
  tip: { border: "#8b5cf6", bg: "#f5f3ff", icon: "💡", label: "Consejo" },
  warning: { border: "#f59e0b", bg: "#fffbeb", icon: "⚠️", label: "Atención" },
  danger: { border: "#ef4444", bg: "#fef2f2", icon: "🚨", label: "Peligro" },
  success: { border: "#22c55e", bg: "#f0fdf4", icon: "✅", label: "Éxito" },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export function Callout({ variant = "info", title, children, style }: CalloutProps) {
  const v = VARIANTS[variant];
  return (
    <div
      style={{
        borderLeft: `4px solid ${v.border}`,
        background: v.bg,
        borderRadius: "0 8px 8px 0",
        padding: "14px 16px",
        ...style,
      }}
    >
      <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: v.border }}>
        {v.icon} {title ?? v.label}
      </p>
      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
