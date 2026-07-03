"use client";

import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";

interface Expert {
  id: string;
  nombre: string;
  rol: string;
  emoji: string;
  opinion: string;
  error: boolean;
}

const TOPICS = [
  { id: "plataforma_general", label: "Plataforma general" },
  { id: "seguridad", label: "Seguridad y privacidad" },
  { id: "precios", label: "Modelo de precios" },
  { id: "matching", label: "IA y matching" },
  { id: "ux", label: "Experiencia de usuario" }
];

export default function ExpertPanel() {
  const [topic, setTopic] = useState("plataforma_general");
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setExperts([]);
    try {
      const fn = httpsCallable<{ topic: string }, { experts: Expert[]; generatedAt: string }>(
        functions,
        "getExpertPanelAnalysis"
      );
      const result = await fn({ topic });
      setExperts(result.data.experts);
      setGeneratedAt(result.data.generatedAt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al contactar el panel de expertos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--heading)", marginBottom: "0.5rem" }}>
          Panel de Expertos
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          4 expertos independientes analizan Perfil Primero con IA. Perspectivas legales, de negocio, psicológicas y tecnológicas.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopic(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: topic === t.id ? "2px solid #0094d4" : "2px solid var(--line)",
              background: topic === t.id ? "#0094d4" : "transparent",
              color: topic === t.id ? "#fff" : "var(--muted-strong)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            background: loading ? "var(--surface-muted)" : "#0094d4",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px 32px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.15s"
          }}
        >
          {loading ? "Consultando expertos…" : "Solicitar análisis"}
        </button>
        {error && (
          <p style={{ color: "#e53e3e", marginTop: "1rem", fontSize: "14px" }}>{error}</p>
        )}
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              background: "var(--surface)",
              borderRadius: "14px",
              padding: "1.5rem",
              border: "1px solid var(--line)",
              minHeight: 200,
              animation: "pulse 1.5s ease-in-out infinite"
            }}>
              <div style={{ width: "60%", height: 18, background: "var(--line)", borderRadius: 6, marginBottom: "0.75rem" }} />
              <div style={{ width: "40%", height: 13, background: "var(--line)", borderRadius: 6, marginBottom: "1.25rem" }} />
              <div style={{ width: "100%", height: 12, background: "var(--line)", borderRadius: 6, marginBottom: "0.5rem" }} />
              <div style={{ width: "90%", height: 12, background: "var(--line)", borderRadius: 6, marginBottom: "0.5rem" }} />
              <div style={{ width: "95%", height: 12, background: "var(--line)", borderRadius: 6 }} />
            </div>
          ))}
        </div>
      )}

      {experts.length > 0 && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.25rem" }}>
            {experts.map((expert) => (
              <div key={expert.id} style={{
                background: "var(--surface)",
                borderRadius: "14px",
                padding: "1.5rem",
                border: `1px solid ${expert.error ? "#e53e3e" : "var(--line)"}`,
                boxShadow: "var(--shadow-card)"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "2rem", lineHeight: 1 }}>{expert.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: "var(--heading)", fontSize: "15px" }}>{expert.nombre}</div>
                    <div style={{ color: "var(--muted)", fontSize: "12px", lineHeight: 1.4, marginTop: "2px" }}>{expert.rol}</div>
                  </div>
                </div>
                <p style={{
                  color: "var(--text)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  margin: 0
                }}>
                  {expert.opinion}
                </p>
              </div>
            ))}
          </div>
          {generatedAt && (
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "12px", marginTop: "1.5rem" }}>
              Análisis generado el {new Date(generatedAt).toLocaleString("es-CL")} · Powered by Groq AI
            </p>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
