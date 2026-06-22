import type { ReactNode, CSSProperties } from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  style?: CSSProperties;
}

export function StatCard({ value, label, sublabel, icon, trend, style }: StatCardProps) {
  const trendUp = trend && trend.value >= 0;

  return (
    <article
      className="card"
      aria-label={`${label}: ${value}`}
      style={{ padding: "20px 22px", ...style }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--heading)", lineHeight: 1.1 }}>
            {value}
          </p>
          {sublabel && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--muted)" }}>{sublabel}</p>
          )}
          {trend && (
            <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 600, color: trendUp ? "var(--green, #057642)" : "var(--coral, #cc1016)" }}>
              {trendUp ? "↑" : "↓"} {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ""}
            </p>
          )}
        </div>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              fontSize: 24,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--blue-soft, #dce6f1)",
              borderRadius: 10,
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
      </div>
    </article>
  );
}
