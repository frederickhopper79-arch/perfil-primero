import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Marca | Perfil Primero",
  robots: { index: false },
};

const colores = [
  { nombre: "Navy (primario)", hex: "#1a2f5e", uso: "Headers, textos principales, fondos de hero" },
  { nombre: "Cyan (acento)", hex: "#3aaee0", uso: "CTAs, links, badges, highlights" },
  { nombre: "Blanco", hex: "#ffffff", uso: "Fondos de tarjetas, espacios limpios" },
  { nombre: "Gris claro", hex: "#f4f6fa", uso: "Fondos de página, superficies alternativas" },
  { nombre: "Gris texto", hex: "#647488", uso: "Texto secundario, subtítulos, fechas" },
  { nombre: "Línea", hex: "#d2d9e4", uso: "Bordes, separadores, líneas de tabla" },
];

const tipografias = [
  { nombre: "Heading 1", spec: "800 · clamp(1.8rem, 4vw, 2.6rem)", uso: "Títulos principales de página" },
  { nombre: "Heading 2", spec: "700 · 1.5rem–1.75rem", uso: "Secciones, subtítulos de panel" },
  { nombre: "Body", spec: "400 · 15–16px · line-height 1.7", uso: "Texto de contenido, descripciones" },
  { nombre: "Caption / Eyebrow", spec: "600 · 12–13px · uppercase · letter-spacing .08em", uso: "Labels de categoría, breadcrumbs" },
  { nombre: "Button", spec: "700 · 14px", uso: "Texto en botones y CTAs" },
];

const logos = [
  { variante: "Logotipo principal", fondo: "#1a2f5e", texto: "#ffffff", uso: "Uso general sobre fondos oscuros" },
  { variante: "Logotipo invertido", fondo: "#ffffff", texto: "#1a2f5e", uso: "Uso sobre fondos blancos/claros" },
  { variante: "Isotipo (ícono solo)", fondo: "#3aaee0", texto: "#ffffff", uso: "Favicon, avatar, app icon" },
];

export default function BrandPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 8 }}>Uso interno</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>Guía de Marca Perfil Primero</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Referencia de identidad visual para el equipo. Los activos descargables están en la carpeta compartida del equipo.</p>
      </header>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Paleta de colores</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {colores.map((c, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ height: 72, background: c.hex }} />
              <div style={{ padding: "10px 14px", background: "var(--surface)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--heading)" }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: "var(--color-primary)", fontFamily: "monospace", margin: "2px 0" }}>{c.hex}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.uso}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Tipografía</h2>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          {tipografias.map((t, i) => (
            <div key={i} style={{ padding: "14px 20px", borderBottom: i < tipografias.length - 1 ? "1px solid var(--line)" : "none", display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--heading)", minWidth: 140 }}>{t.nombre}</span>
              <code style={{ fontSize: 11, color: "var(--color-primary)", background: "var(--blue-soft)", padding: "2px 8px", borderRadius: 4 }}>{t.spec}</code>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{t.uso}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>Fuente principal: <strong>Inter</strong> (sans-serif del sistema). Fallback: -apple-system, BlinkMacSystemFont, Segoe UI.</p>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Logotipo</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {logos.map((l, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ height: 100, background: l.fondo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 18, color: l.texto, letterSpacing: "-.02em" }}>Perfil Primero</span>
              </div>
              <div style={{ padding: "10px 14px", background: "var(--surface)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--heading)" }}>{l.variante}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{l.uso}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Tono de voz</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { titulo: "Directo y honesto", desc: "Siempre el sueldo primero. Sin eufemismos. Sin 'a convenir'." },
            { titulo: "Empático con el trabajador", desc: "Reconocemos que buscar trabajo es difícil. No juzgamos, acompañamos." },
            { titulo: "Profesional sin ser frío", desc: "Lenguaje claro, accesible. Evitar tecnicismos innecesarios." },
            { titulo: "Optimista con base real", desc: "Mostramos que el cambio es posible, pero con datos reales, no promesas vacías." },
          ].map((v, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)", marginBottom: 6 }}>{v.titulo}</div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Componentes UI clave</h2>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.5rem", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <button className="button primary" style={{ pointerEvents: "none" }}>Botón primario</button>
          <button className="button" style={{ pointerEvents: "none" }}>Botón secundario</button>
          <span style={{ background: "var(--blue-soft)", color: "var(--color-primary)", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Badge</span>
          <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Éxito</span>
          <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Advertencia</span>
          <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Error</span>
        </div>
      </section>
    </main>
  );
}
