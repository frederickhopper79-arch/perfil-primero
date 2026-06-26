import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Diversidad e Inclusión Laboral en Chile 2026 | Perfil Primero",
  description: "Estado de la diversidad e inclusión en el mercado laboral chileno: brechas salariales de género, inclusión de personas con discapacidad y buenas prácticas empresariales.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/diversidad-e-inclusion-laboral-chile" },
};

const datos = [
  { indicador: "Brecha salarial de género Chile", valor: "14.9%", tendencia: "bajando", nota: "Las mujeres ganan en promedio 14.9% menos que hombres en el mismo cargo (INE 2025)" },
  { indicador: "Participación femenina en directorios", valor: "19%", tendencia: "subiendo", nota: "De empresas IPSA. La ley de cuotas de 2023 impulsó el aumento" },
  { indicador: "Empresas con programa de inclusión de PeSD", valor: "32%", tendencia: "subiendo", nota: "Ley 21.015 exige cuota del 1% para empresas con 100+ trabajadores" },
  { indicador: "Trabajadores LGBTI+ que ocultan identidad en el trabajo", valor: "41%", tendencia: "bajando", nota: "Según encuesta Fundación Iguales 2025" },
  { indicador: "Empresas con política formal de DEI documentada", valor: "28%", tendencia: "subiendo", nota: "Concentrada en grandes empresas. En PyMEs es aún menor" },
];

const buenasPracticas = [
  { practica: "Publicar rangos salariales públicamente", impacto: "Reduce brecha de género en negociación salarial. Las mujeres negocian menos sin datos de referencia." },
  { practica: "Lenguaje inclusivo en las descripciones de cargo", impacto: "Herramientas como Textio muestran que las JDs masculinizadas reciben 42% menos postulaciones femeninas." },
  { practica: "Entrevistas estructuradas con criterios predefinidos", impacto: "Elimina el sesgo de afinidad (contratar a quien se parece al entrevistador) y mejora la calidad de la decisión." },
  { practica: "Medir y publicar el eNPS desagregado por género y nivel", impacto: "Identificar dónde hay diferenciales en experiencia del empleado por grupo demográfico." },
  { practica: "Política de trabajo flexible sin penalización cultural", impacto: "El 73% de las trabajadoras con hijos valora el horario flexible sobre el sueldo en ciertos rangos." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Diversidad e Inclusión Laboral en Chile 2026",
  "datePublished": "2026-06-21",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function DiversidadPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--color-dark)" }}>Mercado laboral</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Diversidad e Inclusión Laboral en Chile 2026: Datos y Acciones Concretas
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          La brecha de género sigue existiendo. La inclusión de personas con discapacidad avanza lento. Aquí están los datos reales y las prácticas que cambian el resultado.
        </p>
      </header>

      {/* Datos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>El estado actual en Chile</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {datos.map((d, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem 1.25rem", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-primary)", minWidth: 60 }}>{d.valor}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 2 }}>
                  {d.indicador}
                  <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 8, background: d.tendencia === "bajando" ? "#dcfce7" : "#dbeafe", color: d.tendencia === "bajando" ? "#15803d" : "#1d4ed8" }}>
                    {d.tendencia === "bajando" ? "↓ mejorando" : "↑ mejorando"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.nota}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buenas prácticas */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Prácticas con impacto probado</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {buenasPracticas.map((p, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>✓ {p.practica}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{p.impacto}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", marginBottom: "2rem" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>Cómo Perfil Primero contribuye a la equidad</div>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          El sueldo declarado desde la primera invitación elimina la negociación asimétrica donde las mujeres históricamente han tenido desventaja. El perfil anónimo reduce el sesgo de género, edad y apariencia en la primera selección. Son condiciones estructurales de diseño, no solo promesas.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/empresa" className="button">Contratar con equidad</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Diversidad e inclusion laboral en Chile - Perfil Primero" text="Como la diversidad mejora los resultados y que estan haciendo las empresas chilenas." />
      </div>
</main>
  );
}
