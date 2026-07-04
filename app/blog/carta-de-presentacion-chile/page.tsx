import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Cómo Escribir una Carta de Presentación Laboral en Chile 2026 | Perfil Primero",
  description: "Guía completa con ejemplos reales para escribir una carta de presentación que abre puertas en el mercado laboral chileno. Plantillas para diferentes sectores.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/carta-de-presentacion-chile" },
  openGraph: {
    type: "article",
    title: "Carta de Presentación Laboral en Chile 2026",
    url: "https://perfil-primero.web.app/blog/carta-de-presentacion-chile",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo Escribir una Carta de Presentación Laboral en Chile 2026",
  "datePublished": "2026-06-25",
  "dateModified": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "description": "Guía con ejemplos y plantillas para carta de presentación laboral en Chile, adaptada por sector e industria.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/carta-de-presentacion-chile" },
};

const errores = [
  { error: "Copiar y pegar la misma carta para todas las postulaciones", fix: "Personaliza al menos el primer párrafo con el nombre de la empresa y el cargo específico." },
  { error: "Repetir exactamente lo que dice el CV", fix: "La carta cuenta la historia detrás de los datos. Aporta contexto y motivación, no datos." },
  { error: "Escribir más de una página", fix: "Máximo 3-4 párrafos. El reclutador dedica 30 segundos. Ve al grano." },
  { error: "Empezar con 'Estimado/a Señor/Señora'", fix: "Si sabes el nombre del reclutador, úsalo. Si no, usa 'Estimado equipo de [Empresa]'." },
  { error: "No mencionar el sueldo esperado si te lo piden", fix: "En Chile muchas postulaciones lo solicitan. Indicar un rango real acelera el proceso." },
  { error: "Texto en tercera persona", fix: "Escribe en primera persona: 'Tengo 5 años de experiencia…', no 'El postulante tiene…'" },
];

const estructura = [
  { n: "1", titulo: "Saludo personalizado", desc: "Dirígete a la persona o equipo correcto. Nada de 'A quien corresponda'.", ejemplo: "Estimado equipo de Talent Acquisition de [Empresa]," },
  { n: "2", titulo: "Párrafo de apertura — el gancho", desc: "Di qué cargo solicitas y POR QUÉ quieres trabajar en esa empresa específica (no en cualquier empresa).", ejemplo: "Postulo al cargo de Analista de Datos porque [Empresa] es referente en analítica predictiva en retail chileno y quiero contribuir a ese liderazgo desde el área de datos." },
  { n: "3", titulo: "Párrafo de valor — tu mejor logro", desc: "Un logro cuantificado que sea relevante para el cargo. No una lista de responsabilidades.", ejemplo: "En mi rol anterior en [Empresa anterior], diseñé un dashboard en Power BI que redujo el tiempo de reporte mensual de 3 días a 4 horas, permitiendo decisiones más rápidas en inventario." },
  { n: "4", titulo: "Párrafo de fit cultural", desc: "Muestra que investigaste a la empresa y que sus valores o proyectos te motivan genuinamente.", ejemplo: "Me atrae especialmente el compromiso de [Empresa] con la innovación abierta — el programa [Nombre] que lanzaron en 2025 es exactamente el tipo de iniciativa en la que quiero participar." },
  { n: "5", titulo: "Cierre con call to action", desc: "Pide la reunión. No esperes a que te llamen — dilo explícitamente.", ejemplo: "Quedo disponible para una reunión cuando lo estimen conveniente. Adjunto mi CV y portfolio. Mi teléfono directo es [número]." },
];

export default function CartaPresentacionPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}
        <a href="/blog">Blog</a> {" › "}
        <span aria-current="page">Carta de presentación Chile</span>
      </nav>

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--primary-700)", fontWeight: 700 }}>Empleabilidad</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 6 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Cómo Escribir una Carta de Presentación Laboral en Chile 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          La carta de presentación correcta puede ser lo que separa tu postulación de otras 200. Aquí la estructura exacta, con ejemplos reales adaptados al mercado laboral chileno.
        </p>
      </header>

      <div style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 20px", marginBottom: 28 }}>
        <strong style={{ fontSize: 14 }}>¿Sabías que en Perfil Primero no necesitas carta de presentación?</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>Tu perfil estructurado ya comunica tu valor. Las empresas te contactan con sueldo declarado antes de pedirte documentos. <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 600 }}>Crear perfil gratis →</a></p>
      </div>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Estructura en 5 párrafos que funciona</h2>
        <div style={{ display: "grid", gap: 14 }}>
          {estructura.map((s) => (
            <div key={s.n} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ background: "var(--primary-700)", color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flex: "0 0 auto" }}>{s.n}</span>
                <div>
                  <strong style={{ fontSize: 15, color: "var(--heading)", display: "block", marginBottom: 4 }}>{s.titulo}</strong>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px", lineHeight: 1.6 }}>{s.desc}</p>
                  <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--muted-strong)", fontStyle: "italic", lineHeight: 1.6 }}>
                    "{s.ejemplo}"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Plantilla lista para usar</h2>
        <div style={{ background: "#f8fafc", border: "1px solid var(--line)", borderRadius: 12, padding: "24px 28px", fontFamily: "Georgia, serif", lineHeight: 1.8, fontSize: 14, color: "#1e293b" }}>
          <p style={{ marginBottom: 16 }}><strong>Estimado equipo de [Nombre Empresa],</strong></p>
          <p style={{ marginBottom: 16 }}>Postulo al cargo de <strong>[Cargo]</strong> porque [razón específica de por qué ESA empresa y no cualquiera]. Llevo [N] años trabajando en [área] y quiero llevar ese expertise al contexto de [lo que hace la empresa].</p>
          <p style={{ marginBottom: 16 }}>En mi rol anterior como [Cargo] en [Empresa], logré [logro cuantificado relevante para el cargo al que postulo]. Esto fue posible gracias a [habilidad o metodología clave que también aplicarías aquí].</p>
          <p style={{ marginBottom: 16 }}>Lo que me atrae de [Empresa] es [aspecto específico: un proyecto, un valor, una noticia reciente]. Creo que puedo contribuir directamente a [objetivo de la empresa] desde el primer mes.</p>
          <p style={{ marginBottom: 0 }}>Estoy disponible para conversar cuando lo estimen conveniente. Adjunto mi CV. Mi sueldo esperado es [rango o monto]. Muchas gracias por su tiempo.<br /><br /><em>[Tu nombre]<br />[Teléfono] · [Email]</em></p>
        </div>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>6 errores que destruyen una carta de presentación</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {errores.map((e, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid #fce7f3", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ color: "var(--coral)", fontSize: 14, flexShrink: 0 }}>✗</span>
                <strong style={{ fontSize: 14, color: "var(--heading)" }}>{e.error}</strong>
              </div>
              <div style={{ display: "flex", gap: 10, paddingLeft: 24 }}>
                <span style={{ color: "var(--green)", fontSize: 14, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{e.fix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>¿Cuándo NO enviar carta de presentación en Chile?</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {[
            "Cuando el formulario no la pide — no agregues adjuntos que no solicitaron.",
            "En portales de empleo masivo como Indeed o LinkedIn Easy Apply — nadie la lee.",
            "Cuando la oferta dice 'Postula con tu LinkedIn' — el sistema no permite adjuntos.",
            "Si la empresa es contactada directamente por ti vía referido — ahí el email de referencia es suficiente.",
          ].map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--primary-700)", flexShrink: 0 }}>→</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <strong style={{ display: "block", fontSize: 15, marginBottom: 4 }}>¿Prefieres que las empresas lleguen a ti?</strong>
          <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 14 }}>Publica tu perfil en Perfil Primero →</a>
        </div>
        <ShareNative title="Carta de presentacion laboral Chile 2026 - Perfil Primero" text="Guia completa con plantilla y ejemplos para escribir una carta de presentacion que abre puertas en Chile." />
      </footer>
    </main>
  );
}
