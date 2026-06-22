"use client";

import { useEffect, useState } from "react";

export default function ReferralPage() {
  const [code, setCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = (params.get("ref") ?? "").toUpperCase();
    setCode(c);
    if (c) {
      try { sessionStorage.setItem("pp_ref", c); } catch { /* */ }
    }
  }, []);

  return (
    <main>
      <header className="topbar siteTopbar">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.png" alt="Perfil Primero" />
        </a>
        <nav aria-label="Principal">
          <a className="navButton navPostulant" href="/postulante">Soy postulante</a>
          <a className="navAction navButton" href="/empresa">Soy empresa</a>
        </nav>
      </header>

      <div className="subpageWrap">
        <div className="referralHero">
          <p className="eyebrow">Invitación especial</p>
          <h1>Alguien en Perfil Primero quiere que te unas</h1>
          <p className="lead">
            Perfil Primero es la plataforma laboral invertida de Chile: publicas tu perfil anónimo
            una vez y las empresas verificadas llegan a ti con cargo, sueldo y modalidad claros.
            Sin enviar CVs. Sin perder tiempo.
          </p>
          {code && (
            <div className="referralCodeDisplay">
              <span className="referralCodeLabel">Tu código de invitación</span>
              <strong className="referralCodeValue">{code}</strong>
              <span className="referralCodeHint">Se aplica automáticamente al activar tu perfil</span>
            </div>
          )}
          <div className="referralCtas">
            <a className="button primary" href={`/postulante${code ? `?ref=${code}` : ""}`}>
              Crear mi perfil gratis
            </a>
            <a className="button secondary" href="/como-funciona">
              Ver cómo funciona
            </a>
          </div>
        </div>

        <section className="referralBenefits">
          <h2>¿Por qué Perfil Primero?</h2>
          <div className="referralBenefitGrid">
            <article>
              <strong>Tu identidad protegida</strong>
              <p>Las empresas ven tu experiencia y renta esperada, pero no tu nombre ni contacto hasta que tú decides avanzar.</p>
            </article>
            <article>
              <strong>Sueldo visible desde el inicio</strong>
              <p>Cada invitación incluye cargo, modalidad y rango de sueldo. Rechazas sin consecuencias si no te conviene.</p>
            </article>
            <article>
              <strong>Empresas verificadas</strong>
              <p>Solo empresas que pasaron revisión manual pueden contactarte. Sin spam, sin procesos opacos.</p>
            </article>
            <article>
              <strong>IA que mejora tu perfil</strong>
              <p>Sube tu CV y la inteligencia artificial extrae tus habilidades, resumen y experiencia automáticamente.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

