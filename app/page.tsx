import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  EyeOff,
  FileText,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  UserRoundCheck
} from "lucide-react";
import { VerifiedCompaniesBanner } from "@/components/verified-companies-banner";

const profiles = [
  {
    code: "PP-8F29",
    title: "Especialista en marketing digital",
    skills: ["Google Ads", "GA4", "Meta Ads"],
    salary: "$1.200.000 - $1.800.000",
    mode: "Remoto o hibrido",
    status: "Disponible"
  },
  {
    code: "PP-41C7",
    title: "Supervisor de operaciones",
    skills: ["Logistica", "Turnos", "KPI"],
    salary: "$1.000.000 - $1.400.000",
    mode: "Presencial",
    status: "Activo"
  },
  {
    code: "PP-73B1",
    title: "Asistente administrativo",
    skills: ["Excel", "Facturacion", "ERP"],
    salary: "$750.000 - $950.000",
    mode: "Hibrido",
    status: "Disponible en 15 dias"
  }
];

const workerBenefits = [
  {
    icon: <EyeOff />,
    title: "Tu identidad sigue privada",
    text: "Las empresas ven tu experiencia, renta esperada y comuna, pero no tu nombre, telefono ni correo hasta que tu aceptes avanzar."
  },
  {
    icon: <FileText />,
    title: "No llenas formularios eternos",
    text: "Subes tu CV, completas lo importante una vez y la plataforma arma un perfil claro para mostrarte mejor."
  },
  {
    icon: <CheckCircle2 />,
    title: "Decides con sueldo a la vista",
    text: "Cada invitacion debe venir con cargo, modalidad y rango de sueldo. Si no te conviene, rechazas y sigues anonimo."
  }
];

const companyBenefits = [
  {
    icon: <Search />,
    title: "Encuentras personas disponibles",
    text: "Buscas por cargo, habilidades, renta, comuna y modalidad sin esperar cientos de postulaciones que no calzan."
  },
  {
    icon: <ShieldCheck />,
    title: "Contactas con reglas claras",
    text: "La empresa se verifica antes de hablar con postulantes reales y cada proceso queda ordenado dentro de la plataforma."
  },
  {
    icon: <BriefcaseBusiness />,
    title: "Pagas cuando hay resultado",
    text: "No pagas por mirar perfiles ni por publicar avisos. El cobro aparece cuando cierras un trato con un postulante."
  }
];

const storyboard = [
  {
    step: "1",
    icon: <UserRoundCheck />,
    title: "Juan publica su perfil",
    text: "Vendedor, 5 anos de experiencia, espera $900.000-$1.200.000 y prefiere trabajo hibrido en Santiago."
  },
  {
    step: "2",
    icon: <Building2 />,
    title: "Una empresa verificada lo encuentra",
    text: "Le envia una invitacion con cargo, sueldo, modalidad y condiciones visibles antes de pedirle cualquier dato privado."
  },
  {
    step: "3",
    icon: <Handshake />,
    title: "Juan acepta o rechaza",
    text: "Si acepta, se revela el contacto bajo reglas de cierre. Si rechaza, su identidad sigue anonima."
  }
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
          <span>Perfil Primero</span>
        </a>
        <nav aria-label="Principal">
          <a href="/empresa">Buscar talento</a>
          <a href="/trabajador">Crear perfil</a>
          <a href="/precios">Precios</a>
          <a className="navButton navPostulant" href="/trabajador">Postulante</a>
          <a className="navAction navButton" href="/empresa">Empresa</a>
        </nav>
      </header>

      <section className="hero portalHero homeHeroPrime">
        <div className="heroCopy portalHeroCopy">
          <p className="eyebrow">Trabajo en Chile con sueldo claro desde el inicio</p>
          <h1>Publica tu perfil y que las empresas te ofrezcan trabajo con sueldo claro, no al reves.</h1>
          <p className="lead">
            Publicas un perfil anonimo, recibes invitaciones con sueldo y modalidad,
            y tu decides si aceptas, rechazas o pides mas informacion.
          </p>
          <div className="homeSearchPanel" aria-label="Busqueda rapida">
            <label>
              <BriefcaseBusiness size={20} aria-hidden="true" />
              <span>Cargo o categoria</span>
              <strong>Ventas, administracion, tecnologia</strong>
            </label>
            <label>
              <MapPin size={20} aria-hidden="true" />
              <span>Lugar</span>
              <strong>Chile, region o comuna</strong>
            </label>
            <a className="homeSearchButton" href="/empresa" aria-label="Buscar talento">
              <Search size={24} aria-hidden="true" />
            </a>
          </div>
          <div className="heroActions">
            <a className="button primary largeAction" href="/trabajador">
              Crear mi perfil gratis
              <ArrowRight size={20} aria-hidden="true" />
            </a>
            <a className="button secondary postulantHeroAction" href="/postulante">Soy postulante</a>
            <a className="button ghost compactAction" href="/empresa">Soy empresa</a>
          </div>
          <div className="heroProofStrip">
            <span>Anonimo hasta aceptar</span>
            <span>Empresas verificadas</span>
            <span>Sueldo visible</span>
          </div>
        </div>

        <aside className="portalSidePanel">
          <div className="homeTalentBoard">
            <div className="homeTalentHeader">
              <span>Perfil Primero</span>
              <strong>Talento disponible</strong>
            </div>
            <div className="homeTalentMetrics">
              <div><strong>30 dias</strong><span>visibilidad activa</span></div>
              <div><strong>$ claro</strong><span>antes de avanzar</span></div>
            </div>
            <article className="profileCard heroProfileCard">
              <div className="profileTop">
                <span className="profileCode">PP-JUAN</span>
                <span>Disponible</span>
              </div>
              <h2>Vendedor terreno B2B</h2>
              <div className="chips">
                <span>Ventas</span>
                <span>CRM</span>
                <span>5 anos</span>
              </div>
              <div className="profileMeta">
                <span>$900.000 - $1.200.000</span>
                <span>Hibrido</span>
              </div>
            </article>
            <div className="homeInviteCard">
              <span>Invitacion recibida</span>
              <strong>Ejecutivo comercial B2B</strong>
              <p>$1.100.000 - $1.350.000 | Hibrido | Santiago</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="paymentResultBand homeOutcomeBand" aria-label="Pago por resultado">
        <div>
          <p className="eyebrow">Pago por resultado</p>
          <h2>No publicamos avisos. No cobramos por mirar perfiles. Solo pagas cuando cierras un trato.</h2>
        </div>
        <a className="button secondary" href="/precios">Ver precios</a>
      </section>

      <section className="storyboardBand homeStoryboard" aria-label="Como funciona">
        <div className="panelHeader">
          <div>
            <span className="smallLabel">Como funciona</span>
            <strong>Un proceso simple, con datos concretos desde el primer contacto.</strong>
          </div>
        </div>
        <div className="storyboardGrid drawnStoryboardGrid">
          <svg className="storyFlowSvg" aria-hidden="true" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <defs>
              <marker id="storyArrowHead" markerHeight="10" markerWidth="10" orient="auto" refX="8" refY="5">
                <path d="M0,0 L10,5 L0,10 Z" />
              </marker>
            </defs>
            <path d="M305 60 C365 60 380 60 440 60" />
            <path d="M635 60 C695 60 710 60 765 60" />
          </svg>
          {storyboard.map((item) => (
            <article className="storyCard drawnStoryCard" key={item.title}>
              <span className="storyConnector" aria-hidden="true" />
              <div className="drawnStoryTop">
                <span className="drawnStepNumber">{item.step}</span>
                <div className="iconBox">{item.icon}</div>
              </div>
              <div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="marketPanel productShowcase" aria-label="Vista previa de perfiles">
        <div className="panelHeader">
          <div>
            <span className="smallLabel">Perfiles disponibles</span>
            <strong>Ejemplos de perfiles anonimos que una empresa podria encontrar.</strong>
          </div>
          <span className="liveDot">Activos</span>
        </div>
        <div className="profileList">
          {profiles.map((profile) => (
            <article className="profileCard" key={profile.code}>
              <div className="profileTop">
                <span className="profileCode">{profile.code}</span>
                <span>{profile.status}</span>
              </div>
              <h2>{profile.title}</h2>
              <div className="chips">
                {profile.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <div className="profileMeta">
                <span>{profile.salary}</span>
                <span>{profile.mode}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split" id="postulantes">
        <div>
          <p className="eyebrow">Beneficios para postulantes</p>
          <h2>Menos postulaciones al vacio, mas ofertas con informacion clara.</h2>
          <p>
            Perfil Primero esta pensado para personas que quieren encontrar trabajo sin
            exponer sus datos personales ni perder tiempo en procesos poco claros.
          </p>
        </div>
        <div className="featureGrid">
          {workerBenefits.map((benefit) => (
            <Feature key={benefit.title} {...benefit} />
          ))}
        </div>
      </section>

      <section className="split reverse" id="empresas">
        <div>
          <p className="eyebrow">Beneficios para empresas</p>
          <h2>Busca postulantes reales y conversa solo cuando hay calce.</h2>
          <p>
            La empresa entra a buscar personas disponibles, compara perfiles anonimos
            y avanza con invitaciones que ya incluyen sueldo y modalidad.
          </p>
        </div>
        <div className="featureGrid">
          {companyBenefits.map((benefit) => (
            <Feature key={benefit.title} {...benefit} />
          ))}
        </div>
      </section>

      <VerifiedCompaniesBanner />

      <footer className="siteFooter">
        <a href="/precios">Precios</a>
        <a href="/legal/privacidad">Privacidad</a>
        <a href="/legal/terminos">Terminos</a>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  text
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="feature">
      <div className="iconBox">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
