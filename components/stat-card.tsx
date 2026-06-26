import type { FC, ReactNode } from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  sub?: string;
  icon?: ReactNode | string;
  trend?: { value: number; positive?: boolean };
  color?: "primary" | "green" | "amber";
}

const COLORS = {
  primary: "var(--color-primary)",
  green: "var(--green)",
  amber: "var(--amber)",
};

export const StatCard: FC<StatCardProps> = ({ value, label, sub, icon, trend, color = "primary" }) => (
  <div style={{
    background: "var(--surface)",
    borderRadius: 14,
    border: "1px solid var(--line)",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  }}>
    {icon && (
      <div style={{ color: COLORS[color], marginBottom: 4, fontSize: typeof icon === "string" ? 24 : undefined }}>
        {icon}
      </div>
    )}
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 26, fontWeight: 800, color: COLORS[color], lineHeight: 1 }}>{value}</span>
      {trend && (
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: trend.positive !== false ? "var(--green)" : "var(--coral)",
        }}>
          {trend.value > 0 ? "+" : ""}{trend.value}%
        </span>
      )}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--heading)" }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--muted)" }}>{sub}</div>}
  </div>
);
