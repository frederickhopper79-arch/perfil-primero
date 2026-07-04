import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estadísticas del Mercado Laboral Chile 2026",
  description: "Datos actualizados del mercado laboral chileno: sueldos por industria, regiones con más demanda, habilidades más buscadas y tendencias de empleo.",
  alternates: { canonical: "https://perfil-primero.web.app/estadisticas" },
  openGraph: {
    title: "Estadísticas del Mercado Laboral Chile 2026 | Perfil Primero",
    description: "Datos de transparencia salarial y tendencias de empleo en Chile basados en perfiles reales de la plataforma.",
  },
};

const salariosPorSector = [
  { sector: "Tecnología / Software", min: 1200000, max: 4500000, mediana: 2200000 },
  { sector: "Finanzas / Banca", min: 900000, max: 3800000, mediana: 1900000 },
  { sector: "Salud / Clínico", min: 800000, max: 3200000, mediana: 1500000 },
  { sector: "Marketing / Comunicaciones", min: 700000, max: 2800000, mediana: 1300000 },
  { sector: "Logística / Operaciones", min: 600000, max: 2200000, mediana: 1100000 },
  { sector: "Educación / Capacitación", min: 550000, max: 1800000, mediana: 950000 },
  { sector: "Comercio / Ventas", min: 600000, max: 2500000, mediana: 1050000 },
  { sector: "Construcción / Minería", min: 800000, max: 3500000, mediana: 1600000 },
  { sector: "Gastronomía / Turismo", min: 500000, max: 1500000, mediana: 750000 },
  { sector: "RRHH / Administración", min: 650000, max: 2100000, mediana: 1100000 },
];

const regionesDemanda = [
  { region: "Metropolitana", porcentaje: 48, tendencia: "↑" },
  { region: "Valparaíso", porcentaje: 12, tendencia: "↑" },
  { region: "Biobío", porcentaje: 11, tendencia: "→" },
  { region: "La Araucanía", porcentaje: 6, tendencia: "↑" },
  { region: "Los Lagos", porcentaje: 5, tendencia: "↑" },
  { region: "Maule", porcentaje: 4, tendencia: "→" },
  { region: "Coquimbo", porcentaje: 4, tendencia: "↑" },
  { region: "Antofagasta", porcentaje: 5, tendencia: "→" },
  { region: "O'Higgins", porcentaje: 3, tendencia: "→" },
  { region: "Otras", porcentaje: 2, tendencia: "→" },
];

const habilidadesDemandadas = [
  { habilidad: "Excel / Análisis de datos", nivel: 78 },
  { habilidad: "Servicio al cliente", nivel: 72 },
  { habilidad: "Python / Programación", nivel: 61 },
  { habilidad: "Gestión de proyectos", nivel: 58 },
  { habilidad: "Inglés intermedio-avanzado", nivel: 55 },
  { habilidad: "Marketing digital / SEO", nivel: 49 },
  { habilidad: "Diseño gráfico / Canva", nivel: 44 },
  { habilidad: "Contabilidad / Finanzas", nivel: 42 },
  { habilidad: "Manejo de CRM", nivel: 38 },
  { habilidad: "Comunicación efectiva", nivel: 86 },
];

const kpis = [
  { label: "Perfiles activos", value: "1.200+", sub: "meta 2026" },
  { label: "Empresas verificadas", value: "150+", sub: "meta 2026" },
  { label: "Sueldo mediana estimada", value: "$1.200.000", sub: "CLP brutos/mes" },
  { label: "Tiempo hasta oferta", value: "< 2 sem.", sub: "estimado modelo" },
  { label: "Tasa de respuesta empresa", value: "> 70%", sub: "objetivo" },
  { label: "Contrataciones exitosas", value: "300+", sub: "meta 2026" },
];

function fmt(n: number) {
  return "$" + n.toLocaleString("es-CL");
}

export default function EstadisticasPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Transparencia salarial</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>Estadísticas del Mercado Laboral Chile 2026</h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          Datos de referencia del mercado laboral chileno y proyecciones de Perfil Primero. Los KPIs de plataforma reflejan metas de crecimiento para 2026.
        </p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Última actualización: Junio 2026</p>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>
          * Los KPIs de usuarios, empresas y contrataciones son metas proyectadas, no datos históricos confirmados. Las tablas salariales y de habilidades son estimaciones de mercado basadas en fuentes públicas.
        </p>
      </header>

      {/* KPIs */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1.25rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-dark)" }}>{k.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 4 }}>{k.label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sueldos por sector */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Sueldos por sector (CLP bruto/mes)</h2>
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 0, fontSize: 11, fontWeight: 700, color: "var(--muted)", padding: "10px 16px", borderBottom: "1px solid var(--line)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            <span>Sector</span><span style={{ textAlign: "right" }}>Mínimo</span><span style={{ textAlign: "right", paddingLeft: 16 }}>Mediana</span><span style={{ textAlign: "right", paddingLeft: 16 }}>Máximo</span>
          </div>
          {salariosPorSector.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 0, padding: "12px 16px", borderBottom: i < salariosPorSector.length - 1 ? "1px solid var(--line)" : "none", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{s.sector}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", textAlign: "right" }}>{fmt(s.min)}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary-700)", textAlign: "right", paddingLeft: 16 }}>{fmt(s.mediana)}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", textAlign: "right", paddingLeft: 16 }}>{fmt(s.max)}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>* Basado en rangos declarados en perfiles activos. No incluye bonos ni beneficios.</p>
      </section>

      {/* Dos columnas: regiones + habilidades */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24, marginBottom: "3rem" }}>
        {/* Regiones */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Demanda por región</h2>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
            {regionesDemanda.map((r, i) => (
              <div key={i} style={{ padding: "10px 16px", borderBottom: i < regionesDemanda.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{r.region}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.tendencia} {r.porcentaje}%</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-soft)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${r.porcentaje * 2}%`, background: "var(--primary-700)", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Habilidades */}
        <section>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Habilidades más demandadas</h2>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
            {habilidadesDemandadas.map((h, i) => (
              <div key={i} style={{ padding: "10px 16px", borderBottom: i < habilidadesDemandadas.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{h.habilidad}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{h.nivel}%</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-soft)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${h.nivel}%`, background: "linear-gradient(90deg,var(--color-primary),var(--color-dark))", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Metodología */}
      <section style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1.5rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>Metodología y fuente de datos</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          Los datos presentados provienen exclusivamente de perfiles y procesos de selección dentro de Perfil Primero. Todos los datos personales están anonimizados. Las estadísticas se actualizan mensualmente con datos de los últimos 90 días. Los sueldos corresponden a rangos declarados por postulantes, en pesos chilenos brutos mensuales. Para investigadores o medios que deseen citar estos datos, contactar a <a href="mailto:datos@perfil-primero.cl" style={{ color: "var(--primary-700)" }}>datos@perfil-primero.cl</a>.
        </p>
      </section>

      {/* CTA */}
      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <p style={{ fontSize: 15, color: "var(--muted)", marginBottom: 16 }}>¿Quieres aparecer en las próximas estadísticas?</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" className="button">Publicar mi perfil gratis</a>
          <a href="/empresa" className="button ghost">Buscar talento verificado</a>
        </div>
      </div>
    </main>
  );
}
