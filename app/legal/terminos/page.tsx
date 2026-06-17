export default function TermsPage() {
  return (
    <main className="legalPage">
      <a className="brand" href="/">
        <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
        <span>Perfil Primero</span>
      </a>
      <p className="eyebrow">Condiciones de uso</p>
      <h1>Terminos de uso</h1>
      <p>
        Perfil Primero es una plataforma de empleo invertida: el postulante publica un perfil laboral anonimo y las
        empresas verificadas pueden buscar, invitar, entrevistar y cerrar procesos con reglas de contacto y pago.
      </p>

      <h2>1. Cuenta y veracidad</h2>
      <p>
        Cada usuario debe entregar informacion verdadera, actualizada y propia. La suplantacion, datos falsos,
        ofertas inexistentes, uso abusivo de mensajes o intento de evadir pagos pueden generar suspension.
      </p>

      <h2>2. Postulantes</h2>
      <p>
        El postulante controla su perfil, puede editar informacion, subir CV, completar tests opcionales, aceptar o
        rechazar invitaciones y mantener sus datos privados mientras no acepte avanzar bajo las reglas de la plataforma.
      </p>

      <h2>3. Empresas</h2>
      <p>
        Las empresas deben registrarse con datos verificables, publicar oportunidades reales, informar sueldo, modalidad,
        ubicacion, condiciones principales y usar la mensajeria interna hasta que el sistema habilite el intercambio de
        contacto conforme al flujo de pago.
      </p>

      <h2>4. Verificacion de empresas</h2>
      <p>
        Perfil Primero puede aprobar, rechazar, suspender o solicitar antecedentes adicionales antes de permitir contacto
        con postulantes reales. La verificacion busca reducir abuso, ofertas falsas y procesos poco transparentes.
      </p>

      <h2>5. Entrevistas y contacto</h2>
      <p>
        Las entrevistas se programan dentro de la plataforma con al menos un dia de anticipacion. Antes de entrevistar,
        ambas partes deben aceptar las reglas: no intercambiar telefono, correo, redes sociales u otros datos de contacto
        antes del punto autorizado por el sistema.
      </p>

      <h2>6. Pago por resultado</h2>
      <p>
        Durante pruebas los cobros se mantienen en monto reducido. En operacion comercial, el postulante paga por
        visibilidad mensual y la empresa paga cuando corresponde desbloquear contacto/cierre de trato. El pago aprobado
        activa visibilidad, desbloqueo, comprobantes y registros contables segun el tipo de servicio.
      </p>

      <h2>7. Mercado Pago, comprobantes y conciliacion</h2>
      <p>
        Mercado Pago procesa el cobro. Perfil Primero registra preference, redirect, webhook, estado aprobado,
        activacion/desbloqueo y asiento contable. Si un pago queda pendiente o falla, el servicio asociado puede quedar
        bloqueado hasta la confirmacion del proveedor.
      </p>

      <h2>8. IA y decision humana</h2>
      <p>
        La IA ayuda a ordenar informacion, sugerir mejoras y estimar compatibilidad. No garantiza contratacion ni debe
        reemplazar entrevistas, revision humana ni criterios legales de no discriminacion.
      </p>

      <h2>9. Reputacion y evaluaciones</h2>
      <p>
        Postulantes y empresas pueden evaluar seriedad, asistencia y comportamiento dentro del proceso. Las evaluaciones
        deben ser honestas, respetuosas y relacionadas con la experiencia laboral dentro de Perfil Primero.
      </p>

      <h2>10. Administracion, auditoria y suspension</h2>
      <p>
        La administracion puede monitorear pagos, asientos contables, facturacion, cupones, entrevistas, reputacion,
        seguridad, logs y auditoria. Puede suspender cuentas, empresas, perfiles u ofertas cuando detecte abuso,
        incumplimiento, riesgo legal o intento de evadir el modelo de pago.
      </p>

      <h2>11. Limitacion de responsabilidad</h2>
      <p>
        Perfil Primero facilita contacto laboral, pero no garantiza contratacion, permanencia, remuneracion final ni
        cumplimiento posterior de obligaciones entre postulante y empresa. Cada parte es responsable de sus decisiones,
        declaraciones, entrevistas, acuerdos y obligaciones legales.
      </p>

      <h2>12. Pendiente antes de lanzamiento comercial</h2>
      <p>
        Antes de operar masivamente deben incorporarse datos legales definitivos de la sociedad, domicilio, politica de
        reembolsos, canal formal de soporte, procedimiento de reclamos y revision por abogado chileno.
      </p>
    </main>
  );
}
