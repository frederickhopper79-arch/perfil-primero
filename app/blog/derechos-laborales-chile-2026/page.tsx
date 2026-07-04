import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";


export const metadata: Metadata = {
  title: "Derechos Laborales en Chile 2026: Lo que Todo Trabajador Debe Saber | Perfil Primero",
  description: "Guía actualizada de derechos laborales en Chile 2026: contrato de trabajo, despidos, permisos, teletrabajo y las últimas modificaciones al Código del Trabajo.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/derechos-laborales-chile-2026" },
};

const derechos = [
  {
    titulo: "Contrato de trabajo",
    items: [
      "Todo contrato debe estar firmado dentro de 15 días de inicio de funciones (5 días si es obra o faena)",
      "Las condiciones esenciales (sueldo, cargo, jornada) no pueden modificarse unilateralmente por el empleador",
      "El sueldo mínimo en Chile desde julio 2025 es $500.000 mensuales brutos",
      "Si trabajas más de 3 meses sin contrato, se presume relación laboral indefinida",
    ],
  },
  {
    titulo: "Jornada de trabajo",
    items: [
      "La jornada máxima ordinaria es 40 horas semanales (reducción gradual aprobada en 2023)",
      "Las horas extras deben acordarse por escrito y pagarse con 50% de recargo",
      "El trabajador puede rechazar horas extras si no hay acuerdo previo escrito",
      "La jornada de 4x3 (cuatro días de trabajo, tres de descanso) es legal si se acuerda con el empleador",
    ],
  },
  {
    titulo: "Teletrabajo (Ley 21.220)",
    items: [
      "El empleador debe proporcionar o costear los equipos y herramientas necesarios",
      "El trabajador tiene derecho a desconectarse fuera de su horario pactado",
      "La modalidad remota debe estar en el contrato o en un anexo firmado",
      "El empleador no puede exigir disponibilidad permanente ni comunicaciones fuera de jornada",
    ],
  },
  {
    titulo: "Vacaciones y permisos",
    items: [
      "Vacaciones legales: mínimo 15 días hábiles al año (derecho adquirido tras 1 año de servicio)",
      "Trabajadores con 10+ años en el mismo empleador tienen un día adicional por cada 3 años extra",
      "Permiso de paternidad: 5 días hábiles pagados (puede ser consecutivo o dentro del primer mes)",
      "Permiso de alimentación: hasta 2 bloques de 30 minutos o 1 bloque de 60 minutos al día",
    ],
  },
  {
    titulo: "Despido y finiquito",
    items: [
      "El empleador debe dar aviso con 30 días de anticipación o pagar indemnización sustitutiva",
      "La indemnización por años de servicio es 30 días de sueldo base por año, con tope de 11 años",
      "El finiquito debe pagarse dentro de 10 días hábiles desde el término de funciones",
      "Puedes reclamar ante la Inspección del Trabajo o el Juzgado Laboral si no pagas el finiquito",
      "El despido por 'necesidades de empresa' requiere que el empleador pruebe la causal",
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Derechos Laborales en Chile 2026: Lo que Todo Trabajador Debe Saber",
  "datePublished": "2026-06-20",
  "dateModified": "2026-06-22",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
};

export default function DerechosLaboralesPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href="/blog" style={{ fontSize: 12, color: "var(--primary-700)" }}>← Blog</a>
          <span style={{ fontSize: 11, padding: "2px 8px", background: "#dcfce7", borderRadius: 20, color: "#15803d" }}>Para trabajadores</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.25 }}>
          Derechos Laborales en Chile 2026: Lo Que Todo Trabajador Debe Saber
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          El Código del Trabajo chileno te protege, pero solo si lo conoces. Esta guía resume los derechos más importantes en lenguaje simple, con las actualizaciones vigentes en 2026.
        </p>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", background: "#fef3c7", padding: "8px 12px", borderRadius: 8, display: "inline-block" }}>
          ⚠ Esta guía es informativa y no reemplaza asesoría legal. Para situaciones específicas, consulta a un abogado laboral o a la Inspección del Trabajo.
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: "2.5rem" }}>
        {derechos.map((d, i) => (
          <section key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem 1.5rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-dark)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--primary-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
              {d.titulo}
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
              {d.items.map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>Recursos oficiales</div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 12, color: "var(--muted)", lineHeight: 2 }}>
          <li>Dirección del Trabajo — <strong>inspección.dt.gob.cl</strong></li>
          <li>Código del Trabajo Chile — <strong>bcn.cl/leychile</strong></li>
          <li>Juzgados Laborales — <strong>pjud.cl</strong></li>
        </ul>
      </div>

      <div style={{ textAlign: "center" }}>
        <a href="/postulante" className="button">Buscar trabajo con derechos claros</a>
      </div>
    
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
        <ShareNative title="Derechos laborales en Chile 2026 - Perfil Primero" text="Los derechos fundamentales del trabajador chileno actualizados para 2026." />
      </div>
</main>
  );
}
