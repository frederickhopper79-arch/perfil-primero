"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { getProfileAiAdvice } from "@/lib/firebase/workers";

export function AiProfileAdvisor({
  headline,
  summary,
  skills,
  onApply
}: {
  headline: string;
  summary: string;
  skills: string;
  onApply?: (summary: string) => void;
}) {
  const [advice, setAdvice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canAnalyze = headline.trim().length > 0 && summary.trim().length > 0;

  async function handleAdvice() {
    if (!canAnalyze) {
      setError("Completa al menos el título y resumen profesional antes de analizar.");
      return;
    }
    setLoading(true);
    setAdvice("");
    setError("");

    try {
      const result = await getProfileAiAdvice({ headline, summary, skills });
      setAdvice(result.advice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar una recomendación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="aiPanel">
      <div className="aiPanelHeader">
        <span>
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">IA Perfil Primero</p>
          <h2>Mejora tu perfil antes de publicarlo</h2>
        </div>
      </div>
      <p>
        La IA revisa tu titulo, resumen y habilidades para sugerir una version
        mas clara, atractiva y compatible con busquedas de empresas.
      </p>

      {!canAnalyze && (
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          Completa el título y resumen profesional para habilitar el análisis.
        </p>
      )}

      <button
        className="button secondary full"
        type="button"
        onClick={handleAdvice}
        disabled={loading || !canAnalyze}
      >
        {loading ? "Analizando perfil..." : "Analizar con IA"}
      </button>

      {error && (
        <p style={{ color: "var(--error, #c0392b)", fontSize: 13, marginTop: 8 }}>
          {error}
        </p>
      )}

      {advice && (
        <div className="aiResponse">
          {advice.split("\n").map((line, i) => (
            line.trim() ? <p key={i} style={{ margin: "0 0 6px" }}>{line}</p> : <br key={i} />
          ))}
          {onApply && (
            <button
              className="button primary full"
              type="button"
              style={{ marginTop: 12 }}
              onClick={() => onApply(extractSuggestedSummary(advice))}
            >
              Aplicar mejora al resumen
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function extractSuggestedSummary(text: string) {
  const marker = "version mejorada";
  const lower = text.toLowerCase();
  const index = lower.indexOf(marker);
  if (index >= 0) return text.slice(index + marker.length).replace(/^[:\s-]+/, "").trim();
  return text.trim();
}
