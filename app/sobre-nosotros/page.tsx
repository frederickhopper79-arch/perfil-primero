import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Nosotros | Perfil Primero",
  description: "Conoce la historia, misión y equipo detrás de Perfil Primero, la plataforma laboral invertida de Chile que pone la transparencia salarial primero.",
  alternates: { canonical: "https://perfil-primero.web.app/sobre-nosotros" },
};

const valores = [
  { titulo: "Transparencia radical", desc: "El sueldo siempre va primero. No hay negociaciones opacas, no hay 'a convenir'. Si no puedes publicar el sueldo, no estás listo para contratar.", icon: "💎" },
  { titulo: "Privacidad por diseño", desc: "Los datos personales de los trabajadores son suyos. No los compartimos, no los vendemos, no los mostramos sin autorización explícita.", icon: "🔒" },
  { titulo: "Calidad sobre cantidad", desc: "No queremos ser el portal con más vacantes. Queremos ser el portal donde cada contacto vale la pena.", icon: "🎯" },
  { titulo: "Impacto real en Chile", desc: "Nuestro éxito se mide en contrataciones exitosas, no en clicks. Cada persona que consigue trabajo gracias a Perfil Primero es nuestro KPI número uno.", icon: "🇨🇱" },
];

const hitos = [
  { año: "2025 Q3", evento: "Fundación de Perfil Primero SpA en Puerto Montt" },
  { año: "2025 Q4", evento: "Primeras empresas verificadas y primeras contrataciones" },
  { año: "2026 Q1", evento: "Integración con OMILs municipales y expansión a regiones" },
  { año: "2026 Q2", evento: "Meta: 1.200+ perfiles activos · 300+ contrataciones · 150 empresas verificadas (objetivo de crecimiento)" },
  { año: "2026 Q3", evento: "Lanzamiento de app móvil y video-perfil (en desarrollo)" },
  { año: "2026 Q4", evento: "Expansión a Concepción, Valparaíso y Temuco" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "Sobre Perfil Primero",
  "url": "https://perfil-primero.web.app/sobre-nosotros",
  "mainEntity": {
    "@type": "Organization",
    "name": "Perfil Primero SpA",
    "legalName": "Perfil Primero SpA",
    "taxID": "78.449.783-6",
    "foundingDate": "2025",
    "address": { "@type": "PostalAddress", "addressLocality": "Puerto Montt", "addressRegion": "Los Lagos", "addressCountry": "CL" },
    "description": "Plataforma laboral invertida donde los trabajadores publican perfiles anónimos y las empresas verificadas llegan con sueldo y condiciones claras.",
  },
};

export default function SobreNosotrosPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Nuestra historia</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Nacimos para cambiar cómo funciona el empleo en Chile</h1>
        <p style={{ color: "var(--muted)", maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>
          Perfil Primero nació de una convicción simple: el mercado laboral chileno está roto porque la información es asimétrica. Las empresas saben todo y el trabajador no sabe nada hasta el final del proceso. Decidimos darle la vuelta.
        </p>
      </header>

      {/* Historia */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>El problema que decidimos resolver</h2>
        <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem", fontSize: 14, lineHeight: 1.8, color: "var(--text)" }}>
          <p>En Chile, buscar trabajo sigue siendo un proceso humillante para los trabajadores. Mandas CV tras CV sin saber cuánto paga el cargo. Pasas 3 rondas de entrevistas y en la última te dicen que el sueldo es la mitad de lo que esperabas. Y las empresas se preguntan por qué hay tanta rotación.</p>
          <p style={{ marginBottom: 0 }}>Perfil Primero invierte el modelo. El trabajador publica un perfil anónimo con su experiencia y expectativas. Las empresas verificadas llegan con el sueldo declarado desde la primera invitación. El trabajador decide si quiere avanzar. La información fluye de forma simétrica.</p>
        </div>
      </section>

      {/* Valores */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Lo que nos guía</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 14 }}>
          {valores.map((v, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem" }}>
              <span style={{ fontSize: 26, display: "block", marginBottom: 10 }}>{v.icon}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>{v.titulo}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hitos */}
      <section style={{ marginBottom: "3.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem" }}>Nuestros hitos</h2>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--line)", marginLeft: 12 }} />
          {hitos.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: "1.25rem" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < 4 ? "var(--primary-700)" : "var(--line)", border: "2px solid var(--surface)", zIndex: 1, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
              <div style={{ padding: "2px 0" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary-700)", marginRight: 8 }}>{h.año}</span>
                <span style={{ fontSize: 13, color: i < 4 ? "var(--text)" : "var(--muted)" }}>{h.evento}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Datos legales */}
      <section style={{ background: "var(--surface-muted)", borderRadius: 12, border: "1px solid var(--line)", padding: "1.25rem", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 10 }}>Información legal</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "var(--muted)" }}>
          <div><strong style={{ color: "var(--text)" }}>Razón social:</strong> Perfil Primero SpA</div>
          <div><strong style={{ color: "var(--text)" }}>RUT:</strong> 78.449.783-6</div>
          <div><strong style={{ color: "var(--text)" }}>Domicilio:</strong> Puerto Montt, Los Lagos</div>
          <div><strong style={{ color: "var(--text)" }}>Representante legal:</strong> Fabián Carrillo Lara</div>
          <div><strong style={{ color: "var(--text)" }}>Giro:</strong> Servicios de plataforma laboral digital</div>
          <div><strong style={{ color: "var(--text)" }}>Año de fundación:</strong> 2025</div>
        </div>
      </section>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/contacto" className="button">Contáctanos</a>
        <a href="/transparencia" className="button ghost">Nuestros compromisos</a>
        <a href="/roadmap" className="button ghost">Roadmap de producto</a>
      </div>
    </main>
  );
}
