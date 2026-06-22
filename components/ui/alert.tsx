import type { ReactNode, CSSProperties } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

const VARIANT_STYLES: Record<AlertVariant, { bg: string; border: string; color: string; icon: string }> = {
  info: { bg: "var(--blue-soft, #dce6f1)", border: "var(--blue, #0a66c2)", color: "var(--blue-dark, #004182)", icon: "ℹ" },
  success: { bg: "var(--green-soft, #e7f3ee)", border: "var(--green, #057642)", color: "var(--green-dark, #04583a)", icon: "✓" },
  warning: { bg: "#fef9c3", border: "#ca8a04", color: "#92400e", icon: "⚠" },
  error: { bg: "#fee2e2", border: "var(--coral, #cc1016)", color: "#991b1b", icon: "✕" },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}

export function Alert({ variant = "info", title, children, icon, onDismiss, style }: AlertProps) {
  const v = VARIANT_STYLES[variant];
  const roleMap: Record<AlertVariant, string> = {
    info: "note",
    success: "status",
    warning: "alert",
    error: "alert",
  };

  return (
    <div
      role={roleMap[variant]}
      style={{
        display: "flex",
        gap: 12,
        background: v.bg,
        border: `1.5px solid ${v.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 16, color: v.color, flexShrink: 0, lineHeight: 1.4 }}>
        {icon ?? v.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <strong style={{ display: "block", fontSize: 14, color: v.color, marginBottom: 3 }}>
            {title}
          </strong>
        )}
        <div style={{ fontSize: 13, color: v.color, lineHeight: 1.5 }}>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Cerrar alerta"
          style={{
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: v.color,
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
