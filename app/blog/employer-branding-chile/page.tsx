import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Employer Branding en Chile: Cómo Atraer Talento con tu Marca Empleadora",
  description: "Guía práctica de employer branding para empresas chilenas. Aprende a construir una marca empleadora que atraiga al mejor talento sin gastar una fortuna.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/employer-branding-chile" },
};

const pilares = [
  {
    titulo: "Transparencia salarial",
    desc: "Las empresas que publican rangos salariales reciben 3x más postulaciones de calidad. El secretismo salarial aleja al talento senior.",
    accion: "Publica el rango salarial real desde el primer contacto, no 'a convenir'.",
    impacto: "alto",
  },
  {
    titulo: "Cultura documentada",
    desc: "No basta con decir 'somos una familia'. Los mejores candidatos quieren ver ejemplos concretos de cómo es trabajar contigo.",
    accion: "Describe tu política de trabajo remoto, vacaciones, reuniones y comunicación interna.",
    impacto: "alto",
  },
  {
    titulo: "Proceso de selección transparente",
    desc: "El 67% de los candidatos no vuelve a postular a una empresa que los dejó sin respuesta. La comunicación durante el proceso define tu reputación.",
    accion: "Define tiempos claros: primera respuesta en 48h, entrevistas en 1 semana, feedback siempre.",
    impacto: "medio",
  },
  {
    titulo: "Reseñas verificadas de empleados",
    desc: "El 72% de los profesionales consulta reseñas de empleados antes de aceptar una oferta. Las reseñas reales son más poderosas que cualquier anuncio.",
    accion: "Pide reseñas verificadas a empleados actuales. Responde las negativas con apertura.",
    impacto: "alto",
  },
  {
    titulo: "Beneficios diferenciados",
    desc: "El sueldo ya no es suficiente. Los candidatos valoran la flexibilidad, el aprendizaje y el bienestar tanto o más que el monto mensual.",
    accion: "Documenta y comunica los beneficios reales: seguro, días libres, budget de capacitación.",
    impacto: "medio",
  },
];

const erroresFrequentes = [
  { error: "Decir 'somos una startup' como si fuera un beneficio", solucion: "Muestra qué obtienen concretamente: acciones, flexibilidad, impacto directo." },
  { error: "Publicar vacantes con 'renta a convenir'", solucion: "Define el rango antes de publicar. Si no sabes el budget, no estás listo para contratar." },
  { error: "No dar feedback a candidatos rechazados", solucion: "Un email simple de rechazo con agradecimiento protege tu reputación por años." },
  { error: "Pedirle al candidato que te venda antes de mostrarte tú", solucion: "Presenta la empresa, el rol y el sueldo antes de pedir que el candidato demuestre nada." },
  { error: "Mentir sobre la cultura en el proceso", solucion: "Los candidatos que entran con expectativas falsas se van en menos de 6 meses." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Employer Branding en Chile: Cómo Atraer Talento con tu Marca Empleadora",
  "datePublished": "2026-05-20",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function EmployerBrandingPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--primary-700)" }}>← Blog</a>
          <span style={{ fontSize: 11, color: "var(--muted)", padding: "2px 8px", background: "var(--blue-soft)", borderRadius: 20 }}>Para empresas</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Employer Branding en Chile: Cómo Atraer el Mejor Talento con tu Marca Empleadora
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          En un mercado laboral donde los mejores profesionales tienen múltiples opciones, las empresas que contratan mejor son las que construyen reputación antes de publicar una vacante.
        </p>
      </header>

      {/* Intro */}
      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text)", marginBottom: "2rem" }}>
        El employer branding ya no es un lujo de las grandes corporaciones. En Chile, las empresas de todos los tamaños que invierten en su reputación como empleadores reducen su costo de contratación hasta un 50% y contratan candidatos de mayor calidad en la mitad del tiempo.
      </p>

      {/* Pilares */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Los 5 pilares del employer branding efectivo</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pilares.map((p, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{i + 1}. {p.titulo}</h3>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: p.impacto === "alto" ? "#dcfce7" : "#fef3c7", color: p.impacto === "alto" ? "#15803d" : "#92400e", flexShrink: 0, marginLeft: 8 }}>
                  Impacto {p.impacto}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginBottom: 8 }}>{p.desc}</p>
              <div style={{ background: "var(--blue-soft)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--heading)", fontWeight: 500 }}>
                💡 {p.accion}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Errores */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Errores que destruyen tu marca empleadora</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {erroresFrequentes.map((e, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: "var(--coral)", fontSize: 14 }}>✗</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--heading)" }}>{e.error}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--green)", fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{e.solucion}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 14, padding: "2rem", textAlign: "center", color: "#fff" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Empieza por la transparencia salarial</p>
        <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 13, marginBottom: 16 }}>En Perfil Primero, las empresas declaran el sueldo antes del primer contacto. Es el primer paso para un employer branding auténtico.</p>
        <a href="/empresa" style={{ display: "inline-block", background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "10px 24px", borderRadius: 10, fontSize: 14 }}>Registrar mi empresa</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Employer Branding en Chile - Perfil Primero" text="Como construir una marca empleadora autentica que atraiga mejores candidatos en Chile." />
      </div>
</main>
  );
}
