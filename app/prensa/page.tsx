import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prensa | Perfil Primero",
  description: "Kit de prensa de Perfil Primero. Descarga logos, datos de la empresa y contacta a nuestro equipo de comunicaciones.",
  alternates: { canonical: "https://perfil-primero.web.app/prensa" },
};

const datosRapidos = [
  { label: "Fundación", value: "2025" },
  { label: "Domicilio legal", value: "Puerto Montt, Chile" },
  { label: "RUT", value: "78.449.783-6" },
  { label: "Tipo de empresa", value: "SpA (Sociedad por Acciones)" },
  { label: "Usuarios activos (meta 2026)", value: "1.200+" },
  { label: "Empresas verificadas (meta 2026)", value: "150+" },
  { label: "Contrataciones exitosas (meta 2026)", value: "300+" },
  { label: "Regiones objetivo", value: "12" },
];

const hitos = [
  "Primera plataforma laboral invertida de Chile con sueldo obligatorio desde el primer contacto",
  "Integración con red municipal de OMILs para trabajadores vulnerables sin costo",
  "Análisis de CV con Gemini AI: primero en Chile en aplicar IA generativa al proceso de postulación",
  "Modelo de privacidad: identidad del trabajador protegida hasta su decisión explícita",
];

const mensajesClave = [
  "Perfil Primero es la primera plataforma laboral de Chile donde el sueldo es visible antes del primer contacto.",
  "El mercado laboral chileno funciona con asimetría de información que perjudica a los trabajadores. Perfil Primero lo invierte.",
  "Las empresas llegan al trabajador, no al revés. Y deben mostrar el sueldo desde la invitación.",
  "El modelo OMIL permite a municipalidades crear perfiles para personas que no saben usar tecnología.",
];

export default function PrensaPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>Sala de prensa</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Kit de Prensa — Perfil Primero</h1>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Todo lo que necesitas para escribir sobre Perfil Primero. Datos verificados, mensajes clave y contacto directo con nuestro equipo.
        </p>
      </header>

      {/* Contacto prensa */}
      <div style={{ background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem", marginBottom: "2.5rem", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 4 }}>Contacto de prensa</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Para entrevistas, datos adicionales o material gráfico</div>
        </div>
        <a href="mailto:prensa@perfil-primero.cl" className="button" style={{ whiteSpace: "nowrap" }}>prensa@perfil-primero.cl</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: "2.5rem" }}>
        {/* Datos rápidos */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Datos de la empresa</h2>
          <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
            {datosRapidos.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < datosRapidos.length - 1 ? "1px solid var(--line)" : "none", fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>{d.label}</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mensajes clave */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Mensajes clave</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {mensajesClave.map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 14px", borderLeft: "3px solid var(--color-primary)", fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                {m}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Hitos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Primeros en Chile</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {hitos.map((h, i) => (
            <li key={i} style={{ display: "flex", gap: 10, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 14px", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>★</span> {h}
            </li>
          ))}
        </ul>
      </section>

      {/* Descarga assets */}
      <section style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Assets disponibles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { nombre: "Logo horizontal (PNG)", href: "/logo-perfil-primero.png" },
            { nombre: "Isotipo (PNG)", href: "/isotipo.png" },
          ].map((a, i) => (
            <a key={i} href={a.href} download style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-soft)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span>{a.nombre}</span>
              <span style={{ color: "var(--color-primary)" }}>↓</span>
            </a>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>Para uso editorial. No modificar colores ni proporciones. Para variaciones aprobadas, contactar al equipo de prensa.</p>
      </section>
    </main>
  );
}
