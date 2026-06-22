import type { ReactNode, CSSProperties } from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  badge?: string;
  centered?: boolean;
  style?: CSSProperties;
  level?: 1 | 2 | 3;
}

export function SectionHeader({
  title,
  description,
  action,
  badge,
  centered = false,
  style,
  level = 2,
}: SectionHeaderProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: centered ? "center" : "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
        textAlign: centered ? "center" : undefined,
        flexDirection: centered ? "column" : undefined,
        alignContent: centered ? "center" : undefined,
        ...style,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: centered ? "center" : undefined }}>
          <Tag style={{ margin: 0, fontSize: level === 1 ? 28 : level === 2 ? 20 : 16, fontWeight: 800, color: "var(--heading)" }}>
            {title}
          </Tag>
          {badge && (
            <span style={{
              background: "var(--blue-soft, #dce6f1)",
              color: "var(--blue-dark, #004182)",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
            }}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted-strong)", lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {action && !centered && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
