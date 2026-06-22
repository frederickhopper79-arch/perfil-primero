import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparencia salarial en Chile: ¿dónde estamos? | Blog Perfil Primero",
  description: "Análisis de la Ley de Igualdad Salarial y cómo Perfil Primero contribuye a un mercado laboral más justo.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/transparencia-salarial-chile" },
  openGraph: { title: "Transparencia salarial en Chile: ¿dónde estamos?", type: "article" },
};

export default function BlogPostTransparencia() {
  return (
    <main style={{ maxWidth: 740, margin: "60px auto", padding: "0 24px" }}>
      <a href="/blog" style={{ color: "#0a66c2", fontSize: 14, fontWeight: 600 }}>← Volver al blog</a>
      <div style={{ marginTop: 24, marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ background: "#dce6f1", color: "#0a66c2", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>Mercado laboral</span>
        <time dateTime="2026-05-01" style={{ fontSize: 12, color: "#647488" }}>1 de mayo de 2026</time>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
        Transparencia salarial en Chile: ¿dónde estamos?
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#344a5e" }}>
        Chile avanzó en 2022 con la Ley N° 21.561 (40 horas) y discute normativas de igualdad salarial,
        pero la brecha de información en el mercado laboral sigue siendo amplia. La mayoría de los avisos
        de trabajo no incluye el sueldo.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>El problema de la información asimétrica</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#344a5e" }}>
        Cuando una empresa oculta el sueldo, el poder de negociación queda desequilibrado. El candidato
        invierte semanas en el proceso sin saber si la oferta final estará dentro de su rango de expectativas.
        Esto genera frustración, abandono de procesos y pérdida de tiempo para ambas partes.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>Perfil Primero como solución de mercado</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#344a5e" }}>
        Nuestra política es simple: toda invitación debe incluir un rango salarial. Las empresas que no
        lo incluyen no pueden enviar invitaciones. Esto no es solo una feature — es un principio de diseño
        que pone la transparencia en el centro del proceso.
      </p>
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: 20, marginTop: 32 }}>
        <strong style={{ color: "#92400e" }}>¿Eres empresa?</strong>
        <p style={{ color: "#78350f", margin: "8px 0 0", fontSize: 15 }}>
          Únete a las empresas verificadas que practican la transparencia salarial. Atrae mejor talento y reduce el tiempo de contratación.
        </p>
        <a href="/empresa" style={{ display: "inline-block", marginTop: 12, background: "#d97706", color: "#fff", borderRadius: 6, padding: "8px 18px", fontWeight: 700, fontSize: 14 }}>
          Registrar empresa
        </a>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { "@context": "https://schema.org", "@type": "Article", "headline": "Transparencia salarial en Chile: ¿dónde estamos?", "datePublished": "2026-05-01", "author": { "@type": "Organization", "name": "Perfil Primero SpA" }, "publisher": { "@type": "Organization", "name": "Perfil Primero SpA" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://perfil-primero.web.app" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://perfil-primero.web.app/blog" },
          { "@type": "ListItem", "position": 3, "name": "Transparencia salarial", "item": "https://perfil-primero.web.app/blog/transparencia-salarial-chile" },
        ]},
      ]).replace(/</g, "\\u003c") }} />
    </main>
  );
}
