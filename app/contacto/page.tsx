import type { Metadata } from "next";
import { SiteTopbar } from "@/components/site-topbar";

export const metadata: Metadata = {
  title: "Contacto · Perfil Primero",
  description: "Contáctanos para soporte, alianzas institucionales, o prensa. Respondemos en menos de 24 horas hábiles.",
  alternates: { canonical: "https://perfil-primero.web.app/contacto" },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contacto Perfil Primero",
  "url": "https://perfil-primero.web.app/contacto",
  "mainEntity": {
    "@type": "Organization",
    "name": "Perfil Primero SpA",
    "email": "contacto@perfil-primero.cl",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Puerto Montt",
      "addressRegion": "Los Lagos",
      "addressCountry": "CL",
    },
  },
};

interface ContactChannel {
  emoji: string;
  label: string;
  value: string;
  href: string;
  description: string;
}

const CHANNELS: ContactChannel[] = [
  {
    emoji: "📧",
    label: "Soporte general",
    value: "soporte@perfil-primero.cl",
    href: "mailto:soporte@perfil-primero.cl",
    description: "Problemas con tu cuenta, pagos o perfil",
  },
  {
    emoji: "🤝",
    label: "Alianzas y OMIL",
    value: "omil@perfil-primero.cl",
    href: "mailto:omil@perfil-primero.cl",
    description: "Municipios y programas de empleo público",
  },
  {
    emoji: "📰",
    label: "Prensa",
    value: "prensa@perfil-primero.cl",
    href: "mailto:prensa@perfil-primero.cl",
    description: "Medios de comunicación y periodistas",
  },
  {
    emoji: "💼",
    label: "Empresas",
    value: "empresas@perfil-primero.cl",
    href: "mailto:empresas@perfil-primero.cl",
    description: "Planes para equipos y contratación masiva",
  },
];

export default function ContactoPage() {
  return (
    <>
      <SiteTopbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)", marginBottom: "0.75rem" }}>
          Contacto
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.0625rem" }}>
          Estamos en Puerto Montt, Chile. Respondemos en menos de 24 horas hábiles.
        </p>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
        marginBottom: "3rem",
      }}>
        {CHANNELS.map((ch) => (
          <a
            key={ch.label}
            href={ch.href}
            style={{
              display: "block",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "0.875rem",
              padding: "1.5rem",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{ch.emoji}</div>
            <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{ch.label}</div>
            <div style={{ color: "var(--color-primary)", fontSize: "0.9375rem", marginBottom: "0.5rem" }}>
              {ch.value}
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{ch.description}</div>
          </a>
        ))}
      </div>

      <div style={{
        background: "var(--surface-muted)",
        borderRadius: "1rem",
        padding: "2rem",
      }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "1.25rem" }}>Datos de la empresa</h2>
        <dl style={{ margin: 0, display: "grid", gap: "0.625rem" }}>
          {[
            ["Razón social", "Perfil Primero SpA"],
            ["RUT", "78.449.783-6"],
            ["Domicilio", "Puerto Montt, Los Lagos, Chile"],
            ["Representante legal", "Fabián Carrillo Lara"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <dt style={{ fontWeight: 600, minWidth: "160px", color: "var(--muted-strong)" }}>{label}:</dt>
              <dd style={{ margin: 0 }}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
    </>
  );
}
