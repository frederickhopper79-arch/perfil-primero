import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo en Vivo | Perfil Primero para Equipos RRHH",
  description: "Prueba Perfil Primero antes de registrarte. Demo interactiva de búsqueda de candidatos con datos ficticios para equipos de RRHH y empresas.",
  alternates: { canonical: "https://perfil-primero.web.app/demos" },
};

const perfilesDemо = [
  { codigo: "PP-4821", sector: "Tecnología / Software", region: "Metropolitana", cargo: "Desarrollador Backend", experiencia: "5 años", sueldo: "$2.200.000 – $2.800.000", modalidad: "Remoto", habilidades: ["Python", "AWS", "PostgreSQL"], score: 94 },
  { codigo: "PP-3307", sector: "Marketing / Comunicaciones", region: "Valparaíso", cargo: "Especialista Marketing Digital", experiencia: "3 años", sueldo: "$1.100.000 – $1.400.000", modalidad: "Híbrido", habilidades: ["SEO", "Google Ads", "Meta Ads"], score: 87 },
  { codigo: "PP-6142", sector: "Finanzas / Banca", region: "Metropolitana", cargo: "Analista Financiero Senior", experiencia: "7 años", sueldo: "$1.800.000 – $2.200.000", modalidad: "Presencial", habilidades: ["Excel avanzado", "Power BI", "SAP"], score: 91 },
  { codigo: "PP-2091", sector: "RRHH / Administración", region: "Biobío", cargo: "Jefe de Personas", experiencia: "6 años", sueldo: "$1.500.000 – $1.900.000", modalidad: "Híbrido", habilidades: ["Selección", "Clima organizacional", "Compensaciones"], score: 82 },
  { codigo: "PP-7734", sector: "Salud / Clínico", region: "Los Lagos", cargo: "Enfermero/a Clínico", experiencia: "4 años", sueldo: "$1.300.000 – $1.600.000", modalidad: "Presencial", habilidades: ["UCI", "Urgencias", "ACLS"], score: 89 },
  { codigo: "PP-5510", sector: "Logística / Operaciones", region: "Metropolitana", cargo: "Coordinador Logístico", experiencia: "4 años", sueldo: "$1.000.000 – $1.300.000", modalidad: "Presencial", habilidades: ["WMS", "Gestión de flota", "SAP MM"], score: 76 },
];

export default function DemosPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span style={{ display: "inline-block", background: "var(--blue-soft)", color: "var(--primary-700)", padding: "4px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Demo interactiva</span>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.25rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>Así ven los perfiles las empresas en Perfil Primero</h1>
        <p style={{ color: "var(--muted)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          Estos son perfiles ficticios con datos ilustrativos. En la plataforma real, el nombre y contacto del candidato permanece oculto hasta que ambas partes deciden avanzar.
        </p>
      </header>

      <div style={{ background: "#fff9e6", border: "1px solid #f0d060", borderRadius: 10, padding: "10px 16px", marginBottom: 28, fontSize: 13, color: "#7a5c00" }}>
        <strong>Modo demo</strong> — Los perfiles a continuación son ficticios. <a href="/empresa" style={{ color: "var(--primary-700)", fontWeight: 600 }}>Regístrate gratis como empresa →</a> para acceder a candidatos reales.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginBottom: "3rem" }}>
        {perfilesDemо.map((p, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>{p.codigo}</span>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--heading)", marginTop: 2 }}>{p.cargo}</div>
              </div>
              <div style={{ background: "var(--primary-700)", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 800 }}>{p.score}%</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span>📍 {p.region}</span>
              <span>🏢 {p.modalidad}</span>
              <span>💼 {p.experiencia}</span>
            </div>
            <div style={{ fontWeight: 700, color: "var(--primary-700)", fontSize: 14 }}>{p.sueldo} CLP</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {p.habilidades.map((h, j) => (
                <span key={j} style={{ background: "var(--blue-soft)", color: "var(--color-dark)", padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <a href="/empresa" className="button primary" style={{ flex: 1, textAlign: "center", fontSize: 13 }}>Invitar candidato →</a>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 18, padding: "2.5rem", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>¿Listo para ver candidatos reales?</h2>
        <p style={{ color: "rgba(255,255,255,0.9)", maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
          El registro de empresa es gratuito. Solo pagas $4.990 CLP cuando desbloqueas el contacto de un candidato que te interesa — después de que él acepta tu invitación.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/empresa" style={{ background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>Registrar mi empresa gratis</a>
          <a href="/como-funciona" style={{ border: "1.5px solid rgba(255,255,255,.6)", color: "#fff", fontWeight: 600, padding: "12px 28px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>Ver cómo funciona</a>
        </div>
      </div>
    </main>
  );
}
