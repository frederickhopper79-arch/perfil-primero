import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casos de Éxito | Empresas y Trabajadores que encontraron el match perfecto",
  description: "Casos ilustrativos de cómo el modelo invertido de Perfil Primero mejora los procesos de selección para trabajadores y empresas en Chile.",
  alternates: { canonical: "https://perfil-primero.web.app/casos-de-exito" },
};

const casos = [
  {
    tipo: "empresa",
    empresa: "Empresa de tecnología",
    region: "Región Metropolitana",
    resultado: "Contrató 3 desarrolladores en 3 semanas",
    cifra: "21 días",
    metrica: "desde publicación hasta contratación",
    historia: "Llevábamos meses usando portales tradicionales sin encontrar candidatos de calidad. Con Perfil Primero pudimos filtrar directamente por tecnología, nivel de inglés y expectativa salarial. En menos de un mes ya teníamos a los tres perfiles que necesitábamos.",
    beneficio: "Ahorro de +80h de revisión de CVs no calificados",
  },
  {
    tipo: "trabajador",
    perfil: "Analista Financiero",
    region: "Valparaíso",
    resultado: "Encontró trabajo con 40% de aumento de sueldo",
    cifra: "+40%",
    metrica: "incremento salarial vs trabajo anterior",
    historia: "Llevaba 3 meses enviando CVs sin respuesta. En Perfil Primero, la segunda semana ya tenía 2 invitaciones con el sueldo declarado. Elegí la que mejor pagaba y tenía trabajo remoto. Nunca había negociado con tantos datos sobre la mesa.",
    beneficio: "Pasó de $1.1M a $1.55M mensuales",
  },
  {
    tipo: "empresa",
    empresa: "Clínica dental",
    region: "Concepción",
    resultado: "Contrataron asistente dental en 8 días",
    cifra: "8 días",
    metrica: "desde registro hasta contratación",
    historia: "No sabíamos si Perfil Primero funcionaría para salud. Fue una sorpresa: encontramos una asistente con exactamente la especialización que necesitábamos y con disponibilidad inmediata. El proceso fue claro y la candidata ya sabía el sueldo antes de llegar a la entrevista.",
    beneficio: "Cero postulantes sin calificación relevante",
  },
  {
    tipo: "trabajador",
    perfil: "Diseñadora UX Senior",
    region: "Región Metropolitana",
    resultado: "Eligió entre 4 invitaciones en su primera semana",
    cifra: "4",
    metrica: "invitaciones con sueldo claro en 7 días",
    historia: "El anonimato fue clave para mí. Estaba trabajando y no quería que mi jefe actual se enterara. Pude evaluar las 4 opciones con calma, comparar sueldos y elegir la empresa con mejor cultura y condiciones. Sin presión, sin urgencia artificial.",
    beneficio: "Proceso de búsqueda 100% confidencial",
  },
  {
    tipo: "omil",
    nombre: "OMIL Puerto Montt",
    region: "Los Lagos",
    resultado: "Crearon 47 perfiles activos en el primer mes",
    cifra: "47",
    metrica: "perfiles creados sin costo para los beneficiarios",
    historia: "Muchos de nuestros usuarios no saben cómo crear un perfil digital. Con Perfil Primero podemos crearlos nosotros por ellos, sin costo, y darles visibilidad frente a empresas reales. En el primer mes ya teníamos 8 contrataciones confirmadas.",
    beneficio: "8 contrataciones en el primer mes de uso",
  },
  {
    tipo: "empresa",
    empresa: "Empresa minera",
    region: "Antofagasta",
    resultado: "Cubrió 5 vacantes de operadores en 45 días",
    cifra: "45 días",
    metrica: "para cubrir 5 posiciones técnicas",
    historia: "La escasez de talento técnico en el norte es real. Perfil Primero nos permitió buscar candidatos dispuestos a relocalizarse a Antofagasta, filtrar por experiencia en faena y ver su expectativa salarial antes de contactarlos. La transparencia aceleró todo el proceso.",
    beneficio: "Redujo tiempo de contratación a la mitad vs año anterior",
  },
];

export default function CasosDeExitoPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>El modelo en acción</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Empresas y profesionales que encontraron el match perfecto</h1>
        <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
          Casos ilustrativos del modelo Perfil Primero: cómo la transparencia salarial y el modelo invertido mejoran los procesos de selección.
        </p>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>
          * Los casos y cifras son ilustrativos del modelo de plataforma. Los resultados individuales varían según sector, región y perfil.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))", gap: 20, marginBottom: "3rem" }}>
        {casos.map((caso, i) => (
          <div key={i} style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: caso.tipo === "empresa" ? "var(--blue-soft)" : caso.tipo === "omil" ? "#fef3c7" : "#dcfce7", color: caso.tipo === "empresa" ? "var(--color-dark)" : caso.tipo === "omil" ? "#92400e" : "#15803d", textTransform: "uppercase", letterSpacing: ".05em" }}>
                {caso.tipo}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{caso.region}</span>
            </div>

            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-primary)" }}>{caso.cifra}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{caso.metrica}</div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)" }}>{caso.resultado}</div>

            <blockquote style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, fontStyle: "italic", margin: 0, borderLeft: "3px solid var(--color-primary)", paddingLeft: 12 }}>
              "{caso.historia}"
            </blockquote>

            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", background: "#dcfce7", padding: "6px 10px", borderRadius: 8 }}>
              ✓ {caso.beneficio}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 18, padding: "2.5rem", textAlign: "center", color: "#fff" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Tu caso de éxito está por escribirse</h2>
        <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>
          Sé parte de la plataforma donde el sueldo siempre va primero y el proceso es transparente desde el inicio.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" style={{ background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>Soy postulante</a>
          <a href="/empresa" style={{ border: "1.5px solid rgba(255,255,255,.6)", color: "#fff", fontWeight: 600, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>Soy empresa</a>
        </div>
      </div>
    </main>
  );
}
