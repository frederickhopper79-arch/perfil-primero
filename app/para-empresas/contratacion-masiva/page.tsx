import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contratación Masiva en Chile | Perfil Primero para Empresas",
  description: "Solución de contratación masiva para empresas en Chile. Accede a cientos de perfiles verificados con habilidades específicas y filtra por región, experiencia y sueldo.",
  alternates: { canonical: "https://perfil-primero.web.app/para-empresas/contratacion-masiva" },
};

const features = [
  { icon: "⚡", titulo: "Búsqueda masiva filtrada", desc: "Filtra por industria, región, nivel de experiencia y rango salarial para encontrar exactamente quién necesitas." },
  { icon: "📊", titulo: "Panel de gestión de pipeline", desc: "Gestiona múltiples procesos de selección en paralelo desde un solo panel. Invitaciones, chats y seguimiento integrado." },
  { icon: "🤝", titulo: "Invitaciones personalizadas masivas", desc: "Envía invitaciones a múltiples candidatos con una propuesta personalizada para cada rol específico." },
  { icon: "✅", titulo: "Candidatos pre-verificados", desc: "Todos los trabajadores en la plataforma han completado al menos el 60% de su perfil y tienen datos reales validados." },
  { icon: "💰", titulo: "Plan ilimitado para alto volumen", desc: "Contrata todo el personal que necesitas con un único pago mensual sin costo por candidato adicional." },
  { icon: "📈", titulo: "Métricas de proceso", desc: "Visualiza tasas de respuesta, tiempo hasta contratación y eficiencia de tu proceso para optimizarlo constantemente." },
];

export default function ContratacionMasivaPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", borderRadius: 20, padding: "3rem 2rem", textAlign: "center", color: "#fff", marginBottom: "3rem" }}>
        <p style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: 10 }}>Para empresas</p>
        <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.3rem)", fontWeight: 800, color: "#fff", marginBottom: 14 }}>Contratación masiva con sueldo claro desde el inicio</h1>
        <p style={{ color: "rgba(255,255,255,0.92)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.6, fontSize: 15 }}>
          Para empresas que necesitan contratar múltiples posiciones en paralelo. Un plan, acceso ilimitado a perfiles, sin costo por candidato adicional.
        </p>
        <a href="/empresa" style={{ display: "inline-block", background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14 }}>
          Comenzar proceso masivo
        </a>
      </header>

      {/* Features */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem", textAlign: "center" }}>Todo lo que necesitas para contratar en escala</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.5rem" }}>
              <span style={{ fontSize: 26, display: "block", marginBottom: 10 }}>{f.icon}</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>{f.titulo}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan */}
      <section style={{ background: "var(--blue-soft)", borderRadius: 16, padding: "2rem", textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: 10 }}>Plan empresarial ilimitado</h2>
        <p style={{ fontSize: 32, fontWeight: 800, color: "var(--primary-700)", margin: "8px 0" }}>$29.990</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>CLP / mes · IVA incluido · Sin compromisos de permanencia</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, margin: "0 auto", textAlign: "left", marginBottom: 20 }}>
          {["Búsquedas ilimitadas de perfiles", "Invitaciones ilimitadas al mes", "Panel de gestión de múltiples procesos", "Desbloqueo de contactos sin costo adicional", "Soporte prioritario vía chat"].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--text)" }}>
              <span style={{ color: "var(--green)" }}>✓</span> {item}
            </div>
          ))}
        </div>
        <a href="/empresa" className="button">Activar plan empresarial</a>
      </section>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>¿Prefieres pagar por candidato? Tenemos también el plan por contacto a $9.990 CLP.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/precios" className="button ghost">Ver todos los planes</a>
          <a href="/contacto" className="button ghost">Hablar con ventas</a>
        </div>
      </div>
    </main>
  );
}
