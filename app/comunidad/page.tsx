import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comunidad Perfil Primero | Trabajadores y Empresas Chile",
  description: "Únete a la comunidad laboral de Chile. Recursos gratuitos, guías de empleabilidad, datos de mercado y conexión con profesionales de tu industria.",
  alternates: { canonical: "https://perfil-primero.web.app/comunidad" },
};

const recursos = [
  { icon: "📋", titulo: "Guía de perfil profesional", desc: "Crea un perfil que destaque ante las empresas correctas. Secciones, errores y tips.", href: "/blog/guia-perfil-profesional", cta: "Leer guía" },
  { icon: "💰", titulo: "Cómo negociar tu sueldo", desc: "Estrategias probadas para negociar con datos y confianza en el mercado chileno.", href: "/blog/como-negociar-tu-sueldo-en-chile", cta: "Ver estrategias" },
  { icon: "📊", titulo: "Tendencias del mercado 2026", desc: "Las industrias con más crecimiento y las habilidades más demandadas.", href: "/blog/tendencias-mercado-laboral-chile-2025", cta: "Ver tendencias" },
  { icon: "🎙️", titulo: "Preparar tu entrevista", desc: "Preguntas difíciles, cómo responderlas y qué hacer en los 30 minutos previos.", href: "/blog/como-preparar-entrevista-trabajo-chile", cta: "Prepararme" },
  { icon: "📜", titulo: "Derechos laborales 2026", desc: "Contratos, finiquitos, teletrabajo y lo que todo trabajador debe saber.", href: "/blog/derechos-laborales-chile-2026", cta: "Conocer mis derechos" },
  { icon: "🔍", titulo: "LinkedIn para buscar trabajo", desc: "Las secciones que cambian el resultado y los errores que sabotean tu perfil.", href: "/blog/linkedin-para-buscar-trabajo-chile", cta: "Optimizar LinkedIn" },
];

const faqItems = [
  { q: "¿Perfil Primero tiene foro o chat de comunidad?", r: "Estamos construyendo un espacio de comunidad. Por ahora ofrecemos recursos, guías y blog. El foro interactivo llega en Q3 2026." },
  { q: "¿Puedo compartir mi experiencia de contratación?", r: "Sí. Cuando seas contratado a través de la plataforma podrás dejar una reseña pública (anónima) sobre el proceso." },
  { q: "¿Hay grupos por industria o región?", r: "Estamos mapeando los sectores con más actividad. Los primeros grupos serán Tecnología, Salud y Retail en la RM y Los Lagos." },
  { q: "¿Cómo puedo sugerir temas para el blog?", r: "Escríbenos a contacto@perfil-primero.cl con el asunto 'Sugerencia blog'. Los temas más solicitados se publican primero." },
];

const valores = [
  { icon: "🔒", titulo: "Privacidad por diseño", desc: "Tu nombre y contacto no aparecen en ningún perfil público. Tú decides cuándo y con quién compartirlos." },
  { icon: "💵", titulo: "Sueldo primero", desc: "Ninguna oferta puede llegar sin sueldo visible. Eliminamos el 'a convenir' del proceso de contratación en Chile." },
  { icon: "✅", titulo: "Empresas verificadas", desc: "Cada empresa pasa por un proceso de verificación antes de poder contactar candidatos. Sin spam, sin fraude." },
  { icon: "📣", titulo: "Voz al trabajador", desc: "En el modelo invertido el poder cambia de lado: tú publicas, ellos postulan. No al revés." },
];

export default function ComunidadPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,var(--color-dark),var(--color-primary))", color: "#fff", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
        <span style={{ display: "inline-block", background: "rgba(255,255,255,.15)", borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Comunidad</span>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.75rem)", fontWeight: 800, color: "#fff", marginBottom: 16, maxWidth: 620, margin: "0 auto 16px" }}>
          El mercado laboral justo empieza con información
        </h1>
        <p style={{ color: "rgba(255,255,255,.85)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7, fontSize: 16 }}>
          Recursos gratuitos, datos del mercado y una plataforma construida para que los trabajadores chilenos negocien desde la información, no desde el miedo.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" style={{ background: "#fff", color: "var(--color-dark)", fontWeight: 700, padding: "12px 28px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>Publicar mi perfil gratis</a>
          <a href="/blog" style={{ border: "1.5px solid rgba(255,255,255,.6)", color: "#fff", fontWeight: 600, padding: "12px 28px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>Ver recursos →</a>
        </div>
      </section>

      {/* Stats rápidas */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "1.5rem 1.5rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap" }}>
          {[
            { val: "18", label: "artículos publicados" },
            { val: "44", label: "términos en el glosario" },
            { val: "0 CLP", label: "costo publicar tu perfil" },
            { val: "Q3 2026", label: "foro de comunidad" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-700)" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--heading)", marginBottom: 8, textAlign: "center" }}>Lo que nos mueve</h2>
        <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>Perfil Primero no es solo una plataforma — es una postura sobre cómo debería funcionar el mercado laboral en Chile.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
          {valores.map((v, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.25rem" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--heading)", marginBottom: 6 }}>{v.titulo}</div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--heading)", marginBottom: 8 }}>Recursos gratuitos</h2>
          <p style={{ color: "var(--muted)", marginBottom: 28 }}>Guías prácticas para trabajar mejor en Chile.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {recursos.map((r, i) => (
              <a key={i} href={r.href} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: 8, transition: "box-shadow .15s" }}>
                <span style={{ fontSize: 26 }}>{r.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{r.titulo}</span>
                <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{r.desc}</span>
                <span style={{ fontSize: 13, color: "var(--primary-700)", fontWeight: 700, marginTop: "auto" }}>{r.cta} →</span>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a href="/blog" style={{ color: "var(--primary-700)", fontWeight: 700, fontSize: 14 }}>Ver todos los artículos del blog →</a>
          </div>
        </div>
      </section>

      {/* Herramientas */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "3.5rem 1.5rem" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--heading)", marginBottom: 8 }}>Herramientas útiles</h2>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>Recursos interactivos para conocer tu valor en el mercado.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
          {[
            { icon: "🧮", titulo: "Calculadora salarial", desc: "Estima tu sueldo bruto, líquido y cotizaciones según tu contrato.", href: "/calculadora-salarial", cta: "Calcular" },
            { icon: "📚", titulo: "Glosario laboral", desc: "44 términos del mercado laboral chileno explicados en lenguaje claro.", href: "/glosario", cta: "Ver glosario" },
            { icon: "🏢", titulo: "Demo de empresa", desc: "Mira cómo ven los perfiles las empresas antes de registrarte.", href: "/demos", cta: "Ver demo" },
            { icon: "🗺️", titulo: "Cómo funciona", desc: "Entiende el modelo invertido en 3 pasos.", href: "/como-funciona", cta: "Entender el modelo" },
          ].map((t, i) => (
            <a key={i} href={t.href} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 26 }}>{t.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{t.titulo}</span>
              <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{t.desc}</span>
              <span style={{ fontSize: 13, color: "var(--primary-700)", fontWeight: 700, marginTop: "auto" }}>{t.cta} →</span>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--heading)", marginBottom: 28, textAlign: "center" }}>Preguntas frecuentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqItems.map((f, i) => (
              <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.1rem 1.25rem" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)", marginBottom: 6 }}>{f.q}</div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, margin: 0 }}>{f.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "3.5rem 1.5rem", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>¿Eres parte de la comunidad?</h2>
        <p style={{ color: "var(--muted)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.7 }}>Publica tu perfil y empieza a recibir ofertas con sueldo claro desde el primer mensaje. Gratis durante el lanzamiento.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/postulante" className="button primary">Soy trabajador — publicar mi perfil</a>
          <a href="/empresa" className="button">Soy empresa — buscar talento</a>
        </div>
      </section>
    </main>
  );
}
