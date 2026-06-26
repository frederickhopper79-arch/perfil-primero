import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "Seguro de Cesantía en Chile 2026: Cuánto Cobras, Cuándo y Cómo Solicitarlo | Perfil Primero",
  description: "Guía completa del Seguro de Cesantía AFC Chile 2026: montos por mes, requisitos según tipo de contrato, cómo solicitarlo en AFC y cuándo corresponde el Fondo de Cesantía Solidario.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/seguro-de-cesantia-chile-como-cobrar" },
  openGraph: { type: "article", title: "Seguro de Cesantía Chile 2026: Cuánto y Cómo Cobrar", url: "https://perfil-primero.web.app/blog/seguro-de-cesantia-chile-como-cobrar", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Seguro de Cesantía en Chile 2026: Cuánto Cobras, Cuándo y Cómo Solicitarlo",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/seguro-de-cesantia-chile-como-cobrar" },
};

const tablaMontos = [
  { mes: "1°", pct_cta_individual: "70%", min_fcs: "Puede complementar hasta 70% del promedio" },
  { mes: "2°", pct_cta_individual: "55%", min_fcs: "Puede complementar hasta 55%" },
  { mes: "3°", pct_cta_individual: "45%", min_fcs: "Puede complementar hasta 45%" },
  { mes: "4°", pct_cta_individual: "40%", min_fcs: "Solo si accediste al FCS" },
  { mes: "5°", pct_cta_individual: "35%", min_fcs: "Solo si accediste al FCS" },
];

const requisitosIndefinido = [
  "Contrato indefinido terminado por causas del art. 159 N°4-6, art. 160 o art. 161",
  "Haber cotizado al menos 12 meses en AFC (continuos o discontinuos)",
  "No haber recibido el beneficio en los últimos 6 meses (salvo que hayas cotizado 6 meses nuevos)",
  "Solicitarlo dentro de los 30 días hábiles siguientes al despido",
];

const requisitosPlazoFijo = [
  "Contrato a plazo fijo o por obra terminado",
  "Haber cotizado al menos 6 meses en AFC (continuos o discontinuos)",
  "El beneficio solo proviene de la Cuenta Individual: no accedes al Fondo Solidario",
  "Solicitarlo dentro de los 30 días hábiles siguientes al término",
];

const pasos = [
  { n: "1", titulo: "Ingresa a afc.cl o llama al 600 800 2000", detalle: "AFC Chile es la entidad que administra el Seguro de Cesantía. También puedes acudir a cualquier sucursal con tu cédula de identidad." },
  { n: "2", titulo: "Ten lista la documentación", detalle: "Finiquito firmado, certificado de cotizaciones AFC (lo puedes descargar en afc.cl), y cédula de identidad vigente." },
  { n: "3", titulo: "Presenta la solicitud dentro de 30 días hábiles", detalle: "Este plazo es desde la fecha de término del contrato. Si te pasas, pierdes los giros del mes que hayan vencido." },
  { n: "4", titulo: "Elige la modalidad de pago", detalle: "Puedes elegir giros mensuales (1 por mes, hasta 5–7 según el fondo) o giro único total si ya tienes trabajo formal." },
];

export default function SeguroCesantiaPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">Seguro de cesantía Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 6 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          Seguro de Cesantía en Chile 2026: Cuánto Cobras, Cuándo y Cómo Solicitarlo
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Perdiste el trabajo o te desvincularon. El Seguro de Cesantía AFC existe para protegerte. Aquí cómo funciona, cuánto recibes cada mes y cómo solicitarlo sin errores.
        </p>
      </header>

      {/* Datos clave */}
      <div style={{ background: "linear-gradient(135deg,#1a2f5e,#3aaee0)", borderRadius: 14, padding: "20px 24px", marginBottom: 28, color: "#fff" }}>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>Seguro de Cesantía AFC · Datos clave 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
          {[
            { label: "Cotización trabajador", valor: "0,6%", nota: "Del sueldo bruto" },
            { label: "Cotización empleador", valor: "2,4%", nota: "Indefinido / 3% plazo fijo" },
            { label: "Primer giro", valor: "70%", nota: "Del promedio últimos 3 meses" },
            { label: "Plazo para solicitar", valor: "30 días", nota: "Hábiles desde el despido" },
          ].map((d) => (
            <div key={d.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 2 }}>{d.valor}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{d.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{d.nota}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dos cuentas */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Las 2 cuentas del Seguro de Cesantía</h2>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          <div style={{ background: "var(--surface)", border: "2px solid #0a66c2", borderRadius: 12, padding: "18px 20px" }}>
            <strong style={{ fontSize: 15, color: "#0a66c2", display: "block", marginBottom: 8 }}>Cuenta Individual</strong>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>Es tuya. Se acumula con las cotizaciones del empleador y del trabajador. La puedes cobrar siempre que te quedes sin trabajo, independientemente de la causal de despido. Si no la usas y te jubilas, se suma a tu pensión.</p>
          </div>
          <div style={{ background: "var(--surface)", border: "2px solid #7c3aed", borderRadius: 12, padding: "18px 20px" }}>
            <strong style={{ fontSize: 15, color: "#7c3aed", display: "block", marginBottom: 8 }}>Fondo de Cesantía Solidario (FCS)</strong>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>Es colectivo. Solo para contratos indefinidos terminados por art. 159 N°4-6, 160 o 161 (no por renuncia). Complementa si los fondos individuales no alcanzan los mínimos por mes. Requiere al menos 12 meses cotizando.</p>
          </div>
        </div>
      </section>

      {/* Montos por mes */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>¿Cuánto recibes cada mes?</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>Base de cálculo: promedio de los últimos 3 meses de remuneración imponible antes del despido.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {["Mes de pago", "% de la Cuenta Individual", "Fondo Solidario (si aplica)"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", borderBottom: "2px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tablaMontos.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line)", background: i === 0 ? "#f0f8fe" : "var(--surface)" }}>
                  <td style={{ padding: "11px 14px", fontWeight: i === 0 ? 700 : 400, fontSize: 14 }}>{r.mes} mes {i === 0 && "★"}</td>
                  <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: "var(--color-primary)" }}>{r.pct_cta_individual}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)" }}>{r.min_fcs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>* El % se aplica sobre el promedio de remuneración de los últimos 3 meses. Existen topes mínimos y máximos definidos anualmente por decreto.</p>
      </section>

      {/* Requisitos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Requisitos según tipo de contrato</h2>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
            <strong style={{ fontSize: 15, display: "block", marginBottom: 10, color: "#15803d" }}>Contrato indefinido</strong>
            {requisitosIndefinido.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
                <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>{r}
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
            <strong style={{ fontSize: 15, display: "block", marginBottom: 10, color: "#0a66c2" }}>Contrato a plazo fijo / por obra</strong>
            {requisitosPlazoFijo.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
                <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>→</span>{r}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Cómo solicitar el Seguro de Cesantía</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {pasos.map((p) => (
            <div key={p.n} style={{ display: "flex", gap: 14, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
              <span style={{ background: "var(--color-primary)", color: "#fff", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, flex: "0 0 auto" }}>{p.n}</span>
              <div>
                <strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>{p.titulo}</strong>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{p.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "16px 20px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 6 }}>Después de cobrar la cesantía: encuentra tu próximo trabajo</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>En Perfil Primero publicas tu perfil anónimo y las empresas verificadas te contactan con sueldo y modalidad declarados desde el primer mensaje.</p>
        <a href="/postulante" style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: 13 }}>Publicar mi perfil gratis →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/blog/finiquito-chile-guia-completa" style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>← Guía de finiquito Chile</a>
        <ShareNative title="Seguro de cesantia Chile 2026: cuanto cobras y como solicitarlo" text="Guia completa del Seguro de Cesantia AFC: montos por mes, requisitos y pasos para solicitarlo." />
      </footer>
    </main>
  );
}
