import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Gratificación Legal en Chile 2026: Cómo Calcularla y Qué Debe Pagarte la Empresa | Perfil Primero",
  description: "Todo sobre la gratificación legal en Chile: modalidades (25% de remuneración vs 30% de utilidades), cuándo corresponde, cómo calcularla y si puede imputarse al sueldo mínimo.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/gratificacion-legal-chile-como-calcular" },
  openGraph: { type: "article", title: "Gratificación Legal Chile 2026: Cálculo y Derechos", url: "https://perfil-primero.web.app/blog/gratificacion-legal-chile-como-calcular", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Gratificación Legal en Chile 2026: Cómo Calcularla y Qué Debe Pagarte la Empresa",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/gratificacion-legal-chile-como-calcular" },
};

export default function GratificacionPage() {
  const IMM = 510000;
  const tope25 = IMM * 4.75;
  const topeAnual = tope25 * 12;

  function fmt(n: number) {
    return "$" + Math.round(n).toLocaleString("es-CL");
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Gratificación legal Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 5 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Gratificación Legal en Chile 2026: Cómo Calcularla y Qué Debe Pagarte la Empresa
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          La gratificación es un derecho legal en Chile, no un bono voluntario. Aquí te explicamos las dos modalidades, cómo calcularla y qué pasa cuando la empresa incluye la gratificación en el sueldo mensual.
        </p>
      </header>

      {/* Dos modalidades */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Las 2 modalidades de gratificación legal (art. 47–49 CT)</h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <div style={{ background: "var(--surface)", border: "2px solid #0a66c2", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0a66c2", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Modalidad A (más común)</div>
            <strong style={{ fontSize: 17, display: "block", marginBottom: 10 }}>25% de la remuneración anual</strong>
            <div style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
              <div>✓ Aplica si la empresa tiene utilidades ese año</div>
              <div>✓ Tope: 4,75 IMM mensual por trabajador</div>
              <div>✓ Tope mensual 2026: <strong style={{ color: "var(--heading)" }}>{fmt(tope25)}</strong></div>
              <div>✓ Tope anual 2026: <strong style={{ color: "var(--heading)" }}>{fmt(topeAnual)}</strong></div>
              <div>✓ Puede incluirse en el sueldo mensual (gratificación garantizada)</div>
              <div>✗ Si no hay utilidades, no corresponde bajo esta modalidad</div>
            </div>
          </div>
          <div style={{ background: "var(--surface)", border: "2px solid #7c3aed", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Modalidad B</div>
            <strong style={{ fontSize: 17, display: "block", marginBottom: 10 }}>30% de las utilidades líquidas</strong>
            <div style={{ display: "grid", gap: 6, fontSize: 13, color: "var(--muted)" }}>
              <div>✓ Se reparte el 30% de las utilidades líquidas entre los trabajadores</div>
              <div>✓ Proporcional al sueldo de cada trabajador</div>
              <div>✗ Sin utilidades = sin gratificación</div>
              <div>✗ No puede imputarse al sueldo mínimo</div>
              <div>✗ Menos predecible para el trabajador</div>
              <div>→ Menos usada en la práctica</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cálculo ejemplo */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Ejemplo de cálculo: gratificación mensual incluida en sueldo</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
          La forma más común en Chile es que la empresa "adelanta" la gratificación mensualmente. Al contrato dice "el sueldo incluye gratificación garantizada". Veamos cómo se calcula:
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { concepto: "Sueldo base acordado", valor: "$900.000", nota: "Lo que dice el contrato" },
            { concepto: "Gratificación mensual (25% ÷ 12 meses, tope)", valor: `${fmt(Math.min(900000 * 0.25 / 12, tope25))}`, nota: `Límite: ${fmt(tope25)}/mes` },
            { concepto: "Sueldo bruto total", valor: "$918.750", nota: "Base + gratificación mensual", bold: true },
            { concepto: "", valor: "", nota: "" },
            { concepto: "Cuidado: si el contrato NO dice 'incluye gratificación'", valor: "→", nota: "La gratificación se paga APARTE del sueldo base" },
          ].filter(r => r.concepto || r.nota).map((r, i) => (
            r.concepto ? (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", background: r.bold ? "linear-gradient(90deg,#1a2f5e,#3aaee0)" : "var(--bg-soft)", borderRadius: 8, color: r.bold ? "#fff" : "var(--text)" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: r.bold ? 700 : 400 }}>{r.concepto}</span>
                  {!r.bold && r.nota && <span style={{ fontSize: 11, color: "var(--muted)", display: "block" }}>{r.nota}</span>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{r.valor}</span>
              </div>
            ) : (
              <div key={i} style={{ padding: "8px 14px", background: "#fff7ed", borderRadius: 8, fontSize: 12, color: "#92400e", borderLeft: "3px solid #d97706" }}>{r.nota}</div>
            )
          ))}
        </div>
      </section>

      {/* Preguntas clave */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Lo que debes saber antes de firmar</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            { q: "¿Toda empresa debe pagar gratificación?", a: "Solo las empresas con giro comercial o industrial que tengan utilidades líquidas en el ejercicio anual (según balance). Las empresas sin fines de lucro, personas naturales que no sean comerciantes o industriales, y algunas cooperativas están exentas." },
            { q: "¿Puedo exigir que me paguen la gratificación separada del sueldo?", a: "Si el contrato dice 'sueldo incluye gratificación garantizada' y la empresa tiene utilidades, la práctica es válida. Sin embargo, el monto debe quedar claro en la liquidación de sueldo. Si no hay constancia, puedes reclamar la gratificación aparte." },
            { q: "¿Qué pasa si me fui a mitad de año?", a: "La gratificación es proporcional a los meses trabajados durante el año comercial (enero a diciembre). Si trabajaste 6 meses, te corresponde el 50% de la gratificación anual." },
            { q: "¿La gratificación se incluye para calcular la indemnización por años de servicio?", a: "Depende. Si la gratificación es variable o por utilidades, no se incluye en la base de cálculo de la indemnización. Si es garantizada y mensual, sí forma parte de la 'última remuneración mensual' que se usa como base." },
          ].map((item, i) => (
            <details key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q}<span style={{ color: "var(--primary-700)", flexShrink: 0, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "16px 20px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 6 }}>¿Tu oferta de trabajo declara la gratificación?</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>En Perfil Primero las empresas verificadas deben indicar si la gratificación ya está incluida en el sueldo o si se paga aparte. Sin ambigüedades desde la primera invitación.</p>
        <a href="/postulante" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 13 }}>Ver cómo funciona →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/blog/sueldo-minimo-chile-2026" style={{ color: "var(--primary-700)", fontWeight: 600, fontSize: 14 }}>← Sueldo mínimo Chile 2026</a>
        <ShareNative title="Gratificacion legal Chile 2026: como calcularla" text="Las dos modalidades de gratificacion legal en Chile, calculo con ejemplos y que debe aparecer en tu liquidacion." />
      </footer>
    </main>
  );
}
