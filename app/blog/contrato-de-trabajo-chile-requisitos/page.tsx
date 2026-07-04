import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Contrato de Trabajo en Chile 2026: Requisitos, Tipos y Qué Debe Incluir | Perfil Primero",
  description: "Guía completa del contrato de trabajo en Chile: requisitos legales, tipos (indefinido, plazo fijo, por obra), cláusulas obligatorias y qué NO pueden incluir.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/contrato-de-trabajo-chile-requisitos" },
  openGraph: { type: "article", title: "Contrato de Trabajo Chile 2026: Requisitos y Tipos", url: "https://perfil-primero.web.app/blog/contrato-de-trabajo-chile-requisitos", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Contrato de Trabajo en Chile 2026: Requisitos, Tipos y Qué Debe Incluir",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/contrato-de-trabajo-chile-requisitos" },
};

const clausulasObligatorias = [
  { n: "1", item: "Lugar y fecha del contrato", detalle: "Ciudad y fecha de firma. Determina qué juzgado laboral es competente." },
  { n: "2", item: "Individualización del empleador", detalle: "RUT, razón social, domicilio y giro de la empresa." },
  { n: "3", item: "Individualización del trabajador", detalle: "RUT, nombre completo, domicilio, fecha de nacimiento y estado civil." },
  { n: "4", item: "Función o cargo", detalle: "Descripción específica de las funciones. 'Otras funciones que se indiquen' es válido, pero no puede ser la única descripción." },
  { n: "5", item: "Monto de la remuneración", detalle: "Sueldo base en pesos, periodicidad de pago (mensual, quincenal) y forma (transferencia, cheque)." },
  { n: "6", item: "Distribución y duración de la jornada", detalle: "Horas semanales, horario, y si hay trabajo nocturno o en turno." },
  { n: "7", item: "Lugar de trabajo", detalle: "Dirección exacta. Si es remoto, debe indicarlo explícitamente (Ley 21.220)." },
  { n: "8", item: "Plazo del contrato", detalle: "Indefinido, plazo fijo (con fecha de término) o por obra específica." },
];

const tiposContrato = [
  {
    tipo: "Indefinido",
    cuando: "La relación laboral no tiene fecha de término pactada.",
    ventajas: "Mayor estabilidad, acceso completo a todos los beneficios, mejor acceso a créditos bancarios.",
    limitaciones: "Para el empleador: despido requiere causal o indemnización.",
    color: "#15803d",
  },
  {
    tipo: "Plazo fijo",
    cuando: "Trabajo temporal con fecha de término establecida. Máximo 1 año (2 años para gerentes o técnicos extranjeros).",
    ventajas: "Puede renovarse, y si se renueva más de 2 veces se convierte en indefinido automáticamente.",
    limitaciones: "Si el empleador pone fin antes del plazo, debe pagar el tiempo restante más indemnización.",
    color: "#0a66c2",
  },
  {
    tipo: "Por obra o faena",
    cuando: "Para una tarea específica y delimitada. Termina cuando termina la obra.",
    ventajas: "Muy usado en construcción, eventos, proyectos TI.",
    limitaciones: "La descripción de la obra debe ser precisa. No puede usarse para trabajo habitual y permanente.",
    color: "#7c3aed",
  },
  {
    tipo: "A tiempo parcial",
    cuando: "Jornada semanal de hasta 30 horas (máximo 2/3 de la jornada ordinaria).",
    ventajas: "Sueldo y beneficios proporcionales. Compatible con estudios.",
    limitaciones: "Proporcional al mínimo: si la jornada es 22.5 hrs (50%), el mínimo es $255.000 líquidos.",
    color: "#92400e",
  },
];

const clausulasProhibidas = [
  "Renunciar a derechos laborales irrenunciables (vacaciones mínimas, indemnizaciones legales, fuero maternal)",
  "Obligar al trabajador a afiliarse a una AFP o Isapre específica",
  "Exigir no afiliarse a un sindicato",
  "Establecer multas mayores al 25% de la remuneración diaria sin acuerdo del trabajador",
  "Cláusulas de exclusividad que impidan al trabajador desarrollar actividades independientes fuera del horario laboral",
  "Descuentos de sueldo no autorizados por el trabajador o sin causa legal",
];

export default function ContratoTrabajoPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Contrato de trabajo Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 7 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Contrato de Trabajo en Chile 2026: Requisitos, Tipos y Qué Debe Incluir
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Lo que toda persona debe saber antes de firmar un contrato de trabajo en Chile: cláusulas obligatorias, tipos de contrato, plazos legales y lo que el empleador NO puede incluir.
        </p>
      </header>

      <div style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
        <strong style={{ fontSize: 13, color: "var(--heading)" }}>Plazo legal:</strong>
        <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 6 }}>El empleador tiene <strong>15 días corridos</strong> desde que el trabajador inicia labores para escriturar el contrato (5 días si el contrato es por obra o faena de menos de 30 días).</span>
      </div>

      {/* Tipos de contrato */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Tipos de contrato de trabajo en Chile</h2>
        <div style={{ display: "grid", gap: 14 }}>
          {tiposContrato.map((t) => (
            <div key={t.tipo} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", borderLeft: `4px solid ${t.color}` }}>
              <strong style={{ fontSize: 16, color: "var(--heading)", display: "block", marginBottom: 8 }}>{t.tipo}</strong>
              <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
                <div><span style={{ color: "var(--muted)", fontWeight: 600 }}>Cuándo aplica: </span><span style={{ color: "var(--text)" }}>{t.cuando}</span></div>
                <div><span style={{ color: "var(--green)", fontWeight: 600 }}>✓ Ventajas: </span><span style={{ color: "var(--muted)" }}>{t.ventajas}</span></div>
                <div><span style={{ color: "var(--coral)", fontWeight: 600 }}>⚠ Ojo: </span><span style={{ color: "var(--muted)" }}>{t.limitaciones}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cláusulas obligatorias */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Las 8 cláusulas obligatorias (art. 10 CT)</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {clausulasObligatorias.map((c) => (
            <div key={c.n} style={{ display: "flex", gap: 14, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "13px 16px" }}>
              <span style={{ background: "var(--color-dark)", color: "#fff", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flex: "0 0 auto" }}>{c.n}</span>
              <div>
                <strong style={{ fontSize: 14, display: "block", marginBottom: 3 }}>{c.item}</strong>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{c.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cláusulas prohibidas */}
      <section style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "20px 24px", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#7f1d1d", marginBottom: 14 }}>Lo que el contrato NO puede incluir</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {clausulasProhibidas.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#7f1d1d" }}>
              <span style={{ flexShrink: 0 }}>✗</span>
              <span style={{ lineHeight: 1.5 }}>{c}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#7f1d1d", marginTop: 12, marginBottom: 0, opacity: 0.7 }}>Una cláusula prohibida es nula de pleno derecho: el resto del contrato sigue siendo válido sin ella.</p>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "16px 20px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 6 }}>En Perfil Primero las condiciones se declaran antes del contrato</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>Las empresas verificadas deben indicar cargo, sueldo, modalidad y tipo de contrato desde la primera invitación. Sin sorpresas al firmar.</p>
        <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 13 }}>Publicar mi perfil gratis →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/blog/derechos-laborales-chile-2026" style={{ color: "var(--primary-700)", fontWeight: 600, fontSize: 14 }}>← Guía completa de derechos laborales</a>
        <ShareNative title="Contrato de trabajo Chile 2026: requisitos y tipos" text="Todo sobre el contrato de trabajo en Chile: clausulas obligatorias, tipos y lo que el empleador no puede incluir." />
      </footer>
    </main>
  );
}
