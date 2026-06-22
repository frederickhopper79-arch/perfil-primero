import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo contratar mejor en Chile usando Perfil Primero · Blog",
  description: "Guía para empresas: cómo encontrar candidatos calificados con sueldo claro, sin currículos masivos ni intermediarios.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/como-contratar-mejor-en-chile" },
  openGraph: {
    type: "article",
    title: "Cómo contratar mejor en Chile usando Perfil Primero",
    description: "Guía para empresas: cómo encontrar candidatos calificados con sueldo claro.",
    url: "https://perfil-primero.web.app/blog/como-contratar-mejor-en-chile",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo contratar mejor en Chile usando Perfil Primero",
  "datePublished": "2025-06-15",
  "author": { "@type": "Organization", "name": "Perfil Primero" },
  "publisher": {
    "@type": "Organization",
    "name": "Perfil Primero",
    "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/logo-perfil-primero.png" },
  },
};

export default function ComoContratarPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <nav aria-label="Migas de pan" style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}
        <a href="/blog">Blog</a> {" › "}
        <span aria-current="page">Cómo contratar mejor en Chile</span>
      </nav>

      <header style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "inline-block",
          background: "var(--green-soft)",
          color: "var(--green-dark)",
          padding: "0.25rem 0.75rem",
          borderRadius: "1rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          marginBottom: "1rem",
        }}>
          Guía para Empresas
        </div>
        <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1.25 }}>
          Cómo contratar mejor en Chile usando Perfil Primero
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.0625rem", margin: 0 }}>
          El proceso tradicional de reclutamiento en Chile consume semanas y genera frustración.
          Te mostramos cómo el modelo invertido reduce el tiempo de contratación a días.
        </p>
      </header>

      <article style={{ lineHeight: 1.75 }}>
        <h2>El problema del reclutamiento tradicional</h2>
        <p>
          Publicar un aviso laboral en un portal tradicional puede generar cientos de postulaciones,
          el 80% de las cuales no califica para el cargo. Los equipos de RRHH invierten días revisando
          CVs que no coinciden con las expectativas salariales o la modalidad de trabajo requerida.
        </p>

        <h2>El modelo invertido: candidatos que ya quieren trabajar contigo</h2>
        <p>
          En Perfil Primero, los candidatos ya han publicado su perfil con sus condiciones claras:
          sueldo esperado, modalidad de trabajo, región y sector. Tú filtras, encuentras al candidato
          adecuado y le envías una invitación. Si acepta, pagas $9.990 CLP para ver sus datos de contacto.
        </p>

        <h2>Paso 1: Define tu búsqueda con filtros específicos</h2>
        <p>
          Usa los filtros de sector, región, rango salarial y habilidades para encontrar candidatos
          que ya cumplen tus criterios. Cada perfil muestra un score de compatibilidad calculado
          automáticamente según tus requisitos.
        </p>

        <h2>Paso 2: Envía invitaciones personalizadas</h2>
        <p>
          Las invitaciones en Perfil Primero son diferentes a los emails masivos. Cada invitación
          incluye el cargo, el rango salarial ofrecido y la modalidad. El candidato evalúa si le
          interesa antes de que cualquier dato personal sea compartido.
        </p>

        <h2>Paso 3: Coordina la entrevista directamente</h2>
        <p>
          Una vez aceptada la invitación y desbloqueado el contacto, puedes coordinarte directamente
          con el candidato. Sin intermediarios, sin comisiones por contratación.
        </p>

        <h2>Costos transparentes</h2>
        <ul>
          <li><strong>$9.990 CLP</strong> por cada contacto desbloqueado (pago puntual)</li>
          <li>Sin costo si el candidato rechaza tu invitación</li>
          <li>Sin comisión al momento de contratar</li>
        </ul>

        <div style={{
          background: "var(--blue-soft)",
          border: "1px solid var(--blue)",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
          marginTop: "2rem",
        }}>
          <strong>📊 Dato:</strong> Las empresas que describen claramente el sueldo y la modalidad
          en su invitación tienen 3x más tasa de aceptación por parte de los candidatos.
        </div>
      </article>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.9375rem" }}>
          ¿Lista para contratar de forma más inteligente?{" "}
          <a href="/bienvenida" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Crea tu cuenta empresa gratis →
          </a>
        </p>
      </footer>
    </main>
  );
}
