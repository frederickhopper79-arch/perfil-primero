import type { ReactNode } from "react";

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://perfil-primero.web.app/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://perfil-primero.web.app/blog" },
  ],
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }}
      />
      {children}
    </>
  );
}
