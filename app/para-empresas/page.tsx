import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Primero para Empresas · Contrata sin intermediarios",
  description: "Encuentra candidatos verificados con sueldo claro. Sin publicar avisos, sin currículos masivos. Paga solo cuando contactas al candidato ideal.",
  alternates: { canonical: "https://perfil-primero.web.app/para-empresas" },
  openGraph: {
    title: "Perfil Primero para Empresas",
    description: "Encuentra candidatos verificados con sueldo claro. Sin publicar avisos, sin currículos masivos.",
    url: "https://perfil-primero.web.app/para-empresas",
    siteName: "Perfil Primero",
    locale: "es_CL",
    type: "website",
  },
};

const benefits = [
  {
    emoji: "🎯",
    title: "Candidatos ya calificados",
    description: "Cada perfil declara habilidades, sueldo esperado y disponibilidad. Filtras, no revisas montones de CVs.",
  },
  {
    emoji: "💸",
    title: "Paga solo por contactos reales",
    description: "Sin suscripción mensual obligatoria. Pagas $9.990 CLP solo cuando decides contactar a alguien.",
  },
  {
    emoji: "🔒",
    title: "Datos protegidos hasta el acuerdo",
    description: "Los candidatos son anónimos hasta que aceptan tu invitación. Se cuida la reputación de ambas partes.",
  },
  {
    emoji: "⚡",
    title: "Contratación en días, no semanas",
    description: "Sin avisos, sin espera. Envías invitación hoy, el candidato responde en 48h promedio.",
  },
  {
    emoji: "✅",
    title: "Empresas verificadas",
    description: "Tu empresa pasa por verificación antes de acceder. Candidatos saben que reciben invitaciones reales.",
  },
  {
    emoji: "🌎",
    title: "Cobertura en 16 regiones",
    description: "Busca talento en cualquier región de Chile o filtra por candidatos abiertos a trabajo remoto.",
  },
];

const steps = [
  { n: "01", title: "Regístrate y verifica tu empresa", desc: "Proceso simple en 1–3 días hábiles." },
  { n: "02", title: "Busca con filtros inteligentes", desc: "Sector, sueldo, región, habilidades, disponibilidad." },
  { n: "03", title: "Envía una invitación", desc: "Sin revelar datos del candidato todavía." },
  { n: "04", title: "Candidato acepta y pagas", desc: "$9.990 CLP para ver su contacto. Sin más comisiones." },
  { n: "05", title: "Coordinas la entrevista", desc: "Directo al email o teléfono del candidato." },
];

export default function ParaEmpresasPage() {
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
            background: "rgba(255,255,255,0.12)",
            padding: "0.375rem 1rem",
            borderRadius: "2rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            backdropFilter: "blur(8px)",
          }}>
            Para Empresas
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3rem)", margin: "0 0 1.25rem", lineHeight: 1.15 }}>
            El talento te busca a ti.<br />Tú decides a quién contratar.
          </h1>
          <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.92)", margin: "0 0 2.5rem", lineHeight: 1.65 }}>
            Olvídate de publicar avisos y revisar cientos de CVs.
            Busca entre perfiles verificados con sueldo claro. Paga solo cuando encuentras al candidato ideal.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/bienvenida"
              style={{
                display: "inline-block",
                background: "#fff",
                color: "var(--blue-dark)",
                padding: "0.875rem 2rem",
                borderRadius: "0.625rem",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              Registrar empresa gratis
            </a>
            <a
              href="/precios"
              style={{
                display: "inline-block",
                border: "2px solid rgba(255,255,255,0.4)",
                color: "#fff",
                padding: "0.875rem 2rem",
                borderRadius: "0.625rem",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Ver precios →
            </a>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "2.5rem" }}>
          Por qué las empresas eligen Perfil Primero
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

      {/* Pasos */}
      <section style={{ background: "var(--surface-muted)", padding: "4rem 1rem" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "2.5rem" }}>
            Cómo funciona en 5 pasos
          </h2>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {steps.map((s) => (
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
                  color: "var(--color-primary)",
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

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "0.75rem" }}>
          ¿Listo para contratar diferente?
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "1.0625rem" }}>
          Sin costos de suscripción inicial. Verificación rápida. Candidatos reales.
        </p>
        <a
          href="/bienvenida"
          style={{
            display: "inline-block",
            background: "var(--color-primary)",
            color: "#fff",
            padding: "1rem 2.5rem",
            borderRadius: "0.625rem",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "1.0625rem",
          }}
        >
          Crear cuenta empresa →
        </a>
      </section>
    </main>
    </>
  );
}
