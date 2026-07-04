import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Tendencias del mercado laboral en Chile 2025 · Perfil Primero",
  description: "Análisis de las tendencias laborales en Chile: trabajo remoto, sueldos por sector, demanda de habilidades tecnológicas y el auge del trabajo por proyecto.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/tendencias-mercado-laboral-chile-2025" },
  openGraph: {
    type: "article",
    title: "Tendencias del mercado laboral en Chile 2025",
    url: "https://perfil-primero.web.app/blog/tendencias-mercado-laboral-chile-2025",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tendencias del mercado laboral en Chile 2025",
  "datePublished": "2025-07-01",
  "author": { "@type": "Organization", "name": "Perfil Primero" },
  "publisher": {
    "@type": "Organization",
    "name": "Perfil Primero",
    "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/logo-perfil-primero.png" },
  },
};

interface TrendStat {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

const STATS: TrendStat[] = [
  { label: "Ofertas con trabajo remoto o híbrido", value: "62%", change: "+18% vs 2023", positive: true },
  { label: "Aumento promedio de sueldos TI", value: "+12%", change: "interanual 2024–2025", positive: true },
  { label: "Tiempo promedio de contratación", value: "41 días", change: "-7 días vs modelo invertido", positive: false },
  { label: "Candidatos que buscan flexibilidad horaria", value: "78%", change: "como criterio clave", positive: true },
];

export default function TendenciasPage() {
  return (
    <>      <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <nav aria-label="Migas de pan" style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}
        <a href="/blog">Blog</a> {" › "}
        <span aria-current="page">Tendencias 2025</span>
      </nav>

      <header style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "inline-block",
          background: "var(--surface-muted)",
          color: "var(--muted-strong)",
          padding: "0.25rem 0.75rem",
          borderRadius: "1rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          marginBottom: "1rem",
        }}>
          Análisis de Mercado · 2025
        </div>
        <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1.25 }}>
          Tendencias del mercado laboral en Chile 2025
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.0625rem", margin: 0 }}>
          El mercado laboral chileno está experimentando cambios estructurales. Analizamos las
          tendencias más importantes para trabajadores y empresas en 2025.
        </p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1rem",
        marginBottom: "2.5rem",
      }}>
        {STATS.map((stat) => (
          <div key={stat.label} style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "0.75rem",
            padding: "1rem",
          }}>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--primary-700)" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: "0.25rem" }}>
              {stat.label}
            </div>
            {stat.change && (
              <div style={{
                fontSize: "0.75rem",
                color: stat.positive ? "var(--green)" : "var(--coral)",
                marginTop: "0.25rem",
                fontWeight: 600,
              }}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <article style={{ lineHeight: 1.75 }}>
        <h2>1. El trabajo remoto llegó para quedarse</h2>
        <p>
          Post-pandemia, el 62% de las ofertas laborales en Chile incluyen algún componente de
          trabajo remoto o híbrido. Los sectores de tecnología, finanzas y servicios profesionales
          lideran esta transformación. Los trabajadores que buscan posiciones presenciales en Santiago
          compiten en un mercado diferente al de regiones como Valparaíso o Concepción, donde el
          remoto abre oportunidades sin fronteras geográficas.
        </p>

        <h2>2. Sueldos en tecnología alcanzan nuevos máximos</h2>
        <p>
          Los desarrolladores de software, especialistas en IA y profesionales de ciberseguridad
          lideran los incrementos salariales. Un desarrollador backend senior en Santiago puede
          aspirar a $3.5–5 millones de pesos mensuales en 2025, con empresas internacionales
          pagando en dólares a talentos chilenos que trabajan de forma remota.
        </p>

        <h2>3. Transparencia salarial como ventaja competitiva</h2>
        <p>
          La nueva generación de trabajadores exige conocer el sueldo antes de postular.
          Las empresas que incluyen el rango salarial en sus ofertas reciben hasta 3x más
          candidatos calificados. Plataformas como Perfil Primero inversión el modelo:
          los candidatos declaran su sueldo esperado para que las empresas encuentren
          exactamente lo que buscan.
        </p>

        <h2>4. Habilidades más demandadas en 2025</h2>
        <ul>
          <li><strong>Tecnología:</strong> Python, React, TypeScript, SQL, cloud (AWS/GCP/Azure)</li>
          <li><strong>IA y datos:</strong> Machine Learning, análisis de datos, Power BI</li>
          <li><strong>Blandas:</strong> comunicación remota, autogestión, adaptabilidad</li>
          <li><strong>Finanzas:</strong> conocimiento en ESG, compliance y regulación fintech</li>
          <li><strong>Salud:</strong> telemedicina, gestión clínica digital</li>
        </ul>

        <h2>5. El auge del trabajo por proyecto</h2>
        <p>
          El 23% de los profesionales chilenos en 2025 trabajan de forma independiente o en
          modalidad freelance, combinando proyectos con múltiples clientes. Esta tendencia
          impulsa la necesidad de perfiles claros y públicos que permitan a las empresas
          encontrar talento para proyectos específicos sin procesos largos de reclutamiento.
        </p>

        <h2>6. OMIL y programas de empleo regional</h2>
        <p>
          Las Oficinas Municipales de Intermediación Laboral (OMIL) están digitalizando sus
          procesos. Perfil Primero se integra con OMIL para que municipios de todo Chile
          puedan crear perfiles de trabajadores y conectarlos con empresas verificadas,
          especialmente en regiones como Los Lagos, La Araucanía y Aysén.
        </p>
      </article>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.9375rem", margin: 0 }}>
          Explora más en{" "}
          <a href="/analisis-expertos" style={{ color: "var(--primary-700)", fontWeight: 600 }}>
            Análisis de mercado por sector →
          </a>
        </p>
        <ShareNative title="Tendencias del mercado laboral en Chile 2025 · Perfil Primero" text="Trabajo remoto, IA y transparencia salarial: las tendencias que definen el empleo en Chile." />
      </footer>
    </main>
    </>
  );
}
