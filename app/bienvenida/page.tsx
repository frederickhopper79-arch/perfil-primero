"use client";
import { useEffect, useState } from "react";
import type { Metadata } from "next";

const CHECKLIST = [
  { id: "profile", label: "Completar perfil profesional (título, habilidades, renta esperada)", href: "/postulante" },
  { id: "cv", label: "Subir o redactar tu CV con análisis de IA", href: "/postulante" },
  { id: "tests", label: "Realizar al menos un test de evaluación", href: "/postulante" },
  { id: "cover", label: "Escribir o generar tu carta de presentación", href: "/postulante" },
  { id: "activate", label: "Activar visibilidad de tu perfil por 30 días", href: "/postulante" },
];

const STORAGE_KEY = "pp_bienvenida_checks";

export default function BienvenidaPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      setChecked(stored);
    } catch { /* silent */ }
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const done = CHECKLIST.filter((item) => checked[item.id]).length;
  const pct = Math.round((done / CHECKLIST.length) * 100);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 16px" }}>
      <a href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>← Inicio</a>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "16px 0 4px", color: "var(--heading)" }}>
        ¡Bienvenido/a a Perfil Primero!
      </h1>
      <p style={{ color: "var(--muted-strong)", marginBottom: 28, lineHeight: 1.6 }}>
        Sigue esta lista para tener tu perfil listo y empezar a recibir invitaciones de empresas verificadas con sueldo claro.
      </p>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 8, background: "var(--line)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "var(--brand)", borderRadius: 8, transition: "width 0.4s" }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--brand)" }}>{pct}%</span>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {CHECKLIST.map((item) => {
          const isDone = Boolean(checked[item.id]);
          return (
            <li key={item.id}>
              <label style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                background: isDone ? "var(--brand-tint, #e0f2fe)" : "var(--surface)",
                border: `1.5px solid ${isDone ? "var(--brand)" : "var(--line)"}`,
                borderRadius: 10, cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
              }}>
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggle(item.id)}
                  style={{ width: 18, height: 18, accentColor: "var(--brand)", cursor: "pointer", flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, color: isDone ? "var(--brand-dark, #0369a1)" : "var(--text)", fontWeight: isDone ? 600 : 400, textDecoration: isDone ? "line-through" : "none", flex: 1 }}>
                  {item.label}
                </span>
                <a href={item.href} style={{ fontSize: 12, color: "var(--brand)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
                  Ir →
                </a>
              </label>
            </li>
          );
        })}
      </ul>

      {pct === 100 && (
        <div style={{ background: "var(--success-bg, #dcfce7)", border: "1.5px solid var(--success, #16a34a)", borderRadius: 12, padding: "18px 22px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
          <strong style={{ fontSize: 16, color: "var(--success, #16a34a)" }}>¡Perfil completo!</strong>
          <p style={{ margin: "6px 0 16px", fontSize: 14, color: "var(--muted-strong)" }}>
            Tu perfil ya puede aparecer en las búsquedas de empresas verificadas.
          </p>
          <a className="button" href="/postulante" style={{ textDecoration: "none", display: "inline-block" }}>
            Ver mi panel →
          </a>
        </div>
      )}
    </main>
  );
}
