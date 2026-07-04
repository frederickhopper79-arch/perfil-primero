import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Licencia Médica en Chile 2026: Tipos, Cuánto Pagan y Cómo Tramitarla | Perfil Primero",
  description: "Guía completa de licencia médica en Chile: tipos (COMPIN, Isapre, maternal), pago de subsidio, plazo para presentarla, qué hacer si el empleador la rechaza y licencias prolongadas.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/licencia-medica-chile-2026" },
  openGraph: { type: "article", title: "Licencia Médica Chile 2026: Tipos y Cómo Tramitarla", url: "https://perfil-primero.web.app/blog/licencia-medica-chile-2026", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Licencia Médica en Chile 2026: Tipos, Cuánto Pagan y Cómo Tramitarla",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/licencia-medica-chile-2026" },
};

const tipos = [
  { tipo: "Enfermedad común", codigo: "Tipo 1", quien_paga: "FONASA o Isapre", desde: "Desde el 4° día", tope: "Hasta el 100% del sueldo (con tope IMM×30)", color: "#0a66c2" },
  { tipo: "Accidente del trabajo / Enfermedad laboral", codigo: "Tipo 2", quien_paga: "ACHS / Mutual", desde: "Desde el día 1", tope: "100% del sueldo sin tope máximo", color: "#15803d" },
  { tipo: "Maternal pre y postnatal", codigo: "Tipos 3–6", quien_paga: "FONASA o Isapre", desde: "Desde el día 1", tope: "90 días pre+posnatal + 12 semanas postnatal parcial", color: "#7c3aed" },
  { tipo: "Enfermedad grave hijo menor de 1 año", codigo: "Tipo 7", quien_paga: "FONASA o Isapre", desde: "Desde el día 1", tope: "Puede tomarla padre o madre", color: "#92400e" },
  { tipo: "Accidente de trayecto", codigo: "Tipo 8", quien_paga: "Mutual de Seguridad", desde: "Desde el día 1", tope: "100% sueldo, cubre el trayecto directo casa-trabajo", color: "#d97706" },
];

const pasos = [
  { n: "1", titulo: "Obtén la licencia firmada por el médico", detalle: "El médico completa el formulario COMPIN o el sistema electrónico (SIAP/ORACLE). Recuerda pedirle la copia para ti." },
  { n: "2", titulo: "Presenta la licencia dentro de 2 días hábiles", detalle: "Tienes 2 días hábiles desde la fecha de inicio para presentarla a tu empleador. El empleador la envía a FONASA/Isapre en 3 días hábiles adicionales." },
  { n: "3", titulo: "Espera la resolución", detalle: "FONASA/COMPIN tiene hasta 30 días hábiles para resolver. Si es Isapre, 20 días hábiles. Durante ese tiempo, el empleador te paga y luego recupera el subsidio." },
  { n: "4", titulo: "Recibe el subsidio", detalle: "El monto lo paga la entidad previsional al empleador, quien te lo transfiere junto con tu sueldo. Si trabajas a honorarios, el subsidio va directo a ti." },
];

const faq = [
  { q: "¿Cuánto me pagan en licencia médica?", a: "El subsidio por incapacidad laboral temporal (SIL) es el promedio de tus remuneraciones de los últimos 3 meses, con un tope. Para FONASA en 2026, el tope es aproximadamente $2.800.000 brutos/mes. Los primeros 3 días de licencia común NO tienen subsidio (días de carencia): los paga el empleador solo si el contrato lo establece o por costumbre, pero no está obligado por ley." },
  { q: "¿Me pueden despedir estando con licencia?", a: "No directamente. Estar con licencia no es fuero, pero en la práctica el empleador no puede despedirte por causa de la licencia misma. Sí puede despedirte durante una licencia si existe causa justificada (art. 160) o necesidades de la empresa, pero debe igualmente pagar lo que corresponda y el despido entra en efecto solo al término de la licencia." },
  { q: "¿Qué pasa si la Isapre o FONASA rechaza la licencia?", a: "Puedes apelar ante la Superintendencia de Salud (supersalud.gob.cl) dentro de 15 días hábiles desde la notificación del rechazo. Si no apelan o si la apelación es rechazada, debes reintegrar los días pagados o, en su defecto, el empleador los descuenta de tu sueldo." },
  { q: "¿Puedo salir de casa cuando estoy con licencia?", a: "Sí, pero con criterio. La licencia no te prohíbe salir de casa: te prohíbe trabajar. Sin embargo, si la Isapre o FONASA hace una visita de inspección y no te encuentra en reposo coherente con tu diagnóstico, puede ser causal de rechazo." },
  { q: "¿El período de licencia cuenta para las vacaciones?", a: "Sí, los días de licencia médica se contabilizan como días trabajados para efectos del cálculo de vacaciones anuales." },
  { q: "¿Qué es una licencia prolongada y cuándo aplica?", a: "Cuando acumulas más de 6 meses continuos de licencia, COMPIN o la Isapre puede derivarte a una Comisión de Medicina Preventiva e Invalidez (COMPIN) que evalúa si corresponde declarar invalidez parcial o total." },
];

export default function LicenciaMedicaPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Licencia médica Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 6 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Licencia Médica en Chile 2026: Tipos, Cuánto Pagan y Cómo Tramitarla
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Desde la licencia común hasta el postnatal: guía clara de cada tipo, quién paga, cuánto recibes y qué pasa si te la rechazan.
        </p>
      </header>

      {/* Plazos clave */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { plazo: "2 días", desc: "Para presentar la licencia al empleador desde que inicia", color: "#dc2626" },
          { plazo: "3 días", desc: "Carencia en licencia común: no hay subsidio los primeros 3 días", color: "#d97706" },
          { plazo: "30 días", desc: "Plazo de FONASA/COMPIN para resolver la licencia", color: "#0a66c2" },
          { plazo: "15 días", desc: "Para apelar si rechazan tu licencia", color: "#7c3aed" },
        ].map((p) => (
          <div key={p.plazo} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: p.color, marginBottom: 6 }}>{p.plazo}</div>
            <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{p.desc}</span>
          </div>
        ))}
      </div>

      {/* Tipos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Tipos de licencia médica en Chile</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {tipos.map((t) => (
            <div key={t.tipo} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px", borderLeft: `4px solid ${t.color}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, background: "var(--bg-soft)", color: "var(--muted-strong)", padding: "2px 8px", borderRadius: 5, fontWeight: 700, flex: "0 0 auto" }}>{t.codigo}</span>
                <strong style={{ fontSize: 14, color: "var(--heading)" }}>{t.tipo}</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10, fontSize: 12 }}>
                <div><span style={{ color: "var(--muted)", fontWeight: 600, display: "block" }}>Quién paga</span><span>{t.quien_paga}</span></div>
                <div><span style={{ color: "var(--muted)", fontWeight: 600, display: "block" }}>Desde</span><span>{t.desde}</span></div>
                <div><span style={{ color: "var(--muted)", fontWeight: 600, display: "block" }}>Tope</span><span>{t.tope}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pasos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Cómo tramitar una licencia médica paso a paso</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {pasos.map((p) => (
            <div key={p.n} style={{ display: "flex", gap: 14, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
              <span style={{ background: "var(--primary-700)", color: "#fff", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flex: "0 0 auto" }}>{p.n}</span>
              <div>
                <strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>{p.titulo}</strong>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{p.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Preguntas frecuentes</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {faq.map((item, i) => (
            <details key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q}<span style={{ color: "var(--primary-700)", flexShrink: 0, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/blog/derechos-laborales-chile-2026" style={{ color: "var(--primary-700)", fontWeight: 600, fontSize: 14 }}>← Derechos laborales Chile 2026</a>
        <ShareNative title="Licencia medica Chile 2026: tipos, pago y tramitacion" text="Guia completa de licencia medica en Chile: tipos, cuanto pagan, plazos y que pasa si la rechazan." />
      </footer>
    </main>
  );
}
