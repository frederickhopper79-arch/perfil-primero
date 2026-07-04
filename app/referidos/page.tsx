import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programa de Referidos | Perfil Primero",
  description: "Refiere a un amigo o colega a Perfil Primero y ambos obtienen beneficios. Gana 1 mes gratis por cada referido que active su perfil.",
  alternates: { canonical: "https://perfil-primero.web.app/referidos" },
};

const pasos = [
  { num: "01", titulo: "Comparte tu código", desc: "Encuentra tu código de referido único en tu panel de postulante, en la sección 'Mi cuenta'." },
  { num: "02", titulo: "Tu contacto se registra", desc: "Tu amigo o colega se registra usando tu código. Aplica tanto para postulantes como para empresas." },
  { num: "03", titulo: "Ambos ganan", desc: "Cuando tu referido activa su perfil o cuenta, tú obtienes 30 días gratis y él también." },
];

const faq = [
  { q: "¿Cuántas personas puedo referir?", a: "No hay límite. Puedes referir a tantas personas como quieras y acumular meses gratuitos por cada referido exitoso." },
  { q: "¿Cuándo se acredita el beneficio?", a: "El beneficio se acredita automáticamente dentro de las 24 horas siguientes a la activación del perfil o cuenta de tu referido." },
  { q: "¿Funciona para referir empresas también?", a: "Sí. Si refieres a una empresa y esta se verifica y activa su cuenta, también obtienes el beneficio." },
  { q: "¿Expiran los meses acumulados?", a: "Los meses gratuitos no expiran y se aplican de forma consecutiva a tu suscripción vigente." },
  { q: "¿Dónde encuentro mi código de referido?", a: "En tu panel de postulante, ve a 'Mi cuenta' > 'Código de referido'. El código es único y permanente." },
];

export default function ReferidosPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: "3.5rem", padding: "3rem 1.5rem", background: "linear-gradient(135deg,var(--color-dark) 0%,var(--color-primary) 100%)", borderRadius: 20, color: "#fff" }}>
        <p style={{ fontSize: 13, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>Programa de referidos</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "#fff", marginBottom: 14 }}>Recomienda Perfil Primero y gana un mes gratis</h1>
        <p style={{ color: "rgba(255,255,255,0.92)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6, marginBottom: 24 }}>
          Por cada amigo o colega que actives en la plataforma, ambos obtienen 30 días gratis. Sin límite de referidos.
        </p>
        <a href="/postulante" style={{ display: "inline-block", background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>
          Ir a mi panel y ver mi código
        </a>
      </header>

      {/* Beneficios visuales */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "3rem" }}>
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--primary-700)", marginBottom: 4 }}>30</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)" }}>días gratis para ti</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>por cada referido activado</div>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "var(--color-dark)", marginBottom: 4 }}>30</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)" }}>días gratis para tu referido</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>cuando activa su cuenta</div>
        </div>
      </div>

      {/* Cómo funciona */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem", textAlign: "center" }}>Cómo funciona</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {pasos.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1.25rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--blue-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 800, color: "var(--primary-700)" }}>
                {p.num}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", marginBottom: 4 }}>{p.titulo}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem" }}>Preguntas frecuentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faq.map((f, i) => (
            <details key={i} style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "1rem" }}>
              <summary style={{ fontWeight: 600, fontSize: 14, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {f.q}
                <span style={{ color: "var(--primary-700)", fontSize: 20, fontWeight: 300, flexShrink: 0, marginLeft: 12 }}>+</span>
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <div style={{ textAlign: "center", background: "var(--blue-soft)", borderRadius: 14, padding: "2rem" }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>¿Aún no tienes cuenta?</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Regístrate gratis como postulante y empieza a referir desde el primer día.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" className="button">Crear mi perfil gratis</a>
          <a href="/como-funciona" className="button ghost">Cómo funciona</a>
        </div>
      </div>
    </main>
  );
}
