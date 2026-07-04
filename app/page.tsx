import type { Metadata } from "next";
import { BadgeCheck, Building2, ChevronRight, Eye, Lock, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { SocialProofCounter } from "@/components/social-proof-counter";

export const metadata: Metadata = {
  title: "Trabajo en Chile con sueldo claro desde el primer contacto",
  description: "La plataforma laboral invertida de Chile. Publica tu perfil anónimo y recibe ofertas de empresas verificadas con cargo, sueldo y modalidad antes de revelar tus datos.",
  alternates: { canonical: "https://perfil-primero.web.app/" },
  openGraph: {
    title: "Perfil Primero | Publica primero, decide con sueldo a la vista",
    description: "Trabajo en Chile sin exponer tus datos. Empresas verificadas llegan a ti con sueldo y condiciones claras.",
    url: "https://perfil-primero.web.app",
    images: [{ url: "/hero-marketplace.png", width: 1200, height: 630, alt: "Perfil Primero" }],
  },
};

const testimonials = [
  {
    quote: "Recibí 3 ofertas en mi primera semana. Lo mejor: ya sabía el sueldo antes de responder.",
    name: "Ingeniera de Software",
    region: "Región Metropolitana",
    icon: "💻"
  },
  {
    quote: "Llevaba 4 meses buscando. Aquí encontré trabajo en 18 días sin mandar un solo CV ciego.",
    name: "Contador Auditor",
    region: "Valparaíso",
    icon: "📊"
  },
  {
    quote: "Tenía miedo de que mi jefe actual se enterara. El anonimato me dio tranquilidad total.",
    name: "Jefa de Marketing",
    region: "Concepción",
    icon: "📣"
  }
];

const vsTradicional = [
  { aspecto: "Quién busca a quién", tradicional: "Tú mandas CVs al vacío", perfilPrimero: "Las empresas llegan a ti" },
  { aspecto: "Sueldo", tradicional: "Lo sabes en la última entrevista", perfilPrimero: "Visible desde la primera invitación" },
  { aspecto: "Privacidad", tradicional: "Tu nombre circula sin control", perfilPrimero: "Anónimo hasta que tú aceptas" },
  { aspecto: "Empresas", tradicional: "No sabes si la empresa es real", perfilPrimero: "Todas están verificadas" },
  { aspecto: "Tiempo invertido", tradicional: "Horas en procesos que no avanzan", perfilPrimero: "Solo avanzas si hay calce real" },
  { aspecto: "Poder de decisión", tradicional: "La empresa decide todo", perfilPrimero: "Tú decides si avanzas o rechazas" }
];

const stats = [
  { value: "Gratis", label: "para postulantes", sub: "sin costo para publicar tu perfil" },
  { value: "100%", label: "empresas verificadas", sub: "antes de hablar contigo" },
  { value: "0", label: "CVs enviados al vacío", sub: "solo contactos con calce real" }
];

const sectores = [
  "Tecnología", "Marketing", "Finanzas", "Operaciones", "Ventas",
  "RRHH", "Legal", "Salud", "Ingeniería", "Educación"
];

export default function Home() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="homeHero" aria-label="Propuesta de valor principal">
        <p className="eyebrow">El empleo que viene a ti · Chile</p>
        <h1>Deja de enviar CVs al vacío. Publica tu perfil y que las empresas lleguen a ti con sueldo claro.</h1>
        <p className="lead">
          Las empresas verificadas te encuentran. Te proponen trabajo con cargo, modalidad y renta <strong>antes</strong> de pedirte datos. Tú decides si avanzas o rechazas — sin presión, sin sorpresas.
        </p>
        <div className="homeHeroActions">
          <a className="button primary" href="/postulante">
            Publicar mi perfil gratis <ChevronRight size={16} aria-hidden="true" />
          </a>
          <a className="button secondary" href="/como-funciona">Ver cómo funciona</a>
        </div>
        <div className="heroProofStrip">
          <span><BadgeCheck size={13} aria-hidden="true" /> Anónimo hasta que tú aceptas</span>
          <span><BadgeCheck size={13} aria-hidden="true" /> Solo empresas verificadas</span>
          <span><BadgeCheck size={13} aria-hidden="true" /> Sueldo visible siempre</span>
          <span><BadgeCheck size={13} aria-hidden="true" /> Gratis para postulantes</span>
        </div>
        <SocialProofCounter />
      </section>

      {/* ── Cómo funciona: 3 pasos ── */}
      <section className="homeStepsStrip" aria-label="Cómo funciona">
        <div className="homeStep">
          <span className="stepNum">1</span>
          <div>
            <strong>Publicas tu perfil</strong>
            <p>Anónimo, con renta esperada y disponibilidad. Las empresas no ven tus datos hasta que tú lo permites.</p>
          </div>
        </div>
        <span className="stepArrow" aria-hidden="true">→</span>
        <div className="homeStep">
          <span className="stepNum">2</span>
          <div>
            <strong>Recibes invitaciones</strong>
            <p>Cada oferta viene con cargo, sueldo y modalidad visible. Sin sorpresas.</p>
          </div>
        </div>
        <span className="stepArrow" aria-hidden="true">→</span>
        <div className="homeStep">
          <span className="stepNum">3</span>
          <div>
            <strong>Tú decides</strong>
            <p>Aceptas, rechazas o pides más información. Tu identidad queda protegida hasta que avances.</p>
          </div>
        </div>
        <a className="homeStepsMore" href="/como-funciona">Ver detalle <ChevronRight size={14} aria-hidden="true" /></a>
      </section>

      {/* ── Stats ── */}
      <section className="homeStats" aria-label="Datos de la plataforma">
        {stats.map((s) => (
          <div key={s.label} className="homeStat">
            <span className="homeStatValue">{s.value}</span>
            <strong>{s.label}</strong>
            <span className="homeStatSub">{s.sub}</span>
          </div>
        ))}
      </section>

      {/* ── Diferenciador: Perfil Primero vs tradicional ── */}
      <section className="homeVs" aria-label="Comparativa con búsqueda tradicional">
        <div className="homeVsHeader">
          <p className="eyebrow">¿Por qué Perfil Primero?</p>
          <h2>El modelo laboral en Chile está al revés.<br />Nosotros lo dimos vuelta.</h2>
        </div>
        <div className="homeVsTable" role="table" aria-label="Comparación de modelos">
          <div className="homeVsRow homeVsRowHead" role="row">
            <span role="columnheader">Aspecto</span>
            <span role="columnheader">Búsqueda tradicional</span>
            <span role="columnheader" className="homeVsColPP">Perfil Primero</span>
          </div>
          {vsTradicional.map((row) => (
            <div key={row.aspecto} className="homeVsRow" role="row">
              <span className="homeVsAspecto" role="cell">{row.aspecto}</span>
              <span className="homeVsTradicional" role="cell">✗ {row.tradicional}</span>
              <span className="homeVsPP" role="cell"><BadgeCheck size={14} aria-hidden="true" /> {row.perfilPrimero}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Para postulantes ── */}
      <section className="homeForWorker" aria-label="Para postulantes">
        <div className="homeForWorkerText">
          <p className="eyebrow">Para postulantes</p>
          <h2>Deja de mandar CVs al vacío.</h2>
          <p>Con Perfil Primero publicas tu perfil una vez y las empresas verificadas llegan a ti con oferta real en mano. Tú filtras, tú decides.</p>
          <ul className="homeFeatureList">
            <li><Lock size={16} aria-hidden="true" /> Tu identidad 100% protegida hasta que aceptas</li>
            <li><TrendingUp size={16} aria-hidden="true" /> Sueldo visible antes del primer mensaje</li>
            <li><Zap size={16} aria-hidden="true" /> IA analiza tu CV y mejora tu perfil</li>
            <li><Shield size={16} aria-hidden="true" /> Solo empresas verificadas pueden contactarte</li>
          </ul>
          <a className="button primary" href="/postulante">
            Publicar mi perfil · gratis ahora <ChevronRight size={15} aria-hidden="true" />
          </a>
        </div>
        <div className="homeForWorkerCard" aria-label="Vista previa de perfil anónimo">
          <div className="homeAnonymousCard">
            <div className="homeAnonymousHeader">
              <span className="homeAnonymousCode">PP-A3F8D1B2</span>
              <span className="homeAnonymousBadge">Disponible</span>
            </div>
            <h3>Especialista en Marketing Digital</h3>
            <div className="homeAnonymousChips">
              {["Google Ads", "GA4", "Meta Ads", "SEO"].map((s) => <span key={s}>{s}</span>)}
            </div>
            <div className="homeAnonymousDetails">
              <span>🏠 Remoto o híbrido</span>
              <span>📍 Región Metropolitana</span>
              <span>💰 $1.200.000 – $1.800.000</span>
            </div>
            <div className="homeAnonymousLock">
              <Eye size={14} aria-hidden="true" />
              <span>Nombre e información de contacto protegidos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Para empresas ── */}
      <section className="homeForCompany" aria-label="Para empresas">
        <div className="homeForCompanyText">
          <p className="eyebrow">Para empresas</p>
          <h2>Encuentra personas disponibles. No currículums.</h2>
          <p>Buscas por cargo, habilidades, renta y modalidad. Ves perfiles reales y disponibles. Pagas solo cuando hay resultado: un contacto real desbloqueado.</p>
          <a className="button primary" href="/empresa">
            Buscar talento <ChevronRight size={15} aria-hidden="true" />
          </a>
          <ul className="homeFeatureList homeFeatureListDark">
            <li><Users size={16} aria-hidden="true" /> Perfiles filtrados por calce real</li>
            <li><Building2 size={16} aria-hidden="true" /> Empresa verificada = mayor respuesta</li>
            <li><Zap size={16} aria-hidden="true" /> Sin mensualidades — pagas por resultado</li>
            <li><TrendingUp size={16} aria-hidden="true" /> Pipeline de candidatos integrado</li>
          </ul>
        </div>
        <div className="homeForCompanyStats">
          {[
            { icon: "🎯", title: "Sin postulaciones masivas", text: "Solo ves perfiles que calzan con tu búsqueda. No 500 CVs sin filtrar." },
            { icon: "⚡", title: "Proceso más rápido", text: "El postulante ya está disponible y espera ofertas. No tienes que convencerlo de que existes." },
            { icon: "📋", title: "Sueldo definido desde el inicio", text: "Públicas tus condiciones en la invitación. Evitas negociaciones que nunca debieron empezar." }
          ].map((item) => (
            <div key={item.title} className="homeCompanyCard">
              <span className="homeCompanyCardIcon">{item.icon}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimoniales ilustrativos ── */}
      <section className="homeTestimonials" aria-label="Ejemplos de experiencias en la plataforma">
        <div className="homeTestimonialsHeader">
          <p className="eyebrow">Así funciona el modelo</p>
          <h2>La experiencia que Perfil Primero hace posible</h2>
        </div>
        <div className="homeTestimonialsGrid">
          {testimonials.map((t) => (
            <article key={t.name} className="homeTestimonialCard">
              <blockquote className="homeTestimonialQuote">"{t.quote}"</blockquote>
              <div className="homeTestimonialAuthor">
                <span className="homeTestimonialIcon">{t.icon}</span>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.region}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 12, fontStyle: "italic" }}>
          Historias ilustrativas del modelo. Publicaremos testimonios reales verificados a medida que se concreten contrataciones.
        </p>
      </section>

      {/* ── Herramientas gratuitas ── */}
      <section style={{ maxWidth: 860, margin: "0 auto 3rem", padding: "0 24px" }}>
        <p style={{ fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--primary-700)", marginBottom: 8, textAlign: "center" }}>Herramientas gratuitas</p>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 800, color: "var(--heading)", marginBottom: "1.5rem" }}>Recursos para tu búsqueda de empleo</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {[
            { icon: "🧮", titulo: "Calculadora salarial", desc: "¿Cuánto vale tu cargo en tu región?", href: "/calculadora-salarial" },
            { icon: "📊", titulo: "Estadísticas de mercado", desc: "Sueldos y demanda por sector", href: "/estadisticas" },
            { icon: "💡", titulo: "Tips profesionales", desc: "Guías de empleabilidad", href: "/tips-profesionales" },
            { icon: "❓", titulo: "Preguntas frecuentes", desc: "Resuelve tus dudas rápido", href: "/faq" },
          ].map((h, i) => (
            <a key={i} href={h.href} style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)", padding: "1.25rem", textDecoration: "none", transition: "border-color .15s" }}>
              <span style={{ fontSize: 24 }}>{h.icon}</span>
              <strong style={{ fontSize: 14, color: "var(--heading)" }}>{h.titulo}</strong>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{h.desc}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="homeCta" aria-label="Llamado a la acción">
        <h2>¿Listo para trabajar en tus términos?</h2>
        <p>Únete a los primeros profesionales de Chile que reciben ofertas con sueldo claro desde el primer contacto.</p>
        <div className="homeCtaActions">
          <a className="button primary" href="/postulante">
            Soy postulante <ChevronRight size={16} aria-hidden="true" />
          </a>
          <a className="button secondary homeCtaBtnCompany" href="/empresa">
            Soy empresa <ChevronRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          <a href="/como-funciona" className="homeCtaLink">Ver cómo funciona →</a>
          <a href="/casos-de-exito" className="homeCtaLink">Casos de éxito →</a>
        </div>
      </section>
    </main>
  );
}
