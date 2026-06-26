import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Trabajo Independiente vs Relación Laboral en Chile 2026 | Perfil Primero",
  description: "Guía completa: diferencias entre boleta de honorarios y contrato de trabajo en Chile. Derechos, costos, beneficios y cuándo conviene cada modalidad.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/trabajo-independiente-vs-relacion-laboral-chile" },
};

const comparacion = [
  { aspecto: "Relación con el empleador", contrato: "Relación laboral (subordinación y dependencia)", honorarios: "Prestación de servicios independiente" },
  { aspecto: "Cotizaciones previsionales", contrato: "AFP: 10% + seguro invalidez, Salud: 7% (descuento en nómina)", honorarios: "10.75% retención obligatoria desde 2023 (Ley 21.242)" },
  { aspecto: "Seguro de cesantía", contrato: "Sí (0.6% trabajador + 2.4% empleador)", honorarios: "No aplica" },
  { aspecto: "Vacaciones legales", contrato: "15 días hábiles mínimo por año", honorarios: "No existen. Se negocian contractualmente" },
  { aspecto: "Indemnización por término", contrato: "30 días por año, tope 11 años (si no hay CAS)", honorarios: "No aplica. Solo lo que diga el contrato civil" },
  { aspecto: "Seguro de accidentes del trabajo", contrato: "Mutualidad (financiada por empleador)", honorarios: "Opcional, auto-contratado" },
  { aspecto: "IVA en las facturas", contrato: "No aplica", honorarios: "Depende: si es persona natural con 2ª categoría, emite boleta. Si tiene empresa, factura con IVA" },
  { aspecto: "Flexibilidad de horario", contrato: "Definida por el empleador (con límites legales)", honorarios: "Alta, acordada con el cliente" },
];

const sennalesDeRelacionLaboral = [
  "Tienes horario fijo definido por quien te paga",
  "Recibes instrucciones directas de cómo hacer el trabajo (no solo qué resultado lograr)",
  "Usas equipos, herramientas o instalaciones del contratante",
  "No puedes rechazar trabajos dentro del acuerdo sin consecuencias",
  "Llevas más de 1 año con el mismo cliente como único o principal ingreso",
  "El cliente puede ponerte fin a la relación sin previo aviso y sin causa",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Trabajo Independiente vs Relación Laboral en Chile 2026",
  "datePublished": "2026-06-22",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function TrabajoIndependientePage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "#dcfce7", borderRadius: 20, color: "#15803d" }}>Para trabajadores</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Trabajo Independiente vs Relación Laboral en Chile: Qué Conviene en 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          ¿Te ofrecen trabajar a honorarios cuando en la práctica es un trabajo dependiente? Aquí está el análisis completo para saber qué te conviene y cuándo te están simulando una relación laboral.
        </p>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", background: "#fef3c7", padding: "8px 12px", borderRadius: 8, display: "inline-block" }}>
          ⚠ Esta guía es informativa. Para tu situación específica, consulta con un abogado laboral o tributario.
        </div>
      </header>

      {/* Tabla comparativa */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Comparación completa</h2>
        <div className="tableWrap" style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 14px", background: "var(--bg-soft)", color: "var(--muted)", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em" }}>Aspecto</th>
                <th style={{ padding: "10px 14px", background: "#dcfce7", color: "#15803d", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left" }}>Contrato de trabajo</th>
                <th style={{ padding: "10px 14px", background: "#fef3c7", color: "#92400e", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left" }}>Honorarios</th>
              </tr>
            </thead>
            <tbody>
              {comparacion.map((c, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--heading)" }}>{c.aspecto}</td>
                  <td style={{ padding: "10px 14px", color: "var(--text)", lineHeight: 1.5 }}>{c.contrato}</td>
                  <td style={{ padding: "10px 14px", color: "var(--text)", lineHeight: 1.5 }}>{c.honorarios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Señales */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Señales de que te están simulando una relación laboral</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
          Si pagas a honorarios pero en la práctica tu vínculo tiene estas características, el Código del Trabajo puede reconocer una relación laboral encubierta, con todos los derechos que eso implica.
        </p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {sennalesDeRelacionLaboral.map((s, i) => (
            <li key={i} style={{ display: "flex", gap: 10, background: "var(--surface)", borderRadius: 10, border: "1px solid #fce7f3", padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--coral)", flexShrink: 0 }}>⚠</span> {s}
            </li>
          ))}
        </ul>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", marginBottom: "2rem" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>En Perfil Primero, las empresas declaran la modalidad desde la invitación</div>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          Todas las invitaciones de empresas en Perfil Primero deben especificar si el vínculo es contrato indefinido, plazo fijo, honorarios o contrato de obra. Sabes exactamente a qué tipo de relación te invitan antes de responder.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/postulante" className="button">Buscar trabajo con transparencia total</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Trabajo independiente vs relacion laboral Chile - Perfil Primero" text="Comparativa entre honorarios y contrato de trabajo en Chile con ventajas y desventajas." />
      </div>
</main>
  );
}
