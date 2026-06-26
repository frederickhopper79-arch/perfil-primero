import type { FC } from "react";

interface TimelineItem {
  fecha: string;
  titulo: string;
  desc?: string;
  tipo?: "info" | "success" | "warning" | "error";
  icono?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  compact?: boolean;
}

const TIPO_COLORS = {
  info: "var(--color-primary)",
  success: "var(--green)",
  warning: "var(--amber)",
  error: "var(--coral)",
};

export const Timeline: FC<TimelineProps> = ({ items, compact = false }) => (
  <div style={{ position: "relative", paddingLeft: compact ? 28 : 36 }}>
    <div style={{
      position: "absolute",
      left: compact ? 8 : 11,
      top: 8,
      bottom: 8,
      width: 2,
      background: "var(--line)",
    }} />
    {items.map((item, i) => {
      const color = TIPO_COLORS[item.tipo ?? "info"];
      return (
        <div key={i} style={{ position: "relative", marginBottom: compact ? 12 : 16 }}>
          <div style={{
            position: "absolute",
            left: compact ? -20 : -25,
            top: 3,
            width: compact ? 10 : 12,
            height: compact ? 10 : 12,
            borderRadius: "50%",
            background: color,
            border: "2px solid var(--surface)",
          }} />
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", marginBottom: 2 }}>
              {item.icono && <span style={{ fontSize: compact ? 12 : 14 }}>{item.icono}</span>}
              <span style={{ fontSize: compact ? 12 : 13, fontWeight: 600, color: "var(--heading)" }}>{item.titulo}</span>
              <time style={{ fontSize: 11, color: "var(--muted)" }}>{item.fecha}</time>
            </div>
            {item.desc && !compact && (
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);
