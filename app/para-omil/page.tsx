import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programa OMIL · Perfil Primero para Municipios",
  description: "Solución digital para Oficinas Municipales de Intermediación Laboral. Crea perfiles de trabajadores y conéctalos con empresas verificadas en tu región.",
  alternates: { canonical: "https://perfil-primero.web.app/para-omil" },
};

const benefits = [
  {
    emoji: "🏛️",
    title: "Gestión centralizada de perfiles",
    description: "Crea y administra hasta 500 perfiles de trabajadores desde un solo panel. Sin necesidad de que los trabajadores tengan email propio.",
  },
  {
    emoji: "📊",
    title: "Reportes de colocación",
    description: "Dashboard con estadísticas de invitaciones, aceptaciones y contrataciones en tu municipio.",
  },
  {
    emoji: "🤝",
    title: "Red de empresas verificadas",
    description: "Conecta a tus trabajadores con empleadores reales que han pasado por verificación.",
  },
  {
    emoji: "🆓",
    title: "Sin costo para el trabajador",
    description: "Los perfiles creados por OMIL no tienen costo. El financiamiento es por parte de las empresas.",
  },
];

export default function ParaOmilPage() {
  return (
    <>      <main>
      <section className="on-dark" style={{
        background: "linear-gradient(135deg, var(--color-dark) 0%, var(--color-primary) 100%)",
        color: "#fff",
        padding: "5rem 1rem 4rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            padding: "0.375rem 1rem",
            borderRadius: "2rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}>
            Para OMIL
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 2.75rem)", margin: "0 0 1.25rem", lineHeight: 1.15 }}>
            Digitaliza la intermediación laboral de tu municipio
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, margin: "0 0 2.5rem", lineHeight: 1.65 }}>
            Perfil Primero ofrece a las OMIL de Chile una plataforma para crear y gestionar
            perfiles laborales de vecinos sin empleo, conectándolos con empleadores verificados.
          </p>
          <a
            href="mailto:omil@perfil-primero.cl"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "var(--color-dark)",
              padding: "0.875rem 2.5rem",
              borderRadius: "0.625rem",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1.0625rem",
            }}
          >
            Solicitar acceso OMIL →
          </a>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "4rem 1rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "2.5rem" }}>
          Beneficios para tu municipio
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}>
          {benefits.map((b) => (
            <div key={b.title} style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "1rem",
              padding: "1.75rem",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{b.emoji}</div>
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.0625rem" }}>{b.title}</h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        background: "var(--surface-muted)",
        padding: "4rem 1rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>¿Tu municipio quiere sumarse?</h2>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Escríbenos a <strong>omil@perfil-primero.cl</strong> con el nombre de tu municipio y región.
            El proceso de incorporación toma 2–5 días hábiles.
          </p>
          <a
            href="mailto:omil@perfil-primero.cl"
            style={{
              display: "inline-block",
              background: "var(--color-primary)",
              color: "#fff",
              padding: "0.875rem 2rem",
              borderRadius: "0.625rem",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Contactar al equipo OMIL
          </a>
        </div>
      </section>
    </main>
    </>
  );
}
