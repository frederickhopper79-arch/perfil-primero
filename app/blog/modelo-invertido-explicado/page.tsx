import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "El modelo de empleo invertido: por qué funciona | Blog Perfil Primero",
  description: "En el modelo tradicional envías CV a ciegas. En Perfil Primero, las empresas vienen a ti con sueldo claro desde el primer mensaje.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/modelo-invertido-explicado" },
  openGraph: { title: "El modelo de empleo invertido: por qué funciona", type: "article" },
};

export default function BlogPostModeloInvertido() {
  return (
    <>      <main style={{ maxWidth: 740, margin: "60px auto", padding: "0 24px" }}>
      <a href="/blog" style={{ color: "var(--primary-700)", fontSize: 14, fontWeight: 600 }}>← Volver al blog</a>
      <div style={{ marginTop: 24, marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ background: "var(--blue-soft)", color: "var(--primary-700)", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>Plataforma</span>
        <time dateTime="2026-05-15" style={{ fontSize: 12, color: "#647488" }}>15 de mayo de 2026</time>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
        El modelo de empleo invertido: por qué funciona
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#344a5e" }}>
        El modelo tradicional de búsqueda de empleo tiene un problema estructural: el postulante tiene que
        revelar su identidad, experiencia y expectativas <em>antes</em> de saber si la empresa vale su tiempo.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>El modelo invertido cambia el poder</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#344a5e" }}>
        En Perfil Primero, el talento publica un <strong>perfil anónimo</strong> con sus habilidades, experiencia
        y expectativas salariales. Las empresas verificadas buscan, y cuando encuentran un match, envían una
        invitación con <strong>cargo, sueldo y modalidad</strong> incluidos. Solo si el trabajador acepta,
        la empresa conoce su identidad.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>Resultados en datos</h2>
      <ul style={{ fontSize: 15, lineHeight: 2, color: "#344a5e" }}>
        <li>Trabajadores reciben en promedio <strong>3.2 invitaciones</strong> en sus primeros 30 días.</li>
        <li>El <strong>89%</strong> de las invitaciones incluye rango salarial desde el primer mensaje.</li>
        <li>Tiempo promedio entre perfil activo y primer contacto de empresa: <strong>8 días</strong>.</li>
      </ul>
      <div style={{ background: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 10, padding: 20, marginTop: 32 }}>
        <strong style={{ color: "#065f46" }}>¿Listo para probar el modelo invertido?</strong>
        <p style={{ color: "#047857", margin: "8px 0 0", fontSize: 15 }}>
          Crea tu perfil anónimo en 5 minutos. Sin CV. Sin datos personales hasta que tú quieras.
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: 12, background: "#057642", color: "#fff", borderRadius: 6, padding: "8px 18px", fontWeight: 700, fontSize: 14 }}>
          Empezar gratis
        </a>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { "@context": "https://schema.org", "@type": "Article", "headline": "El modelo de empleo invertido: por qué funciona", "datePublished": "2026-05-15", "author": { "@type": "Organization", "name": "Perfil Primero SpA" }, "publisher": { "@type": "Organization", "name": "Perfil Primero SpA" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://perfil-primero.web.app" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://perfil-primero.web.app/blog" },
          { "@type": "ListItem", "position": 3, "name": "El modelo invertido", "item": "https://perfil-primero.web.app/blog/modelo-invertido-explicado" },
        ]},
      ]).replace(/</g, "\\u003c") }} />
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="El modelo de empleo invertido - Perfil Primero" text="Por que publicar tu perfil es mejor que enviar CVs a ciegas en Chile." />
      </div>
</main>
    </>
  );
}
