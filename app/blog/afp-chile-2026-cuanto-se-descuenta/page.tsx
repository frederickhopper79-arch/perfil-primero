import type { Metadata } from "next";
import { ShareNative } from "@/components/ui/share-native";

export const metadata: Metadata = {
  title: "AFP Chile 2026: Cuánto Se Descuenta, Qué Cubre y Cómo Elegir | Perfil Primero",
  description: "Todo sobre las AFP en Chile 2026: porcentaje de descuento, comisiones por AFP, tipos de fondos, SIS, pensión garantizada y cómo comparar antes de elegir.",
  alternates: { canonical: "https://perfil-primero.web.app/blog/afp-chile-2026-cuanto-se-descuenta" },
  openGraph: { type: "article", title: "AFP Chile 2026: Cuánto Se Descuenta y Cómo Elegir", url: "https://perfil-primero.web.app/blog/afp-chile-2026-cuanto-se-descuenta", siteName: "Perfil Primero", locale: "es_CL" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "AFP Chile 2026: Cuánto Se Descuenta, Qué Cubre y Cómo Elegir",
  "datePublished": "2026-06-25",
  "author": { "@type": "Organization", "name": "Perfil Primero SpA" },
  "publisher": { "@type": "Organization", "name": "Perfil Primero SpA", "logo": { "@type": "ImageObject", "url": "https://perfil-primero.web.app/isotipo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://perfil-primero.web.app/blog/afp-chile-2026-cuanto-se-descuenta" },
};

const afps = [
  { nombre: "Capital", comision: "1.44%", total: "12.38% + 1.44% = 13.82%", rentabilidad5a: "5.2%", nota: "Una de las más grandes por afiliados" },
  { nombre: "Cuprum", comision: "1.44%", total: "13.82%", rentabilidad5a: "5.8%", nota: "Alta rentabilidad histórica en fondo A" },
  { nombre: "Habitat", comision: "1.27%", total: "13.65%", rentabilidad5a: "5.5%", nota: "Menor comisión entre las grandes" },
  { nombre: "Modelo", comision: "0.58%", total: "13.06%", rentabilidad5a: "5.1%", nota: "Comisión más baja del mercado" },
  { nombre: "PlanVital", comision: "1.16%", total: "13.54%", rentabilidad5a: "4.9%", nota: "Opción para trabajos de temporada" },
  { nombre: "ProVida", comision: "1.45%", total: "13.83%", rentabilidad5a: "5.3%", nota: "Red de atención más extensa" },
  { nombre: "Uno", comision: "0.69%", total: "13.07%", rentabilidad5a: "5.0%", nota: "Segunda comisión más baja" },
];

const fondos = [
  { letra: "A", perfil: "Más riesgoso", renta_variable: "80%", para: "Menores de 35 años con horizonte largo", retorno: "Mayor potencial a largo plazo", color: "#dc2626" },
  { letra: "B", perfil: "Riesgoso", renta_variable: "60%", para: "Entre 36-45 años", retorno: "Buen balance crecimiento/seguridad", color: "#d97706" },
  { letra: "C", perfil: "Moderado", renta_variable: "40%", para: "Entre 46-55 años", retorno: "Equilibrado", color: "#15803d" },
  { letra: "D", perfil: "Conservador", renta_variable: "20%", para: "Mayores de 56 años (hombres), 51 (mujeres)", retorno: "Prioriza protección del capital", color: "#0a66c2" },
  { letra: "E", perfil: "Más conservador", renta_variable: "5%", para: "Cercanos a pensión o en ella", retorno: "Mínima variación, máxima estabilidad", color: "#7c3aed" },
];

export default function AfpPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Migas de pan" style={{ fontSize: 13, color: "var(--muted)", marginBottom: "1.5rem" }}>
        <a href="/">Inicio</a> {" › "}<a href="/blog">Blog</a> {" › "}<span aria-current="page">AFP Chile 2026</span>
      </nav>
      <header style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "3px 10px", background: "#fef3c7", borderRadius: 20, color: "#92400e", fontWeight: 700 }}>Derechos laborales</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>25 junio 2026 · 6 min de lectura</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.3rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14, lineHeight: 1.2 }}>
          AFP Chile 2026: Cuánto Se Descuenta, Qué Cubre y Cómo Elegir
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7 }}>
          Entiende exactamente cuánto de tu sueldo va a la AFP, cuánto corresponde a cada concepto, y cómo comparar AFP para pagar menos comisión sin sacrificar rentabilidad.
        </p>
      </header>

      {/* Resumen descuentos */}
      <div style={{ background: "linear-gradient(135deg,#1a2f5e,#3aaee0)", borderRadius: 14, padding: "22px 26px", marginBottom: 28, color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>Descuentos previsionales · Chile 2026 (sobre sueldo bruto)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { concepto: "AFP (ahorro)", pct: "10%", nota: "Va a tu cuenta individual" },
            { concepto: "AFP (comisión)", pct: "~1.27–1.45%", nota: "Varía por AFP elegida" },
            { concepto: "SIS (seguro)", pct: "~1.49%", nota: "Lo paga el empleador" },
            { concepto: "Salud", pct: "7%", nota: "FONASA o Isapre" },
            { concepto: "Seg. Cesantía", pct: "0.6%", nota: "Tú + 2.4% empleador" },
          ].map((d) => (
            <div key={d.concepto} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 2 }}>{d.pct}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{d.concepto}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{d.nota}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparativa AFP */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Comparativa de AFP Chile 2026</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>La comisión es el porcentaje ADICIONAL al 10% de ahorro que cobra cada AFP por administrar tu fondo.</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)" }}>
                {["AFP", "Comisión", "Total descuento", "Rentab. 5 años (F.A)", "Nota"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "2px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {afps.map((a, i) => (
                <tr key={a.nombre} style={{ borderBottom: "1px solid var(--line)", background: a.comision === "0.58%" ? "#f0f8fe" : "var(--surface)" }}>
                  <td style={{ padding: "11px 14px", fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{a.nombre} {a.comision === "0.58%" && <span style={{ fontSize: 9, background: "var(--primary-700)", color: "#fff", borderRadius: 4, padding: "1px 5px", marginLeft: 4 }}>MÁS BARATA</span>}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{a.comision}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)" }}>{a.total}</td>
                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--green)", fontWeight: 700 }}>{a.rentabilidad5a}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)" }}>{a.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>* Comisiones y rentabilidades orientativas. Consulta datos exactos en superintendencia.cl/afp</p>
      </section>

      {/* Tipos de fondos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Los 5 fondos de AFP: ¿cuál te conviene?</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {fondos.map((f) => (
            <div key={f.letra} style={{ display: "flex", gap: 14, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px", borderLeft: `4px solid ${f.color}` }}>
              <div style={{ background: f.color, color: "#fff", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flex: "0 0 auto" }}>{f.letra}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <strong style={{ fontSize: 14 }}>{f.perfil}</strong>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>· Renta variable: {f.renta_variable}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>{f.para}</div>
                <div style={{ fontSize: 12, color: "var(--muted-strong)" }}>{f.retorno}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "16px 20px", marginBottom: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
        <strong style={{ fontSize: 14, display: "block", marginBottom: 6 }}>¿Tu AFP está descontando bien de tu sueldo?</strong>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 10px" }}>Usa nuestra calculadora salarial para ver el bruto/líquido estimado según tu sector y experiencia en Chile.</p>
        <a href="/calculadora-salarial" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 13 }}>Calculadora salarial gratuita →</a>
      </div>

      <footer style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
        <a href="/blog/sueldo-minimo-chile-2026" style={{ color: "var(--primary-700)", fontWeight: 600, fontSize: 14 }}>← Sueldo mínimo Chile 2026</a>
        <ShareNative title="AFP Chile 2026: cuanto se descuenta y como elegir" text="Comparativa completa de AFP: comisiones, fondos, y cuanto va realmente a tu cuenta individual." />
      </footer>
    </main>
  );
}
