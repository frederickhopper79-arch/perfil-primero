import { BadgeCheck } from "lucide-react";
import { SocialProofCounter } from "@/components/social-proof-counter";

export default function Home() {
  return (
    <main>
      <header className="topbar siteTopbar">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="Perfil Primero" />
        </a>
        <nav aria-label="Principal">
          <a href="/como-funciona">Cómo funciona</a>
          <a className="navButton navPostulant" href="/postulante">Postulante</a>
          <a className="navAction navButton" href="/empresa">Empresa</a>
        </nav>
      </header>

      {/* Hero: centrado, directo */}
      <section className="homeHero" aria-label="Propuesta de valor">
        <p className="eyebrow">Plataforma laboral · Chile</p>
        <h1>Publica tu perfil y recibe ofertas con sueldo claro desde el primer contacto.</h1>
        <p className="lead">
          Las empresas verificadas te encuentran, te proponen trabajo con cargo, modalidad y renta antes de pedirte datos. Tú decides si avanzas o rechazas.
        </p>
        <div className="homeHeroActions">
          <a className="button primary" href="/postulante">Soy postulante</a>
          <a className="button secondary" href="/empresa">Soy empresa</a>
        </div>
        <div className="heroProofStrip">
          <span><BadgeCheck size={13} aria-hidden="true" /> Anónimo hasta aceptar</span>
          <span><BadgeCheck size={13} aria-hidden="true" /> Empresas verificadas</span>
          <span><BadgeCheck size={13} aria-hidden="true" /> Sueldo visible siempre</span>
        </div>
        <SocialProofCounter />
      </section>

      {/* Cómo funciona: 3 pasos en fila */}
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
        <a className="homeStepsMore" href="/como-funciona">Ver detalle →</a>
      </section>

    </main>
  );
}
