import { NextResponse } from "next/server";

const BASE = "https://perfil-primero.web.app";

const staticRoutes = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/como-funciona", priority: "0.9", changefreq: "monthly" },
  { url: "/precios", priority: "0.9", changefreq: "monthly" },
  { url: "/para-postulantes", priority: "0.8", changefreq: "monthly" },
  { url: "/para-empresas", priority: "0.8", changefreq: "monthly" },
  { url: "/para-omil", priority: "0.7", changefreq: "monthly" },
  { url: "/postulante", priority: "0.9", changefreq: "weekly" },
  { url: "/empresa", priority: "0.9", changefreq: "weekly" },
  { url: "/blog", priority: "0.8", changefreq: "weekly" },
  { url: "/blog/guia-perfil-profesional", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/como-negociar-tu-sueldo-en-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/tendencias-mercado-laboral-chile-2025", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/transparencia-salarial-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/modelo-invertido-explicado", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/como-contratar-mejor-en-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/guia-sueldo-chile-2026", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/trabajo-remoto-chile-2026", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/employer-branding-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/beneficios-laborales-mas-valorados-chile-2026", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/linkedin-para-buscar-trabajo-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/retencion-talento-chile-2026", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/ia-en-seleccion-de-personal-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/derechos-laborales-chile-2026", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/diversidad-e-inclusion-laboral-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/trabajo-independiente-vs-relacion-laboral-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/como-escribir-un-buen-cv-chile", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/como-preparar-entrevista-trabajo-chile", priority: "0.7", changefreq: "monthly" },
  { url: "/blog/licencia-medica-chile-2026", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/gratificacion-legal-chile-como-calcular", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/seguro-de-cesantia-chile-como-cobrar", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/vacaciones-chile-cuantos-dias", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/afp-chile-2026-cuanto-se-descuenta", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/contrato-de-trabajo-chile-requisitos", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/sueldo-minimo-chile-2026", priority: "0.9", changefreq: "monthly" },
  { url: "/blog/carta-de-presentacion-chile", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/finiquito-chile-guia-completa", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/habilidades-digitales-chile-2026", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/horas-extraordinarias-chile-2026", priority: "0.8", changefreq: "monthly" },
  { url: "/blog/trabajo-part-time-chile-2026", priority: "0.8", changefreq: "monthly" },
  { url: "/calculadora-salarial", priority: "0.9", changefreq: "monthly" },
  { url: "/estadisticas", priority: "0.8", changefreq: "weekly" },
  { url: "/faq", priority: "0.8", changefreq: "monthly" },
  { url: "/sobre-nosotros", priority: "0.7", changefreq: "monthly" },
  { url: "/prensa", priority: "0.5", changefreq: "monthly" },
  { url: "/comunidad", priority: "0.7", changefreq: "monthly" },
  { url: "/referidos", priority: "0.6", changefreq: "monthly" },
  { url: "/transparencia", priority: "0.7", changefreq: "monthly" },
  { url: "/changelog", priority: "0.6", changefreq: "weekly" },
  { url: "/roadmap", priority: "0.6", changefreq: "monthly" },
  { url: "/analisis-expertos", priority: "0.6", changefreq: "monthly" },
  { url: "/ayuda", priority: "0.7", changefreq: "monthly" },
  { url: "/contacto", priority: "0.6", changefreq: "monthly" },
  { url: "/legal/privacidad", priority: "0.4", changefreq: "yearly" },
  { url: "/legal/terminos", priority: "0.4", changefreq: "yearly" },
];

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(r => `  <url>
    <loc>${BASE}${r.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
