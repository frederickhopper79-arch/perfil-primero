import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Perfil Primero",
  description: "Respuestas a las preguntas más comunes sobre Perfil Primero: cómo funciona, cuánto cuesta, qué es el modelo invertido, privacidad y seguridad de datos.",
  alternates: { canonical: "https://perfil-primero.web.app/faq" },
};

const faqs = [
  {
    categoria: "Postulantes",
    preguntas: [
      { q: "¿Cómo funciona el perfil anónimo?", a: "Tu nombre, apellido, foto y datos de contacto están ocultos hasta que tú decidas aceptar una invitación. Las empresas solo ven tu experiencia, habilidades, región y expectativa salarial." },
      { q: "¿Qué pasa después de publicar mi perfil?", a: "Las empresas verificadas pueden enviarte invitaciones con el cargo, sueldo y modalidad de trabajo declarados. Tú decides si quieres avanzar. Solo al aceptar una invitación, la empresa ve tus datos de contacto." },
      { q: "¿Cuánto cuesta publicar mi perfil?", a: "Durante el lanzamiento, publicar y activar tu perfil es completamente gratis. Tras el período de lanzamiento, la activación cuesta $999 CLP por 30 días. Si eres derivado por una OMIL municipal, siempre es gratuito." },
      { q: "¿Qué pasa después de 30 días?", a: "Tu perfil se desactiva automáticamente. Puedes renovarlo cuando quieras. Mientras no esté activo, ninguna empresa puede verlo." },
      { q: "¿Puedo desactivar mi perfil en cualquier momento?", a: "Sí, puedes desactivar tu visibilidad en cualquier momento desde tu panel. Tu perfil se guarda y puedes reactivarlo cuando necesites." },
      { q: "¿Las empresas saben quién soy antes de que yo lo autorice?", a: "No. Eso es exactamente lo que nos diferencia. Nunca compartimos tu identidad sin tu consentimiento explícito." },
    ],
  },
  {
    categoria: "Empresas",
    preguntas: [
      { q: "¿Qué significa que debo declarar el sueldo?", a: "Cuando envías una invitación a un candidato, debes indicar el rango salarial, el cargo y la modalidad (presencial/remoto/híbrido). No hay 'a convenir'. Es obligatorio." },
      { q: "¿Cómo se verifica mi empresa?", a: "Revisamos que la empresa exista legalmente en el SII, que el dominio de correo coincida, y que la descripción del negocio sea coherente. El proceso toma 24-48 horas hábiles." },
      { q: "¿Qué pasa si el candidato rechaza mi invitación?", a: "Puedes enviar una nueva invitación a otro candidato. Si el rechazo es sistemático, el sistema te dará retroalimentación sobre qué aspectos mejorar en tus invitaciones." },
      { q: "¿Cuánto cuesta acceder a los perfiles?", a: "Buscar y filtrar perfiles es siempre gratuito. Durante el lanzamiento, desbloquear el contacto de un candidato cuesta $4.990 CLP (precio normal: $9.990 CLP). También hay plan mensual ilimitado desde $29.990 CLP." },
      { q: "¿Puedo contratar directamente o debo hacerlo a través de la plataforma?", a: "Una vez que el candidato acepta tu invitación y ve tus datos, el proceso de contratación es entre ustedes. No cobramos comisión por contratación, solo por el contacto inicial." },
    ],
  },
  {
    categoria: "Privacidad y seguridad",
    preguntas: [
      { q: "¿Venden mis datos a terceros?", a: "No. Nunca. Nuestro modelo de negocio son las transacciones en la plataforma, no la venta de datos. Los datos de los postulantes son suyos." },
      { q: "¿Qué pasa con mis datos si elimino mi cuenta?", a: "Eliminamos tus datos personales en un plazo de 30 días. Solo conservamos datos anonimizados para estadísticas de uso." },
      { q: "¿La plataforma cumple con la Ley 19.628 de protección de datos de Chile?", a: "Sí. Además, estamos preparados para las exigencias de la Ley 21.719 que entró en vigor en 2026, incluyendo el derecho al olvido y la portabilidad de datos." },
    ],
  },
  {
    categoria: "OMILs y municipalidades",
    preguntas: [
      { q: "¿Qué es el acceso OMIL?", a: "Las Oficinas Municipales de Intermediación Laboral pueden crear perfiles para personas que no dominan la tecnología. El perfil es gratuito, dura 60 días y aparece igual que cualquier otro perfil en la plataforma." },
      { q: "¿La persona derivada por la OMIL puede tomar control de su perfil?", a: "Sí. Si la persona después quiere gestionar su propio perfil, puede registrarse con su RUT y el sistema transfiere el control." },
      { q: "¿Cómo se registra una OMIL en la plataforma?", a: "Contacta a nuestro equipo en omil@perfil-primero.cl con el RUT de la municipalidad y el nombre del funcionario responsable. El proceso toma 48 horas hábiles." },
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.flatMap(cat => cat.preguntas.map(p => ({
    "@type": "Question",
    "name": p.q,
    "acceptedAnswer": { "@type": "Answer", "text": p.a },
  }))),
};

export default function FaqPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Preguntas frecuentes</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Todo lo que necesitas saber</h1>
        <p style={{ color: "var(--muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Si no encuentras tu respuesta aquí, escríbenos a <a href="mailto:ayuda@perfil-primero.cl" style={{ color: "var(--primary-700)" }}>ayuda@perfil-primero.cl</a>
        </p>
      </header>

      {faqs.map((cat, ci) => (
        <section key={ci} style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-dark)", marginBottom: "1rem", padding: "6px 14px", background: "var(--blue-soft)", borderRadius: 8, display: "inline-block" }}>
            {cat.categoria}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.preguntas.map((p, i) => (
              <details key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
                <summary style={{ padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "var(--heading)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {p.q}
                  <span style={{ color: "var(--primary-700)", flexShrink: 0, marginLeft: 10, fontSize: 18 }}>+</span>
                </summary>
                <div style={{ padding: "0 18px 14px", fontSize: 13, color: "var(--muted)", lineHeight: 1.7, borderTop: "1px solid var(--line)" }}>
                  <div style={{ paddingTop: 12 }}>{p.a}</div>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>¿Tienes una pregunta que no está aquí?</p>
        <a href="/contacto" className="button">Contactar soporte</a>
      </div>
    </main>
  );
}
