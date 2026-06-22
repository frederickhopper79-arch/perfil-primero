import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo crear un perfil profesional que destaque · Perfil Primero",
  description: "Guía paso a paso para construir un perfil laboral atractivo en Chile: foto, resumen, habilidades, sueldo esperado y más.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/guia-perfil-profesional" },
  openGraph: {
    type: "article",
    title: "Cómo crear un perfil profesional que destaque",
    description: "Guía paso a paso para construir un perfil laboral atractivo en Chile.",
    url: "https://perfil-primero.web.app/blog/guia-perfil-profesional",
    siteName: "Perfil Primero",
    locale: "es_CL",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo crear un perfil profesional que destaque",
  "description": "Guía paso a paso para construir un perfil laboral atractivo en Chile.",
  "datePublished": "2025-06-01",
  "author": { "@type": "Organization", "name": "Perfil Primero" },
  "publisher": {
    "@type": "Organization",
    "name": "Perfil Primero",
    "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/logo-perfil-primero.png" },
  },
  "url": "https://perfil-primero.web.app/blog/guia-perfil-profesional",
};

export default function GuiaPerfilPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <nav aria-label="Migas de pan" style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a>
        {" › "}
        <a href="/blog">Blog</a>
        {" › "}
        <span aria-current="page">Guía de perfil profesional</span>
      </nav>

      <header style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "inline-block",
          background: "var(--blue-soft)",
          color: "var(--blue-dark)",
          padding: "0.25rem 0.75rem",
          borderRadius: "1rem",
          fontSize: "0.8125rem",
          fontWeight: 600,
          marginBottom: "1rem",
        }}>
          Guía para Postulantes
        </div>
        <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1.25 }}>
          Cómo crear un perfil profesional que destaque
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.0625rem", margin: 0 }}>
          En Perfil Primero, las empresas te encuentran a ti. Por eso, tu perfil es tu mejor carta de presentación.
          Aquí te enseñamos cómo optimizarlo paso a paso.
        </p>
      </header>

      <article style={{ lineHeight: 1.75, color: "var(--text)" }}>
        <h2>1. Foto de perfil profesional</h2>
        <p>
          Una buena foto aumenta en un 40% las probabilidades de que una empresa revise tu perfil completo.
          Usa una foto reciente, con fondo neutro y buena iluminación. No es necesario un traje formal;
          lo importante es proyectar confianza y profesionalismo.
        </p>

        <h2>2. Título profesional claro y específico</h2>
        <p>
          Evita títulos genéricos como "Profesional con experiencia". En cambio, usa algo como:
          <strong> "Ingeniero en Informática · Backend Python · 5 años en fintech"</strong>.
          Los reclutadores buscan por palabras clave; tu título es lo primero que leen.
        </p>

        <h2>3. Resumen ejecutivo en 3–5 oraciones</h2>
        <p>
          Tu resumen debe responder: ¿qué haces?, ¿cuánto llevas haciéndolo? y ¿cuál es tu valor diferencial?
          Ejemplo: <em>"Desarrolladora frontend con 6 años de experiencia en React y TypeScript. Especializada en
          rendimiento y accesibilidad web. He liderado migraciones a Next.js en startups y empresas del sector
          retail en Chile."</em>
        </p>

        <h2>4. Habilidades técnicas y blandas</h2>
        <p>
          Agrega entre 8 y 15 habilidades ordenadas por relevancia. Mezcla skills técnicas
          (Python, Excel avanzado, AutoCAD) con habilidades interpersonales (trabajo en equipo,
          comunicación efectiva, liderazgo de equipos pequeños).
        </p>

        <h2>5. Rango salarial honesto</h2>
        <p>
          En Perfil Primero, defines el sueldo que esperas recibir. Esto filtra las ofertas no alineadas
          desde el principio. Investiga el mercado usando datos de LinkedIn Salary, Mercer Chile o
          nuestro propio <a href="/analisis-expertos">análisis de mercado</a>. Ser transparente ahorra tiempo a ambas partes.
        </p>

        <h2>6. Disponibilidad y modalidad</h2>
        <p>
          Indica claramente si buscas trabajo presencial, híbrido o 100% remoto, y si estás disponible
          inmediatamente o en un plazo específico. Las empresas filtran por estos criterios.
        </p>

        <h2>7. Logros cuantificables (no solo responsabilidades)</h2>
        <p>
          En lugar de "Responsable del área de ventas", escribe "Lideré equipo de 5 vendedores,
          aumentando facturación en 32% en 12 meses." Los números crean credibilidad y hacen tu
          perfil memorable.
        </p>

        <h2>8. CV en PDF actualizado</h2>
        <p>
          Sube tu CV en PDF (máximo 5 MB). Aunque tu perfil en Perfil Primero es completo, muchas
          empresas solicitan el documento para sus procesos internos. Asegúrate que esté actualizado
          y sin errores tipográficos.
        </p>

        <div style={{
          background: "var(--green-soft)",
          border: "1px solid var(--green)",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
          marginTop: "2rem",
        }}>
          <strong>💡 Consejo Perfil Primero:</strong> Completa el 100% de tu perfil para aparecer
          primero en las búsquedas. El sistema de scoring de completitud te muestra exactamente qué
          falta y cómo mejorarlo.
        </div>
      </article>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.9375rem" }}>
          ¿Listo para publicar tu perfil?{" "}
          <a href="/bienvenida" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Regístrate gratis →
          </a>
        </p>
      </footer>
    </main>
  );
}
