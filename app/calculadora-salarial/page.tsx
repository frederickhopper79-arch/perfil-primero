import type { Metadata } from "next";
import { CalculadoraClient } from "./calculadora-client";

export const metadata: Metadata = {
  title: "Calculadora Salarial Chile 2026 — ¿Cuánto Debería Ganar? | Perfil Primero",
  description: "Calculadora gratuita de sueldos en Chile 2026. Descubre el rango salarial para tu cargo según sector, región y nivel de experiencia. Datos actualizados del mercado laboral chileno.",
  alternates: { canonical: "https://perfil-primero.web.app/calculadora-salarial" },
  openGraph: {
    title: "Calculadora Salarial Chile 2026 | Perfil Primero",
    description: "Descubre cuánto debería ganar según tu sector, región y experiencia. Herramienta gratuita.",
    url: "https://perfil-primero.web.app/calculadora-salarial",
    siteName: "Perfil Primero",
    locale: "es_CL",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Calculadora Salarial Chile 2026",
  "url": "https://perfil-primero.web.app/calculadora-salarial",
  "description": "Calcula el rango salarial de tu cargo en Chile según sector, región y experiencia.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CLP" },
};

export default function CalculadoraSalarialPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>
          Herramienta gratuita
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>
          Calculadora Salarial Chile 2026
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6, fontSize: 14 }}>
          Descubre el rango salarial de tu cargo según sector, región y nivel de experiencia. Datos basados en el mercado laboral chileno actualizado.
        </p>
      </header>

      <CalculadoraClient />

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", marginBottom: "2rem" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>¿Tu sueldo actual está bajo el mercado?</div>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          En Perfil Primero publicas tu perfil anónimo con tu expectativa salarial real. Las empresas verificadas te contactan con el sueldo declarado desde la primera invitación — sin negociar a ciegas ni perder tiempo.
        </p>
      </div>

      <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Factores que afectan el sueldo en Chile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {[
            { factor: "Región", desc: "Antofagasta y Magallanes pagan ~10–12% más que la RM por costo de vida y lejanía." },
            { factor: "Modalidad remota", desc: "El trabajo 100% remoto suma ~8% sobre el sueldo presencial en promedio." },
            { factor: "Inglés técnico", desc: "Certificación B2+ suma entre 15% y 30% según el sector." },
            { factor: "Certificaciones", desc: "AWS, PMP, CPA: cada una suma entre 10% y 25% al sueldo base del sector." },
          ].map((f) => (
            <div key={f.factor} style={{ background: "var(--bg-soft)", borderRadius: 8, padding: "10px 12px" }}>
              <strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>{f.factor}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/postulante" className="button">Publicar mi perfil con sueldo esperado</a>
        <a href="/estadisticas" className="button ghost">Ver estadísticas del mercado</a>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 20, lineHeight: 1.5 }}>
        Los rangos son referencias orientativas. Varían según empresa, negociación, habilidades específicas y condiciones del mercado local.
        Para datos actualizados en tiempo real, visita la{" "}
        <a href="/estadisticas" style={{ color: "var(--color-primary)" }}>página de estadísticas</a>.
      </p>
    </main>
  );
}
