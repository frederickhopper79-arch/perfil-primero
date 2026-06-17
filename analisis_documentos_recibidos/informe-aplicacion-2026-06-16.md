# Informe de aplicacion de documentos - 2026-06-16

## Documentos procesados

Se extrajeron y dejaron en Markdown los 9 documentos Word entregados por el usuario en esta carpeta. La extraccion permite auditar requisitos sin depender de abrir Word.

## Requisitos aplicados en esta pasada

- Motor IA interno: Functions ya usa el SDK oficial `@google/genai` con modelo configurable por `GEMINI_MODEL`, por defecto `gemini-2.5-flash`, y respuestas JSON estructuradas.
- Auditoria IA: cada llamada central a Gemini registra `aiUsageLogs` con modelo, estado, latencia, tamano de prompt/respuesta y si hubo archivo.
- Mercado Pago: el backend usa el SDK oficial `mercadopago` para crear preferencias y consultar pagos desde webhooks.
- Precio de lanzamiento: se reemplazo el precio fijo como unica fuente por `configuracion_sistema/tarifas` en Firestore, con valores base:
  - `fase_lanzamiento_activa: true`
  - `tarifa_suscripcion_postulante_clp: 999`
  - `tarifa_contacto_empresa_clp: 999`
  - `tarifa_postulante_precio_real: 9990`
  - `tarifa_empresa_precio_real: 24990`
- Firestore/costos: la busqueda de postulantes visibles queda limitada a 20 documentos por llamada.
- Monitoreo cientifico de mercado: se creo `generateMarketAnalyticsReport`, job semanal que calcula postulantes visibles, ofertas visibles, vacantes, sueldo promedio, skills/areas principales, bloqueos de chat y metricas IA.
- Consola administracion: el dashboard ahora lee `marketAnalyticsReports` y muestra tabla de reportes cientificos de mercado.
- Despliegue: Functions y Hosting fueron desplegados en Firebase.

## Validaciones ejecutadas

- `tsc -p functions/tsconfig.json`: correcto.
- `next build`: correcto.
- `firebase deploy --only functions,hosting`: correcto.

## Pendientes duros detectados en los documentos

- Facturacion real SII/OpenFactura: la plataforma registra estado contable, pero falta integracion real con proveedor de DTE.
- Conciliacion bancaria por transferencia: falta endpoint/panel transaccional para aprobar transferencias contra factura anticipada.
- Paginacion avanzada de buscador empresa: existe limite de 20; falta cursor UI real, filtros compuestos e indices productivos.
- Chat en tiempo real: falta optimizacion fina para escuchar solo mensajes nuevos por cursor/timestamp en todas las vistas.
- Correos reales Gmail/SendGrid: hay registros `emailReminders`, pero falta proveedor de envio conectado.
- Reportes contables descargables avanzados: existe CSV contable base; falta separacion mensual F29, XML/PDF DTE y conciliacion completa.
