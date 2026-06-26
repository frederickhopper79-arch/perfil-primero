import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Beneficios Laborales Más Valorados en Chile 2026 | Perfil Primero",
  description: "Ranking de los beneficios laborales más valorados por los trabajadores chilenos en 2026. Datos reales sobre qué importa más allá del sueldo.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/beneficios-laborales-mas-valorados-chile-2026" },
};

const beneficios = [
  { rank: 1, nombre: "Trabajo remoto o híbrido", valoracion: 94, categoria: "flexibilidad", desc: "El beneficio más buscado post-pandemia. Los trabajadores prefieren 3 días en casa como mínimo." },
  { rank: 2, nombre: "Horario flexible", valoracion: 88, categoria: "flexibilidad", desc: "Poder elegir el bloque horario de trabajo dentro de un marco definido. Especialmente valorado por padres y madres." },
  { rank: 3, nombre: "Seguro complementario de salud", valoracion: 85, categoria: "bienestar", desc: "Cubre lo que FONASA o isapre no cubre. Con cobertura dental y visión es aún más atractivo." },
  { rank: 4, nombre: "Días libres adicionales", valoracion: 82, categoria: "tiempo", desc: "Más allá del mínimo legal. Empresas que dan 20 días de vacaciones retienen un 40% más." },
  { rank: 5, nombre: "Budget de capacitación anual", valoracion: 78, categoria: "desarrollo", desc: "Entre $300.000 y $600.000 CLP anuales para cursos, certificaciones o conferencias." },
  { rank: 6, nombre: "Bono de desempeño", valoracion: 75, categoria: "compensación", desc: "1-3 sueldos anuales basados en metas claras y medibles, no en criterio del jefe." },
  { rank: 7, nombre: "Plan de carrera documentado", valoracion: 71, categoria: "desarrollo", desc: "Saber qué se necesita para subir de nivel y en qué timeframe. Los millennials priorizan esto." },
  { rank: 8, nombre: "Alimentación o colación", valoracion: 66, categoria: "bienestar", desc: "Casino en oficina, convenio con restaurantes o tarjeta de colación. Vale entre $50.000-$120.000 CLP/mes." },
  { rank: 9, nombre: "Seguro de vida", valoracion: 58, categoria: "bienestar", desc: "Especialmente valorado por trabajadores con dependientes. Bajo costo para la empresa, alto impacto." },
  { rank: 10, nombre: "Aguinaldos de Fiestas Patrias y Navidad", valoracion: 55, categoria: "compensación", desc: "Tradición chilena. Empresas que no los dan tienen peor reputación en el mercado." },
];

const categoriaColor: Record<string, string> = {
  flexibilidad: "#dbeafe",
  bienestar: "#dcfce7",
  tiempo: "#fef3c7",
  desarrollo: "#f3e8ff",
  compensación: "#fce7f3",
};

const categoriaText: Record<string, string> = {
  flexibilidad: "#1d4ed8",
  bienestar: "#15803d",
  tiempo: "#92400e",
  desarrollo: "#7c3aed",
  compensación: "#be185d",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Beneficios Laborales Más Valorados en Chile 2026",
  "datePublished": "2026-06-10",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function BeneficiosLaboralesPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--color-primary)" }}>Mercado laboral</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Los 10 Beneficios Laborales Más Valorados en Chile en 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Datos de más de 1,200 perfiles activos en Perfil Primero y encuestas del mercado chileno. El sueldo importa, pero no es todo.
        </p>
      </header>

      {/* Ranking */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {beneficios.map((b) => (
            <div key={b.rank} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: b.rank <= 3 ? "var(--color-primary)" : "var(--bg-soft)", color: b.rank <= 3 ? "#fff" : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                  {b.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)" }}>{b.nombre}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 10, background: categoriaColor[b.categoria], color: categoriaText[b.categoria] }}>{b.categoria}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary)" }}>{b.valoracion}%</span>
                  </div>
                  <div style={{ background: "var(--line)", borderRadius: 4, height: 4, marginBottom: 8 }}>
                    <div style={{ background: "var(--color-primary)", height: 4, borderRadius: 4, width: `${b.valoracion}%` }} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Insight */}
      <div style={{ background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem", marginBottom: "2.5rem", borderLeft: "4px solid var(--color-primary)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>Lo que dicen los datos de Perfil Primero</div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          El 68% de los perfiles activos en Perfil Primero menciona el trabajo remoto como condición preferida. Las invitaciones de empresas que declaran trabajo remoto tienen una tasa de aceptación 2.4x mayor que las que no lo mencionan. La transparencia sobre beneficios importa tanto como el sueldo.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/para-postulantes" className="button">Ver cómo funciona para postulantes</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Beneficios laborales mas valorados Chile 2026 - Perfil Primero" text="Los beneficios que los trabajadores chilenos priorizan mas alla del sueldo en 2026." />
      </div>
</main>
  );
}
