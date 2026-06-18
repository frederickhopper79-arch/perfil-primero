import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo funciona | Perfil Primero",
  description: "Descubre cómo funciona la plataforma laboral invertida de Chile. El postulante publica primero, la empresa llega con sueldo y condiciones claras.",
};

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  EyeOff,
  FileText,
  Handshake,
  Search,
  ShieldCheck,
  UserRoundCheck
} from "lucide-react";
import { VerifiedCompaniesBanner } from "@/components/verified-companies-banner";

const storyboard = [
  {
    step: "1",
    icon: <UserRoundCheck size={20} />,
    title: "El postulante publica su perfil",
    text: "Sube su CV, define renta esperada, modalidad y región. La plataforma arma un perfil anónimo sin exponer nombre, teléfono ni correo."
  },
  {
    step: "2",
    icon: <Building2 size={20} />,
    title: "Una empresa verificada lo encuentra",
    text: "La empresa busca por cargo, habilidades, renta y modalidad. Ve perfiles anónimos y envía una invitación con cargo, sueldo y condiciones."
  },
  {
    step: "3",
    icon: <Handshake size={20} />,
    title: "El postulante decide",
    text: "Si acepta, se abre el contacto bajo reglas claras. Si rechaza o ignora, su identidad queda protegida y puede seguir recibiendo otras ofertas."
  }
];

const workerBenefits = [
  {
    icon: <EyeOff size={18} />,
    title: "Tu identidad sigue privada",
    text: "Las empresas ven tu experiencia, renta esperada y región, pero no tu nombre, teléfono ni correo hasta que tú aceptes avanzar."
  },
  {
    icon: <FileText size={18} />,
    title: "Sin formularios eternos",
    text: "Subes tu CV, completas lo importante una vez y la plataforma arma un perfil claro con apoyo de IA."
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: "Decides con sueldo a la vista",
    text: "Cada invitación viene con cargo, modalidad y rango de sueldo. Si no te conviene, rechazas y sigues anónimo."
  }
];

const companyBenefits = [
  {
    icon: <Search size={18} />,
    title: "Encuentras personas disponibles",
    text: "Buscas por cargo, habilidades, renta, región y modalidad sin esperar cientos de postulaciones que no calzan."
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Contactas con reglas claras",
    text: "La empresa se verifica antes de hablar con postulantes reales. Cada proceso queda ordenado en la plataforma."
  },
  {
    icon: <BriefcaseBusiness size={18} />,
    title: "Pagas cuando hay resultado",
    text: "No pagas por mirar perfiles ni por publicar avisos. El cobro llega cuando cierras un trato con un postulante."
  }
];

const faqs = [
  {
    q: "¿Es gratis para postulantes?",
    a: "El perfil se crea sin costo. La visibilidad activa —que las empresas te encuentren— requiere una suscripción de $999 CLP al mes."
  },
  {
    q: "¿Cómo se verifica una empresa?",
    a: "La empresa se registra con datos reales. El equipo de Perfil Primero revisa la información antes de autorizar el contacto con postulantes."
  },
  {
    q: "¿Mi nombre aparece en el perfil?",
    a: "No. Las empresas ven tu cargo, habilidades, experiencia, región y renta esperada. Tu nombre, teléfono y correo solo se comparten cuando tú aceptas avanzar."
  },
  {
    q: "¿Qué pasa si rechazo una invitación?",
    a: "Nada. Sigues anónimo y puedes seguir recibiendo otras invitaciones. La empresa no sabe quién rechazó."
  },
  {
    q: "¿Para qué sirven los tests opcionales?",
    a: "Son señales adicionales para empresas. Un nivel B2 en inglés o un perfil conductual claro puede diferenciarte sin revelar tu identidad."
  },
  {
    q: "¿En qué ciudades funciona?",
    a: "La plataforma opera en todo Chile. Puedes buscar trabajo remoto, híbrido o presencial en cualquier región."
  },
  {
    q: "¿Cuánto cuesta para empresas?",
    a: "No pagas por mirar perfiles ni por publicar avisos. El cobro ocurre cuando desbloqueas el contacto después de que el postulante acepta la invitación."
  },
  {
    q: "¿Puedo eliminar mi perfil?",
    a: "Sí. Puedes desactivar la visibilidad desde tu panel en cualquier momento, o solicitar eliminación completa escribiendo a contacto@perfil-primero.cl."
  }
];

const sampleProfiles = [
  {
    code: "PP-8F29A1B2",
    title: "Especialista en marketing digital",
    skills: ["Google Ads", "GA4", "Meta Ads"],
    salary: "$1.200.000 – $1.800.000",
    mode: "Remoto o híbrido",
    status: "Disponible"
  },
  {
    code: "PP-41C73D9E",
    title: "Supervisor de operaciones",
    skills: ["Logística", "Turnos", "KPI"],
    salary: "$1.000.000 – $1.400.000",
    mode: "Presencial",
    status: "Activo"
  },
  {
    code: "PP-73B1F20C",
    title: "Asistente administrativo",
    skills: ["Excel", "Facturación", "ERP"],
    salary: "$750.000 – $950.000",
    mode: "Híbrido",
    status: "Disponible en 15 días"
  }
];

export default function ComoFuncionaPage() {
  return (
    <main>
      <header className="topbar siteTopbar">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="Perfil Primero" />
        </a>
        <nav aria-label="Principal">
          <a href="/como-funciona" aria-current="page">Cómo funciona</a>
          <a className="navButton navPostulant" href="/postulante">Postulante</a>
          <a className="navAction navButton" href="/empresa">Empresa</a>
        </nav>
      </header>

      <div className="subpageWrap">
        <a className="backLink" href="/">
          <ArrowLeft size={14} /> Inicio
        </a>

        <div className="subpageHeader">
          <p className="eyebrow">Plataforma laboral invertida</p>
          <h1>Cómo funciona Perfil Primero</h1>
          <p className="lead">
            En Perfil Primero el proceso es al revés: tú publicas tu perfil anónimo y las empresas verificadas llegan a ti con ofertas reales y sueldo visible.
          </p>
        </div>

        {/* Storyboard paso a paso */}
        <section className="cfSection" aria-label="Proceso paso a paso">
          <h2 className="cfSectionTitle">El proceso en 3 pasos</h2>
          <div className="cfSteps">
            {storyboard.map((item) => (
              <article className="cfStep" key={item.step}>
                <div className="cfStepHead">
                  <span className="cfStepNum">{item.step}</span>
                  <div className="iconBox">{item.icon}</div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Perfiles de ejemplo */}
        <section className="cfSection" aria-label="Perfiles anónimos de ejemplo">
          <h2 className="cfSectionTitle">Así se ven los perfiles anónimos</h2>
          <p className="cfSectionDesc">Las empresas ven esto. Sin nombre, sin teléfono, sin correo.</p>
          <div className="cfProfileGrid">
            {sampleProfiles.map((p) => (
              <article className="profileCard" key={p.code}>
                <div className="profileTop">
                  <span className="profileCode">{p.code}</span>
                  <span>{p.status}</span>
                </div>
                <h3 className="cfProfileTitle">{p.title}</h3>
                <div className="chips">
                  {p.skills.map((s) => <span key={s}>{s}</span>)}
                </div>
                <div className="profileMeta">
                  <span>{p.salary}</span>
                  <span>{p.mode}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Beneficios: postulante */}
        <section className="cfSection cfBenefitsSplit" aria-label="Beneficios para postulantes">
          <div className="cfBenefitsText">
            <p className="eyebrow">Para postulantes</p>
            <h2>Menos postulaciones al vacío, más ofertas con información clara.</h2>
            <p>Perfil Primero está pensado para personas que quieren encontrar trabajo sin exponer sus datos ni perder tiempo en procesos opacos.</p>
            <a className="button primary cfBenefitCta" href="/postulante">Soy postulante</a>
          </div>
          <div className="cfBenefitCards">
            {workerBenefits.map((b) => (
              <article className="cfBenefitCard" key={b.title}>
                <div className="iconBox">{b.icon}</div>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Beneficios: empresa */}
        <section className="cfSection cfBenefitsSplit cfBenefitsSplitReverse" aria-label="Beneficios para empresas">
          <div className="cfBenefitsText">
            <p className="eyebrow">Para empresas</p>
            <h2>Busca postulantes reales y conversa solo cuando hay calce.</h2>
            <p>La empresa entra a buscar personas disponibles, compara perfiles anónimos y avanza con invitaciones que ya incluyen sueldo y modalidad.</p>
            <a className="button secondary cfBenefitCta" href="/empresa">Buscar talento</a>
          </div>
          <div className="cfBenefitCards">
            {companyBenefits.map((b) => (
              <article className="cfBenefitCard" key={b.title}>
                <div className="iconBox">{b.icon}</div>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <VerifiedCompaniesBanner />

        {/* FAQ */}
        <section className="cfSection cfFaq" aria-label="Preguntas frecuentes">
          <h2 className="cfSectionTitle">Preguntas frecuentes</h2>
          <div className="faqGrid">
            {faqs.map((item) => (
              <article className="faqItem" key={item.q}>
                <strong>{item.q}</strong>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
          <p className="cfFaqCta">
            ¿Tienes otra duda? Escríbenos a{" "}
            <a href="mailto:contacto@perfil-primero.cl">contacto@perfil-primero.cl</a>
          </p>
        </section>
      </div>

    </main>
  );
}
