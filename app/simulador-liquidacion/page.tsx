import type { Metadata } from "next";
import { LiquidacionClient } from "./liquidacion-client";

export const metadata: Metadata = {
  title: "Simulador de Liquidación de Sueldo Chile 2026 — Calcula tu Líquido | Perfil Primero",
  description: "Calcula tu sueldo líquido en Chile 2026. Ingresa tu bruto y obtén el desglose completo: AFP, salud, cesantía, y el costo real para la empresa. Gratis y sin registro.",
  alternates: { canonical: "https://perfil-primero.web.app/simulador-liquidacion" },
  openGraph: {
    title: "Simulador de Liquidación de Sueldo Chile 2026 | Perfil Primero",
    description: "Descubre cuánto recibes realmente de tu sueldo bruto. Desglose AFP, salud, cesantía y costo empresa.",
    url: "https://perfil-primero.web.app/simulador-liquidacion",
    siteName: "Perfil Primero",
    locale: "es_CL",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Simulador de Liquidación de Sueldo Chile 2026",
  "url": "https://perfil-primero.web.app/simulador-liquidacion",
  "description": "Calcula el sueldo liquido desde el bruto con desglose de AFP, salud, seguro de cesantia y costo para la empresa.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CLP" },
};

export default function SimuladorLiquidacionPage() {
  return (
    <main style={{ maxWidth: 740, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>Herramienta gratuita</p>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>
          Simulador de Liquidación de Sueldo Chile 2026
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6, fontSize: 14 }}>
          Ingresa tu sueldo bruto y obtén el desglose completo: cuánto va a la AFP, salud, cesantía, cuánto recibes líquido y cuánto le cuesta tu sueldo realmente a tu empleador.
        </p>
      </header>

      <LiquidacionClient />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 24, marginBottom: 24 }}>
        {[
          { titulo: "¿Qué es el sueldo bruto?", desc: "El sueldo acordado en tu contrato antes de cualquier descuento. Lo que la empresa dice que pagas como remuneración base." },
          { titulo: "¿Qué es el sueldo líquido?", desc: "Lo que recibes en tu cuenta bancaria cada mes después de AFP, salud y seguro de cesantía." },
          { titulo: "¿Qué es el costo empresa?", desc: "Lo que realmente le cuesta tu cargo al empleador, incluyendo SIS y cotización de cesantía que paga él." },
        ].map((c) => (
          <div key={c.titulo} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
            <strong style={{ fontSize: 13, display: "block", marginBottom: 6 }}>{c.titulo}</strong>
            <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{c.desc}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "14px 18px", marginBottom: "1.5rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>¿Tu sueldo bruto está a mercado?</strong>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px" }}>Compara con los rangos de tu sector en nuestra calculadora salarial.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/calculadora-salarial" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 12 }}>Calculadora salarial →</a>
          <a href="/blog/afp-chile-2026-cuanto-se-descuenta" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 12 }}>Comparar AFP →</a>
          <a href="/postulante" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 12 }}>Buscar trabajo con sueldo claro →</a>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
        Cálculo orientativo basado en cotizaciones vigentes en Chile 2026. No reemplaza una liquidación oficial emitida por tu empleador o un contador.
      </p>
    </main>
  );
}
