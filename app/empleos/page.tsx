import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Empleos en Chile con sueldo visible | Perfil Primero",
  description: "Encuentra empleos en Chile donde el sueldo está publicado desde el inicio. Postula de forma anónima y recibe ofertas de empresas verificadas.",
  alternates: { canonical: "https://perfil-primero.web.app/empleos" },
  openGraph: {
    title: "Empleos en Chile con sueldo claro | Perfil Primero",
    description: "El primer portal de empleo de Chile donde el sueldo es visible antes del primer contacto.",
  },
};

// Demanda referencial del mercado laboral chileno (fuentes públicas SENCE/INE) —
// no representan vacantes activas dentro de la plataforma.
const sectores = [
  { nombre: "Tecnología", slug: "tecnologia", demanda: "Alta demanda", icon: "💻" },
  { nombre: "Finanzas", slug: "finanzas", demanda: "Demanda media", icon: "📊" },
  { nombre: "Salud", slug: "salud", demanda: "Alta demanda", icon: "🏥" },
  { nombre: "Marketing", slug: "marketing", demanda: "Demanda media", icon: "📣" },
  { nombre: "Construcción", slug: "construccion", demanda: "Alta demanda", icon: "🏗️" },
  { nombre: "Logística", slug: "logistica", demanda: "Demanda media", icon: "🚚" },
  { nombre: "Educación", slug: "educacion", demanda: "Demanda estable", icon: "📚" },
  { nombre: "Comercio", slug: "comercio", demanda: "Alta demanda", icon: "🛍️" },
];

const regiones = [
  { nombre: "Región Metropolitana", intensidad: 100 },
  { nombre: "Valparaíso", intensidad: 45 },
  { nombre: "Biobío", intensidad: 40 },
  { nombre: "La Araucanía", intensidad: 25 },
  { nombre: "Los Lagos", intensidad: 22 },
  { nombre: "Antofagasta", intensidad: 20 },
  { nombre: "Coquimbo", intensidad: 17 },
  { nombre: "Maule", intensidad: 15 },
];

const modalidades = [
  { nombre: "Remoto", porcentaje: 34, icon: "🏠" },
  { nombre: "Híbrido", porcentaje: 41, icon: "🔄" },
  { nombre: "Presencial", porcentaje: 25, icon: "🏢" },
];

export default function EmpleosPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Empleos con transparencia</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>
          Empleos en Chile con sueldo visible desde el primer contacto
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto 24px", lineHeight: 1.6 }}>
          En Perfil Primero no mandas CVs al vacío. Publicas tu perfil anónimo y las empresas verificadas llegan a ti con cargo, sueldo y condiciones claras.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" className="button">Publicar mi perfil gratis</a>
          <a href="/como-funciona" className="button ghost">Cómo funciona</a>
        </div>
      </header>

      {/* Modalidades */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "0.75rem" }}>
        {modalidades.map((m, i) => (
          <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-700)" }}>{m.porcentaje}%</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{m.nombre}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginBottom: "3rem", fontStyle: "italic" }}>
        Distribución referencial del mercado laboral chileno (fuentes públicas), no de vacantes dentro de la plataforma.
      </p>

      {/* Sectores */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Sectores con mayor demanda en Chile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {sectores.map((s, i) => (
            <a key={i} href={`/postulante?sector=${s.slug}`} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem 1.25rem", color: "inherit" }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)" }}>{s.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.demanda}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Regiones */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Actividad laboral por región</h2>
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
          {regiones.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < regiones.length - 1 ? "1px solid var(--line)" : "none" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{r.nombre}</span>
              <div style={{ width: 120, height: 4, background: "var(--bg-soft)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${r.intensidad}%`, background: "var(--primary-700)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>
          Intensidad relativa de la demanda laboral por región según fuentes públicas del mercado chileno.
        </p>
      </section>

      {/* Cómo funciona diferente */}
      <section style={{ background: "var(--blue-soft)", borderRadius: 16, padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>¿Por qué Perfil Primero es diferente?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {[
            { icon: "💰", titulo: "Sueldo desde el día 1", desc: "Las empresas declaran el rango salarial antes de contactarte." },
            { icon: "🔒", titulo: "Tu identidad protegida", desc: "Eres anónimo hasta que decides aceptar una invitación." },
            { icon: "✅", titulo: "Empresas verificadas", desc: "Solo empresas verificadas pueden ver tu perfil y contactarte." },
            { icon: "⚡", titulo: "Tú decides siempre", desc: "Puedes rechazar cualquier invitación sin dar explicaciones." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)" }}>{item.titulo}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: 12 }}>¿Listo para recibir ofertas con sueldo claro?</h2>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>Es gratis y toma 5 minutos crear tu perfil. Empieza hoy.</p>
        <a href="/postulante" className="button" style={{ fontSize: 15, padding: "12px 32px" }}>Crear mi perfil gratuito</a>
      </div>

      {/* Structured data — WebPage (no JobPosting: Google exige ofertas reales e individuales) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Empleos en Chile con sueldo visible | Perfil Primero",
            "description": "Plataforma laboral invertida donde postulantes publican perfiles anónimos y empresas verificadas ofrecen trabajo con sueldo visible.",
            "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "url": "https://perfil-primero.web.app" },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
