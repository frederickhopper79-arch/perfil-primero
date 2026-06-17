export default function PrivacyPage() {
  return (
    <main className="legalPage">
      <a className="brand" href="/">
        <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
        <span>Perfil Primero</span>
      </a>
      <p className="eyebrow">Documento operativo</p>
      <h1>Politica de privacidad</h1>
      <p>
        Perfil Primero trata datos laborales de postulantes y datos comerciales de empresas para operar una plataforma
        de perfiles anonimos, invitaciones laborales, entrevistas web, pagos, reputacion y control administrativo.
      </p>

      <h2>1. Datos que recopilamos</h2>
      <p>
        Podemos recopilar nombre, correo, telefono, region, comuna, experiencia, habilidades, pretension de renta,
        CV, portafolio, resultados de tests opcionales, mensajes internos, entrevistas programadas, evaluaciones,
        comprobantes de pago, datos de empresa, RUT/identificacion fiscal, logo y antecedentes de verificacion.
      </p>

      <h2>2. Separacion entre perfil publico y privado</h2>
      <p>
        El perfil visible para empresas verificadas muestra datos laborales no identificatorios: cargo, experiencia,
        habilidades, area, region/comuna, modalidad y renta esperada. Nombre, correo, telefono, CV original y enlaces
        privados se mantienen bloqueados hasta que exista aceptacion del proceso y pago cuando corresponda.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <p>
        Usamos la informacion para crear perfiles laborales, permitir busqueda de talento, gestionar invitaciones,
        programar entrevistas, habilitar mensajeria, procesar pagos, emitir respaldos administrativos, prevenir abuso,
        auditar acciones sensibles y mejorar la experiencia de postulantes y empresas.
      </p>

      <h2>4. Uso de IA</h2>
      <p>
        Google IA puede analizar CVs, sugerir mejoras de perfil y apoyar comparaciones entre vacantes y perfiles.
        La IA es una herramienta de apoyo, no una decision automatica obligatoria. No debe usarse para discriminar por
        edad, genero, nacionalidad, salud, religion, situacion familiar u otros atributos protegidos.
      </p>

      <h2>5. Tests opcionales</h2>
      <p>
        Los tests de ingles, espanol y personalidad son filtros iniciales de orientacion. No constituyen evaluaciones
        psicometricas clinicas, certificaciones academicas ni diagnosticos. El postulante decide si los completa.
      </p>

      <h2>6. Pagos y facturacion</h2>
      <p>
        Los pagos se procesan mediante Mercado Pago. Perfil Primero registra identificadores de pago, monto, moneda,
        tipo de cobro, estado, cupones, referencias operativas y respaldos necesarios para conciliacion, contabilidad
        y facturacion mediante SII/OpenFactura u otro proveedor.
      </p>

      <h2>7. Conservacion y eliminacion</h2>
      <p>
        Conservamos datos mientras la cuenta este activa, existan obligaciones legales, respaldos contables, auditoria
        de seguridad o procesos laborales pendientes. El usuario puede solicitar rectificacion, desactivacion o
        eliminacion cuando no exista obligacion legal o contractual de conservarlos.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        La plataforma usa Firebase Auth, Firestore Rules, Storage Rules, funciones backend, auditoria de eventos y
        separacion de datos publicos/privados. Ningun sistema es invulnerable; por eso se monitorean accesos, pagos,
        desbloqueos de contacto, cambios administrativos y alertas de seguridad.
      </p>

      <h2>9. Derechos del usuario</h2>
      <p>
        Los usuarios pueden solicitar acceso, correccion, actualizacion, suspension o eliminacion de datos personales,
        sujeto a validacion de identidad y obligaciones legales aplicables.
      </p>

      <h2>10. Contacto</h2>
      <p>
        Las solicitudes de privacidad deben canalizarse por los medios oficiales de Perfil Primero. Antes del
        lanzamiento comercial debe incorporarse razon social, domicilio, correo de contacto y responsable de datos.
      </p>
    </main>
  );
}
