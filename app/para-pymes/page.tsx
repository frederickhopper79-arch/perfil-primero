import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil Primero para PyMEs | Contratación eficiente para empresas medianas y pequeñas",
  description: "Solución de contratación diseñada para PyMEs chilenas. Sin departamento de RRHH propio. Encuentra candidatos calificados con sueldo claro desde el primer contacto.",
  alternates: { canonical: "https://perfil-primero.web.app/para-pymes" },
};

const dolorPymes = [
  { dolor: "No tengo equipo de RRHH", solucion: "En Perfil Primero tú eres el buscador y el decisor. El proceso es tan simple que lo maneja cualquier gerente o dueño." },
  { dolor: "Los portales tradicionales me inundan de CVs irrelevantes", solucion: "Los candidatos ya filtraron por tu rango salarial antes de aparecer. Solo ves quienes calzan." },
  { dolor: "No puedo pagar headhunters que cobran 1-2 sueldos por candidato", solucion: "Pagas $4.990 CLP (lanzamiento) solo cuando decides desbloquear el contacto de un postulante. Hasta ese momento, todo es gratis." },
  { dolor: "No sé si el candidato es real antes de gastar tiempo en una entrevista", solucion: "Los perfiles en Perfil Primero están validados. La OMIL verifica los perfiles de derivación municipal." },
  { dolor: "Mis procesos son largos y pierdo candidatos en el camino", solucion: "El candidato ya te está esperando. El proceso puede cerrarse en menos de una semana." },
];

const pasos = [
  { num: 1, desc: "Registras tu empresa (con tu RUT)", sub: "5 minutos" },
  { num: 2, desc: "La verificamos en 24-48h", sub: "Sin papeleo" },
  { num: 3, desc: "Buscas por cargo, sector y sueldo", sub: "Gratis" },
  { num: 4, desc: "Envías una invitación con el sueldo declarado", sub: "Gratis" },
  { num: 5, desc: "El candidato acepta y pagas $4.990 para ver sus contactos", sub: "Solo si hay calce" },
];

export default function ParaPymesPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 20, padding: "3rem 2rem", textAlign: "center", color: "#fff", marginBottom: "3rem" }}>
        <p style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>Para PyMEs chilenas</p>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.3rem)", fontWeight: 800, color: "#fff", marginBottom: 14 }}>Contrata sin RRHH. Paga solo si hay calce.</h1>
        <p style={{ color: "rgba(255,255,255,0.92)", maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6, fontSize: 15 }}>
          Designed para dueños y gerentes de PyMEs que necesitan contratar bien, rápido y sin gastar en headhunters ni portales de suscripción mensual.
        </p>
        <a href="/empresa" style={{ display: "inline-block", background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>
          Registrar mi PyME
        </a>
      </header>

      {/* Dolores */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem", textAlign: "center" }}>Los problemas que resolvemos para tu PyME</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dolorPymes.map((d, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <span style={{ color: "var(--coral)", fontSize: 16 }}>✗</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)" }}>{d.dolor}</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "var(--green)", fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{d.solucion}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proceso simplificado */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem", textAlign: "center" }}>El proceso en 5 pasos simples</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pasos.map((p) => (
            <div key={p.num} style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "12px 16px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {p.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "var(--text)" }}>{p.desc}</div>
              </div>
              <span style={{ fontSize: 11, color: "var(--primary-700)", background: "var(--blue-soft)", padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>{p.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Precio */}
      <div style={{ background: "var(--blue-soft)", borderRadius: 16, padding: "1.75rem", textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 4 }}>Precio final para una PyME</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary-700)", margin: "8px 0" }}>$4.990 CLP</div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>por contacto desbloqueado · Pagas solo al pedir los datos del postulante · Sin suscripción mensual</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, textDecoration: "line-through" }}>Precio normal: $9.990 CLP</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/empresa" className="button" style={{ marginRight: 10 }}>Comenzar gratis</a>
        <a href="/precios" className="button ghost">Comparar todos los planes</a>
      </div>
    </main>
  );
}
