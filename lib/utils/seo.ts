// Utilidades SEO y structured data para Perfil Primero

const BASE_URL = "https://perfil-primero.web.app";

/** Genera JSON-LD de JobPosting para una oferta */
export function jobPostingSchema(job: {
  title: string;
  description: string;
  hiringOrganization: string;
  baseSalary?: { min: number; max: number };
  jobLocation?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "TEMPORARY";
  workMode?: "REMOTE" | "HYBRID" | "ON_SITE";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.datePosted ?? new Date().toISOString().slice(0, 10),
    validThrough: job.validThrough,
    employmentType: job.employmentType ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.hiringOrganization,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "CL", addressLocality: job.jobLocation ?? "Chile" },
    },
    ...(job.workMode === "REMOTE" ? { jobLocationType: "TELECOMMUTE" } : {}),
    ...(job.baseSalary
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "CLP",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.baseSalary.min,
              maxValue: job.baseSalary.max,
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };
}

/** Genera JSON-LD de FAQPage */
export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Genera JSON-LD de BreadcrumbList */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  };
}

/** Genera JSON-LD de WebSite con SearchAction */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Perfil Primero",
    url: BASE_URL,
    description: "Plataforma laboral invertida de Chile. Postulantes publican perfiles anónimos y empresas verificadas llegan con sueldo claro.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/empresa?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Genera JSON-LD de WebApplication */
export function webAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Perfil Primero",
    url: BASE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Android, iOS",
    offers: {
      "@type": "Offer",
      price: "999",
      priceCurrency: "CLP",
    },
  };
}

/** Genera canonical URL absoluta */
export function canonicalUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Open Graph image absoluta */
export function ogImage(src: string): string {
  return src.startsWith("http") ? src : `${BASE_URL}${src}`;
}
