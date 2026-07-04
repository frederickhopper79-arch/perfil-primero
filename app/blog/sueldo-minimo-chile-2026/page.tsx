import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Sueldo Mínimo Chile 2026: Cuánto Es, Desde Cuándo y Cómo Calcularlo | Perfil Primero",
  description: "Valor oficial del sueldo mínimo en Chile 2026: monto actualizado, fecha de vigencia, cálculo de liquidación, diferencias por sector y qué hacer si te pagan menos.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/sueldo-minimo-chile-2026" },
  openGraph: {
    type: "article",
    title: "Sueldo Mínimo Chile 2026: Valor Oficial y Cálculo",
    url: "https://perfil-primero.web.app/blog/sueldo-minimo-chile-2026",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Sueldo Mínimo Chile 2026: Cuánto Es, Desde Cuándo y Cómo Calcularlo",
  "datePublished": "2026-06-25",
  "dateModified": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "description": "Valor actualizado del sueldo minimo en Chile para 2026 y como calcularlo correctamente en tu liquidacion de sueldo.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/sueldo-minimo-chile-2026" },
};

const faqItems = [
  {
    q: "¿Cuánto es el sueldo mínimo en Chile en 2026?",
    a: "$510.000 pesos líquidos mensuales (bruto aproximado $600.000). Este valor está vigente desde agosto 2025 y será revisado por el Congreso en el primer semestre de 2026 según la agenda laboral del gobierno.",
  },
  {
    q: "¿El sueldo mínimo es líquido o bruto?",
    a: "El sueldo mínimo legal de $510.000 es el monto LÍQUIDO que debe recibir el trabajador. El empleador debe pagar además las cotizaciones previsionales (AFP ~12.38%, salud 7%, más Seguro Cesantía). El costo total para la empresa es de aproximadamente $710.000–730.000 mensuales.",
  },
  {
    q: "¿Qué pasa si trabajo medio tiempo?",
    a: "El sueldo mínimo es proporcional a las horas trabajadas. Si trabajas 22 horas semanales (media jornada), tu sueldo mínimo es el 50% del valor completo. La base es 45 horas semanales para la jornada completa.",
  },
  {
    q: "¿Las gratificaciones se incluyen en el sueldo mínimo?",
    a: "Depende de cómo se paguen. Si la empresa paga gratificación legal garantizada (25% de la remuneración, tope 4.75 IMM), esta puede imputarse al sueldo mínimo. Si la empresa paga el 30% de la utilidad, no puede imputarse. Revisa tu contrato.",
  },
  {
    q: "¿Me pueden pagar menos del sueldo mínimo si soy 'a honorarios'?",
    a: "Si trabajas a honorarios, no aplica el sueldo mínimo porque no hay relación laboral dependiente. Sin embargo, si tu situación real es de subordinación (horario fijo, jefe directo, tareas asignadas), existe una relación laboral encubierta y tienes derecho a demandar que se reconozca el vínculo laboral con todos sus beneficios.",
  },
  {
    q: "¿Cómo reclamo si me pagan menos del mínimo?",
    a: "Tienes tres vías: (1) Inspección del Trabajo: presenta denuncia en inspección.dt.gob.cl — es gratuito y el inspector puede exigir el pago inmediato. (2) Carta certificada al empleador exigiendo el pago. (3) Juzgado Laboral: si el empleador no cumple, puedes demandar y el juez puede condenar al pago más recargos.",
  },
];

const historial = [
  { año: "2022", monto: "$400.000", variacion: "+$10.000" },
  { año: "2023", monto: "$440.000", variacion: "+$40.000" },
  { año: "2024", monto: "$500.000", variacion: "+$60.000" },
  { año: "2025", monto: "$510.000", variacion: "+$10.000" },
  { año: "2026", monto: "~$540.000 (proyección)", variacion: "En negociación" },
];

export default function SueldoMinimoPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}
        <a href="/blog">Blog</a> {" › "}
        <span aria-current="page">Sueldo mínimo Chile 2026</span>
      </nav>

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 5 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Sueldo Mínimo Chile 2026: Cuánto Es, Desde Cuándo y Cómo Calcularlo
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Todo lo que necesitas saber sobre el ingreso mínimo mensual (IMM) en Chile: valor oficial, cálculo en tu liquidación, derechos y qué hacer si te pagan menos.
        </p>
      </header>

      {/* Valor destacado */}
      <div style={{ background: "linear-gradient(135deg, #1a2f5e, #3aaee0)", borderRadius: 16, padding: "28px 32px", marginBottom: 32, color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em" }}>Sueldo mínimo vigente · Chile 2025–2026</div>
        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>$510.000</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>Pesos líquidos mensuales · Jornada completa (45 hrs/semana)</div>
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>Vigente desde agosto 2025 · Bruto aprox. $600.000 · Costo empresa aprox. $720.000</div>
      </div>

      {/* Historial */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Evolución histórica del sueldo mínimo en Chile</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "2px solid var(--line)" }}>Año</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "2px solid var(--line)" }}>Monto líquido</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "2px solid var(--line)" }}>Variación</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr key={h.año} style={{ borderBottom: "1px solid var(--line)", background: i === 3 ? "#f0f8fe" : "var(--surface)" }}>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: i === 3 ? 700 : 400, color: "var(--heading)" }}>{h.año} {i === 3 && <span style={{ fontSize: 10, background: "var(--primary-700)", color: "#fff", borderRadius: 4, padding: "1px 6px", marginLeft: 6 }}>VIGENTE</span>}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: i === 3 ? "var(--primary-700)" : "var(--text)", textAlign: "right" }}>{h.monto}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--green)", textAlign: "right" }}>{h.variacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cálculo */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Cómo calcular el costo real del sueldo mínimo para la empresa</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { concepto: "Sueldo bruto base", monto: "$600.000", nota: "Antes de descuentos del trabajador" },
            { concepto: "AFP (trabajador, ~12.38%)", monto: "−$74.280", nota: "Varía según AFP y comisión" },
            { concepto: "Salud (trabajador, 7%)", monto: "−$42.000", nota: "FONASA o Isapre" },
            { concepto: "Seguro de Cesantía (trabajador, 0.6%)", monto: "−$3.600", nota: "Contrato indefinido" },
            { concepto: "Sueldo líquido", monto: "$480.120", nota: "Lo que recibe el trabajador", bold: true },
            { concepto: "Seguro de Cesantía (empleador, 2.4%)", monto: "+$14.400", nota: "Costo adicional empresa" },
            { concepto: "Mutual de Seguridad (0.93% base)", monto: "+$5.580", nota: "Varía por actividad" },
            { concepto: "COSTO TOTAL EMPRESA", monto: "$619.980", nota: "Aproximado, varía por AFP y Mutual", bold: true },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: r.bold ? "var(--color-dark)" : "var(--bg-soft)", borderRadius: 8, color: r.bold ? "#fff" : "var(--text)" }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 400 }}>{r.concepto}</span>
                {!r.bold && <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>{r.nota}</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{r.monto}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, marginBottom: 0 }}>* Cálculo orientativo. Las cotizaciones varían según AFP, comisión y tipo de contrato. Usa la calculadora de la DT para datos exactos.</p>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Preguntas frecuentes sobre el sueldo mínimo</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {faqItems.map((item, i) => (
            <details key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <summary style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q} <span style={{ color: "var(--primary-700)", flexShrink: 0, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 20px", marginBottom: "2rem" }}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 6 }}>¿Ganas más del mínimo pero quieres saber si tu sueldo está a mercado?</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>Usa nuestra calculadora salarial gratuita para ver el rango de tu sector y nivel.</p>
        <a href="/calculadora-salarial" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 13 }}>Calculadora salarial Chile 2026 →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <strong style={{ display: "block", fontSize: 15, marginBottom: 4 }}>¿Buscas trabajo con sueldo transparente?</strong>
          <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 14 }}>Publica tu perfil en Perfil Primero →</a>
        </div>
        <ShareNative title="Sueldo minimo Chile 2026 - valor oficial y calculo" text="Cuanto es el sueldo minimo en Chile 2026, como calcularlo en tu liquidacion y que hacer si te pagan menos." />
      </footer>
    </main>
  );
}
