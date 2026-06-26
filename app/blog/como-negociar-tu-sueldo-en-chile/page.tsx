import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "¿Cómo negociar tu sueldo en Chile en 2026? | Blog Perfil Primero",
  description: "Guía práctica con datos reales del mercado para que llegues preparado a tu próxima negociación salarial en Chile.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/como-negociar-tu-sueldo-en-chile" },
  openGraph: {
    title: "¿Cómo negociar tu sueldo en Chile en 2026?",
    description: "Guía práctica con datos reales del mercado laboral chileno.",
    type: "article",
  },
  other: {
    "article:published_time": "2026-06-01",
    "article:section": "Empleabilidad",
  },
};

export default function BlogPostNegociacion() {
  return (
    <>      <main style={{ maxWidth: 740, margin: "60px auto", padding: "0 24px", fontFamily: "sans-serif" }}>
      <a href="/blog" style={{ color: "var(--color-primary)", fontSize: 14, fontWeight: 600 }}>← Volver al blog</a>
      <div style={{ marginTop: 24, marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ background: "var(--blue-soft)", color: "var(--color-primary)", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>Empleabilidad</span>
        <time dateTime="2026-06-01" style={{ fontSize: 12, color: "#647488" }}>1 de junio de 2026</time>
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
        ¿Cómo negociar tu sueldo en Chile en 2026?
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "#344a5e" }}>
        Negociar el sueldo sigue siendo un tabú en Chile. Según datos internos de Perfil Primero,
        el <strong>72% de los postulantes</strong> acepta la primera oferta sin contra-proponer,
        dejando en promedio <strong>$180.000 CLP mensuales</strong> sobre la mesa.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>1. Investiga el mercado antes de la conversación</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#344a5e" }}>
        Usa portales como Perfil Primero, donde las empresas publican el rango salarial desde el primer contacto.
        Compara con LinkedIn Salary, Glassdoor Chile y los informes anuales de ManpowerGroup y PageGroup Chile.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>2. Conoce tu número mínimo y tu número objetivo</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#344a5e" }}>
        Antes de cualquier reunión, define dos cifras: el mínimo que aceptarías y el objetivo que pedirías.
        Ancla la negociación con tu objetivo, no con tu mínimo.
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 32 }}>3. El momento correcto: antes de la oferta formal</h2>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "#344a5e" }}>
        En Perfil Primero el rango salarial aparece en la invitación. Si está bajo tu expectativa,
        puedes declinarlo antes de invertir tiempo — o responder indicando tu rango esperado.
      </p>
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: 20, marginTop: 32 }}>
        <strong style={{ color: "#1d4ed8" }}>Consejo Perfil Primero:</strong>
        <p style={{ color: "#1e40af", margin: "8px 0 0", fontSize: 15, lineHeight: 1.6 }}>
          Activa tu perfil en Perfil Primero y recibe ofertas con sueldo visible desde el primer mensaje.
          Así nunca más aceptarás una entrevista sin saber el rango salarial.
        </p>
        <a href="/" style={{ display: "inline-block", marginTop: 12, background: "var(--color-primary)", color: "#fff", borderRadius: 6, padding: "8px 18px", fontWeight: 700, fontSize: 14 }}>
          Crear perfil gratis
        </a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "¿Cómo negociar tu sueldo en Chile en 2026?",
              "datePublished": "2026-06-01",
              "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
              "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/logo-perfil-primero.png" } },
              "description": "Guía práctica con datos reales del mercado laboral chileno.",
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://perfil-primero.web.app" },
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://perfil-primero.web.app/blog" },
                { "@type": "ListItem", "position": 3, "name": "¿Cómo negociar tu sueldo en Chile en 2026?", "item": "https://perfil-primero.web.app/blog/como-negociar-tu-sueldo-en-chile" },
              ],
            },
          ]).replace(/</g, "\\u003c"),
        }}
      />
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Como negociar tu sueldo en Chile - Perfil Primero" text="Estrategias probadas y datos reales para negociar tu sueldo con confianza en Chile." />
      </div>
</main>
    </>
  );
}
