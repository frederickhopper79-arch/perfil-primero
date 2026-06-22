import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://perfil-primero.web.app";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/precios`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/empresas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // Páginas de audiencia
    { url: `${base}/para-postulantes`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/para-empresas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/para-omil`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Soporte y contacto
    { url: `${base}/ayuda`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    // Blog
    { url: `${base}/blog/tendencias-mercado-laboral-chile-2025`, lastModified: new Date("2026-07-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/guia-perfil-profesional`, lastModified: new Date("2026-06-15"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/como-contratar-mejor-en-chile`, lastModified: new Date("2026-06-10"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/como-negociar-tu-sueldo-en-chile`, lastModified: new Date("2026-06-01"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/modelo-invertido-explicado`, lastModified: new Date("2026-05-15"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/transparencia-salarial-chile`, lastModified: new Date("2026-05-01"), changeFrequency: "monthly", priority: 0.7 },
    // Estado y legal
    { url: `${base}/estado`, lastModified: now, changeFrequency: "hourly", priority: 0.3 },
    { url: `${base}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
