import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapa del Sitio | Perfil Primero",
  description: "Mapa de todas las páginas y secciones de Perfil Primero.",
  robots: { index: false, follow: true },
};

const secciones = [
  {
    titulo: "Inicio y plataforma",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Cómo funciona", href: "/como-funciona" },
      { label: "Precios", href: "/precios" },
      { label: "Estadísticas de mercado", href: "/estadisticas" },
      { label: "Calculadora salarial", href: "/calculadora-salarial" },
      { label: "Mapa del sitio", href: "/mapa-del-sitio" },
    ],
  },
  {
    titulo: "Para postulantes",
    links: [
      { label: "Cómo funciona para postulantes", href: "/para-postulantes" },
      { label: "Crear mi perfil", href: "/postulante" },
      { label: "Programa de referidos", href: "/referidos" },
      { label: "Tips profesionales", href: "/tips-profesionales" },
      { label: "Empleos disponibles", href: "/empleos" },
    ],
  },
  {
    titulo: "Para empresas",
    links: [
      { label: "Cómo funciona para empresas", href: "/para-empresas" },
      { label: "Buscar talento", href: "/empresa" },
      { label: "Solución para PyMEs", href: "/para-pymes" },
      { label: "Contratación masiva", href: "/para-empresas/contratacion-masiva" },
      { label: "Guía de inicio para empresas", href: "/para-empresas/onboarding" },
      { label: "Empresa verificada", href: "/empresa-verificada" },
      { label: "Análisis de expertos", href: "/analisis-expertos" },
    ],
  },
  {
    titulo: "Para OMILs",
    links: [
      { label: "Cómo funciona para OMILs", href: "/para-omil" },
      { label: "Panel OMIL", href: "/omil" },
    ],
  },
  {
    titulo: "Blog y contenido",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guía de sueldos Chile 2026", href: "/blog/guia-sueldo-chile-2026" },
      { label: "Trabajo remoto en Chile 2026", href: "/blog/trabajo-remoto-chile-2026" },
      { label: "Cómo preparar una entrevista", href: "/blog/como-preparar-entrevista-trabajo-chile" },
      { label: "Derechos laborales 2026", href: "/blog/derechos-laborales-chile-2026" },
      { label: "LinkedIn para buscar trabajo", href: "/blog/linkedin-para-buscar-trabajo-chile" },
      { label: "Beneficios laborales 2026", href: "/blog/beneficios-laborales-mas-valorados-chile-2026" },
      { label: "Cómo escribir un buen CV", href: "/blog/como-escribir-un-buen-cv-chile" },
      { label: "Retención de talento 2026", href: "/blog/retencion-talento-chile-2026" },
      { label: "Employer branding Chile", href: "/blog/employer-branding-chile" },
      { label: "IA en selección de personal", href: "/blog/ia-en-seleccion-de-personal-chile" },
      { label: "Diversidad e inclusión laboral", href: "/blog/diversidad-e-inclusion-laboral-chile" },
      { label: "Trabajo independiente vs relación laboral", href: "/blog/trabajo-independiente-vs-relacion-laboral-chile" },
    ],
  },
  {
    titulo: "Sobre Perfil Primero",
    links: [
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
      { label: "Casos de éxito", href: "/casos-de-exito" },
      { label: "Transparencia", href: "/transparencia" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Changelog", href: "/changelog" },
      { label: "Comunidad", href: "/comunidad" },
      { label: "Prensa", href: "/prensa" },
      { label: "Vs portales tradicionales", href: "/vs-portales-tradicionales" },
    ],
  },
  {
    titulo: "Soporte y legal",
    links: [
      { label: "Ayuda", href: "/ayuda" },
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Contacto", href: "/contacto" },
      { label: "Privacidad", href: "/legal/privacidad" },
      { label: "Términos de uso", href: "/legal/terminos" },
      { label: "Accesibilidad", href: "/accesibilidad" },
    ],
  },
];

export default function MapaSitioPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 10 }}>Mapa del Sitio</h1>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Todas las páginas de Perfil Primero, organizadas por sección.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
        {secciones.map((s, i) => (
          <section key={i}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>{s.titulo}</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
              {s.links.map((l, j) => (
                <li key={j}>
                  <a href={l.href} style={{ fontSize: 13, color: "var(--text)", display: "block", padding: "4px 0" }}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
