"use client";
import { useState } from "react";
import { ReadingTime } from "@/components/ui/reading-time";

const posts = [
  { slug: "como-escribir-un-buen-cv-chile", title: "Cómo Escribir un Buen CV en Chile: Guía Práctica 2026", summary: "Secciones obligatorias, errores que destrozan tu CV y lo que buscan los reclutadores chilenos. Guía actualizada para el mercado laboral 2026.", date: "2026-06-22", category: "Empleabilidad" },
  { slug: "trabajo-independiente-vs-relacion-laboral-chile", title: "Trabajo Independiente vs Relación Laboral en Chile: Qué Conviene en 2026", summary: "Comparación completa entre contrato de trabajo y honorarios: derechos, cotizaciones, vacaciones, seguro de cesantía y señales de relación laboral encubierta.", date: "2026-06-22", category: "Trabajadores" },
  { slug: "diversidad-e-inclusion-laboral-chile", title: "Diversidad e Inclusión Laboral en Chile 2026: Datos y Acciones Concretas", summary: "Brechas salariales de género, inclusión de personas con discapacidad y prácticas de DEI con impacto real en el mercado chileno.", date: "2026-06-21", category: "Mercado laboral" },
  { slug: "derechos-laborales-chile-2026", title: "Derechos Laborales en Chile 2026: Lo que Todo Trabajador Debe Saber", summary: "Guía actualizada: contrato de trabajo, despidos, teletrabajo, vacaciones y las últimas modificaciones al Código del Trabajo.", date: "2026-06-20", category: "Trabajadores" },
  { slug: "ia-en-seleccion-de-personal-chile", title: "IA en Selección de Personal en Chile: Qué Funciona y Qué No", summary: "Análisis práctico del uso de IA en RRHH en Chile: análisis de CV, matching, sesgos y dónde el criterio humano es insustituible.", date: "2026-06-20", category: "Tecnología RRHH" },
  { slug: "retencion-talento-chile-2026", title: "Retención de Talento en Chile: Lo que Funciona (y lo que No) en 2026", summary: "El costo de reemplazar a una persona es de 1.5 a 12 sueldos. Estrategias probadas para reducir la rotación en empresas chilenas.", date: "2026-06-18", category: "Para Empresas" },
  { slug: "linkedin-para-buscar-trabajo-chile", title: "LinkedIn para Buscar Trabajo en Chile: Lo que Realmente Funciona en 2026", summary: "Las secciones que cambian el resultado, los errores que sabotean tu perfil y cómo complementar LinkedIn con Perfil Primero.", date: "2026-06-15", category: "Empleabilidad" },
  { slug: "beneficios-laborales-mas-valorados-chile-2026", title: "Los 10 Beneficios Laborales Más Valorados en Chile en 2026", summary: "Ranking con datos reales: qué importa más allá del sueldo para los profesionales chilenos, con porcentajes y análisis por sector.", date: "2026-06-10", category: "Mercado laboral" },
  { slug: "como-preparar-entrevista-trabajo-chile", title: "Cómo Preparar una Entrevista de Trabajo en Chile: Guía Completa 2026", summary: "El proceso exacto, desde antes de la entrevista hasta la negociación salarial. Preguntas difíciles y cómo responderlas.", date: "2026-06-01", category: "Empleabilidad" },
  { slug: "tendencias-mercado-laboral-chile-2025", title: "Tendencias del mercado laboral en Chile 2025", summary: "Trabajo remoto, sueldos TI en máximos históricos, transparencia salarial y el auge del trabajo por proyecto. Análisis con datos reales.", date: "2026-07-01", category: "Mercado laboral" },
  { slug: "licencia-medica-chile-2026", title: "Licencia Médica en Chile 2026: Tipos, Cuánto Pagan y Cómo Tramitarla", summary: "Desde la licencia común hasta el postnatal: plazos clave, quién paga el subsidio, cómo tramitarla y qué hacer si FONASA o la Isapre la rechaza.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "gratificacion-legal-chile-como-calcular", title: "Gratificación Legal en Chile 2026: Cómo Calcularla y Qué Debe Pagarte la Empresa", summary: "Las dos modalidades (25% remuneración vs 30% utilidades), cálculo mensual con ejemplo real y qué significa 'sueldo incluye gratificación'.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "seguro-de-cesantia-chile-como-cobrar", title: "Seguro de Cesantía en Chile 2026: Cuánto Cobras, Cuándo y Cómo Solicitarlo", summary: "Montos por mes (70%, 55%, 45%…), diferencia entre Cuenta Individual y Fondo Solidario, requisitos y pasos para solicitarlo en AFC.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "vacaciones-chile-cuantos-dias", title: "Vacaciones en Chile 2026: Cuántos Días Te Corresponden", summary: "15 días hábiles, feriado progresivo, cálculo proporcional y qué pasa si el empleador las posterga. Todo sobre el feriado legal chileno.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "afp-chile-2026-cuanto-se-descuenta", title: "AFP Chile 2026: Cuánto Se Descuenta, Qué Cubre y Cómo Elegir", summary: "Comparativa de comisiones, tipos de fondos (A–E) y cuánto va realmente a tu cuenta individual versus a la comisión de la AFP.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "contrato-de-trabajo-chile-requisitos", title: "Contrato de Trabajo en Chile 2026: Requisitos, Tipos y Qué Debe Incluir", summary: "Las 8 cláusulas obligatorias por ley, tipos de contrato (indefinido, plazo fijo, por obra) y lo que el empleador no puede incluir.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "sueldo-minimo-chile-2026", title: "Sueldo Mínimo Chile 2026: Cuánto Es y Cómo Calcularlo", summary: "Valor oficial del IMM, historial, cálculo de costo para empresa y trabajador, preguntas frecuentes y qué hacer si te pagan menos del mínimo.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "carta-de-presentacion-chile", title: "Cómo Escribir una Carta de Presentación Laboral en Chile 2026", summary: "Estructura en 5 párrafos, plantilla lista para usar y los 6 errores que destruyen una carta de presentación en el mercado laboral chileno.", date: "2026-06-25", category: "Empleabilidad" },
  { slug: "finiquito-chile-guia-completa", title: "Finiquito en Chile: Guía Completa 2026 — Cómo Calcular y Qué Exigir", summary: "Todo sobre el finiquito laboral chileno: indemnización por años de servicio, aviso previo, causales, plazos y checklist antes de firmar.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "habilidades-digitales-chile-2026", title: "Las 15 Habilidades Digitales Más Buscadas en Chile 2026", summary: "Ranking actualizado con demanda, salario extra y nivel de entrada de las 15 habilidades digitales que más pagan en Chile.", date: "2026-06-25", category: "Empleabilidad" },
  { slug: "horas-extraordinarias-chile-2026", title: "Horas Extraordinarias en Chile 2026: Límite, Pago y Tus Derechos", summary: "Todo sobre las horas extras en Chile: cuántas puedes trabajar, cuánto te deben pagar (recargo del 50%), cuándo son voluntarias y cómo reclamar si no te las pagan.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "trabajo-part-time-chile-2026", title: "Trabajo Part-Time en Chile 2026: Derechos, Sueldo Mínimo y Jornada Parcial", summary: "Guía completa sobre la jornada parcial en Chile: límite de horas, sueldo mínimo proporcional, cotizaciones y diferencias con el contrato de tiempo completo.", date: "2026-06-25", category: "Derechos laborales" },
  { slug: "guia-sueldo-chile-2026", title: "Guía de Sueldos en Chile 2026: Cuánto Ganar por Sector y Nivel", summary: "Tabla de sueldos junior, mid y senior en 8 industrias chilenas, factores regionales y cómo negociar tu próximo aumento.", date: "2026-06-25", category: "Mercado laboral" },
  { slug: "trabajo-remoto-chile-2026", title: "Trabajo Remoto en Chile 2026: Estado del Mercado y Ley 21.220", summary: "Estadísticas de adopción, sectores con más remoto, derechos legales y qué habilidades buscan las empresas que operan en remoto.", date: "2026-06-20", category: "Mercado laboral" },
  { slug: "employer-branding-chile", title: "Employer Branding en Chile: Cómo Atraer el Mejor Talento", summary: "5 pilares del employer branding efectivo y los errores más comunes que destruyen la reputación de empleador.", date: "2026-05-20", category: "Para Empresas" },
  { slug: "guia-perfil-profesional", title: "Cómo crear un perfil profesional que destaque", summary: "Guía paso a paso para optimizar tu perfil en Perfil Primero: foto, título, resumen, habilidades, sueldo esperado y más.", date: "2026-06-15", category: "Empleabilidad" },
  { slug: "como-contratar-mejor-en-chile", title: "Cómo contratar mejor en Chile usando Perfil Primero", summary: "El modelo invertido reduce el tiempo de contratación de 41 días a menos de una semana. Guía práctica para equipos de RRHH.", date: "2026-06-10", category: "Para Empresas" },
  { slug: "como-negociar-tu-sueldo-en-chile", title: "¿Cómo negociar tu sueldo en Chile en 2026?", summary: "Guía práctica con datos reales del mercado para que llegues preparado a tu próxima negociación salarial.", date: "2026-06-01", category: "Empleabilidad" },
  { slug: "modelo-invertido-explicado", title: "El modelo de empleo invertido: por qué funciona", summary: "En el modelo tradicional envías CV a ciegas. En Perfil Primero, las empresas vienen a ti con sueldo claro desde el primer mensaje.", date: "2026-05-15", category: "Plataforma" },
  { slug: "transparencia-salarial-chile", title: "Transparencia salarial en Chile: ¿dónde estamos?", summary: "Análisis de la Ley de Igualdad Salarial y cómo Perfil Primero contribuye a un mercado laboral más justo.", date: "2026-05-01", category: "Mercado laboral" },
];

const CATEGORIES = ["Todos", "Empleabilidad", "Trabajadores", "Mercado laboral", "Derechos laborales", "Para Empresas", "Tecnología RRHH", "Plataforma"];
const PAGE_SIZE = 6;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [page, setPage] = useState(1);

  const filtered = activeCategory === "Todos" ? posts : posts.filter(p => p.category === activeCategory);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeCategory(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }

  return (
    <main style={{ maxWidth: 860, margin: "60px auto", padding: "0 24px 60px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "var(--heading)" }}>Blog</h1>
        <p style={{ color: "var(--muted)", marginBottom: 0 }}>Consejos de empleabilidad, datos del mercado y novedades de Perfil Primero.</p>
      </div>

      {/* Filtros de categoría */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => changeCategory(cat)} style={{ padding: "6px 16px", borderRadius: 999, border: activeCategory === cat ? "none" : "1px solid var(--line)", background: activeCategory === cat ? "var(--primary-700)" : "var(--surface)", color: activeCategory === cat ? "#fff" : "var(--text)", fontWeight: activeCategory === cat ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
            {cat}
            {cat !== "Todos" && (
              <span style={{ marginLeft: 6, opacity: 0.7, fontWeight: 400 }}>({posts.filter(p => p.category === cat).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Contador accesible de resultados */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {filtered.length} artículos en {activeCategory === "Todos" ? "todas las categorías" : activeCategory}
      </p>

      {/* Artículos */}
      {paginated.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ margin: 0, fontWeight: 600 }}>No hay artículos en esta categoría todavía.</p>
          <p style={{ margin: "8px 0 0", fontSize: 13 }}>Prueba otra categoría o vuelve pronto.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {paginated.map(post => (
            <article key={post.slug} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 28, contain: "layout style" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ background: "var(--blue-soft)", color: "var(--primary-700)", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{post.category}</span>
                <time dateTime={post.date} style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(post.date).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                </time>
                <ReadingTime text={post.summary + " " + post.title} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "var(--heading)" }}>
                <a href={`/blog/${post.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{post.title}</a>
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{post.summary}</p>
              <a href={`/blog/${post.slug}`} style={{ display: "inline-block", marginTop: 16, color: "var(--primary-700)", fontWeight: 700, fontSize: 14 }}>Leer artículo →</a>
            </article>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <nav aria-label="Paginación del blog" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 36 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: page === 1 ? "var(--muted)" : "var(--text)", fontWeight: 600, fontSize: 14, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
          >← Anterior</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} aria-current={n === page ? "page" : undefined}
              style={{ padding: "7px 13px", borderRadius: 8, border: "none", background: n === page ? "var(--primary-700)" : "var(--surface)", color: n === page ? "#fff" : "var(--text)", fontWeight: n === page ? 700 : 500, fontSize: 14, cursor: "pointer" }}>
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface)", color: page === totalPages ? "var(--muted)" : "var(--text)", fontWeight: 600, fontSize: 14, cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
          >Siguiente →</button>
        </nav>
      )}

      {/* Indicador */}
      <p style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
        Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} artículos
        {activeCategory !== "Todos" && ` en "${activeCategory}"`}
      </p>
    </main>
  );
}
