import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Primero para Postulantes · Publica tu perfil gratis",
  description: "Publica tu perfil laboral anónimo y recibe invitaciones de empresas verificadas que ya conocen tu sueldo esperado. Sin spam, sin llamadas no deseadas.",
  alternates: { canonical: "https://perfil-primero.web.app/para-postulantes" },
  openGraph: {
    title: "Perfil Primero para Postulantes",
    description: "Publica tu perfil laboral anónimo y recibe invitaciones de empresas verificadas.",
    url: "https://perfil-primero.web.app/para-postulantes",
    siteName: "Perfil Primero",
    locale: "es_CL",
    type: "website",
  },
};

const benefits = [
  {
    emoji: "🕵️",
    title: "Perfil 100% anónimo",
    description: "Tus datos personales (nombre, RUT, email, teléfono) están protegidos hasta que aceptas una invitación.",
  },
  {
    emoji: "💰",
    title: "Tú defines el sueldo",
    description: "Declara el sueldo que esperas desde el inicio. Las empresas solo te contactan si calza con su presupuesto.",
  },
  {
    emoji: "🚫",
    title: "Sin spam ni llamadas no solicitadas",
    description: "Solo empresas verificadas pueden enviarte invitaciones. Sin recruiters indeseados.",
  },
  {
    emoji: "🎯",
    title: "Oportunidades relevantes",
    description: "Las empresas ya conocen tu sector, región y habilidades antes de contactarte. Las invitaciones son serias.",
  },
  {
    emoji: "⏸️",
    title: "Pausa cuando quieras",
    description: "¿Ya encontraste trabajo? Pausa tu perfil con un clic. Reactívalo cuando vuelvas a buscar.",
  },
  {
    emoji: "🤖",
    title: "Análisis de CV con IA",
    description: "Sube tu CV y nuestra IA te da sugerencias para mejorar tu perfil y aumentar tu score de visibilidad.",
  },
];

const howItWorks = [
  { n: "01", title: "Crea tu perfil", desc: "Registro gratis, sin tarjeta. Solo tu email." },
  { n: "02", title: "Completa tus datos profesionales", desc: "Habilidades, experiencia, sector y sueldo esperado." },
  { n: "03", title: "Tu perfil queda visible (anónimo)", desc: "Las empresas te pueden encontrar, pero no saben quién eres." },
  { n: "04", title: "Recibes invitaciones", desc: "Revisa, acepta o rechaza. Tú tienes el control." },
  { n: "05", title: "Si aceptas, se comparte tu contacto", desc: "La empresa lo desbloquea y coordinan la entrevista directamente." },
];

export default function ParaPostulantesPage() {
  return (
    <>      <main>
      {/* Hero */}
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
            Para Postulantes
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", margin: "0 0 1.25rem", lineHeight: 1.15 }}>
            Tu perfil. Tus condiciones.<br />Tú decides quién te contacta.
          </h1>
          <p style={{ fontSize: "1.125rem", opacity: 0.9, margin: "0 0 2.5rem", lineHeight: 1.65 }}>
            Publica tu perfil profesional anónimo y recibe invitaciones de empresas verificadas que
            ya saben cuánto quieres ganar. Sin currículos masivos, sin spam, sin llamadas no deseadas.
          </p>
          <a
            href="/bienvenida"
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
            Publicar mi perfil gratis →
          </a>
        </div>
      </section>

      {/* Beneficios */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "2.5rem" }}>
          Por qué los profesionales eligen Perfil Primero
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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

      {/* Cómo funciona */}
      <section style={{ background: "var(--surface-muted)", padding: "4rem 1rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "2.5rem" }}>
            Cómo funciona en 5 pasos
          </h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {howItWorks.map((s) => (
              <li key={s.n} style={{
                display: "flex",
                gap: "1.25rem",
                alignItems: "flex-start",
                background: "var(--surface)",
                borderRadius: "0.875rem",
                padding: "1.25rem",
                border: "1px solid var(--line)",
              }}>
                <div style={{
                  flexShrink: 0,
                  width: 48, height: 48,
                  borderRadius: "50%",
                  background: "var(--blue-soft)",
                  color: "var(--primary-700)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                }}>
                  {s.n}
                </div>
                <div>
                  <strong style={{ display: "block", marginBottom: "0.25rem" }}>{s.title}</strong>
                  <span style={{ color: "var(--muted)", fontSize: "0.9375rem" }}>{s.desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "0.75rem" }}>
          Tu próximo trabajo te está buscando
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "1.0625rem" }}>
          100% gratis. Sin tarjeta de crédito. Visible en menos de 5 minutos.
        </p>
        <a
          href="/bienvenida"
          style={{
            display: "inline-block",
            background: "var(--primary-700)",
            color: "#fff",
            padding: "1rem 2.5rem",
            borderRadius: "0.625rem",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1.0625rem",
          }}
        >
          Crear perfil gratis →
        </a>
      </section>
    </main>
    </>
  );
}
