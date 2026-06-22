export default function PrivacyPage() {
  return (
    <>
      <header className="topbar siteTopbar">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.png" alt="Perfil Primero" />
          <span className="brandName">Perfil Primero</span>
        </a>
        <nav aria-label="Principal">
          <a href="/como-funciona" className="navLink">Cómo funciona</a>
          <a href="/precios" className="navLink">Precios</a>
          <a href="/ayuda" className="navLink">Ayuda</a>
          <a className="navButton navPostulant" href="/postulante">Soy postulante</a>
          <a className="navAction navButton" href="/empresa">Soy empresa</a>
        </nav>
      </header>
      <main className="legalPage">
      <p className="eyebrow">Documento operativo · Versión 1.0 · Junio 2026</p>
      <h1>Política de privacidad</h1>
      <p>
        Perfil Primero trata datos laborales de postulantes y datos comerciales de empresas para operar una plataforma
        de perfiles anónimos, invitaciones laborales, entrevistas web, pagos, reputación y control administrativo.
      </p>

      <h2>1. Datos que recopilamos</h2>
      <p>
        Podemos recopilar nombre, correo, teléfono, región, comuna, experiencia, habilidades, pretensión de renta,
        CV, portafolio, resultados de tests opcionales, mensajes internos, entrevistas programadas, evaluaciones,
        comprobantes de pago, datos de empresa, RUT o identificación fiscal, logo y antecedentes de verificación.
      </p>

      <h2>2. Separación entre perfil público y privado</h2>
      <p>
        El perfil visible para empresas verificadas muestra datos laborales no identificatorios: cargo, experiencia,
        habilidades, área, región y comuna, modalidad y renta esperada. Nombre, correo, teléfono, CV original y
        enlaces privados se mantienen bloqueados hasta que exista aceptación del proceso y pago cuando corresponda.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <p>
        Usamos la información para crear perfiles laborales, permitir búsqueda de talento, gestionar invitaciones,
        programar entrevistas, habilitar mensajería, procesar pagos, emitir respaldos administrativos, prevenir abuso,
        auditar acciones sensibles y mejorar la experiencia de postulantes y empresas.
      </p>

      <h2>4. Uso de inteligencia artificial</h2>
      <p>
        Google IA puede analizar CVs, sugerir mejoras de perfil y apoyar comparaciones entre vacantes y perfiles.
        La IA es una herramienta de apoyo, no una decisión automática obligatoria. No debe usarse para discriminar por
        edad, género, nacionalidad, salud, religión, situación familiar u otros atributos protegidos.
      </p>

      <h2>5. Tests opcionales de idioma y conducta</h2>
      <p>
        Los tests de inglés, español y conducta laboral son filtros iniciales de orientación. No constituyen
        evaluaciones psicométricas clínicas, certificaciones académicas ni diagnósticos formales. El postulante decide
        si los completa. Los resultados son visibles para empresas verificadas como señal adicional dentro del perfil.
      </p>

      <h2>6. Pagos y facturación</h2>
      <p>
        Los pagos se procesan mediante Mercado Pago. Perfil Primero registra identificadores de pago, monto, moneda,
        tipo de cobro, estado, cupones, referencias operativas y respaldos necesarios para conciliación, contabilidad
        y facturación mediante SII u otro proveedor autorizado.
      </p>

      <h2>7. Conservación y eliminación</h2>
      <p>
        Conservamos datos mientras la cuenta esté activa, existan obligaciones legales, respaldos contables, auditoría
        de seguridad o procesos laborales pendientes. El usuario puede solicitar rectificación, desactivación o
        eliminación cuando no exista obligación legal o contractual de conservarlos.
      </p>

      <h2>8. Seguridad técnica</h2>
      <p>
        La plataforma usa Firebase Auth, Firestore Security Rules, Storage Rules, funciones backend con Firebase Admin
        SDK, auditoría de eventos y separación estricta de datos públicos y privados. Ningún sistema es invulnerable;
        por eso se monitorean accesos, pagos, desbloqueos de contacto, cambios administrativos y alertas de seguridad.
      </p>

      <h2>9. Derechos del usuario</h2>
      <p>
        Los usuarios pueden solicitar acceso, corrección, actualización, suspensión o eliminación de sus datos
        personales, sujeto a validación de identidad y obligaciones legales aplicables en Chile.
      </p>

      <h2>10. Cookies y rastreo</h2>
      <p>
        La plataforma puede utilizar cookies esenciales para autenticación y funcionamiento. No se utilizan cookies
        de rastreo publicitario de terceros. El uso de la plataforma implica aceptación de las cookies necesarias
        para su operación.
      </p>

      <h2>11. Contacto y responsable de datos</h2>
      <p>
        Para solicitudes de privacidad, acceso, rectificación o eliminación de datos, contacta al responsable de la plataforma:
      </p>
      <ul>
        <li><strong>Razón social:</strong> Perfil Primero SpA</li>
        <li><strong>RUT:</strong> 78.449.783-6</li>
        <li><strong>Domicilio legal:</strong> Puerto Montt, Región de Los Lagos, Chile</li>
        <li><strong>Responsable de datos:</strong> Fabián Alonso Carrillo Lara</li>
        <li><strong>Correo de contacto:</strong> contacto@perfil-primero.cl</li>
      </ul>
      <p>
        Esta política está sujeta a revisión por asesor legal antes del inicio formal de actividades comerciales.
        La plataforma fue desarrollada por Hopper Tech E.I.R.L. para Perfil Primero SpA.
      </p>
    </main>
    </>
  );
}
