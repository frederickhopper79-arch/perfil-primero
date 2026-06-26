import type { FC } from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ crumbs }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": crumbs.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": c.label,
      ...(c.href ? { "item": `https://perfil-primero.web.app${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.5rem" }}>
        <ol style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 0, margin: 0, listStyle: "none", alignItems: "center" }}>
          <li>
            <a href="/" style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none" }}>Inicio</a>
          </li>
          {crumbs.map((c, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>/</span>
              {c.href && i < crumbs.length - 1 ? (
                <a href={c.href} style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none" }}>{c.label}</a>
              ) : (
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};
