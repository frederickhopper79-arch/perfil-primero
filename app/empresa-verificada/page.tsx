import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proceso de Verificación de Empresas | Perfil Primero",
  description: "Descubre cómo verificamos cada empresa antes de darle acceso a perfiles de trabajadores. Nuestro proceso garantiza que solo empleadores serios y legítimos usan la plataforma.",
  alternates: { canonical: "https://perfil-primero.web.app/empresa-verificada" },
};

const pasos = [
  {
    numero: "01",
    titulo: "Registro con datos legales",
    desc: "La empresa ingresa su RUT, razón social, sitio web y email corporativo. No se aceptan correos genéricos de Hotmail o Gmail.",
    icon: "📋",
  },
  {
    numero: "02",
    titulo: "Validación de RUT en SII",
    desc: "Verificamos que el RUT esté activo en el Servicio de Impuestos Internos y que la empresa esté al día con sus obligaciones tributarias.",
    icon: "🔍",
  },
  {
    numero: "03",
    titulo: "Revisión manual por nuestro equipo",
    desc: "Un miembro del equipo de Perfil Primero revisa la información, valida el sitio web y confirma que es una empresa real con actividad comercial.",
    icon: "👥",
  },
  {
    numero: "04",
    titulo: "Compromiso de transparencia",
    desc: "La empresa acepta nuestros Términos de Servicio, que incluyen la obligación de declarar siempre un rango salarial en cada invitación.",
    icon: "🤝",
  },
  {
    numero: "05",
    titulo: "Acceso habilitado en menos de 24 horas",
    desc: "Una vez verificada, la empresa puede buscar perfiles y enviar invitaciones. El proceso completo toma menos de un día hábil.",
    icon: "✅",
  },
];

const criterios = [
  { cumple: true, label: "RUT activo en el SII" },
  { cumple: true, label: "Sitio web corporativo verificado" },
  { cumple: true, label: "Email con dominio empresarial" },
  { cumple: true, label: "Razón social coincide con RUT" },
  { cumple: true, label: "Sin antecedentes de fraude o spam" },
  { cumple: false, label: "Emails de Gmail o Hotmail" },
  { cumple: false, label: "RUT con deudas en el Dicom" },
  { cumple: false, label: "Empresas con denuncias por SERNAC" },
];

const faq = [
  { q: "¿Cuánto tiempo tarda la verificación?", a: "El proceso completo toma menos de 24 horas hábiles desde el envío de los datos. En muchos casos se resuelve el mismo día." },
  { q: "¿Qué pasa si una empresa verificada actúa de mala fe?", a: "Si un trabajador reporta una conducta indebida y lo verificamos, la empresa es suspendida inmediatamente y no puede recuperar acceso." },
  { q: "¿Puedo verificar si una empresa está certificada?", a: "Sí. Todas las invitaciones muestran el badge '✅ Empresa verificada' cuando la empresa ha pasado nuestro proceso de validación." },
  { q: "¿Aceptan empresas extranjeras?", a: "Por ahora solo aceptamos empresas con RUT chileno activo. La expansión internacional está planificada para 2027." },
];

export default function EmpresaVerificadaPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8 }}>Confianza primero</p>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--heading)", marginBottom: 14 }}>Cómo verificamos cada empresa antes de darte acceso a perfiles</h1>
        <p style={{ color: "var(--muted)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
          Ninguna empresa puede contactar trabajadores sin pasar por nuestro proceso de verificación. Así protegemos a cada persona que confía en Perfil Primero.
        </p>
      </header>

      {/* Proceso */}
      <section style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
          <div style={{ position: "absolute", left: 22, top: 0, bottom: 0, width: 2, background: "var(--line)" }} />
          {pasos.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: "1.5rem", position: "relative" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--primary-700)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, zIndex: 1 }}>
                {p.numero}
              </div>
              <div style={{ flex: 1, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{p.titulo}</h3>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Criterios */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Criterios de aprobación y rechazo</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {criterios.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface)", borderRadius: 10, border: `1px solid ${c.cumple ? "var(--green)" : "var(--coral)"}22`, padding: "10px 14px" }}>
              <span style={{ fontSize: 16, color: c.cumple ? "var(--green)" : "var(--coral)" }}>{c.cumple ? "✓" : "✗"}</span>
              <span style={{ fontSize: 13, color: "var(--text)" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--heading)", marginBottom: "1.25rem" }}>Preguntas frecuentes</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faq.map((f, i) => (
            <details key={i} style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "1rem" }}>
              <summary style={{ fontWeight: 600, fontSize: 14, color: "var(--heading)", cursor: "pointer", listStyle: "none" }}>{f.q}</summary>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/empresa" className="button">Verificar mi empresa</a>
        <a href="/transparencia" className="button ghost">Ver compromisos de transparencia</a>
      </div>
    </main>
  );
}
