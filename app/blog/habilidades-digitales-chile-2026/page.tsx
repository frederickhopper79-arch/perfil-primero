import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Las 15 Habilidades Digitales Más Buscadas en Chile 2026 | Perfil Primero",
  description: "Ranking actualizado de las habilidades digitales con mayor demanda en el mercado laboral chileno: IA, datos, ciberseguridad, marketing digital y más. Con rangos salariales reales.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/habilidades-digitales-chile-2026" },
  openGraph: {
    type: "article",
    title: "Habilidades Digitales Más Buscadas en Chile 2026",
    url: "https://perfil-primero.web.app/blog/habilidades-digitales-chile-2026",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Las 15 Habilidades Digitales Más Buscadas en Chile 2026",
  "datePublished": "2026-06-25",
  "dateModified": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "description": "Ranking de habilidades digitales con más demanda laboral en Chile para 2026, con rangos salariales y consejos de certificación.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/habilidades-digitales-chile-2026" },
};

const habilidades = [
  { rank: 1, nombre: "Inteligencia Artificial y Prompting", categoria: "IA / ML", demanda: "Muy Alta", salarioExtra: "+35%", nivel: "Desde 0 años exp.", desc: "Prompt engineering, uso productivo de ChatGPT, Claude, Gemini. Ya no es opcional en ningún sector." },
  { rank: 2, nombre: "Análisis de Datos / SQL", categoria: "Datos", demanda: "Muy Alta", salarioExtra: "+28%", nivel: "1–3 años exp.", desc: "Power BI, Google Looker Studio, SQL básico-intermedio. Sectores: finanzas, retail, logística." },
  { rank: 3, nombre: "Ciberseguridad Básica", categoria: "Seguridad", demanda: "Alta", salarioExtra: "+22%", nivel: "Certificación mínima", desc: "ISO 27001 awareness, gestión de contraseñas, phishing. Esencial para RRHH, finanzas y TI." },
  { rank: 4, nombre: "Marketing Digital y Performance", categoria: "Marketing", demanda: "Alta", salarioExtra: "+18%", nivel: "1–2 años exp.", desc: "Google Ads, Meta Ads, GA4, SEO técnico. Demanda sostenida en pymes y startups." },
  { rank: 5, nombre: "Python para automatización", categoria: "Programación", demanda: "Alta", salarioExtra: "+32%", nivel: "6 meses – 2 años", desc: "Scripts, automatización de Excel, web scraping básico. Alta demanda en operaciones y finanzas." },
  { rank: 6, nombre: "Gestión de Proyectos Digital (Agile/Scrum)", categoria: "Gestión", demanda: "Alta", salarioExtra: "+15%", nivel: "Certificación + exp.", desc: "Jira, Notion, Trello. RRHH de tecnología exige esta habilidad incluso para roles no técnicos." },
  { rank: 7, nombre: "CRM y Automatización de Ventas", categoria: "Ventas", demanda: "Media-Alta", salarioExtra: "+14%", nivel: "1 año exp.", desc: "HubSpot, Salesforce, Pipedrive. Alta rotación = alta demanda de personas que ya sepan el flujo." },
  { rank: 8, nombre: "Excel Avanzado y Power Query", categoria: "Herramientas", demanda: "Media-Alta", salarioExtra: "+12%", nivel: "Desde 0 años", desc: "Tablas dinámicas, Power Query, dashboards. Sigue siendo el estándar en administración y contabilidad." },
  { rank: 9, nombre: "UX/UI y Figma", categoria: "Diseño", demanda: "Media-Alta", salarioExtra: "+20%", nivel: "Portfolio > título", desc: "Prototipado, pruebas de usabilidad, diseño responsive. Alta demanda en startups." },
  { rank: 10, nombre: "Cloud Computing (AWS/GCP)", categoria: "Infraestructura", demanda: "Alta", salarioExtra: "+30%", nivel: "Certificación", desc: "AWS Cloud Practitioner como entrada. Las empresas pagan premio por conocimiento certificado." },
  { rank: 11, nombre: "Contabilidad y ERP (SAP)", categoria: "Finanzas", demanda: "Media-Alta", salarioExtra: "+17%", nivel: "1–3 años exp.", desc: "SAP FI/MM, Oracle. Los profesionales con experiencia en SAP consiguen empleo rápido." },
  { rank: 12, nombre: "Redes Sociales Corporativas (LinkedIn)", categoria: "Comunicaciones", demanda: "Media", salarioExtra: "+10%", nivel: "Portafolio", desc: "Gestión de marca empleadora, contenido B2B, LinkedIn Ads. Muy demandado en RRHH y marketing." },
  { rank: 13, nombre: "E-commerce y Operaciones Online", categoria: "Retail", demanda: "Media", salarioExtra: "+12%", nivel: "1–2 años exp.", desc: "Shopify, MercadoLibre, gestión de catálogo, métricas de conversión." },
  { rank: 14, nombre: "Inglés Técnico (B2+)", categoria: "Idiomas", demanda: "Muy Alta", salarioExtra: "+25%", nivel: "Certificación IELTS/TOEFL", desc: "El idioma sigue siendo el multiplicador de sueldo más confiable en Chile, especialmente en TI." },
  { rank: 15, nombre: "No-code / Low-code", categoria: "Automatización", demanda: "Creciente", salarioExtra: "+15%", nivel: "Desde 0 años", desc: "Zapier, Make.com, Bubble, Webflow. Permite a no-programadores automatizar procesos complejos." },
];

const demandaColor: Record<string, string> = {
  "Muy Alta": "#15803d",
  "Alta": "#0a66c2",
  "Media-Alta": "#92400e",
  "Media": "#6b7280",
  "Creciente": "#7c3aed",
};

export default function HabilidadesDigitalesPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}
        <a href="/blog">Blog</a> {" › "}
        <span aria-current="page">Habilidades digitales 2026</span>
      </nav>

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--primary-700)", fontWeight: 700 }}>Empleabilidad</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>· 8 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.4rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Las 15 Habilidades Digitales Más Buscadas en Chile 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 0 }}>
          El mercado laboral chileno está en transformación digital acelerada. Si quieres aumentar tu empleabilidad y sueldo, estas son las habilidades que las empresas están pagando más hoy.
        </p>
      </header>

      <div style={{ background: "linear-gradient(135deg, #1a2f5e, #3aaee0)", borderRadius: 14, padding: "20px 24px", marginBottom: 32, color: "#fff" }}>
        <strong style={{ display: "block", fontSize: 15, marginBottom: 6 }}>¿Tienes estas habilidades? Publícalas en tu perfil.</strong>
        <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>En Perfil Primero las empresas verificadas te contactan con el sueldo declarado desde el primer mensaje.</p>
        <a href="/postulante" style={{ display: "inline-block", marginTop: 12, background: "#fff", color: "#1a2f5e", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          Publicar mi perfil gratis →
        </a>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {habilidades.map((h) => (
          <article key={h.rank} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <span style={{ background: "var(--color-dark)", color: "#fff", borderRadius: 8, padding: "6px 11px", fontWeight: 900, fontSize: 16, flex: "0 0 auto" }}>#{h.rank}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                  <strong style={{ fontSize: 16, color: "var(--heading)", display: "block", width: "100%", marginBottom: 4 }}>{h.nombre}</strong>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--bg-soft)", color: "var(--muted-strong)" }}>{h.categoria}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#f0fdf4", color: demandaColor[h.demanda] ?? "#000" }}>Demanda: {h.demanda}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "#eff8fd", color: "#0a66c2" }}>Salario extra: {h.salarioExtra}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "var(--bg-soft)", color: "var(--muted)" }}>{h.nivel}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--muted-strong)", margin: 0, lineHeight: 1.6 }}>{h.desc}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "22px 24px", marginTop: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>¿Cómo adquirir estas habilidades en Chile?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { plataforma: "Coursera / EDX", tipo: "Certificados internacionales. Muchos gratuitos con auditoría." },
            { plataforma: "Google Actívate Chile", tipo: "Cursos gratuitos de Google: marketing digital, datos, IA básica." },
            { plataforma: "SENCE / OTIC", tipo: "Franquicia tributaria para empresas. Capacitación sin costo para el trabajador." },
            { plataforma: "YouTube + práctica", tipo: "Excel, Python, SQL y herramientas no-code: el 80% se aprende gratis." },
          ].map((r) => (
            <div key={r.plataforma} style={{ background: "var(--surface)", borderRadius: 8, padding: "14px 16px", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>{r.plataforma}</strong>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{r.tipo}</span>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <strong style={{ display: "block", fontSize: 15, marginBottom: 4 }}>¿Tienes estas habilidades?</strong>
          <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 14 }}>Publica tu perfil en Perfil Primero →</a>
        </div>
        <ShareNative title="Habilidades digitales más buscadas en Chile 2026" text="15 habilidades que las empresas chilenas están pagando más en 2026. Con rangos salariales." />
      </footer>
    </main>
  );
}
