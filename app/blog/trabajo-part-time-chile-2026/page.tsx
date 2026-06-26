import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Trabajo Part-Time en Chile 2026: Derechos, Sueldo Mínimo y Jornada Parcial | Perfil Primero",
  description: "Todo sobre el trabajo a tiempo parcial en Chile: jornada máxima (30 hrs), sueldo mínimo proporcional, derechos laborales completos y cómo declarar en SII si trabajas part-time.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/trabajo-part-time-chile-2026" },
  openGraph: { type: "article", title: "Trabajo Part-Time Chile 2026: Derechos y Sueldo", url: "https://perfil-primero.web.app/blog/trabajo-part-time-chile-2026", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Trabajo Part-Time en Chile 2026: Derechos, Sueldo Mínimo y Jornada Parcial",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/trabajo-part-time-chile-2026" },
};

const IMM = 510000;
const jornadas = [
  { horas: 10, fraccion: 10/45, label: "10 hrs/sem" },
  { horas: 15, fraccion: 15/45, label: "15 hrs/sem" },
  { horas: 20, fraccion: 20/45, label: "20 hrs/sem" },
  { horas: 22.5, fraccion: 22.5/45, label: "22.5 hrs/sem (media jornada)" },
  { horas: 30, fraccion: 30/45, label: "30 hrs/sem (máximo part-time)" },
];

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CL");
}

const derechos = [
  { derecho: "Vacaciones", detalle: "Proporcionales a las horas trabajadas (no a 15 días completos, sino a su fracción correspondiente)", aplica: true },
  { derecho: "Gratificación legal", detalle: "Proporcional. Si la empresa tiene utilidades y aplica la Modalidad A, la gratificación se calcula sobre tu remuneración proporcional", aplica: true },
  { derecho: "Seguro de Cesantía", detalle: "Sí. Tanto empleador como trabajador cotizan normalmente sobre el sueldo proporcional", aplica: true },
  { derecho: "AFP y salud", detalle: "Obligatorio. Se cotizan sobre el sueldo imponible part-time. Si es muy bajo, la cotización mínima puede ser mayor al descuento sobre tu sueldo", aplica: true },
  { derecho: "Licencia médica", detalle: "Sí. El subsidio se calcula sobre el promedio de remuneraciones imponibles de los últimos 3 meses trabajados", aplica: true },
  { derecho: "Fuero maternal / postnatal", detalle: "Sí. Aplica exactamente igual que en jornada completa", aplica: true },
  { derecho: "Horas extras", detalle: "Solo si excedes las horas pactadas en el contrato. Si pactaste 20 hrs y trabajas 22, las 2 extra son horas extraordinarias pagadas con recargo 50%", aplica: true },
  { derecho: "Sindicato", detalle: "Puedes afiliarte a un sindicato en la empresa. Tu voto y participación son los mismos que un trabajador de jornada completa", aplica: true },
];

export default function PartTimePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Trabajo part-time Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "var(--blue-soft)", borderRadius: 20, color: "var(--color-primary)", fontWeight: 700 }}>Empleabilidad</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 5 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Trabajo Part-Time en Chile 2026: Derechos, Sueldo Mínimo y Todo lo que Debes Saber
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          La jornada parcial en Chile tiene reglas propias. Aquí cuántas horas puedes trabajar, cuánto es el mínimo que te deben pagar y qué derechos tienes exactamente igual que un trabajador de jornada completa.
        </p>
      </header>

      {/* Datos clave */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { valor: "≤ 30 hrs", titulo: "Jornada máxima", sub: "Semanales para ser considerado part-time", color: "#0a66c2" },
          { valor: "Proporcional", titulo: "Sueldo mínimo", sub: "Al % de horas vs jornada completa", color: "#15803d" },
          { valor: "Igual", titulo: "Derechos básicos", sub: "AFP, salud, vacaciones, fuero maternal", color: "#7c3aed" },
          { valor: "Por escrito", titulo: "Contrato", sub: "Obligatorio. Debe indicar horas y horario exacto", color: "#92400e" },
        ].map((c) => (
          <div key={c.titulo} style={{ background: "var(--surface)", border: `2px solid ${c.color}22`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: c.color, marginBottom: 4 }}>{c.valor}</div>
            <strong style={{ fontSize: 12, display: "block", marginBottom: 3 }}>{c.titulo}</strong>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.sub}</span>
          </div>
        ))}
      </div>

      {/* Sueldo mínimo proporcional */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "20px 24px", marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Sueldo mínimo proporcional según jornada</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          IMM 2026: <strong>{fmt(IMM)}</strong> líquido (jornada completa 45 hrs/sem). La proporción se calcula sobre las horas contratadas.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {["Jornada","% de jornada completa","Sueldo mínimo líquido"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", borderBottom: "2px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jornadas.map((j, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line)", background: j.horas === 22.5 ? "#f0f8fe" : "var(--surface)" }}>
                  <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: j.horas === 22.5 ? 700 : 400 }}>{j.label} {j.horas === 22.5 && "★"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--muted)" }}>{Math.round(j.fraccion * 100)}%</td>
                  <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: "var(--color-primary)" }}>{fmt(IMM * j.fraccion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Derechos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>¿Qué derechos tienes trabajando part-time?</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {derechos.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "13px 16px" }}>
              <span style={{ color: "var(--green)", fontSize: 16, flexShrink: 0 }}>✓</span>
              <div>
                <strong style={{ fontSize: 14, display: "block", marginBottom: 3 }}>{d.derecho}</strong>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{d.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "14px 18px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 13, display: "block", marginBottom: 4 }}>¿Buscas trabajo part-time con sueldo claro?</strong>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 8px" }}>En Perfil Primero puedes indicar tu preferencia de jornada (parcial, completa, híbrida) y las empresas llegan a ti con condiciones declaradas.</p>
        <a href="/postulante" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 12 }}>Publicar mi perfil gratis →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/blog/derechos-laborales-chile-2026" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>← Derechos laborales Chile 2026</a>
        <ShareNative title="Trabajo part-time Chile 2026: derechos y sueldo minimo" text="Cuantas horas, cuanto minimo y que derechos tienes trabajando a tiempo parcial en Chile." />
      </footer>
    </main>
  );
}
