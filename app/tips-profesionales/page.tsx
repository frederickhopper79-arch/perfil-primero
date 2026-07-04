import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tips para buscar trabajo en Chile 2026 | Perfil Primero",
  description: "Consejos prácticos para mejorar tu perfil profesional, negociar tu sueldo y encontrar trabajo más rápido en Chile. Basados en datos reales de la plataforma.",
  alternates: { canonical: "https://perfil-primero.web.app/tips-profesionales" },
};

const categorias = [
  {
    titulo: "Crea un perfil que destaque",
    icon: "✍️",
    tips: [
      { titulo: "Tu titular es lo más importante", desc: "Usa 10–15 palabras que describan exactamente lo que haces y en qué te especializas. Evita títulos genéricos como 'Profesional de RRHH'." },
      { titulo: "Resumen de 150–200 palabras", desc: "Describe tu propuesta de valor en primera persona. Menciona logros concretos con números cuando sea posible." },
      { titulo: "Mínimo 5 habilidades", desc: "Las empresas filtran por habilidades específicas. Incluye tanto habilidades técnicas como transversales relevantes a tu área." },
      { titulo: "Sube tu CV actualizado", desc: "El análisis con IA de Perfil Primero extrae tus datos automáticamente y sugiere mejoras para tu perfil." },
      { titulo: "Define tu rango salarial honestamente", desc: "Sé realista pero no te subestimes. Investiga el mercado con nuestras estadísticas antes de definir tu expectativa." },
    ],
  },
  {
    titulo: "Negocia tu sueldo con datos",
    icon: "💰",
    tips: [
      { titulo: "Conoce el mercado antes de negociar", desc: "Usa nuestras estadísticas salariales para saber el rango real de tu industria y nivel de experiencia en tu región." },
      { titulo: "Pide el rango máximo del presupuesto", desc: "Las empresas siempre ofrecen el mínimo. Preguntar '¿cuál es el máximo de este rango?' es una táctica válida y efectiva." },
      { titulo: "No des el primer número", desc: "Si la empresa te pregunta cuánto quieres, pregunta primero cuál es el rango del cargo. Quien da el número primero pierde poder." },
      { titulo: "Negocia beneficios si el sueldo es fijo", desc: "Si el sueldo no tiene margen, negocia días de vacaciones adicionales, trabajo remoto, bono de desempeño o capacitaciones." },
      { titulo: "Siempre confirma por escrito", desc: "Cualquier oferta verbal debe confirmarse por email antes de renunciar a tu empleo actual. No asumas nada." },
    ],
  },
  {
    titulo: "Maximiza tu visibilidad",
    icon: "📈",
    tips: [
      { titulo: "Completa tu perfil al 100%", desc: "Los perfiles completos reciben hasta 3x más invitaciones que los perfiles parciales. Cada campo cuenta." },
      { titulo: "Actualiza tu disponibilidad", desc: "Marcarte como 'activamente buscando' aumenta tu visibilidad ante las empresas que usan filtros de urgencia." },
      { titulo: "Comparte tu código QR", desc: "Tu perfil tiene un código QR que puedes compartir en LinkedIn, ferias laborales o con tu red de contactos." },
      { titulo: "Refiere a colegas", desc: "Cada colega que activas en la plataforma te da 30 días gratis de visibilidad adicional." },
      { titulo: "Responde rápido a las invitaciones", desc: "Las empresas prefieren candidatos que responden en menos de 24 horas. La rapidez genera interés y confianza." },
    ],
  },
  {
    titulo: "Entrevistas que convierten",
    icon: "🎯",
    tips: [
      { titulo: "Investiga la empresa antes de la entrevista", desc: "Revisa su LinkedIn, sitio web, reseñas en Glassdoor y noticias recientes. Menciona algo específico en la conversación." },
      { titulo: "Prepara tus respuestas STAR", desc: "Situación, Tarea, Acción, Resultado. Esta estructura da respuestas claras y concretas a preguntas conductuales." },
      { titulo: "Lleva preguntas para el entrevistador", desc: "Preguntar sobre el equipo, los desafíos del cargo y las métricas de éxito demuestra interés genuino y madurez." },
      { titulo: "Confirma los próximos pasos", desc: "Al final de la entrevista pregunta cuándo recibirás noticias. Esto evita la espera indefinida y demuestra seriedad." },
      { titulo: "Envía un email de seguimiento", desc: "Dentro de las 24 horas post-entrevista, envía un correo breve agradeciendo y reiterando tu interés." },
    ],
  },
];

export default function TipsProfesionalesPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Guía de empleo</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Tips para encontrar trabajo más rápido en Chile</h1>
        <p style={{ color: "var(--muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
          Consejos prácticos basados en datos reales de más de 1,200 perfiles activos y 340 contrataciones exitosas en Perfil Primero.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {categorias.map((cat, ci) => (
          <section key={ci}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{cat.titulo}</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cat.tips.map((tip, ti) => (
                <div key={ti} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1.125rem 1.25rem", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "var(--primary-700)", fontWeight: 800, fontSize: 15, flexShrink: 0, minWidth: 24 }}>{ti + 1}.</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 4 }}>{tip.titulo}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: "3rem", background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 16, padding: "2.5rem", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10 }}>¿Listo para aplicar estos tips?</h2>
        <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, marginBottom: 20 }}>Crea tu perfil gratis y comienza a recibir invitaciones con sueldo visible hoy mismo.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" style={{ background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "10px 24px", borderRadius: 10, fontSize: 14 }}>Crear mi perfil</a>
          <a href="/estadisticas" style={{ border: "1.5px solid rgba(255,255,255,.5)", color: "#fff", fontWeight: 600, padding: "10px 24px", borderRadius: 10, fontSize: 14 }}>Ver estadísticas salariales</a>
        </div>
      </div>
    </main>
  );
}
