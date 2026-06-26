import type { FC } from "react";

interface TrustBadgesProps {
  layout?: "row" | "grid";
  compact?: boolean;
}

const BADGES = [
  { icon: "🔒", titulo: "Datos protegidos", desc: "Ley 19.628 + Ley 21.719" },
  { icon: "✅", titulo: "Empresas verificadas", desc: "RUT validado vía SII" },
  { icon: "💰", titulo: "Sueldo siempre visible", desc: "Desde la primera invitación" },
  { icon: "🏛️", titulo: "Red OMIL", desc: "Municipalidades adheridas" },
  { icon: "🇨🇱", titulo: "100% chileno", desc: "Perfil Primero SpA" },
];

export const TrustBadges: FC<TrustBadgesProps> = ({ layout = "row", compact = false }) => (
  <div style={{
    display: "flex",
    flexWrap: "wrap",
    gap: compact ? 8 : 12,
    justifyContent: "center",
    ...(layout === "grid" ? { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" } : {}),
  }}>
    {BADGES.map((b, i) => (
      <div key={i} style={{
        display: "flex",
        alignItems: compact ? "center" : "flex-start",
        gap: compact ? 6 : 10,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: compact ? 8 : 12,
        padding: compact ? "6px 12px" : "12px 16px",
        flexDirection: compact ? "row" : "column",
      }}>
        <span style={{ fontSize: compact ? 14 : 20 }}>{b.icon}</span>
        <div>
          <div style={{ fontSize: compact ? 11 : 12, fontWeight: 700, color: "var(--text)" }}>{b.titulo}</div>
          {!compact && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{b.desc}</div>}
        </div>
      </div>
    ))}
  </div>
);
