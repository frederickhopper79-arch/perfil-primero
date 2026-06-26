import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Inicio para Postulantes | Perfil Primero",
  description: "Crea tu perfil anónimo en 4 pasos y empieza a recibir invitaciones laborales con sueldo declarado desde el primer contacto.",
  alternates: { canonical: "https://perfil-primero.web.app/para-postulantes/onboarding" },
};

const pasos = [
  {
    numero: 1,
    titulo: "Crea tu perfil anónimo",
    duracion: "5 minutos",
    descripcion: "Ingresa con tu email y completa tu perfil profesional. Tu nombre, foto y datos de contacto permanecen ocultos hasta que tú lo decidas.",
    tips: [
      "Usa un resumen profesional de 2-3 oraciones que describa tu experiencia y lo que buscas",
      "Agrega tu sector, nivel de experiencia y pretensión salarial — esto ayuda al algoritmo a encontrarte",
      "Cuanto más completo el perfil, más apareces en búsquedas de empresas verificadas",
    ],
    icono: "👤",
    color: "#3aaee0",
  },
  {
    numero: 2,
    titulo: "Activa tu visibilidad",
    duracion: "2 minutos",
    descripcion: "Durante el lanzamiento, activar tu perfil es completamente gratis. Tu perfil queda visible para empresas verificadas durante 30 días. Si consigues trabajo antes, sin costo extra.",
    tips: [
      "Gratis durante el período de lanzamiento — sin tarjeta requerida",
      "La visibilidad se activa de inmediato",
      "Tras el lanzamiento, el precio será $999 CLP por 30 días",
    ],
    icono: "✅",
    color: "#057642",
  },
  {
    numero: 3,
    titulo: "Recibe invitaciones con sueldo",
    duracion: "Días o semanas",
    descripcion: "Las empresas verificadas te envían invitaciones que incluyen el rango salarial, tipo de contrato y modalidad. Tú decides si aceptar o rechazar cada una.",
    tips: [
      "Recibes notificaciones por email con cada nueva invitación",
      "Puedes ver el sueldo, el cargo y las condiciones antes de responder",
      "Rechazar no tiene consecuencias — es parte normal del proceso",
    ],
    icono: "📬",
    color: "#f5a623",
  },
  {
    numero: 4,
    titulo: "Acepta y desbloquea el contacto",
    duracion: "Tú decides el ritmo",
    descripcion: "Si aceptas una invitación, la empresa puede desbloquear tus datos de contacto (pagan ellos, no tú). A partir de ahí, el proceso sigue como en cualquier entrevista.",
    tips: [
      "Tu identidad solo se revela cuando TÚ aceptas — nunca antes",
      "Puedes tener varias invitaciones activas al mismo tiempo",
      "El proceso de entrevista y contratación lo coordinas directamente con la empresa",
    ],
    icono: "🤝",
    color: "#1a2f5e",
  },
];

const preguntas = [
  {
    q: "¿Las empresas saben quién soy antes de que yo acepte?",
    a: "No. Tu nombre, foto y datos de contacto están ocultos. Las empresas solo ven tu experiencia, sector y pretensión salarial. Tu identidad se revela solo cuando tú aceptas una invitación y la empresa desbloquea el contacto.",
  },
  {
    q: "¿Qué pasa si no recibo invitaciones?",
    a: "Asegúrate de tener el perfil completo (experiencia, sector, pretensiones salariales realistas). Un perfil completo recibe 4x más invitaciones. Si después de 15 días no recibes ninguna, escríbenos y revisamos tu perfil juntos.",
  },
  {
    q: "¿Puedo cancelar mi visibilidad en cualquier momento?",
    a: "Sí. Puedes desactivar tu perfil desde la consola en cualquier momento. El pago es por período de 30 días y no se reembolsa proporcionalmente, pero no hay compromiso de renovación automática.",
  },
  {
    q: "¿Cuántas invitaciones puedo recibir simultáneamente?",
    a: "Sin límite. Puedes recibir invitaciones de múltiples empresas al mismo tiempo y decidir cuáles aceptar. Es normal y esperado que compares opciones.",
  },
];

export default function PostulantesOnboardingPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ display: "inline-block", background: "#e8f6fc", borderRadius: 24, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginBottom: 16, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Guía de inicio — Postulantes
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Cómo empezar en Perfil Primero
        </h1>
        <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          En 4 pasos simples tendrás un perfil activo que atrae empresas verificadas con sueldo declarado desde el primer contacto.
        </p>
      </header>

      {/* Timeline de pasos */}
      <div style={{ position: "relative", marginBottom: "3.5rem" }}>
        {/* Línea vertical */}
        <div style={{ position: "absolute", left: 27, top: 40, bottom: 40, width: 2, background: "var(--line)", zIndex: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {pasos.map((paso) => (
            <div key={paso.numero} style={{ display: "flex", gap: 20, position: "relative", zIndex: 1 }}>
              {/* Círculo numerado */}
              <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: paso.color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}>
                {paso.numero}
              </div>

              {/* Contenido */}
              <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.25rem 1.5rem", boxShadow: "var(--shadow-card)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 20 }}>{paso.icono}</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{paso.titulo}</h2>
                  <span style={{ fontSize: 11, background: "var(--bg-soft)", color: "var(--muted)", borderRadius: 20, padding: "2px 10px", fontWeight: 600, marginLeft: "auto" }}>
                    {paso.duracion}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 12px" }}>{paso.descripcion}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {paso.tips.map((tip, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
                      <span style={{ color: paso.color, flexShrink: 0, marginTop: 1 }}>✓</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparación: antes vs después */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "1.75rem", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem", textAlign: "center" }}>Buscar trabajo antes vs. con Perfil Primero</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#cc1016", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>Búsqueda tradicional</div>
            {["Envías CVs a ciegas", "No sabes el sueldo hasta el final", "Entrevistas para descubrir condiciones", "Semanas sin saber por qué te rechazaron", "Tu CV circula sin tu control"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--muted)", marginBottom: 6, lineHeight: 1.5 }}>
                <span style={{ color: "#cc1016" }}>✗</span> {item}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".05em" }}>Con Perfil Primero</div>
            {["Las empresas llegan a ti", "Sueldo declarado desde la invitación", "Tú decides qué procesos avanzar", "Sin respuesta = sin adivinar", "Identidad protegida hasta que aceptas"].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text)", marginBottom: 6, lineHeight: 1.5 }}>
                <span style={{ color: "var(--green)" }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Preguntas frecuentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {preguntas.map((p, i) => (
            <details key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "1rem 1.25rem" }}>
              <summary style={{ fontWeight: 600, fontSize: 14, color: "var(--heading)", cursor: "pointer", listStyle: "none" }}>
                {p.q}
              </summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>{p.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ textAlign: "center", background: "linear-gradient(135deg, var(--color-dark), var(--color-primary))", borderRadius: 20, padding: "2.5rem 2rem", color: "white" }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>🚀</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10, margin: "0 0 10px" }}>¿Listo para empezar?</h2>
        <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 20, lineHeight: 1.6 }}>
          Crea tu perfil anónimo y actívalo gratis durante el lanzamiento. Las empresas verificadas llegan a ti.
        </p>
        <a
          href="/postulante"
          style={{ display: "inline-block", background: "white", color: "var(--color-dark)", fontWeight: 700, fontSize: 15, padding: "14px 32px", borderRadius: 10, textDecoration: "none" }}
        >
          Crear mi perfil ahora
        </a>
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Sin tarjeta requerida para registrarte</div>
      </div>
    </main>
  );
}
