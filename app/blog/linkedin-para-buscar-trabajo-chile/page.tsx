import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Cómo Usar LinkedIn para Buscar Trabajo en Chile 2026 | Perfil Primero",
  description: "Guía práctica para optimizar tu perfil de LinkedIn en Chile y usarlo como herramienta activa de búsqueda laboral. Configuraciones, errores frecuentes y estrategias.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/linkedin-para-buscar-trabajo-chile" },
};

const seccionesClave = [
  { seccion: "Titular profesional", impacto: "alto", tips: ["No uses solo tu cargo actual: añade tu especialidad y propuesta de valor", "Ejemplo: 'Contador | Especialista en impuestos PYME | Remuneraciones y SII'", "Incluye palabras clave que usan los reclutadores para buscarte"] },
  { seccion: "Foto de perfil", impacto: "alto", tips: ["Fondo neutro, cara visible, expresión profesional pero cercana", "Foto de busto o tres cuartos, no selfie", "Los perfiles con foto reciben 21x más visitas"] },
  { seccion: "Extracto / Acerca de", impacto: "alto", tips: ["Las primeras 3 líneas son lo que se ve sin 'ver más': hazlas contar", "Cuéntate en primera persona, no en tercera ('Soy' no 'Es un profesional que')", "Incluye tu ubicación, disponibilidad y cómo contactarte"] },
  { seccion: "Experiencia", impacto: "alto", tips: ["Para cada cargo: 2-3 logros cuantificados, no lista de tareas", "Usa métricas: 'reduje el costo en 18%', 'lideré un equipo de 7', 'crecí la cartera en $200M'", "Completar bien la experiencia es 10x más efectivo que publicar contenido"] },
  { seccion: "Habilidades y validaciones", impacto: "medio", tips: ["Agrega las 5 habilidades más importantes para tu rol objetivo", "Pide validaciones a excompañeros: son señal de confianza para reclutadores", "Ordénalas: las 3 primeras aparecen sin expandir"] },
  { seccion: "Actividad pública", impacto: "medio", tips: ["No necesitas postear todos los días: 1-2 veces por semana es suficiente", "Comenta con perspectiva en posts de referentes de tu industria", "Mejor compartir un caso real de tu trabajo que repostear noticias genéricas"] },
];

const errores = [
  "Foto de perfil de vacaciones o recortada de grupo",
  "Titular que solo dice el cargo: 'Jefe de Ventas' sin contexto",
  "Experiencia con solo fechas y empresa, sin logros ni contexto",
  "No tener configurada la búsqueda activa de empleo ('Abierto a oportunidades')",
  "URL pública con números aleatorios en vez de tu nombre",
  "Conectar con todos sin personalizar el mensaje de conexión",
  "Poner habilidades que no dominas solo para que aparezcan en búsqueda",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo Usar LinkedIn para Buscar Trabajo en Chile 2026",
  "datePublished": "2026-06-15",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function LinkedinBuscarTrabajoPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--primary-700)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "#dcfce7", borderRadius: 20, color: "#15803d" }}>Para postulantes</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          LinkedIn para Buscar Trabajo en Chile: Lo que Realmente Funciona en 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          LinkedIn tiene 5 millones de usuarios en Chile, pero la mayoría lo usa mal. Esta guía es sobre las secciones que cambian el resultado, no las que se ven bien.
        </p>
      </header>

      {/* Secciones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: "2.5rem" }}>
        {seccionesClave.map((s, i) => (
          <section key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{s.seccion}</h2>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: s.impacto === "alto" ? "#dcfce7" : "#fef3c7", color: s.impacto === "alto" ? "#15803d" : "#92400e" }}>
                Impacto {s.impacto}
              </span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {s.tips.map((t, j) => (
                <li key={j} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--primary-700)", flexShrink: 0 }}>→</span> {t}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Errores */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>7 errores que sabotean tu perfil</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {errores.map((e, i) => (
            <li key={i} style={{ display: "flex", gap: 10, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--coral)", flexShrink: 0 }}>✗</span> {e}
            </li>
          ))}
        </ul>
      </section>

      {/* Tip Perfil Primero */}
      <div style={{ background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>LinkedIn + Perfil Primero: la combinación que funciona</div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          LinkedIn es bueno para networking y visibilidad. Perfil Primero es mejor para encontrar trabajo con sueldo claro desde el inicio. Úsalos juntos: LinkedIn para conectar con tu industria, Perfil Primero para que las empresas te encuentren con sus condiciones ya declaradas.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/postulante" className="button">Crear perfil en Perfil Primero</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Como usar LinkedIn para buscar trabajo en Chile - Perfil Primero" text="Guia practica para optimizar LinkedIn y encontrar empleo en Chile mas rapido." />
      </div>
</main>
  );
}
