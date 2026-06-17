# Backlog pendiente - Perfil Primero

## Tributario y contable

1. Elegir proveedor de facturacion electronica: OpenFactura/Haulmer, Maxxa u otro autorizado.
2. Configurar `OPENFACTURA_API_KEY` o credenciales equivalentes en Firebase Functions.
3. Implementar emision real de DTE afecto, folio SII, PDF y XML.
4. Guardar en `accountingEntries`: `folioSii`, `pdfUrl`, `xmlUrl`, `siiStatus`.
5. Enviar factura PDF/XML al correo de la empresa mediante proveedor transaccional.
6. Validar con contador el plan de cuentas y la conciliacion Mercado Pago/SII.

## Google Calendar y Gmail

1. Crear OAuth consent screen en Google Cloud.
2. Solicitar scopes minimos: Calendar events y envio de email si se usa Gmail API.
3. Guardar tokens por usuario con expiracion y refresh token.
4. Crear evento real en calendario de empresa y postulante al programar entrevista.
5. Enviar recordatorios por correo y registrar estado de envio.

## Usuarios demo reales

1. Ejecutar `gcloud auth application-default login`.
2. Confirmar permisos Admin SDK sobre `perfil-primero`.
3. Ejecutar `npm run seed:demo` en `functions`.
4. Ejecutar `npm run seed:coupons` en `functions`.
5. Estado actual: el seed de cupones fue intentado y fallo por falta de Application Default Credentials.

## Seguridad avanzada

1. Activar App Check para web y Functions.
2. Agregar rate limiting en Functions sensibles.
3. Configurar alertas de abuso y errores.
4. Revisar reglas Firestore con pruebas automatizadas.
5. Ejecutar auditoria OWASP basica antes de abrir datos reales masivamente.

## Evaluaciones profesionales

1. Seleccionar instrumentos no discriminatorios y apropiados al objetivo laboral.
2. Evitar declarar pruebas como psicometricas certificadas sin respaldo profesional.
3. Documentar finalidad, limites y uso de resultados en terminos y privacidad.
