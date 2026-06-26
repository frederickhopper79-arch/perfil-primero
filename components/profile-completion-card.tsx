"use client";
import { useEffect, useState } from "react";
import { getProfileCompletionScore } from "@/lib/firebase/referrals";

interface CompletionScore {
  score: number;
  checks: Array<{ field: string; label: string; done: boolean; weight: number }>;
  missing: string[];
  isPublishable: boolean;
}

export function ProfileCompletionCard() {
  const [data, setData] = useState<CompletionScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfileCompletionScore()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
      <div style={{ height: 12, background: "var(--line)", borderRadius: 6, width: "60%", marginBottom: 12 }} />
      <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 4 }} />
    </div>
  );

  if (error || !data) return null;

  const color = data.score >= 80 ? "var(--green)" : data.score >= 60 ? "var(--amber)" : "var(--coral)";
  const label = data.score >= 80 ? "Excelente" : data.score >= 60 ? "Bueno" : "Incompleto";

  return (
    <div style={{ background: "var(--surface)", borderRadius: 14, border: `1.5px solid ${color}22`, padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)" }}>Completitud del perfil</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, background: `${color}18`, padding: "2px 10px", borderRadius: 20 }}>
          {label} · {data.score}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${data.score}%`, background: color, borderRadius: 8, transition: "width .6s ease" }} />
      </div>

      {/* Checks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: data.missing.length > 0 ? 12 : 0 }}>
        {data.checks.map(c => (
          <div key={c.field} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ color: c.done ? "var(--green)" : "var(--muted)", fontSize: 14, flexShrink: 0 }}>{c.done ? "✓" : "○"}</span>
            <span style={{ color: c.done ? "var(--text)" : "var(--muted)" }}>{c.label}</span>
          </div>
        ))}
      </div>

      {data.missing.length > 0 && (
        <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}>
          <strong style={{ color: "var(--heading)" }}>Para mejorar: </strong>
          {data.missing.slice(0, 3).join(", ")}{data.missing.length > 3 ? ` y ${data.missing.length - 3} más` : ""}
        </div>
      )}

      {!data.isPublishable && (
        <p style={{ fontSize: 11, color: "var(--coral)", marginTop: 8, marginBottom: 0 }}>
          Necesitas al menos 60% para publicar tu perfil.
        </p>
      )}
    </div>
  );
}
