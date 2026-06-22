import type { CSSProperties } from "react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  style?: CSSProperties;
}

export function TestimonialCard({ quote, name, role, company, avatar, rating, style }: TestimonialCardProps) {
  return (
    <blockquote
      className="card"
      cite={company}
      style={{ padding: "22px 24px", margin: 0, ...style }}
    >
      {rating && (
        <div aria-label={`Calificación: ${rating} de 5`} style={{ marginBottom: 10 }}>
          {"★".repeat(rating).split("").map((star, i) => (
            <span key={i} aria-hidden="true" style={{ color: "#f59e0b", fontSize: 16 }}>{star}</span>
          ))}
        </div>
      )}
      <p style={{ margin: "0 0 16px", fontSize: 15, color: "var(--text)", lineHeight: 1.65, fontStyle: "italic" }}>
        "{quote}"
      </p>
      <footer style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--blue-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--blue)",
              flexShrink: 0,
            }}
          >
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <cite style={{ fontStyle: "normal", fontWeight: 700, fontSize: 14, color: "var(--heading)", display: "block" }}>
            {name}
          </cite>
          {(role || company) && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {[role, company].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
      </footer>
    </blockquote>
  );
}
