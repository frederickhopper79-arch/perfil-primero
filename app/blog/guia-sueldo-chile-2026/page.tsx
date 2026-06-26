import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Guía de Sueldos Chile 2026: Cuánto ganar según tu industria y región",
  description: "Descubre los sueldos promedio en Chile para 2026 por industria, región y nivel de experiencia. Datos actualizados con información real de postulantes.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/guia-sueldo-chile-2026" },
  openGraph: {
    title: "Guía de Sueldos Chile 2026 | Perfil Primero",
    description: "Sueldos reales por industria y región en Chile para 2026, basados en datos de Perfil Primero.",
  },
};

const tablaResumen = [
  { sector: "Tecnología / Software", junior: "$900K–$1.2M", mid: "$1.5M–$2.2M", senior: "$2.5M–$4.5M" },
  { sector: "Finanzas / Banca", junior: "$750K–$1M", mid: "$1.2M–$1.8M", senior: "$2M–$3.8M" },
  { sector: "Salud / Clínico", junior: "$650K–$900K", mid: "$1M–$1.6M", senior: "$1.8M–$3.2M" },
  { sector: "Marketing Digital", junior: "$600K–$850K", mid: "$950K–$1.5M", senior: "$1.6M–$2.8M" },
  { sector: "Logística / Operaciones", junior: "$550K–$750K", mid: "$850K–$1.3M", senior: "$1.4M–$2.2M" },
  { sector: "Construcción / Minería", junior: "$700K–$950K", mid: "$1.1M–$1.8M", senior: "$2M–$3.5M" },
  { sector: "RRHH / Administración", junior: "$580K–$780K", mid: "$900K–$1.3M", senior: "$1.4M–$2.1M" },
  { sector: "Comercio / Ventas", junior: "$550K–$750K", mid: "$800K–$1.3M", senior: "$1.4M–$2.5M" },
];

const factoresAlzan = [
  "Inglés avanzado (B2 en adelante): +15–25% sobre la mediana",
  "Trabajo 100% remoto con empresa internacional: hasta +40% sobre mercado local",
  "Habilidades de IA / ML o data science: +20–35% en el sector tech",
  "Certificaciones vigentes (AWS, PMP, CFA): +10–20% según el área",
  "Responsabilidad de equipo o presupuesto: +15–30% como factor de seniority",
];

const articulosRelacionados = [
  { titulo: "Cómo negociar tu sueldo en Chile", href: "/blog/como-negociar-tu-sueldo-en-chile" },
  { titulo: "Transparencia salarial en Chile", href: "/blog/transparencia-salarial-chile" },
  { titulo: "Tendencias del mercado laboral Chile 2025", href: "/blog/tendencias-mercado-laboral-chile-2025" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Guía de Sueldos Chile 2026: Cuánto ganar según tu industria y región",
  "datePublished": "2026-06-01",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "description": "Tabla de sueldos 2026 por industria, región y nivel de experiencia en Chile, basada en datos reales de perfiles activos en Perfil Primero.",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/guia-sueldo-chile-2026" },
};

export default function GuiaSueldoPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, color: "var(--muted)", padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20 }}>Sueldos</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Actualizado: Junio 2026</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Guía de Sueldos Chile 2026: Cuánto ganar según tu industria y región
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Basada en los rangos salariales declarados por más de 1,200 postulantes activos en Perfil Primero durante el primer semestre de 2026. Los sueldos son en pesos chilenos brutos mensuales.
        </p>
      </header>

      {/* Tabla principal */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Sueldos por sector y nivel de experiencia</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--surface)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--muted-strong)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", borderBottom: "1px solid var(--line)" }}>Sector</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--muted-strong)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>Junior</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--muted-strong)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>Semi Senior</th>
                <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--muted-strong)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>Senior</th>
              </tr>
            </thead>
            <tbody>
              {tablaResumen.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < tablaResumen.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text)" }}>{row.sector}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>{row.junior}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--color-primary)", fontWeight: 600 }}>{row.mid}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>{row.senior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>* CLP brutos mensuales. Datos basados en perfiles activos de Perfil Primero, junio 2026.</p>
      </section>

      {/* Factores que alzan */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Factores que aumentan tu sueldo</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {factoresAlzan.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>↑</span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Regiones */}
      <section style={{ marginBottom: "2.5rem", background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: 10 }}>Diferencia por región</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          La Región Metropolitana paga en promedio un <strong>18–25% más</strong> que regiones como Biobío, Los Lagos o La Araucanía para el mismo cargo. Sin embargo, el trabajo remoto ha comenzado a nivelar esta brecha en roles de tecnología, marketing digital y finanzas.
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 8 }}>
          Antofagasta y Atacama tienen sueldos elevados en minería que pueden superar a Santiago en roles especializados de ingeniería y operaciones.
        </p>
      </section>

      {/* CTA */}
      <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem", textAlign: "center", marginBottom: "2.5rem" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>¿Quieres saber cuánto valen tus habilidades específicas?</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Usa nuestro comparador de benchmark salarial con datos en tiempo real de la plataforma.</p>
        <a href="/estadisticas" className="button">Ver benchmark salarial en tiempo real</a>
      </div>

      {/* Artículos relacionados */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Artículos relacionados</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {articulosRelacionados.map((a, i) => (
            <a key={i} href={a.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span>{a.titulo}</span>
              <span style={{ color: "var(--color-primary)" }}>→</span>
            </a>
          ))}
        </div>
      </section>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Guia de sueldos en Chile 2026 - Perfil Primero" text="Rangos salariales actualizados por sector e industria en Chile para 2026." />
      </div>
</main>
  );
}
