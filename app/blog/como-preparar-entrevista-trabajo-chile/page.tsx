import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Cómo Preparar una Entrevista de Trabajo en Chile 2026 | Perfil Primero",
  description: "Guía completa para preparar una entrevista laboral en Chile: preguntas frecuentes, errores comunes y cómo negociar el sueldo desde la primera reunión.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/como-preparar-entrevista-trabajo-chile" },
};

const etapas = [
  {
    etapa: "Antes de la entrevista",
    pasos: [
      "Investiga la empresa: su historia, valores, competidores y noticias recientes",
      "Lee el perfil del cargo al revés: identifica qué competencias valoran más",
      "Prepara 3 historias de logros cuantificados con el formato Situación-Acción-Resultado",
      "Investiga el rango salarial del cargo en Perfil Primero o en el Informe de Mercado Salarial",
      "Prepara 3-5 preguntas para hacerle al entrevistador (no sobre vacaciones ni beneficios en primera ronda)",
    ],
  },
  {
    etapa: "Durante la entrevista",
    pasos: [
      "Llega 10 minutos antes. Si es online, prueba el link 30 minutos antes",
      "Empieza con el 'cuéntame de ti' preparado: 2 minutos, no 10",
      "Usa métricas siempre que puedas: 'lideré un equipo de 5', 'reduje el tiempo en 30%'",
      "Cuando pregunten por debilidades, elige una real que estés trabajando activamente",
      "Pregunta cuál es el próximo paso y cuándo sabrás una respuesta",
    ],
  },
  {
    etapa: "Negociación salarial",
    pasos: [
      "No digas un número primero. Pregunta el rango del cargo",
      "Si te preguntan tu expectativa, da un rango. El piso debe ser tu mínimo real",
      "Negocia el paquete completo: sueldo base + bonos + seguro + capacitación + días libres",
      "El primer número que dan rara vez es el final. Contraoferta siempre, aunque sea simbólico",
      "Pide 24-48h para decidir. Es estándar y muestra madurez, no duda",
    ],
  },
  {
    etapa: "Después de la entrevista",
    pasos: [
      "Envía un email de agradecimiento en las siguientes 2 horas",
      "Si no tienes respuesta en el plazo prometido, haz seguimiento una vez, no más",
      "Si te rechazan, pide feedback. El 30% de las empresas lo da y es valioso",
      "Si tienes otra oferta, infórmalo: acelera el proceso sin mentir",
    ],
  },
];

const preguntasDificiles = [
  { pregunta: "¿Por qué quieres dejar tu trabajo actual?", respuesta: "Busca un desafío más grande / quiero crecer en X área. NUNCA hables mal de tu empleador actual." },
  { pregunta: "¿Cuál es tu mayor debilidad?", respuesta: "Elige algo real pero no crítico para el rol, y explica qué haces para mejorarla." },
  { pregunta: "¿Dónde te ves en 5 años?", respuesta: "Dentro de esta empresa o industria, desarrollando X habilidad o liderando X tipo de equipo." },
  { pregunta: "¿Tienes otras ofertas?", respuesta: "Sé honesto si las tienes, sin revelar detalles. Aumenta tu posición negociadora." },
  { pregunta: "¿Por qué deberíamos contratarte a ti?", respuesta: "Conecta tus 3 competencias clave con los 3 requerimientos principales del cargo." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo Preparar una Entrevista de Trabajo en Chile 2026",
  "datePublished": "2026-06-01",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function ComoPreperarEntrevistaPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--primary-700)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "#dcfce7", borderRadius: 20, color: "#15803d" }}>Para postulantes</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Cómo Preparar una Entrevista de Trabajo en Chile: Guía Completa 2026
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Las personas que se preparan sistemáticamente tienen 3 veces más probabilidad de recibir una oferta. Aquí está el proceso exacto, desde antes de la entrevista hasta la negociación salarial.
        </p>
      </header>

      {/* Etapas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: "2.5rem" }}>
        {etapas.map((e, i) => (
          <section key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--primary-700)", marginBottom: "1rem" }}>{i + 1}. {e.etapa}</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {e.pasos.map((p, j) => (
                <li key={j} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                  <span style={{ color: "var(--primary-700)", flexShrink: 0, fontWeight: 700 }}>{j + 1}.</span> {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Preguntas difíciles */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Las preguntas difíciles — y cómo responderlas</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {preguntasDificiles.map((p, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1rem 1.25rem" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>— {p.pregunta}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{p.respuesta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tip Perfil Primero */}
      <div style={{ background: "var(--blue-soft)", borderRadius: 14, padding: "1.5rem", marginBottom: "2.5rem", borderLeft: "4px solid var(--color-primary)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>Ventaja Perfil Primero: ya sabes el sueldo antes de entrar</div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
          En Perfil Primero, la empresa declara el sueldo desde la invitación. Llegas a la entrevista ya sabiendo si el rango te conviene, sin la tensión de "¿cuánto pagan?" al final del proceso. Puedes enfocar toda tu energía en demostrar tu valor.
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <a href="/postulante" className="button">Crear mi perfil anónimo</a>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>Las empresas llegan a ti con el sueldo declarado. Sin enviar CVs a ciegas.</div>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Como preparar una entrevista de trabajo en Chile - Perfil Primero" text="Guia practica con preguntas reales y tecnicas para entrevistas laborales en Chile." />
      </div>
</main>
  );
}
