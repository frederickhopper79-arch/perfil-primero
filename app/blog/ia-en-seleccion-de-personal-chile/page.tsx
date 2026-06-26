import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "IA en Selección de Personal en Chile: Qué Funciona y Qué No | Perfil Primero",
  description: "Análisis práctico del uso de inteligencia artificial en procesos de selección en Chile. Casos reales, limitaciones éticas y cómo usarla responsablemente.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/ia-en-seleccion-de-personal-chile" },
};

const casos = [
  { caso: "Análisis de CV automatizado", estado: "funciona", desc: "La IA puede clasificar CVs por habilidades técnicas con alta precisión cuando el prompt está bien calibrado. Reduce el tiempo de revisión inicial en 60-80%.", limitacion: "Necesita supervisión humana. Los CVs mal formateados o en PDF complejos se procesan con errores." },
  { caso: "Generación de descripciones de cargo", estado: "funciona", desc: "ChatGPT y similares generan JDs inclusivos y bien estructurados en segundos, especialmente si se le dan parámetros de sector, seniority y cultura.", limitacion: "Tiende a ser genérico. Hay que personalizar y revisar que refleje la cultura real de la empresa." },
  { caso: "Screening de candidatos por video", estado: "precaución", desc: "Algunas herramientas analizan patrones de lenguaje y expresión facial. Los estudios muestran sesgos por acento, iluminación y cámara.", limitacion: "Alta probabilidad de discriminación sistémica. No recomendado en Chile sin marco legal específico." },
  { caso: "Matching candidato-empresa", estado: "funciona", desc: "Comparar embeddings semánticos de perfiles con requisitos de cargo tiene tasas de acierto superiores al 70% para filtros de primera ronda.", limitacion: "Puede perpetuar sesgos históricos de contratación si no se audita el conjunto de entrenamiento." },
  { caso: "Verificación de referencias", estado: "experimental", desc: "IA que genera llamadas de voz para verificar referencias laborales. Ahorra tiempo pero plantea preguntas éticas sobre transparencia.", limitacion: "El candidato no sabe que habla con una IA. Cuestionable desde el punto de vista ético y legal." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "IA en Selección de Personal en Chile: Qué Funciona y Qué No",
  "datePublished": "2026-06-20",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function IaSeleccionPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--color-dark)" }}>Tecnología RRHH</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          IA en Selección de Personal en Chile: Qué Funciona y Qué No en 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          La IA ya está en los procesos de selección chilenos. El problema no es si usarla, sino cuándo confiar en ella y cuándo el criterio humano es insustituible.
        </p>
      </header>

      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text)", marginBottom: "2rem" }}>
        En 2026, el 43% de las empresas medianas en Chile usa algún tipo de IA en su proceso de selección. Desde filtros automáticos de CV hasta análisis de entrevistas grabadas. El riesgo no es la tecnología en sí, sino usarla sin entender sus limitaciones.
      </p>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Análisis por caso de uso</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {casos.map((c, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{c.caso}</h3>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: c.estado === "funciona" ? "#dcfce7" : c.estado === "precaución" ? "#fef3c7" : "#fce7f3", color: c.estado === "funciona" ? "#15803d" : c.estado === "precaución" ? "#92400e" : "#be185d" }}>
                  {c.estado.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 8 }}>{c.desc}</p>
              <div style={{ background: "#fef3c7", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#92400e" }}>
                ⚠ {c.limitacion}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem", marginBottom: "2.5rem", borderLeft: "4px solid var(--color-primary)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", marginBottom: 10 }}>Cómo Perfil Primero usa IA responsablemente</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          Perfil Primero usa Gemini AI para analizar CVs y calcular porcentaje de completitud de perfil. El resultado es orientativo y siempre visible para el candidato. No usamos IA para tomar decisiones de selección: eso sigue siendo responsabilidad del equipo humano de la empresa. El candidato siempre puede revisar y corregir el análisis.
        </p>
      </section>

      <div style={{ textAlign: "center" }}>
        <a href="/analisis-expertos" className="button">Ver análisis de CV con IA</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="IA en seleccion de personal Chile - Perfil Primero" text="Como la inteligencia artificial esta transformando el reclutamiento en Chile." />
      </div>
</main>
  );
}
