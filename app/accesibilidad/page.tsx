import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Declaración de Accesibilidad | Perfil Primero",
  description: "Perfil Primero está comprometido con la accesibilidad web. Conoce nuestro nivel de conformidad WCAG, las funciones disponibles y cómo reportar barreras de acceso.",
  alternates: { canonical: "https://perfil-primero.web.app/accesibilidad" },
};

const funciones = [
  "Navegación completa por teclado en todos los formularios y menús",
  "Etiquetas ARIA en componentes interactivos (modales, alertas, tabs)",
  "Contraste de colores que cumple WCAG 2.1 nivel AA (ratio mínimo 4.5:1)",
  "Textos alternativos en todas las imágenes informativas",
  "Enlace de salto al contenido principal en la parte superior de cada página",
  "Estructura de encabezados jerárquica (H1 → H6) para lectores de pantalla",
  "Formularios con etiquetas explícitas y mensajes de error descriptivos",
  "Soporte para zoom de texto hasta 200% sin pérdida de funcionalidad",
  "Indicadores de foco visible en todos los elementos interactivos",
  "Respeto por la preferencia `prefers-reduced-motion` del sistema operativo",
];

const limitaciones = [
  "Algunos gráficos de datos complejos no tienen descripción textual completa (en mejora)",
  "El lector de CV con Gemini AI puede no interpretar correctamente CVs en formatos no estándar",
  "El chat en tiempo real no tiene soporte completo de lectores de pantalla (en mejora para Q3 2026)",
];

export default function AccesibilidadPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>Declaración de Accesibilidad</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14 }}>
          Perfil Primero SpA está comprometida con hacer que su plataforma sea accesible para todas las personas, incluyendo aquellas con discapacidad visual, auditiva, motora o cognitiva.
        </p>
        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--blue-soft)", borderRadius: 10, fontSize: 13, color: "var(--color-dark)", display: "inline-block" }}>
          Nivel de conformidad objetivo: <strong>WCAG 2.1 Nivel AA</strong>
        </div>
      </header>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Funciones de accesibilidad implementadas</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {funciones.map((f, i) => (
            <li key={i} style={{ display: "flex", gap: 10, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span> {f}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Limitaciones conocidas</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {limitaciones.map((l, i) => (
            <li key={i} style={{ display: "flex", gap: 10, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "10px 14px", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--amber)", flexShrink: 0 }}>⚠</span> {l}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Reportar una barrera de acceso</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>
          Si encuentras alguna barrera de acceso en nuestra plataforma, por favor repórtala a nuestro equipo. Nos comprometemos a responder en un plazo máximo de 5 días hábiles.
        </p>
        <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)", padding: "1.25rem" }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            <strong style={{ color: "var(--heading)" }}>Email:</strong>{" "}
            <a href="mailto:accesibilidad@perfil-primero.cl" style={{ color: "var(--color-primary)" }}>accesibilidad@perfil-primero.cl</a>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Incluye: URL de la página afectada, descripción de la barrera, tecnología asistiva que utilizas (lector de pantalla, ampliador, etc.) y tu sistema operativo.
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--heading)", marginBottom: "1rem" }}>Organismos de supervisión</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
          En Chile, el Servicio Nacional de la Discapacidad (SENADIS) es el organismo responsable de promover la igualdad de oportunidades para personas con discapacidad. Si no obtienes una respuesta satisfactoria de nuestra parte, puedes contactar a SENADIS en <strong>senadis.cl</strong>.
        </p>
      </section>
    </main>
  );
}
