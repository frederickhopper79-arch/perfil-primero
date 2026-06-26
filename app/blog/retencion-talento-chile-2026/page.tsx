import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Retención de Talento en Chile 2026: Estrategias que Realmente Funcionan | Perfil Primero",
  description: "Guía para empresas sobre cómo retener a los mejores profesionales en Chile. Datos reales, costos de rotación y estrategias probadas para 2026.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/retencion-talento-chile-2026" },
};

const costoRotacion = [
  { cargo: "Operario / técnico", meses: 1.5, descripcion: "Reclutamiento + onboarding + productividad reducida" },
  { cargo: "Analista / profesional", meses: 3, descripcion: "Más tiempo de búsqueda + capacitación especializada" },
  { cargo: "Jefatura / senior", meses: 6, descripcion: "Búsqueda externa + impacto en equipo + conocimiento perdido" },
  { cargo: "Gerencia / directivo", meses: 12, descripcion: "Headhunter + período de adaptación + riesgo estratégico" },
];

const estrategias = [
  { titulo: "Sueldo a mercado o sobre mercado", impacto: 92, desc: "El 58% de las renuncias voluntarias tienen como causa principal el sueldo. Revisar sueldos una vez al año es el mínimo.", accion: "Usa el Informe de Mercado Salarial de Perfil Primero para saber si estás pagando competitivo." },
  { titulo: "Trabajo remoto o híbrido real", impacto: 87, desc: "No el híbrido de 4 días en oficina. Los trabajadores valoran elegir dónde trabajar según la tarea.", accion: "Define políticas claras: qué días son presenciales y por qué, no por costumbre." },
  { titulo: "Feedback frecuente y desarrollo", impacto: 79, desc: "El 33% de los trabajadores que renuncian citan falta de oportunidad de crecimiento. No porque no había, sino porque nadie se las mostró.", accion: "1:1 mensual con el jefe directo. Plan de carrera documentado y revisado anualmente." },
  { titulo: "Reconocimiento auténtico", impacto: 74, desc: "No el 'empleado del mes' enmarcado. Reconocimiento específico, inmediato y frente al equipo o en canal de Slack.", accion: "Capacita a los jefes para dar feedback positivo concreto, no genérico." },
  { titulo: "Cultura de equipo real", impacto: 68, desc: "Las personas no dejan empresas, dejan jefes. El 70% de la retención depende de la calidad del liderazgo directo.", accion: "Mide el NPS interno (eNPS) cada 6 meses. Los jefes con eNPS bajo son el principal riesgo de rotación." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Retención de Talento en Chile 2026: Estrategias que Realmente Funcionan",
  "datePublished": "2026-06-18",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function RetencionTalentoCHilePage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--color-dark)" }}>Para empresas</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Retención de Talento en Chile: Lo que Funciona (y lo que No) en 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Reemplazar a una persona cuesta entre 1.5 y 12 meses de sueldo. Retener cuesta una fracción. Aquí están los datos y las estrategias que funcionan en el mercado laboral chileno actual.
        </p>
      </header>

      {/* Costo de rotación */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>El costo real de la rotación</h2>
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "8px 14px", background: "var(--bg-soft)", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
            <span>Cargo</span>
            <span>Costo estimado</span>
          </div>
          {costoRotacion.map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "12px 14px", borderTop: "1px solid var(--line)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--heading)" }}>{c.cargo}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{c.descripcion}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--coral)", textAlign: "right", paddingLeft: 16 }}>~{c.meses} sueldos</div>
            </div>
          ))}
        </div>
      </section>

      {/* Estrategias */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>5 estrategias con mayor impacto probado</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {estrategias.map((e, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{i + 1}. {e.titulo}</h3>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>{e.impacto}%</span>
              </div>
              <div style={{ background: "var(--line)", borderRadius: 4, height: 4, marginBottom: 10 }}>
                <div style={{ background: "var(--color-primary)", height: 4, borderRadius: 4, width: `${e.impacto}%` }} />
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 8 }}>{e.desc}</p>
              <div style={{ background: "var(--blue-soft)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--heading)" }}>
                → {e.accion}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Retener empieza por contratar bien. Perfil Primero te ayuda a encontrar el candidato correcto desde el inicio.</p>
        <a href="/empresa" className="button">Ver cómo funciona para empresas</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Retencion de talento en Chile 2026 - Perfil Primero" text="Estrategias que realmente funcionan para retener talento en empresas chilenas." />
      </div>
</main>
  );
}
