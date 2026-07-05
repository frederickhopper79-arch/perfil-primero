# Registro de Riesgos — Perfil Primero

**Última actualización:** 2026-07-04 · **Responsable del registro:** `[completar]`

| ID | Riesgo | Probabilidad | Impacto | Responsable | Estado | Acción |
|---|---|---|---|---|---|---|
| RISK-001 | Webhook de Mercado Pago no registrado / sin `MERCADOPAGO_WEBHOOK_SECRET`: los pagos se cobran pero nunca pasan a `paid`, el contacto no se desbloquea (cliente paga y no recibe). | Alta | Alto | `[completar]` | Abierto | Registrar el webhook en el panel MP, cargar el secret en `functions/.env`, redeploy y probar un pago real. |
| RISK-002 | Transferencia internacional de datos personales (Firebase, Stripe, SendGrid, IA en EE. UU.) sin mecanismo legal validado. Infracción bajo Ley 21.719. | Media | Alto | `[completar]` | Abierto | Completar los `[REVISAR]` del RAT: base legal, plazos y mecanismo de transferencia. Revisión legal antes del lanzamiento. |
| RISK-003 | SendGrid sin remitente verificado / `SENDGRID_FROM_EMAIL` a dominio inexistente: los correos transaccionales rebotan. | Alta | Medio | `[completar]` | Abierto | Verificar un remitente en SendGrid y configurar `SENDGRID_FROM_EMAIL`. |
| RISK-004 | Inicio de actividades SII pendiente (RUT 78.449.783-6): imposible emitir boleta/DTE válida al cobrar. | Alta | Alto | `[completar]` | Abierto | Gestión en sii.cl + credenciales OpenFactura antes del primer cobro real. |
| RISK-005 | El CV cargado por el postulante puede contener datos sensibles no solicitados que se envían al proveedor de IA sin EIPD. | Media | Alto | `[completar]` | Abierto | Evaluar minimización / Evaluación de Impacto (EIPD). Revisar política de retención del proveedor de IA. |
| RISK-006 | `functions/src/index.ts` monolítico (~5.400 líneas) con toda la lógica de dinero: riesgo de regresión en cada deploy. | Media | Alto | `[completar]` | Mitigado | Lógica de dinero (firma webhook, desbloqueo, cupones, semáforo) extraída a `lib/` con 50 tests unitarios. Modularización de handlers pendiente (RFC-001 / DEBT-001). |
| RISK-007 | PC de desarrollo multi-cliente: la cuenta activa de Firebase CLI puede cambiar y desplegar en el proyecto equivocado. | Media | Alto | `[completar]` | Mitigado | Verificar `firebase login:list` = `perfilprimero7@gmail.com` antes de cada deploy (documentado en CLAUDE.md y AI_CONTEXT). |
| RISK-008 | Clave de IA expuesta en el historial de git en el pasado (rotación pendiente de confirmar). | Baja | Alto | `[completar]` | Abierto | Rotar la clave en GCP/proveedor y confirmar que la anterior está revocada. |

## Clasificación de Referencia (HTES Cap. 16)

Arquitectónico · Operacional · Seguridad · Producto · Inteligencia Artificial

- Operacional: RISK-001, RISK-003, RISK-004, RISK-007
- Seguridad / Privacidad: RISK-002, RISK-005, RISK-008
- Arquitectónico: RISK-006
- IA: RISK-005

## Revisión

Este registro deberá revisarse en cada auditoría HTES y cada vez que se apruebe
una RFC con impacto significativo. Los responsables (`[completar]`) deben
asignarse por rol antes del lanzamiento.
