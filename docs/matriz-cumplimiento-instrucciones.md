# Matriz de cumplimiento - Perfil Primero

Fecha: 2026-06-15

## Implementado o adaptado a Firebase

| Requisito | Estado | Implementacion |
|---|---|---|
| Panel de facturas para empresa | Implementado como panel Firebase | `components/company-invoices-panel.tsx` lista pagos confirmados, folio SII, PDF y XML cuando existan. |
| Exportacion contable CSV | Implementado | `exportAccountingCsv` en Cloud Functions, acceso solo admin, descarga desde consola admin. |
| Cupones `BIENVENIDA50` y `LAUNCH100` | Implementado | Coleccion `coupons`, validacion en checkout y seed `functions/scripts/seed-coupons.mjs`. `LAUNCH100` deja $1 tecnico porque Mercado Pago no procesa $0. |
| Precio Mercado Pago de prueba | Implementado | CLP `$999`, moneda `CLP`, no USD. |
| Scripts backend | Implementado parcialmente | `functions/package.json` incluye `seed:demo` y `seed:coupons`. |
| Registro contable de pagos | Implementado | `accountingEntries` con bruto, neto, IVA, comision MP estimada y estado SII pendiente. |
| Lista de pendientes no implementables sin proveedor | Implementado | Ver `docs/backlog-implementacion-pendiente.md`. |

## Adaptado, no copiado literal

| Requisito original | Motivo de adaptacion |
|---|---|
| Express + Sequelize + modelos relacionales | El proyecto real usa Firebase, Firestore y Cloud Functions. Se adapto a colecciones y callables. |
| Endpoint Express `/api/admin/exportar-contabilidad` | Se implemento como callable `exportAccountingCsv` con Auth admin. |
| `PanelFacturasEmpresa.jsx` | Se implemento como componente Next/React `CompanyInvoicesPanel`. |
| Seed Sequelize de cupones | Se implemento como seed Firestore con Firebase Admin SDK. |

## Pendiente por dependencia externa

| Requisito | Estado |
|---|---|
| Facturacion electronica real SII/OpenFactura | Pendiente de proveedor, API key, datos tributarios y ambiente de certificacion. |
| PDF/XML tributario real | Pendiente de proveedor de facturacion. |
| Envio de factura por correo | Pendiente de proveedor email o Gmail API/OAuth. |
| Google Calendar automatico en calendarios de ambos usuarios | Pendiente de OAuth Calendar por usuario. |
| Usuarios demo reales en Firebase Auth | Pendiente de Application Default Credentials o ejecucion manual con permisos Admin SDK. |
| Tests psicometricos certificados | Pendiente de instrumento profesional validado y revision legal. |
