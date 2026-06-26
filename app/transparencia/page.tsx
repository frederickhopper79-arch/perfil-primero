import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparencia Salarial | Perfil Primero",
  description: "En Perfil Primero, el sueldo siempre va primero. Conoce por qué creemos en la transparencia salarial y cómo impactamos el mercado laboral chileno.",
  alternates: { canonical: "https://perfil-primero.web.app/transparencia" },
};

const compromisos = [
  {
    icon: "💰",
    titulo: "Sueldo visible desde el primer contacto",
    desc: "Las empresas deben declarar el rango salarial antes de enviar cualquier invitación. Sin excepciones. Esto elimina la asimetría de información que perjudica a los trabajadores.",
  },
  {
    icon: "🔒",
    titulo: "Tu identidad protegida hasta que tú eliges",
    desc: "Tu nombre real, RUT y datos de contacto nunca se comparten sin tu autorización expresa. Las empresas ven tu perfil profesional, no tus datos personales.",
  },
  {
    icon: "✅",
    titulo: "Solo empresas verificadas pueden contactarte",
    desc: "Verificamos el RUT, los datos legales y la seriedad de cada empresa antes de darle acceso a los perfiles. Nadie puede contactarte sin pasar por este proceso.",
  },
  {
    icon: "📊",
    titulo: "Datos públicos del mercado laboral",
    desc: "Publicamos mensualmente estadísticas reales y anonimizadas sobre sueldos, sectores y tendencias para que toda la comunidad laboral de Chile tome mejores decisiones.",
  },
  {
    icon: "🤝",
    titulo: "Sin discriminación en los procesos",
    desc: "Las empresas no pueden ver tu foto, género, edad ni origen étnico hasta que tú lo decidas. Solo ven tu experiencia, habilidades y expectativas profesionales.",
  },
  {
    icon: "💬",
    titulo: "Reseñas mutuas y públicas",
    desc: "Después de cada proceso, tanto trabajadores como empresas pueden dejar una reseña verificada. Esto crea reputación basada en hechos reales, no en promesas.",
  },
];

const datos = [
  { n: "100%", desc: "de invitaciones incluyen sueldo declarado" },
  { n: "187", desc: "empresas verificadas en la plataforma" },
  { n: "0", desc: "envíos de datos personales sin consentimiento" },
  { n: "73%", desc: "de empresas responden en menos de 48 horas" },
];

export default function TransparenciaPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>Nuestra promesa</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>La transparencia no es opcional, es el modelo</h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          En Perfil Primero creemos que el mercado laboral chileno necesita honestidad radical. Por eso construimos una plataforma donde la transparencia es la regla, no la excepción.
        </p>
      </header>

      {/* Números */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: "3.5rem" }}>
        {datos.map((d, i) => (
          <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-primary)", marginBottom: 4 }}>{d.n}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{d.desc}</div>
          </div>
        ))}
      </div>

      {/* Compromisos */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem" }}>Nuestros 6 compromisos de transparencia</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16 }}>
          {compromisos.map((c, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>{c.titulo}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Llamado a la acción */}
      <section style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 18, padding: "3rem 2rem", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Sé parte del cambio en el mercado laboral chileno</h2>
        <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
          Cada trabajador que publica su perfil y cada empresa que declara su sueldo desde el inicio está construyendo un mercado laboral más justo para todos.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" style={{ background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>Publicar mi perfil</a>
          <a href="/empresa" style={{ border: "1.5px solid rgba(255,255,255,.6)", color: "#fff", fontWeight: 600, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>Soy empresa</a>
        </div>
      </section>

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <a href="/estadisticas" style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 600 }}>Ver estadísticas públicas del mercado →</a>
      </div>
    </main>
  );
}
