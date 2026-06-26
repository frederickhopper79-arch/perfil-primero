import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Para Empresas | Perfil Primero — Contrata talento verificado en Chile",
  description: "Accede a cientos de perfiles anónimos de trabajadores verificados en Chile. Paga solo cuando conectas con el candidato que te interesa. Sin suscripción obligatoria.",
  alternates: { canonical: "https://perfil-primero.web.app/empresas" },
  openGraph: {
    title: "Perfil Primero para Empresas — Contrata sin intermediarios",
    description: "Encuentra talento en Chile con transparencia salarial desde el primer contacto. Paga solo por los contactos que importan.",
    type: "website",
    url: "https://perfil-primero.web.app/empresas",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Perfil Primero para Empresas",
  "provider": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "description": "Plataforma de contratación directa en Chile. Acceso a perfiles anónimos de trabajadores verificados.",
  "areaServed": { "@type": "Country", "name": "Chile" },
  "offers": {
    "@type": "Offer",
    "price": "4990",
    "priceCurrency": "CLP",
    "description": "Pago por contacto desbloqueado (precio lanzamiento)",
  },
};

const benefits = [
  { icon: "🎯", title: "Solo pagas por lo que vale", desc: "Paga únicamente cuando decides ver los datos de un candidato que te interesa. Sin suscripción obligatoria." },
  { icon: "✅", title: "Candidatos que quieren ser contactados", desc: "Los trabajadores en Perfil Primero están activamente buscando trabajo. No interrumpes a nadie." },
  { icon: "💰", title: "Sueldo claro desde el inicio", desc: "Declara el rango salarial en tu invitación. Reduce el tiempo perdido en entrevistas con expectativas desalineadas." },
  { icon: "🔒", title: "Empresa verificada = más respuestas", desc: "Tu empresa pasa por un proceso de verificación. Los candidatos confían más y responden más rápido." },
  { icon: "📊", title: "Dashboard de reclutamiento", desc: "Gestiona tus invitaciones, filtra por habilidades, región y modalidad. Todo en un solo lugar." },
  { icon: "⚡", title: "Sin intermediarios", desc: "Contacto directo trabajador-empresa. Sin headhunters, sin comisiones por contratación exitosa." },
];

const steps = [
  { n: "1", title: "Crea tu perfil de empresa", desc: "Registra tu empresa y pasa el proceso de verificación (24-48 hrs)." },
  { n: "2", title: "Busca en el directorio", desc: "Filtra por habilidades, región, modalidad y rango salarial esperado." },
  { n: "3", title: "Envía una invitación con sueldo", desc: "El candidato ve el cargo, rango salarial y modalidad antes de aceptar." },
  { n: "4", title: "Solo pagas si conectas", desc: "Cuando el candidato acepta, desbloqueas su contacto por $4.990 CLP (precio lanzamiento)." },
];

export default function EmpresasPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <main>
        {/* Hero */}
        <section className="on-dark" style={{ background: "linear-gradient(135deg, var(--color-dark) 0%, var(--color-primary) 100%)", color: "#fff", padding: "72px 24px 80px", textAlign: "center" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <span style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>
              Para empresas en Chile
            </span>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, margin: "20px 0 16px", lineHeight: 1.1 }}>
              El talento viene a ti.<br />Con sueldo claro desde el inicio.
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 36, lineHeight: 1.6 }}>
              Accede a cientos de trabajadores que ya quieren ser contactados. Paga solo cuando encuentras al candidato correcto.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/empresa" className="button" style={{ fontSize: 16, padding: "12px 28px", background: "#fff", border: "none", color: "var(--color-dark)" }}>
                Registrar empresa gratis
              </a>
              <a href="/precios" className="button secondary" style={{ fontSize: 16, padding: "12px 28px", background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>
                Ver precios
              </a>
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Sin suscripción obligatoria · Sin comisiones por contratación
            </p>
          </div>
        </section>

        {/* Beneficios */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, textAlign: "center", marginBottom: 40 }}>
            ¿Por qué empresas eligen Perfil Primero?
          </h2>
          <div className="dashGrid2">
            {benefits.map((b) => (
              <div key={b.title} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 24, display: "flex", gap: 16 }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: "var(--heading)" }}>{b.title}</div>
                  <p style={{ color: "var(--muted-strong)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section style={{ background: "var(--bg-soft)", padding: "64px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, textAlign: "center", marginBottom: 40 }}>
              4 pasos para contratar
            </h2>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {steps.map((s) => (
                <div key={s.n} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 24, textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, margin: "0 auto 14px" }}>{s.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "var(--heading)" }}>{s.title}</div>
                  <p style={{ color: "var(--muted-strong)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Precio */}
        <section style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, marginBottom: 8 }}>Precio simple y directo</h2>
          <p style={{ color: "var(--muted-strong)", marginBottom: 32, fontSize: 16 }}>Sin letra chica ni contratos de permanencia.</p>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>🚀 Lanzamiento</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Por contacto</div>
              <div className="priceBlock" style={{ justifyContent: "center" }}><span className="priceAmount">$4.990</span><span className="pricePeriod">CLP</span></div>
              <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4, textDecoration: "line-through" }}>Precio normal: $9.990 CLP</p>
              <p style={{ color: "var(--muted-strong)", fontSize: 13, marginTop: 6 }}>Paga solo cuando decides ver los datos de un candidato.</p>
            </div>
            <div style={{ border: "2px solid var(--blue)", borderRadius: 14, padding: 28, background: "var(--blue-soft)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Mensual ilimitado</div>
              <div className="priceBlock" style={{ justifyContent: "center" }}><span className="priceAmount" style={{ color: "var(--blue)" }}>$29.990</span><span className="pricePeriod">CLP/mes</span></div>
              <p style={{ color: "var(--muted-strong)", fontSize: 13, marginTop: 10 }}>Contactos ilimitados. Ideal para equipos con alta rotación.</p>
            </div>
          </div>
          <a href="/empresa" className="button" style={{ display: "inline-block", marginTop: 32, fontSize: 16, padding: "12px 32px" }}>
            Empezar gratis →
          </a>
        </section>
      </main>
    </>
  );
}
