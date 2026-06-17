# Auditoria exhaustiva critica - Perfil Primero

Fecha: 2026-06-15
Sitio auditado: https://perfil-primero.web.app

## Veredicto brutal

Perfil Primero ya dejo de ser una maqueta decorativa, pero todavia no es una plataforma laboral lista para operar con usuarios reales sin supervision. La propuesta es buena, el flujo invertido tiene sentido comercial y la arquitectura elegida es razonable. El problema es que el producto estaba mezclando intencion seria con decisiones peligrosas: estados de pago manipulables desde cliente, usuarios capaces de tocar su rol, candidatos demo presentados como inventario, tests inflables y pago empresarial sin una recompensa privada clara.

Eso no es detalle. Eso mata confianza, ingresos y seguridad.

## Reparaciones aplicadas en esta auditoria

- El perfil trabajador ya no queda `visible` ni `active` al guardar. Queda `hidden` e `inactive` hasta que el pago confirme.
- Las reglas Firestore ahora bloquean que un trabajador active visibilidad/pago desde el cliente.
- Las reglas Firestore ahora bloquean que un usuario se cambie a si mismo a `admin`.
- Las reglas Firestore ahora separan permisos por rol `worker` y `company`.
- Las empresas ya no pueden auto-verificarse desde el cliente.
- Editar una empresa verificada ya no la degrada automaticamente a `pending`.
- Se elimino el candidato demo del panel empresa. Si no hay candidatos reales, la plataforma lo dice.
- El pago/flujo empresa ahora tiene funcion backend para ver contacto privado desbloqueado.
- Mercado Pago, al aprobar pago empresa, crea desbloqueo de contacto.
- Se agrego auditoria cuando una empresa ve el contacto privado.
- Storage ahora limita tipo y peso de CVs/logos.
- El analisis de CV valida formato y tamano antes de subir.
- Los tests ya no inflan puntaje por hacer clic repetido.
- Los tests ahora muestran una pregunta por vez para mejorar UX mobile.
- Se corrigieron separadores/textos rotos en empresa.
- Se mejoraron controles visuales apretados.

## Lo que sigue mal

### 1. No hay dashboard real post-login
El usuario entra y ve formularios. Eso es pobre. Una plataforma laboral necesita estado operativo: perfil activo/inactivo, pagos, invitaciones, recomendaciones, vencimiento, tareas pendientes. Hoy el usuario siente que esta llenando una ficha, no usando un producto.

### 2. Falta onboarding guiado
El flujo trabajador mezcla cuenta, CV, perfil, tests, IA, invitaciones y mensajes en una sola columna larga. Es funcional, pero no elegante. Para convertir usuarios pagadores, debe sentirse como un asistente paso a paso con progreso real, no como un tramite.

### 3. Los tests siguen siendo filtro inicial, no evaluacion seria
Ahora ya no son manipulables por clic repetido, pero siguen siendo pruebas propias sin validez psicometrica formal. Si se venden como certificacion, seria irresponsable. Deben mostrarse como senales internas o reemplazarse por pruebas validadas/licenciadas.

### 4. La IA depende demasiado de texto libre
La IA puede ayudar, pero si la empresa escribe una vacante mediocre, el resultado sera mediocre. Falta forzar campos estructurados: habilidades obligatorias, experiencia, modalidad, renta, horario, urgencia, rubro, restricciones legales permitidas.

### 5. No hay busqueda empresarial robusta
El panel empresa lista perfiles, pero falta filtro serio por comuna, region, area, habilidades, renta, modalidad, seniority, test score y disponibilidad. Sin filtros, la promesa de "encontrar al candidato perfecto" es marketing inflado.

### 6. La trazabilidad existe a medias
Hay pipeline, mensajes y estados, pero no una linea de tiempo visual auditada por evento. Para empresas, esto debe parecer CRM liviano: fecha de invitacion, aceptacion, mensajes, entrevista, oferta, pago, desbloqueo.

### 7. La pagina legal es insuficiente
Tiene terminos y privacidad, pero para CVs y datos laborales reales falta base legal mas seria: tratamiento de datos, retencion, eliminacion, consentimiento, responsabilidad de IA, no discriminacion, contacto del responsable y politica de reclamos.

### 8. Falta operacion admin real
El admin verifica empresas, bien. Pero falta ver usuarios, pagos, perfiles reportados, invitaciones abusivas, logs, suspensiones, revision de logos, reportes y soporte. El admin actual es una puerta minima, no un backoffice.

### 9. Falta comprobante visible de pago
Hay pagos en Firestore y Mercado Pago, pero la UI todavia no muestra comprobante robusto: fecha, monto, estado, ID proveedor, boleta/factura, periodo de visibilidad y vencimiento.

### 10. La marca visual mejoro, pero no es memorable
La web ya no da verguenza visual, pero todavia no tiene una identidad potente. Es limpia y moderna, si. Pero no inolvidable. Falta fotografia/ilustracion propia, microinteracciones y un lenguaje visual mas distintivo.

## Riesgos criticos pendientes

- No hay pruebas automatizadas de reglas Firestore.
- No hay pruebas end-to-end autenticadas con usuarios reales.
- No hay monitoreo de errores ni analitica de conversion.
- No hay proteccion anti-spam/rate limit visible para llamadas IA.
- No hay moderacion de contenido de perfiles o invitaciones.
- No hay expiracion automatica programada de perfiles impagos/vencidos.
- No hay proceso formal de eliminacion de datos del trabajador.

## Conclusion dura

El producto tiene una idea potente, pero todavia no merece venderse como una plataforma madura. Ya se corrigieron agujeros que eran directamente peligrosos. Aun asi, si se abre al mercado manana sin pruebas autenticadas, sin backoffice serio y sin comprobantes claros, se vera como una startup apurada jugando con datos laborales sensibles.

La siguiente fase no debe ser "poner mas bonito". Debe ser convertirlo en sistema operativo: estados reales, pagos auditables, busqueda seria, admin robusto, pruebas de seguridad y experiencia post-login profesional.
