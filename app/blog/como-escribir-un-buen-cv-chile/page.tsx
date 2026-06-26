import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Cómo Escribir un Buen CV en Chile 2026 | Perfil Primero",
  description: "Guía práctica para crear un CV efectivo en Chile: formato, secciones obligatorias, errores frecuentes y qué buscan los reclutadores chilenos en 2026.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/como-escribir-un-buen-cv-chile" },
};

const secciones = [
  { seccion: "Datos de contacto", obligatorio: true, tips: ["Email profesional (no nicknames)", "LinkedIn actualizado", "Teléfono con código de país si aplica", "Ciudad y región (no dirección completa)"] },
  { seccion: "Resumen profesional", obligatorio: true, tips: ["3-4 líneas máximo", "Menciona tu especialidad, años de experiencia y propuesta de valor principal", "Evita clichés: 'soy una persona dinámica y proactiva'", "Escríbelo último, aunque aparezca primero"] },
  { seccion: "Experiencia laboral", obligatorio: true, tips: ["Orden cronológico inverso (más reciente primero)", "Para cada cargo: empresa, cargo, fechas y 2-3 logros cuantificados", "Usa verbos de acción: lideré, implementé, reduje, crecí, diseñé", "Incluye el tamaño de empresa si es relevante (startup de 20 personas vs corporación de 5000)"] },
  { seccion: "Educación", obligatorio: true, tips: ["Solo el título más relevante si tienes más de 5 años de experiencia", "Para recién egresados: incluye GPA, distinciones y actividades destacadas", "Los cursos de 10 horas no son 'educación'. Van en habilidades o certificaciones"] },
  { seccion: "Habilidades técnicas", obligatorio: true, tips: ["Lista las herramientas que realmente dominas, no todas las que has visto", "Divide por categorías: lenguajes, frameworks, herramientas, idiomas", "Nivel de dominio honesto: básico / intermedio / avanzado / experto"] },
  { seccion: "Certificaciones", obligatorio: false, tips: ["Solo las relevantes para el cargo al que postulas", "Incluye el año de obtención", "Las certificaciones vigentes (no expiradas) tienen más peso"] },
];

const errores = [
  { error: "CV de 3+ páginas", por_que: "El 80% de los reclutadores decide en 30 segundos. 1 página para junior, 1.5-2 para senior." },
  { error: "Foto informal o recortada", por_que: "La foto en CV chileno es opcional. Si la pones, fondo neutro y expresión profesional." },
  { error: "Objetivo laboral genérico", por_que: "'Busco crecer profesionalmente en empresa líder' dice cero. Reemplázalo con un resumen enfocado en el cargo." },
  { error: "Responsabilidades sin logros", por_que: "'Gestioné equipo de ventas' es descripción. '200% de cuota en 2024' es logro." },
  { error: "Datos de referencia en el CV", por_que: "No pongas nombre y teléfono de jefes anteriores. Se piden si los solicitan." },
  { error: "Un CV para todos los cargos", por_que: "Personaliza el resumen y la sección de habilidades para cada postulación. 15 minutos de trabajo puede duplicar tu tasa de respuesta." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo Escribir un Buen CV en Chile 2026",
  "datePublished": "2026-06-22",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function ComoEscribirCVPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--color-primary)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "#dcfce7", borderRadius: 20, color: "#15803d" }}>Para postulantes</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Cómo Escribir un Buen CV en Chile: Guía Práctica 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Los reclutadores chilenos ven decenas de CVs al día. Estos son los elementos que hacen que el tuyo llegue a entrevista y los errores que lo mandan al archivo.
        </p>
      </header>

      {/* Secciones */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Las secciones de un CV efectivo</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {secciones.map((s, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{s.seccion}</h3>
                {s.obligatorio && <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: "#dbeafe", color: "#1d4ed8" }}>OBLIGATORIO</span>}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                {s.tips.map((t, j) => (
                  <li key={j} style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Errores */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Errores que destrozan tu CV</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {errores.map((e, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 4 }}>✗ {e.error}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{e.por_que}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "1.25rem", borderLeft: "4px solid var(--color-primary)", marginBottom: "2rem" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>En Perfil Primero el CV es complementario, no principal</div>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          En Perfil Primero, las empresas no ven tu CV primero. Ven tu perfil estructurado (experiencia, habilidades, expectativa salarial) y deciden si te invitan. El CV solo se comparte si decides avanzar. Esto te da una evaluación más justa basada en tus competencias, no en el formato de tu documento.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/postulante" className="button">Crear perfil y que las empresas lleguen a mí</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Como escribir un buen CV en Chile - Perfil Primero" text="Guia con ejemplos para escribir un CV que consiga entrevistas en Chile." />
      </div>
</main>
  );
}
