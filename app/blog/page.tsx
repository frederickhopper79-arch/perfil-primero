import type { Metadata } from "next";
import { SiteTopbar } from "@/components/site-topbar";

export const metadata: Metadata = {
  title: "Blog | Perfil Primero",
  description: "Consejos de empleabilidad, datos del mercado laboral chileno y novedades de Perfil Primero.",
  alternates: { canonical: "https://perfil-primero.web.app/blog" },
};

const posts = [
  {
    slug: "tendencias-mercado-laboral-chile-2025",
    title: "Tendencias del mercado laboral en Chile 2025",
    summary: "Trabajo remoto, sueldos TI en máximos históricos, transparencia salarial y el auge del trabajo por proyecto. Análisis con datos reales.",
    date: "2026-07-01",
    category: "Mercado laboral",
  },
  {
    slug: "guia-perfil-profesional",
    title: "Cómo crear un perfil profesional que destaque",
    summary: "Guía paso a paso para optimizar tu perfil en Perfil Primero: foto, título, resumen, habilidades, sueldo esperado y más.",
    date: "2026-06-15",
    category: "Empleabilidad",
  },
  {
    slug: "como-contratar-mejor-en-chile",
    title: "Cómo contratar mejor en Chile usando Perfil Primero",
    summary: "El modelo invertido reduce el tiempo de contratación de 41 días a menos de una semana. Guía práctica para equipos de RRHH.",
    date: "2026-06-10",
    category: "Para Empresas",
  },
  {
    slug: "como-negociar-tu-sueldo-en-chile",
    title: "¿Cómo negociar tu sueldo en Chile en 2026?",
    summary: "Guía práctica con datos reales del mercado para que llegues preparado a tu próxima negociación salarial.",
    date: "2026-06-01",
    category: "Empleabilidad",
  },
  {
    slug: "modelo-invertido-explicado",
    title: "El modelo de empleo invertido: por qué funciona",
    summary: "En el modelo tradicional envías CV a ciegas. En Perfil Primero, las empresas vienen a ti con sueldo claro desde el primer mensaje.",
    date: "2026-05-15",
    category: "Plataforma",
  },
  {
    slug: "transparencia-salarial-chile",
    title: "Transparencia salarial en Chile: ¿dónde estamos?",
    summary: "Análisis de la Ley de Igualdad Salarial y cómo Perfil Primero contribuye a un mercado laboral más justo.",
    date: "2026-05-01",
    category: "Mercado laboral",
  },
];

export default function BlogPage() {
  return (
    <>
      <SiteTopbar />
      <main style={{ maxWidth: 860, margin: "60px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Blog</h1>
      <p style={{ color: "#647488", marginBottom: 40 }}>
        Consejos de empleabilidad, datos del mercado y novedades de Perfil Primero.
      </p>
      <div style={{ display: "grid", gap: 24 }}>
        {posts.map((post) => (
          <article
            key={post.slug}
            style={{
              background: "#fff",
              border: "1px solid #d2d9e4",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span
                style={{
                  background: "#dce6f1",
                  color: "#0a66c2",
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {post.category}
              </span>
              <time
                dateTime={post.date}
                style={{ fontSize: 12, color: "#647488" }}
              >
                {new Date(post.date).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
              </time>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
              <a href={`/blog/${post.slug}`} style={{ color: "#0d1b2a" }}>
                {post.title}
              </a>
            </h2>
            <p style={{ color: "#647488", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              {post.summary}
            </p>
            <a
              href={`/blog/${post.slug}`}
              style={{
                display: "inline-block",
                marginTop: 16,
                color: "#0a66c2",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Leer artículo →
            </a>
          </article>
        ))}
      </div>
    </main>
    </>
  );
}
