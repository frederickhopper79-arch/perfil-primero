import { BadgeCheck, Building2, Rocket, User, Zap } from "lucide-react";
import type { Metadata } from "next";
import { PLANS, formatCLP, withIVA } from "@/lib/domain/pricing";

export const metadata: Metadata = {
  title: "Precios · Perfil Primero",
  description: "Postulantes GRATIS en lanzamiento. Empresas: $4.990 CLP por contacto (lanzamiento) o $29.990 CLP/mes ilimitado. Sin comisiones ocultas.",
  alternates: { canonical: "https://perfil-primero.web.app/precios" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta publicar mi perfil como trabajador?",
      "acceptedAnswer": { "@type": "Answer", "text": "Durante el lanzamiento, los trabajadores pueden publicar su perfil de forma totalmente gratuita. En el futuro, se habilitará una suscripción opcional de mayor visibilidad." }
    },
    {
      "@type": "Question",
      "name": "¿Cuánto paga una empresa para contactar a un candidato?",
      "acceptedAnswer": { "@type": "Answer", "text": "Durante el lanzamiento, las empresas pagan $4.990 CLP por cada contacto desbloqueado (precio normal: $9.990 CLP). También hay plan mensual ilimitado a $29.990 CLP. No hay comisiones adicionales ni costos ocultos." }
    },
    {
      "@type": "Question",
      "name": "¿Qué pasa si el candidato rechaza la invitación?",
      "acceptedAnswer": { "@type": "Answer", "text": "El pago solo se cobra cuando el trabajador acepta y la empresa decide ver sus datos de contacto. Si el candidato rechaza, no se cobra nada." }
    },
    {
      "@type": "Question",
      "name": "¿Qué métodos de pago aceptan?",
      "acceptedAnswer": { "@type": "Answer", "text": "Aceptamos todos los medios de Mercado Pago en Chile: tarjetas de crédito y débito, transferencia bancaria y efectivo en puntos de pago." }
    },
    {
      "@type": "Question",
      "name": "¿Hay período de prueba gratuito para empresas?",
      "acceptedAnswer": { "@type": "Answer", "text": "Las empresas pueden registrarse, crear su perfil y buscar candidatos sin costo. Solo se cobra al desbloquear el contacto de un candidato específico." }
    },
  ],
};

export default function PreciosPage() {
  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
    />
    <main>
      {/* ── Hero ── */}
      <section className="pricingHero" aria-label="Precios">
        <p className="eyebrow">Transparencia total</p>
        <h1>Sin letra chica. Sin comisiones ocultas.</h1>
        <p className="lead">Un precio claro por lado, solo cuando obtienes valor real. Y te contamos hacia dónde va.</p>
      </section>

      {/* ── Banner lanzamiento ── */}
      <section style={{ maxWidth: 900, margin: "0 auto 0.5rem", padding: "0 1.25rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "linear-gradient(135deg, var(--color-dark) 0%, #0d2e4a 100%)",
          borderRadius: "14px", padding: "1rem 1.5rem",
          border: "1px solid var(--color-primary)"
        }}>
          <Rocket size={22} color="var(--color-primary)" aria-hidden="true" />
          <div>
            <strong style={{ color: "#e8f0fa", fontSize: "15px" }}>
              Precio de lanzamiento
            </strong>
            <p style={{ color: "#7a96b4", fontSize: "13px", margin: "2px 0 0" }}>
              Tarifas especiales mientras construimos comunidad. Avisamos con 30 días antes de cualquier ajuste.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tarjetas de precio actual ── */}
      <section className="pricingCards" aria-label="Precios actuales de lanzamiento" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <article className="pricingCard">
          <div className="pricingCardHeader">
            <User size={28} aria-hidden="true" />
            <h2>Postulante</h2>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
            🚀 Precio de lanzamiento
          </p>
          <div className="pricingAmount">
            <span className="pricingNumber" style={{ fontSize: "52px" }}>Gratis</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "-0.25rem 0 0.75rem" }}>Precio normal tras lanzamiento: $999 CLP</p>
          <ul className="pricingFeatures">
            <li><BadgeCheck size={16} aria-hidden="true" /> Perfil visible 30 días</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Análisis de CV con IA</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Identidad protegida hasta que aceptas</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Recibes oferta con cargo, sueldo y modalidad</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Tests de inglés, español y personalidad</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Pago vía Mercado Pago · Chile</li>
          </ul>
          <a className="button primary full" href="/postulante">Publicar mi perfil gratis</a>
          <p className="pricingNote">Sin tarjeta. Sin compromisos. Cancela cuando quieras.</p>
        </article>

        <article className="pricingCard">
          <div className="pricingCardHeader">
            <Building2 size={28} aria-hidden="true" />
            <h2>Empresa · Por contacto</h2>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
            🚀 Precio de lanzamiento
          </p>
          <div className="pricingAmount">
            <span className="pricingCurrency">$</span>
            <span className="pricingNumber">4.990</span>
            <span className="pricingPeriod">CLP / contacto</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted)", margin: "-0.25rem 0 0.75rem", textDecoration: "line-through" }}>Precio normal: $9.990 CLP</p>
          <ul className="pricingFeatures">
            <li><BadgeCheck size={16} aria-hidden="true" /> Búsqueda ilimitada de perfiles</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Enviar invitaciones sin costo</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Pagas solo al desbloquear el contacto</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Acceso a datos de contacto reales</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Panel de seguimiento por candidato</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Empresa verificada · mayor confianza</li>
          </ul>
          <a className="button secondary full" href="/empresa">Buscar candidatos</a>
          <p className="pricingNote">Solo pagas cuando avanzas. Sin mensualidades.</p>
        </article>

        <article className="pricingCard pricingCardFeatured">
          <div className="pricingCardHeader">
            <Zap size={28} aria-hidden="true" />
            <h2>Empresa · Ilimitado</h2>
          </div>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem" }}>
            ✦ Mejor valor · Contratación activa
          </p>
          <div className="pricingAmount">
            <span className="pricingCurrency">$</span>
            <span className="pricingNumber">29.990</span>
            <span className="pricingPeriod">CLP / mes</span>
          </div>
          <ul className="pricingFeatures">
            <li><BadgeCheck size={16} aria-hidden="true" /> <strong>Contactos ilimitados</strong> durante 30 días</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Sin costo extra por candidato aceptado</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Búsqueda ilimitada de perfiles</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Alertas automáticas de candidatos</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Panel de seguimiento por candidato</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Equivale a 3 contactos a precio normal</li>
          </ul>
          <a className="button primary full" href="/empresa">Contratar plan ilimitado</a>
          <p className="pricingNote">Conviene desde 7 desbloqueos al mes con precio de lanzamiento (desde el 4.° a precio normal).</p>
        </article>
      </section>

      {/* ── Nota precio lanzamiento ── */}
      <section style={{ maxWidth: 760, margin: "0 auto 2rem", padding: "0 1.25rem" }}>
        <div style={{
          background: "var(--bg-soft)",
          border: "1px solid var(--line)",
          borderRadius: "12px",
          padding: "1.25rem 1.5rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start"
        }}>
          <Rocket size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: "2px" }} aria-hidden="true" />
          <p style={{ margin: 0, fontSize: "14px", color: "var(--muted-strong)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--heading)" }}>Precio de lanzamiento</strong> — disponible mientras construimos comunidad.
            Se ajusta cuando la plataforma alcance escala.{" "}
            <strong style={{ color: "var(--heading)" }}>Avisamos con 30 días de anticipación</strong> antes de cualquier cambio,
            y los usuarios activos siempre mantienen su tarifa actual.
          </p>
        </div>
      </section>

      {/* ── Comparativa vs competencia ── */}
      <section style={{ maxWidth: 760, margin: "0 auto 2.5rem", padding: "0 1.25rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} color="var(--color-primary)" aria-hidden="true" />
            <span style={{ fontWeight: 700, color: "var(--heading)", fontSize: "1.05rem" }}>¿Por qué somos más convenientes?</span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ background: "var(--surface)" }}>
                {["Plataforma", "Modelo", "Costo empresa / contratación"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "var(--muted)", fontWeight: 600, borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Perfil Primero · Por contacto 🚀", model: "Pay-per-unlock", cost: "$4.990 CLP lanzamiento (~5 USD)", highlight: true },
                { name: "Perfil Primero · Ilimitado ✦", model: "Suscripción mensual", cost: "$29.990 CLP/mes (~33 USD)", highlight: true },
                { name: "LinkedIn Jobs", model: "CPC / suscripción", cost: "$50–500 USD / publicación" },
                { name: "Laborum.cl", model: "Publicación mensual", cost: "$30–120 USD / mes" },
                { name: "Bumeran", model: "Publicación + avisos", cost: "$20–80 USD / aviso" },
                { name: "Head hunter", model: "Comisión por contratación", cost: "8–15% del sueldo anual" }
              ].map((row) => (
                <tr key={row.name} style={{ background: row.highlight ? "var(--blue-soft)" : "transparent" }}>
                  <td style={{ padding: "10px 14px", color: row.highlight ? "var(--heading)" : "var(--text)", fontWeight: row.highlight ? 700 : 400, borderBottom: "1px solid var(--line)" }}>{row.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--muted)", borderBottom: "1px solid var(--line)" }}>{row.model}</td>
                  <td style={{ padding: "10px 14px", color: row.highlight ? "var(--color-primary)" : "var(--muted-strong)", fontWeight: row.highlight ? 700 : 400, borderBottom: "1px solid var(--line)" }}>{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="pricingFaq" aria-label="Preguntas frecuentes">
        <h2>Preguntas frecuentes</h2>
        <div className="faqGrid">
          <details className="faqItem">
            <summary>¿Cuándo paga el postulante?</summary>
            <p>En Fase 1 (lanzamiento) es gratis. Desde Fase 2, el pago activa la visibilidad del perfil por 30 días en búsquedas de empresas verificadas.</p>
          </details>
          <details className="faqItem">
            <summary>¿Cuándo paga la empresa?</summary>
            <p>Solo cuando el postulante acepta la invitación y la empresa decide desbloquear los datos de contacto. Buscar e invitar es siempre gratis.</p>
          </details>
          <details className="faqItem">
            <summary>¿Subirán los precios sin aviso?</summary>
            <p>No. Los cambios de fase se anuncian con al menos 30 días de anticipación por correo y en la plataforma. Los usuarios activos mantienen su tarifa hasta que ellos cambien.</p>
          </details>
          <details className="faqItem">
            <summary>¿Hay contratos o mensualidades para empresas?</summary>
            <p>Dos opciones: pago por contacto individual ($4.990 CLP durante lanzamiento, luego $9.990 CLP) o plan ilimitado ($29.990 CLP/mes para contactos sin límite). Sin contratos de permanencia en ningún caso.</p>
          </details>
          <details className="faqItem">
            <summary>¿Cuándo conviene el plan ilimitado?</summary>
            <p>Con el precio de lanzamiento ($4.990 por contacto), el plan ilimitado de $29.990 conviene si esperas desbloquear 7 o más contactos en el mes. Cuando rija el precio normal ($9.990), convendrá a partir del 4.º contacto.</p>
          </details>
          <details className="faqItem">
            <summary>¿Qué pasa si mi perfil vence?</summary>
            <p>Tu información queda guardada. Solo dejas de aparecer en búsquedas. Puedes reactivarte cuando quieras.</p>
          </details>
          <details className="faqItem">
            <summary>¿Hay descuentos para OMIL o municipalidades?</summary>
            <p>Sí. Las Oficinas Municipales de Información Laboral (OMIL) pueden crear perfiles de postulantes sin costo. Contacta al administrador para solicitar acceso.</p>
          </details>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="pricingTrust" aria-label="Garantías">
        <h2>Lo que siempre obtienes</h2>
        <div className="trustGrid">
          <div className="trustItem">
            <BadgeCheck size={24} aria-hidden="true" />
            <strong>Anonimato garantizado</strong>
            <p>Ninguna empresa ve tu nombre ni datos hasta que tú lo permites.</p>
          </div>
          <div className="trustItem">
            <BadgeCheck size={24} aria-hidden="true" />
            <strong>Sueldo visible desde el inicio</strong>
            <p>Cada invitación trae rango salarial, cargo y modalidad de trabajo.</p>
          </div>
          <div className="trustItem">
            <BadgeCheck size={24} aria-hidden="true" />
            <strong>Empresas verificadas</strong>
            <p>Revisamos la identidad de cada empresa antes de habilitarlas.</p>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
