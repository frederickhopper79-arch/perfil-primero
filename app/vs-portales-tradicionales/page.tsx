import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Primero vs Portales Tradicionales de Empleo en Chile | Comparación 2026",
  description: "Compara Perfil Primero con los portales tradicionales de empleo en Chile. Modelo invertido vs modelo tradicional: privacidad, sueldo visible, eficiencia y costos.",
  alternates: { canonical: "https://perfil-primero.web.app/vs-portales-tradicionales" },
};

const comparativa = [
  { aspecto: "¿Quién busca a quién?", perfilPrimero: "Las empresas llegan al candidato", tradicional: "El candidato envía CVs al vacío" },
  { aspecto: "Sueldo visible", perfilPrimero: "Obligatorio desde la primera invitación", tradicional: "Generalmente 'a convenir' o lo sabes al final" },
  { aspecto: "Privacidad del candidato", perfilPrimero: "Perfil anónimo hasta que el candidato acepta", tradicional: "Nombre, apellido y datos expuestos desde el inicio" },
  { aspecto: "Verificación de empresas", perfilPrimero: "100% verificadas: RUT + dominio de correo", tradicional: "Cualquier empresa puede publicar (sin verificación real)" },
  { aspecto: "Costo para el candidato", perfilPrimero: "GRATIS durante lanzamiento (luego $999 CLP / 30 días)", tradicional: "Gratis para postular, pero inversión de tiempo enorme" },
  { aspecto: "Costo para la empresa", perfilPrimero: "$4.990 CLP por contacto confirmado (lanzamiento)", tradicional: "Desde $0 (plan básico) hasta $500k/mes (planes premium)" },
  { aspecto: "Calidad de los contactos", perfilPrimero: "Solo candidatos que aceptaron tu propuesta con sueldo declarado", tradicional: "Decenas o cientos de CVs no filtrados" },
  { aspecto: "Tiempo promedio hasta contratación", perfilPrimero: "7-21 días", tradicional: "30-60 días (según estadísticas mercado chileno)" },
  { aspecto: "Modelo de negocio", perfilPrimero: "Transaccional: pagas solo al desbloquear el contacto del postulante", tradicional: "Suscripción mensual o publicación de avisos sin garantía de resultado" },
  { aspecto: "Integración con OMIL", perfilPrimero: "Sí, gratuita para municipalidades y beneficiarios", tradicional: "No" },
];

export default function VsPortalesPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Comparación</p>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>
          Perfil Primero vs Portales Tradicionales de Empleo
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6, fontSize: 14 }}>
          No somos otro portal de avisos de empleo. Somos el modelo opuesto. Aquí está la comparación honesta para que decidas cuál tiene más sentido para ti.
        </p>
      </header>

      {/* Tabla comparativa */}
      <div style={{ overflowX: "auto", marginBottom: "3rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 16px", background: "var(--bg-soft)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", borderBottom: "2px solid var(--line)" }}>Aspecto</th>
              <th style={{ padding: "10px 16px", background: "var(--color-dark)", color: "#fff", fontSize: 12, fontWeight: 700, textAlign: "center", borderBottom: "2px solid var(--color-primary)" }}>Perfil Primero</th>
              <th style={{ padding: "10px 16px", background: "var(--bg-soft)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", textAlign: "center", borderBottom: "2px solid var(--line)" }}>Portales tradicionales</th>
            </tr>
          </thead>
          <tbody>
            {comparativa.map((c, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--heading)", background: "var(--surface)" }}>{c.aspecto}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text)", textAlign: "center", background: "#f0f8fe" }}>
                  <span style={{ color: "var(--green)", marginRight: 6 }}>✓</span>{c.perfilPrimero}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center", background: "var(--surface)" }}>{c.tradicional}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cuándo usar un portal tradicional */}
      <div style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: 10 }}>¿Cuándo tiene sentido un portal tradicional?</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Cuando necesitas llenar una vacante de muy alta rotación (cajeros, reponedores, call center) donde el volumen importa más que el filtro",
            "Cuando tienes un equipo de RRHH dedicado a revisar cientos de CVs y tiempo disponible para hacerlo",
            "Cuando el cargo requiere publicación obligatoria por ley o política interna (ej. cargos públicos)",
          ].map((p, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--muted)", display: "flex", gap: 8, lineHeight: 1.5 }}>
              <span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span> {p}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/empresa" className="button">Probar Perfil Primero gratis</a>
        <a href="/precios" className="button ghost">Ver planes y precios</a>
      </div>
    </main>
  );
}
