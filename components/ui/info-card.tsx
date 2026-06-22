import type { ReactNode, CSSProperties } from "react";

interface InfoCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  style?: CSSProperties;
  horizontal?: boolean;
}

export function InfoCard({ icon, title, description, action, style, horizontal = false }: InfoCardProps) {
  return (
    <div
      className="card"
      style={{
        padding: "22px 24px",
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: horizontal ? "flex-start" : undefined,
        gap: horizontal ? 16 : 12,
        ...style,
      }}
    >
      {icon && (
        <span
          aria-hidden="true"
          style={{
            fontSize: 28,
            width: 52,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--blue-soft, #dce6f1)",
            borderRadius: 12,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <div style={{ minWidth: 0 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--heading)" }}>{title}</h3>
        <p style={{ margin: action ? "0 0 14px" : 0, fontSize: 13, color: "var(--muted-strong)", lineHeight: 1.55 }}>{description}</p>
        {action && (
          action.href ? (
            <a href={action.href} className="button secondary" style={{ fontSize: 13, padding: "6px 14px" }}>
              {action.label}
            </a>
          ) : (
            <button className="button secondary" onClick={action.onClick} style={{ fontSize: 13, padding: "6px 14px" }}>
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}
