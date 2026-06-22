import type { Metadata } from "next";
import { SiteTopbar } from "@/components/site-topbar";

export const metadata: Metadata = {
  title: "Centro de Ayuda · Perfil Primero",
  description: "Preguntas frecuentes y guías de uso para trabajadores y empresas en Perfil Primero.",
  alternates: { canonical: "https://perfil-primero.web.app/ayuda" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Es gratis publicar mi perfil?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sí. Los trabajadores pueden publicar su perfil completamente gratis durante la fase de lanzamiento de Perfil Primero." }
    },
    {
      "@type": "Question",
      "name": "¿Mis datos personales son públicos?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Tu nombre completo, RUT, email y teléfono permanecen ocultos hasta que aceptes una invitación y la empresa decida desbloquear tu contacto." }
    },
    {
      "@type": "Question",
      "name": "¿Cómo sé si una empresa es legítima?",
      "acceptedAnswer": { "@type": "Answer", "text": "Todas las empresas pasan por un proceso de verificación antes de poder enviar invitaciones. El equipo de Perfil Primero revisa la documentación legal de cada empresa." }
    },
    {
      "@type": "Question",
      "name": "¿Qué pasa si rechazo una invitación?",
      "acceptedAnswer": { "@type": "Answer", "text": "No pasa nada. Puedes rechazar invitaciones sin dar explicaciones. La empresa no sabrá quién eres si rechazas." }
    },
    {
      "@type": "Question",
      "name": "¿Cómo pagan las empresas?",
      "acceptedAnswer": { "@type": "Answer", "text": "Las empresas pagan $9.990 CLP por cada contacto que desbloquean, usando Mercado Pago o tarjeta de crédito/débito." }
    },
  ]
};

interface FaqItem {
  q: string;
  a: string;
  category: "worker" | "company" | "general";
}

const FAQ: FaqItem[] = [
  { category: "worker", q: "¿Es gratis publicar mi perfil?", a: "Sí. Los trabajadores pueden publicar su perfil completamente gratis durante la fase de lanzamiento." },
  { category: "worker", q: "¿Mis datos personales son públicos?", a: "No. Tu nombre completo, RUT, email y teléfono permanecen ocultos hasta que aceptes una invitación y la empresa decida desbloquear tu contacto." },
  { category: "worker", q: "¿Cómo activo o desactivo mi perfil?", a: "Desde tu panel de postulante, puedes cambiar tu visibilidad en cualquier momento. Cuando no estés buscando trabajo, simplemente pausa tu perfil." },
  { category: "worker", q: "¿Qué pasa si rechazo una invitación?", a: "No pasa nada. Puedes rechazar invitaciones sin dar explicaciones. La empresa no sabrá tu identidad." },
  { category: "worker", q: "¿Puedo subir mi CV en PDF?", a: "Sí. Puedes subir tu CV en formato PDF o Word (máximo 5 MB). Este documento solo se comparte con empresas que hayan desbloqueado tu contacto." },
  { category: "company", q: "¿Cómo verifico mi empresa?", a: "Durante el registro, el equipo de Perfil Primero revisa tu información legal. El proceso toma entre 1 y 3 días hábiles." },
  { category: "company", q: "¿Cuánto cuesta contactar a un candidato?", a: "Las empresas pagan $9.990 CLP por cada contacto que desbloquean. Sin comisiones adicionales al contratar." },
  { category: "company", q: "¿Qué pasa si el candidato rechaza mi invitación?", a: "No se cobra nada. El pago solo se efectúa cuando el candidato acepta y decides ver sus datos de contacto." },
  { category: "company", q: "¿Cómo sé si un candidato sigue disponible?", a: "Los perfiles muestran fecha de última actividad y estado de disponibilidad. Los candidatos activos aparecen primero." },
  { category: "general", q: "¿Cómo funciona el modelo de Perfil Primero?", a: "Los trabajadores publican perfiles anónimos con sus condiciones. Las empresas los encuentran y envían invitaciones. Solo si ambas partes acuerdan se comparte la información de contacto." },
  { category: "general", q: "¿Está disponible en toda Chile?", a: "Sí. Perfil Primero opera en las 16 regiones de Chile, con soporte especial para municipios a través del programa OMIL." },
  { category: "general", q: "¿Cómo me contacto con soporte?", a: "Puedes escribirnos a soporte@perfil-primero.cl. Respondemos en un plazo máximo de 24 horas hábiles." },
];

const categories = [
  { id: "worker", label: "Para Postulantes", emoji: "👤" },
  { id: "company", label: "Para Empresas", emoji: "🏢" },
  { id: "general", label: "General", emoji: "💬" },
] as const;

export default function AyudaPage() {
  return (
    <>
      <SiteTopbar />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", marginBottom: "0.75rem" }}>
          Centro de Ayuda
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.0625rem" }}>
          Encuentra respuestas a las preguntas más frecuentes
        </p>
      </header>

      {categories.map((cat) => (
        <section key={cat.id} style={{ marginBottom: "3rem" }}>
          <h2 style={{
            fontSize: "1.25rem",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "2px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <span>{cat.emoji}</span> {cat.label}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FAQ.filter((f) => f.category === cat.id).map((item, i) => (
              <details
                key={i}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
              >
                <summary style={{
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  {item.q}
                  <span aria-hidden="true" style={{ color: "var(--muted)", flexShrink: 0 }}>+</span>
                </summary>
                <div style={{
                  padding: "0 1.25rem 1rem",
                  color: "var(--muted)",
                  lineHeight: 1.7,
                  borderTop: "1px solid var(--line)",
                  paddingTop: "0.75rem",
                }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div style={{
        background: "var(--blue-soft)",
        borderRadius: "1rem",
        padding: "2rem",
        textAlign: "center",
        marginTop: "2rem",
      }}>
        <h3 style={{ margin: "0 0 0.5rem" }}>¿No encontraste tu respuesta?</h3>
        <p style={{ color: "var(--muted)", margin: "0 0 1rem" }}>
          Escríbenos y te respondemos en menos de 24 horas hábiles.
        </p>
        <a
          href="mailto:soporte@perfil-primero.cl"
          style={{
            display: "inline-block",
            background: "var(--color-primary)",
            color: "#fff",
            padding: "0.75rem 1.75rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Contactar soporte
        </a>
      </div>
    </main>
    </>
  );
}
