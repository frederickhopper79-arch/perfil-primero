import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Vacaciones en Chile 2026: Cuántos Días Te Corresponden y Cómo Calcularlas | Perfil Primero",
  description: "Guía completa de vacaciones laborales en Chile: días de feriado legal, cálculo proporcional, feriado progresivo, compensación en dinero y tus derechos según el Código del Trabajo.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/vacaciones-chile-cuantos-dias" },
  openGraph: { type: "article", title: "Vacaciones en Chile 2026: Cuántos Días Te Corresponden", url: "https://perfil-primero.web.app/blog/vacaciones-chile-cuantos-dias", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Vacaciones en Chile 2026: Cuántos Días Te Corresponden y Cómo Calcularlas",
  "datePublished": "2026-06-25",
  "dateModified": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/vacaciones-chile-cuantos-dias" },
};

const faqVacaciones = [
  { q: "¿Cuántos días de vacaciones corresponden en Chile?", a: "15 días hábiles por año trabajado (art. 67 Código del Trabajo). Ojo: son días hábiles, no corridos. Los sábados, domingos y festivos no cuentan." },
  { q: "¿Qué es el feriado progresivo?", a: "Después de 10 años continuos o discontinuos con el mismo empleador (o empleadores distintos si acreditas el período), tienes derecho a 1 día hábil adicional de vacaciones por cada 3 años trabajados de más. Ejemplo: 13 años = 16 días hábiles." },
  { q: "¿Puedo tomar vacaciones antes de cumplir un año?", a: "Sí, si llevas más de 6 meses trabajando, puedes acordar con el empleador tomar vacaciones proporcionales antes de cumplir el año. Es un derecho irrenunciable." },
  { q: "¿Se pueden compensar las vacaciones en dinero?", a: "Parcialmente. Si te corresponden más de 10 días hábiles al año, puedes acordar con el empleador compensar en dinero los días que excedan esos 10 días. Los primeros 10 días NO se pueden compensar: debes tomarlos." },
  { q: "¿Qué pasa si me despiden sin haber tomado mis vacaciones?", a: "El empleador debe pagarte las vacaciones proporcionales en el finiquito. Corresponde al sueldo diario multiplicado por los días devengados." },
  { q: "¿El empleador puede negar o postergar mis vacaciones?", a: "Sí, el empleador puede fijar la época de las vacaciones, pero debe avisarte con 30 días de anticipación. No puede negarlas indefinidamente: las vacaciones deben tomarse dentro de los 6 meses siguientes al año trabajado." },
  { q: "¿Qué pasa si me enfermo durante mis vacaciones?", a: "Si obtienes una licencia médica durante las vacaciones, estas se interrumpen. Los días de licencia no se descuentan de tus días de vacaciones. Debes retomar las vacaciones al terminar la licencia (en acuerdo con el empleador)." },
  { q: "¿Los días feriados en medio de las vacaciones se descuentan?", a: "No. Los días festivos nacionales no se cuentan como días de vacaciones. Si hay un festivo en tu período de vacaciones, ese día no se descuenta de tus 15 días hábiles." },
];

export default function VacacionesPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Vacaciones Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 5 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Vacaciones en Chile 2026: Cuántos Días Te Corresponden y Cómo Calcularlas
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Guía clara sobre el feriado legal en Chile: días que te corresponden, cálculo proporcional, feriado progresivo y tus derechos cuando el empleador quiere postergarlas.
        </p>
      </header>

      {/* Cards principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { valor: "15 días", titulo: "Feriado legal anual", sub: "Hábiles (lunes a viernes, sin festivos)", color: "var(--color-primary)" },
          { valor: "+1 día", titulo: "Feriado progresivo", sub: "Por cada 3 años extra tras 10 años", color: "#7c3aed" },
          { valor: "10 días", titulo: "Mínimo intransable", sub: "No se pueden compensar en dinero", color: "#15803d" },
          { valor: "6 meses", titulo: "Plazo para tomarlas", sub: "Desde que se devengan", color: "#92400e" },
        ].map((c) => (
          <div key={c.titulo} style={{ background: "var(--surface)", border: `2px solid ${c.color}20`, borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: c.color, marginBottom: 4 }}>{c.valor}</div>
            <strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>{c.titulo}</strong>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Cálculo proporcional */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Cómo calcular vacaciones proporcionales</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>Si llevas menos de un año, o si te despiden y te deben vacaciones, la fórmula es:</p>
        <div style={{ background: "var(--bg-soft)", borderRadius: 10, padding: "16px 20px", marginBottom: 14, fontFamily: "monospace", fontSize: 15, textAlign: "center" }}>
          Días vacaciones = (15 × meses trabajados) ÷ 12
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { meses: "3 meses", dias: "3,75 días (≈ 4 días)" },
            { meses: "6 meses", dias: "7,5 días (≈ 8 días)" },
            { meses: "8 meses", dias: "10 días exactos" },
            { meses: "11 meses", dias: "13,75 días (≈ 14 días)" },
            { meses: "12 meses (1 año)", dias: "15 días hábiles completos" },
          ].map((r) => (
            <div key={r.meses} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", background: "var(--bg-soft)", borderRadius: 8, fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>{r.meses} trabajados</span>
              <strong>{r.dias}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Preguntas frecuentes sobre vacaciones en Chile</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {faqVacaciones.map((item, i) => (
            <details key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <summary style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>
                {item.q}<span style={{ color: "var(--color-primary)", flexShrink: 0, marginLeft: 8 }}>+</span>
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "16px 20px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 6 }}>¿Buscas un trabajo donde realmente respeten tus vacaciones?</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>En Perfil Primero las empresas declaran las condiciones laborales desde la primera invitación. Sin sorpresas sobre beneficios ni vacaciones adicionales.</p>
        <a href="/postulante" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 13 }}>Publicar mi perfil gratis →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <div>
          <a href="/blog/derechos-laborales-chile-2026" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>← Ver guía completa de derechos laborales</a>
        </div>
        <ShareNative title="Vacaciones Chile 2026: cuantos dias corresponden" text="Guia completa sobre vacaciones en Chile: dias, calculo proporcional, feriado progresivo y derechos." />
      </footer>
    </main>
  );
}
