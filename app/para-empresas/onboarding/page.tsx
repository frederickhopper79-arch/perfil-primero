import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Inicio para Empresas | Perfil Primero",
  description: "Cómo empezar a buscar talento en Perfil Primero en 4 pasos: verificación, búsqueda de perfiles, invitaciones y contratación.",
  alternates: { canonical: "https://perfil-primero.web.app/para-empresas/onboarding" },
};

const pasos = [
  {
    num: 1,
    titulo: "Regístrate y verifica tu empresa",
    duracion: "5-10 minutos",
    desc: "Crea tu cuenta con el correo corporativo y completa el perfil de empresa. Revisamos tu RUT en el SII y verificamos que el dominio de correo corresponda a la empresa. El proceso toma 24-48 horas hábiles.",
    tips: [
      "Usa tu correo @empresa.cl, no uno de Gmail",
      "Ten a mano el RUT de la empresa y el nombre del representante legal",
      "La descripción de la empresa influye en si los candidatos aceptan tus invitaciones",
    ],
    estado: "obligatorio",
  },
  {
    num: 2,
    titulo: "Busca perfiles que calzan con tu necesidad",
    duracion: "10-30 minutos",
    desc: "Usa los filtros de sector, región, nivel de experiencia y rango salarial para encontrar los perfiles que necesitas. Los perfiles muestran experiencia, habilidades y expectativa salarial, pero no el nombre ni los datos de contacto.",
    tips: [
      "Filtra primero por sector y luego afina por habilidades específicas",
      "El rango salarial del candidato vs. lo que ofreces es el filtro más importante",
      "Guarda los perfiles que te interesan en tu pipeline antes de decidir",
    ],
    estado: "libre",
  },
  {
    num: 3,
    titulo: "Envía invitaciones con sueldo declarado",
    duracion: "2-5 minutos por invitación",
    desc: "Al invitar a un candidato, debes declarar el cargo, el rango salarial y la modalidad de trabajo. El candidato ve toda esta información antes de decidir si acepta. No hay 'a convenir'.",
    tips: [
      "Invitaciones con rango salarial tienen 2.4x más tasa de aceptación",
      "Personaliza el mensaje: menciona algo específico del perfil del candidato",
      "El candidato tiene 7 días para responder. Puedes enviar un recordatorio a los 3 días",
    ],
    estado: "obligatorio",
  },
  {
    num: 4,
    titulo: "El candidato acepta → paga y contacta",
    duracion: "Inmediato",
    desc: "Cuando el candidato acepta tu invitación, pagas $4.990 CLP (precio lanzamiento) para desbloquear sus datos de contacto. A partir de ahí, el proceso es entre ustedes: entrevista, oferta y contratación.",
    tips: [
      "El candidato también ve tus datos de contacto cuando acepta",
      "Te recomendamos contactar dentro de las primeras 24 horas: la motivación es máxima",
      "El plan mensual ilimitado ($29.990) conviene si desbloqueas 7 o más contactos al mes con precio de lanzamiento",
    ],
    estado: "pago",
  },
];

export default function OnboardingEmpresasPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>Guía de inicio · Empresas</p>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Cómo empezar a contratar en Perfil Primero</h1>
        <p style={{ color: "var(--muted)", maxWidth: 460, margin: "0 auto", lineHeight: 1.6, fontSize: 14 }}>
          En menos de 48 horas puedes tener tu primer candidato potencial en el pipeline. Este es el proceso exacto.
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: "3rem" }}>
        {pasos.map((p) => (
          <div key={p.num} style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", padding: "1.5rem" }}>
            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {p.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{p.titulo}</h2>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)", padding: "2px 8px", background: "var(--bg-soft)", borderRadius: 20 }}>⏱ {p.duracion}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: p.estado === "obligatorio" ? "#dbeafe" : p.estado === "pago" ? "#fef3c7" : "#dcfce7", color: p.estado === "obligatorio" ? "#1d4ed8" : p.estado === "pago" ? "#92400e" : "#15803d" }}>
                      {p.estado === "obligatorio" ? "Requerido" : p.estado === "pago" ? "$4.990 CLP" : "Gratis"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>{p.desc}</p>
            <div style={{ background: "var(--blue-soft)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-dark)", marginBottom: 6 }}>TIPS</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {p.tips.map((t, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6 }}>
                    <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/empresa" className="button">Comenzar registro de empresa</a>
        <a href="/precios" className="button ghost">Ver planes y precios</a>
      </div>
    </main>
  );
}
