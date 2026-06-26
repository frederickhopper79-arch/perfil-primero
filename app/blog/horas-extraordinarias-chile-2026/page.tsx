import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Horas Extraordinarias en Chile 2026: Límite, Pago y Tus Derechos | Perfil Primero",
  description: "Todo sobre las horas extras en Chile: cuántas puedes trabajar, cuánto te deben pagar (recargo del 50%), cuándo son voluntarias y cómo reclamar si no te las pagan.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/horas-extraordinarias-chile-2026" },
  openGraph: { type: "article", title: "Horas Extraordinarias Chile 2026: Límite y Pago", url: "https://perfil-primero.web.app/blog/horas-extraordinarias-chile-2026", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Horas Extraordinarias en Chile 2026: Límite, Pago y Tus Derechos",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/horas-extraordinarias-chile-2026" },
};

const faq = [
  { q: "¿Cuánto me deben pagar por hora extra?", a: "El valor de la hora ordinaria con un recargo mínimo del 50% (art. 32 CT). Fórmula: (Sueldo bruto mensual ÷ 190 horas mensuales) × 1.5. Ejemplo: bruto $1.000.000 → hora ordinaria $5.263 → hora extra $7.895." },
  { q: "¿Cuántas horas extra puedo trabajar?", a: "Máximo 2 horas extra diarias y el total no puede exceder el límite semanal que llevaría la jornada sobre 60 horas (jornada ordinaria + extra). En la práctica, si trabajas 45 horas semanales, puedes hacer hasta 15 horas extra a la semana." },
  { q: "¿Las horas extras son obligatorias?", a: "No. Las horas extraordinarias son voluntarias y deben pactarse por escrito, ya sea en el contrato original o en un acuerdo posterior. El empleador no puede obligarte a hacerlas salvo fuerza mayor (catástrofe, urgencia impostergable)." },
  { q: "¿Existe un tope de horas extras anuales?", a: "La ley no fija un tope anual, pero sí prohíbe jornadas que excedan 60 horas semanales (ordinaria + extra). En la práctica, el acuerdo de horas extra tiene un plazo máximo de 3 meses, renovable." },
  { q: "¿Las horas extra se incluyen en la base de cálculo del finiquito?", a: "Sí, si las horas extras son habituales y regulares (al menos en los últimos 3 meses), se incluyen en el promedio de remuneración para calcular la indemnización por años de servicio." },
  { q: "¿Qué pasa si trabajé horas extra pero no tenemos acuerdo escrito?", a: "Si puedes demostrar que las hiciste (mensajes, registros de acceso, emails, testigos), tienes derecho a cobrarlas igual. La falta de acuerdo escrito perjudica al empleador, no al trabajador. Reclama ante la Inspección del Trabajo." },
];

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

export default function HorasExtraPage() {
  const ejemplos = [
    { bruto: 600000, label: "$600.000 bruto" },
    { bruto: 900000, label: "$900.000 bruto" },
    { bruto: 1200000, label: "$1.200.000 bruto" },
    { bruto: 1800000, label: "$1.800.000 bruto" },
    { bruto: 2500000, label: "$2.500.000 bruto" },
  ].map(e => ({
    ...e,
    horaOrd: e.bruto / 190,
    horaExtra: (e.bruto / 190) * 1.5,
  }));

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Horas extraordinarias Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 5 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Horas Extraordinarias en Chile 2026: Límite, Pago y Tus Derechos
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          ¿Te están pidiendo quedarte más horas? Antes de decir que sí (o ya que dijiste que sí), conoce cuánto te deben pagar, cuántas son legales y cuándo tienes derecho a negarte.
        </p>
      </header>

      {/* Regla de oro */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { valor: "+50%", titulo: "Recargo mínimo legal", sub: "Sobre el valor de la hora ordinaria", color: "#15803d" },
          { valor: "2 hrs", titulo: "Máximo por día", sub: "Dentro de la jornada semanal legal", color: "#0a66c2" },
          { valor: "3 meses", titulo: "Plazo del acuerdo", sub: "Renovable por escrito", color: "#7c3aed" },
          { valor: "Voluntarias", titulo: "Siempre", sub: "No pueden ser impuestas salvo fuerza mayor", color: "#92400e" },
        ].map((c) => (
          <div key={c.titulo} style={{ background: "var(--surface)", border: `2px solid ${c.color}22`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: c.color, marginBottom: 4 }}>{c.valor}</div>
            <strong style={{ fontSize: 12, display: "block", marginBottom: 3 }}>{c.titulo}</strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Tabla de valores */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>¿Cuánto vale mi hora extra?</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Base: jornada de 45 hrs/semana = 190 hrs/mes. Recargo: 50% mínimo.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {["Sueldo bruto/mes","Hora ordinaria","Hora extra (+50%)","5 horas extra/semana"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", borderBottom: "2px solid var(--line)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ejemplos.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, textAlign: "right" }}>{e.label}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--muted)", textAlign: "right" }}>{fmt(e.horaOrd)}</td>
                  <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: "var(--color-primary)", textAlign: "right" }}>{fmt(e.horaExtra)}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--green)", fontWeight: 600, textAlign: "right" }}>+{fmt(e.horaExtra * 5 * 4.3)}/mes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Preguntas frecuentes sobre horas extra</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {faq.map((item, i) => (
            <details key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q}<span style={{ color: "var(--color-primary)", flexShrink: 0, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "14px 18px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>¿Buscas un trabajo con jornada razonable?</strong>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px" }}>En Perfil Primero las empresas declaran la modalidad y jornada desde la primera invitación. Sin sorpresas sobre horas extra.</p>
        <a href="/postulante" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 12 }}>Publicar mi perfil gratis →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/simulador-liquidacion" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>← Simular mi liquidación de sueldo</a>
        <ShareNative title="Horas extraordinarias Chile 2026: limite, pago y derechos" text="Cuanto te deben pagar por hora extra en Chile, cuantas son legales y cuando puedes negarte." />
      </footer>
    </main>
  );
}
