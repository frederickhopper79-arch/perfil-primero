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
  const [loading, setLoading] = useState(false);

  async function handleAdvice() {
    setLoading(true);
    setAdvice("");

    try {
      const result = await getProfileAiAdvice({ headline, summary, skills });
      setAdvice(result.advice);
    } catch (error) {
      setAdvice(error instanceof Error ? error.message : "No se pudo generar una recomendacion.");
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
          <p className="eyebrow">IA de Google</p>
          <h2>Mejora tu perfil antes de publicarlo</h2>
        </div>
      </div>
      <p>
        La IA revisa tu titulo, resumen y habilidades para sugerir una version
        mas clara, atractiva y compatible con busquedas de empresas.
      </p>
      <button className="button secondary full" type="button" onClick={handleAdvice} disabled={loading}>
        {loading ? "Analizando perfil..." : "Analizar con IA"}
      </button>
      {advice ? (
        <div className="aiResponse">
          {advice}
          {onApply ? (
            <button className="button primary full" type="button" onClick={() => onApply(extractSuggestedSummary(advice))}>
              Aplicar mejora al resumen
            </button>
          ) : null}
        </div>
      ) : null}
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
