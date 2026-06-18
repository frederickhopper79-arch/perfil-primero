import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://perfil-primero.web.app";
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/postulante`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/empresa`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
