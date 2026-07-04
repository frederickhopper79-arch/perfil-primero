import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Trabajo Remoto en Chile 2026: Guía completa para trabajadores y empresas",
  description: "Todo sobre el trabajo remoto en Chile: ley de teletrabajo, sueldos, habilidades más buscadas y cómo encontrar empleos remotos con sueldo claro.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/trabajo-remoto-chile-2026" },
  openGraph: {
    title: "Trabajo Remoto en Chile 2026 | Perfil Primero",
    description: "La guía definitiva sobre teletrabajo en Chile: ley, sueldos, sectores y cómo conseguir un empleo remoto transparente.",
  },
};

const datosRemoto = [
  { label: "Empleos remotos en plataforma", value: "34%" },
  { label: "Incremento vs 2024", value: "+12%" },
  { label: "Sueldo promedio superior al presencial", value: "+18%" },
  { label: "Sectores con más remoto", value: "Tech, Marketing, Finanzas" },
];

const sectoresRemoto = [
  { sector: "Desarrollo de software", porcentaje: 78, tendencia: "↑↑" },
  { sector: "Marketing digital / SEO", porcentaje: 65, tendencia: "↑" },
  { sector: "Diseño gráfico / UX", porcentaje: 60, tendencia: "↑" },
  { sector: "Análisis de datos", porcentaje: 55, tendencia: "↑↑" },
  { sector: "Contabilidad / Finanzas", porcentaje: 38, tendencia: "↑" },
  { sector: "Atención al cliente", porcentaje: 42, tendencia: "→" },
  { sector: "Gestión de proyectos", porcentaje: 51, tendencia: "↑" },
  { sector: "RRHH / Reclutamiento", porcentaje: 44, tendencia: "↑" },
];

const leyTeletrabajo = [
  { articulo: "Art. 152 quáter G", texto: "El empleador debe proporcionar el equipo de trabajo necesario o pagar una compensación por el uso de los del trabajador." },
  { articulo: "Art. 152 quáter I", texto: "El derecho a la desconexión fuera de la jornada laboral es irrenunciable. El empleador no puede exigir disponibilidad 24/7." },
  { articulo: "Art. 152 quáter H", texto: "Los teletrabajadores tienen los mismos derechos y obligaciones que los trabajadores presenciales (previsión, vacaciones, etc.)." },
  { articulo: "Art. 152 quáter J", texto: "El contrato de teletrabajo debe celebrarse por escrito y puede ser modificado de mutuo acuerdo para volver a la presencialidad." },
];

const habilidadesRemoto = [
  "Comunicación escrita clara y concisa",
  "Gestión del tiempo autónoma",
  "Herramientas de colaboración (Slack, Notion, Jira)",
  "Videoconferencias efectivas",
  "Documentación de procesos",
  "Autogestión y disciplina",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Trabajo Remoto en Chile 2026: Guía completa para trabajadores y empresas",
  "datePublished": "2026-06-15",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function TrabajoRemotoPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--primary-700)" }}>← Blog</a>
          <span style={{ fontSize: 11, color: "var(--muted)", padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20 }}>Teletrabajo</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Junio 2026</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Trabajo Remoto en Chile 2026: Todo lo que necesitas saber
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          El 34% de los perfiles activos en Perfil Primero busca trabajo 100% remoto, y la tendencia sigue creciendo. Esta guía cubre derechos laborales, sectores con más demanda y cómo conseguir el trabajo remoto que buscas.
        </p>
      </header>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: "2.5rem" }}>
        {datosRemoto.map((d, i) => (
          <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary-700)" }}>{d.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>{d.label}</div>
          </div>
        ))}
      </div>

      {/* Sectores */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Sectores con más empleos remotos en Chile</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sectoresRemoto.map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{s.sector}</span>
                <span style={{ fontSize: 12, color: "var(--primary-700)", fontWeight: 600 }}>{s.tendencia} {s.porcentaje}%</span>
              </div>
              <div style={{ height: 4, background: "var(--bg-soft)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${s.porcentaje}%`, background: "var(--primary-700)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ley */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Tus derechos como teletrabajador (Ley 21.220)</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leyTeletrabajo.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-700)", background: "var(--blue-soft)", padding: "2px 8px", borderRadius: 6, flexShrink: 0, marginTop: 1 }}>{item.articulo}</span>
              <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{item.texto}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Habilidades */}
      <section style={{ marginBottom: "2.5rem", background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Habilidades clave para el trabajo remoto exitoso</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {habilidadesRemoto.map((h, i) => (
            <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--primary-700)", flexShrink: 0 }}>✓</span> {h}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div style={{ textAlign: "center", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem" }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>Encuentra tu próximo trabajo remoto con sueldo visible</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Publica tu perfil y marca tu preferencia por trabajo remoto. Las empresas con ese modelo llegan a ti.</p>
        <a href="/postulante" className="button">Publicar mi perfil</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Trabajo remoto en Chile 2026 - Perfil Primero" text="Guia completa sobre trabajo remoto: derechos, salarios y empleo a distancia en Chile." />
      </div>
</main>
  );
}
