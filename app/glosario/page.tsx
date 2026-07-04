import type { Metadata } from "next";
import { GlosarioClient } from "./glosario-client";

export const metadata: Metadata = {
  title: "Glosario Laboral Chile 2026 | Perfil Primero",
  description: "50 términos del mercado laboral chileno explicados: finiquito, cotizaciones, liquidación, teletrabajo, honorarios, AFP, FONASA y más.",
  alternates: { canonical: "https://perfil-primero.web.app/glosario" },
};

export default function GlosarioPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Referencia</p>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.25rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>Glosario Laboral Chile 2026</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 580 }}>
          44 términos del mercado laboral chileno explicados en lenguaje claro: contratos, cotizaciones, finiquitos, derechos y más.
        </p>
      </header>
      <GlosarioClient />
    </main>
  );
}
