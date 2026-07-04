import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Finiquito en Chile: Guía Completa 2026 — Cómo Calcular y Qué Exigir | Perfil Primero",
  description: "Todo lo que necesitas saber sobre el finiquito laboral en Chile: cálculo, plazos, indemnización por años de servicio, aviso previo y tus derechos legales.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/finiquito-chile-guia-completa" },
  openGraph: {
    type: "article",
    title: "Finiquito en Chile: Guía Completa 2026",
    url: "https://perfil-primero.web.app/blog/finiquito-chile-guia-completa",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Finiquito en Chile: Guía Completa 2026 — Cómo Calcular y Qué Exigir",
  "datePublished": "2026-06-25",
  "dateModified": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "description": "Guia completa del finiquito laboral en Chile para 2026: calculo, plazos, causal de despido y derechos del trabajador.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/finiquito-chile-guia-completa" },
};

const conceptos = [
  {
    nombre: "Indemnización por años de servicio",
    aplica: "Despido por necesidades de la empresa (art. 161) o causas imputables al empleador",
    calculo: "1 mes de sueldo base por año trabajado (o fracción superior a 6 meses). Máximo 11 meses.",
    ejemplo: "3 años con sueldo $800.000 = $2.400.000",
    color: "#0a66c2",
  },
  {
    nombre: "Indemnización sustitutiva de aviso previo",
    aplica: "Cuando el empleador no da 30 días de aviso antes del despido",
    calculo: "1 mes de remuneración",
    ejemplo: "Sueldo $800.000 → $800.000 de indemnización extra",
    color: "#7c3aed",
  },
  {
    nombre: "Feriado proporcional",
    aplica: "Vacaciones devengadas y no tomadas durante el año en curso",
    calculo: "(Días de vacaciones × días trabajados del año) ÷ 365",
    ejemplo: "15 días de vacaciones, 8 meses trabajados → 10 días pagados",
    color: "#15803d",
  },
  {
    nombre: "Remuneraciones pendientes",
    aplica: "Sueldos, comisiones, bonos y horas extras adeudadas hasta la fecha del despido",
    calculo: "Lo que aparece en tus liquidaciones pero aún no te han pagado",
    ejemplo: "Bonus de marzo no pagado + 12 horas extra de abril",
    color: "#92400e",
  },
];

const causales = [
  { art: "160", nombre: "Causal disciplinaria", detalle: "Faltas graves, acoso, abandono de trabajo. No hay indemnización por años de servicio.", color: "var(--coral)" },
  { art: "161", nombre: "Necesidades de la empresa", detalle: "La causa más común de despido masivo. Genera indemnización completa + aviso previo.", color: "var(--primary-700)" },
  { art: "159 N°4", nombre: "Vencimiento de plazo fijo", detalle: "El contrato llegó a su término. Sin indemnización salvo que el contrato sea renovado más de 2 veces.", color: "var(--muted-strong)" },
  { art: "159 N°6", nombre: "Caso fortuito / fuerza mayor", detalle: "Catástrofe o cierre forzado. Sin indemnización. Muy restrictivo en su aplicación.", color: "var(--muted)" },
  { art: "Mutuo acuerdo", nombre: "Acuerdo entre las partes", detalle: "Negociable. Puedes acordar un monto mayor al legal si ambas partes firman el finiquito.", color: "#7c3aed" },
];

export default function FiniquitoPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}
        <a href="/blog">Blog</a> {" › "}
        <span aria-current="page">Finiquito Chile 2026</span>
      </nav>

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 7 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Finiquito en Chile: Guía Completa 2026 — Cómo Calcular y Qué Exigir
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Ser despedido es estresante. No saber cuánto te deben es peor. Esta guía te explica exactamente cómo funciona el finiquito en Chile, qué conceptos incluye y cómo verificar que el monto sea correcto.
        </p>
      </header>

      <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "16px 20px", marginBottom: 28 }}>
        <strong style={{ fontSize: 14, color: "#92400e", display: "block", marginBottom: 6 }}>Importante: este artículo es informativo, no asesoría legal.</strong>
        <p style={{ fontSize: 13, color: "#78350f", margin: 0 }}>Si tienes dudas sobre tu caso específico, consulta con la Inspección del Trabajo (inspección.dt.gob.cl) — es gratuito.</p>
      </div>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>¿Qué conceptos incluye el finiquito?</h2>
        <div style={{ display: "grid", gap: 14 }}>
          {conceptos.map((c) => (
            <div key={c.nombre} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", borderLeft: `4px solid ${c.color}` }}>
              <strong style={{ fontSize: 15, color: "var(--heading)", display: "block", marginBottom: 6 }}>{c.nombre}</strong>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={{ fontSize: 13, color: "var(--muted)" }}><strong>Aplica cuando:</strong> {c.aplica}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}><strong>Cálculo:</strong> {c.calculo}</div>
                <div style={{ background: "var(--bg-soft)", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "var(--muted-strong)", marginTop: 4 }}>Ej: {c.ejemplo}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Causales de despido y qué te corresponde</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {causales.map((c) => (
            <div key={c.art} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ background: "var(--bg-soft)", borderRadius: 6, padding: "3px 8px", fontWeight: 800, fontSize: 11, color: "var(--muted-strong)", flex: "0 0 auto" }}>Art. {c.art}</span>
                <div>
                  <strong style={{ fontSize: 14, color: "var(--heading)", display: "block", marginBottom: 4 }}>{c.nombre}</strong>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{c.detalle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Plazos que debes conocer</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { plazo: "3 días hábiles", desc: "Para pagar el finiquito en caso de despido por causas disciplinarias (art. 160)" },
            { plazo: "30 días", desc: "Aviso previo que debe darte el empleador antes de despedirte por art. 161" },
            { plazo: "2 años", desc: "Plazo de prescripción para reclamar derechos laborales ante Inspección del Trabajo" },
            { plazo: "Inmediato", desc: "El finiquito debe pagarse al momento de la firma, no días después" },
          ].map((p) => (
            <div key={p.plazo} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
              <strong style={{ fontSize: 18, color: "var(--primary-700)", display: "block", marginBottom: 4 }}>{p.plazo}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{p.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Checklist antes de firmar el finiquito</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {[
            "Verifica que incluya TODOS los conceptos: sueldo pendiente, vacaciones, indemnización y aviso previo si aplica.",
            "Comprueba que el sueldo base usado en el cálculo sea correcto (algunos empleadores usan el sueldo mínimo).",
            "Pide una copia firmada por ambas partes antes de salir de la reunión.",
            "Si algo no está claro, tienes derecho a llevarte el documento y revisarlo con un abogado laboral o la DT antes de firmar.",
            "No firmes bajo presión. El plazo de 3 días hábiles es para el pago, no para que tú decidas inmediatamente.",
            "Si el monto es inferior al que calculas, negocia o reclama ante la Inspección del Trabajo.",
          ].map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text)", alignItems: "flex-start" }}>
              <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 1 }}>☑</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div style={{ background: "linear-gradient(135deg, #1a2f5e, #3aaee0)", borderRadius: 14, padding: "20px 24px", marginBottom: "2rem", color: "#fff" }}>
        <strong style={{ display: "block", fontSize: 15, marginBottom: 6 }}>Después del finiquito: encuentra tu próximo trabajo</strong>
        <p style={{ fontSize: 13, opacity: 0.9, margin: "0 0 12px" }}>En Perfil Primero publicas tu perfil anónimo y las empresas verificadas te contactan con cargo, sueldo y modalidad declarados. Sin mandar CVs a ciegas.</p>
        <a href="/postulante" style={{ display: "inline-block", background: "#fff", color: "#1a2f5e", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          Publicar mi perfil gratis →
        </a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <strong style={{ display: "block", fontSize: 15, marginBottom: 4 }}>¿Buscando trabajo tras el finiquito?</strong>
          <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 14 }}>Crea tu perfil en Perfil Primero →</a>
        </div>
        <ShareNative title="Finiquito Chile 2026: guia completa de calculo y derechos" text="Todo sobre el finiquito laboral en Chile: calculos, causales, plazos y checklist antes de firmar." />
      </footer>
    </main>
  );
}
