# Roadmap — Perfil Primero

**Última actualización:** 2026-07-04 · **Responsable:** `[completar]`

## Visión

Ser la plataforma laboral invertida de referencia en Chile: un mercado donde los
postulantes publican un perfil anónimo una sola vez y son las empresas
verificadas quienes los buscan y contactan con sueldo y condiciones claras desde
el primer mensaje. El valor central es la **transparencia salarial** y el
**anonimato del postulante** hasta que decide avanzar.

## Objetivos del Periodo Actual

Fase: **previo al lanzamiento**. Objetivos medibles para habilitar el cobro real:

1. **Activar el flujo de pagos end-to-end** — webhook de Mercado Pago registrado y confirmando pagos (hoy bloqueado). Métrica: un pago de prueba real pasa a estado `paid` y desbloquea contacto.
2. **Habilitar correo transaccional** — remitente SendGrid verificado; invitaciones, bienvenidas y recordatorios llegan (hoy rebotan). Métrica: tasa de entrega > 95%.
3. **Cumplimiento tributario mínimo** — inicio de actividades SII y emisión de boleta/DTE antes del primer peso cobrado.
4. **Cierre legal de privacidad** — RAT con base legal, plazos de retención y transferencias internacionales validados (Ley 21.719).

## MVP / Alcance Mínimo

Alcanzado técnicamente y desplegado en `https://perfil-primero.web.app`:
registro y perfil de postulantes (anónimo), registro y verificación de empresas,
invitaciones con sueldo declarado, desbloqueo de contacto pagado, IA de análisis
de CV, consola admin completa (pagos, contabilidad, cupones, auditoría, salud
financiera), rol OMIL. Falta activar los integradores externos (pagos, email,
SII) para operar comercialmente.

## Versiones

| Versión | Fecha objetivo | Contenido principal | Estado |
|---|---|---|---|
| v1.x (base técnica) | — | Plataforma completa desplegada, endurecimiento de seguridad y accesibilidad AA | Liberada |
| Lanzamiento comercial | `[completar]` | Pagos reales + email + SII + dominio `perfil-primero.cl` | En curso |
| Post-lanzamiento | `[completar]` | Tests de backend, modularización de functions, CI/CD activo | Planeada |

## Prioridades

| Prioridad | Iniciativa | Justificación |
|---|---|---|
| P0 | Webhook Mercado Pago + secret | Sin esto ningún pago se confirma: el cliente paga y no recibe. Bloquea todo ingreso. |
| P0 | Inicio de actividades SII | Cobrar sin poder emitir documento tributario es infracción. |
| P1 | Remitente SendGrid verificado | Sin correo, invitaciones y recordatorios no llegan: rompe el loop de contratación. |
| P1 | Validación legal del RAT | Transferencia internacional sin mecanismo válido es infracción (Ley 21.719). |
| P2 | Dominio `perfil-primero.cl` + Search Console | SEO y confianza de marca. |

## Riesgos Relevantes para el Roadmap

Ver `docs/RISK_REGISTER.md`. Condicionan la fecha de lanzamiento: RISK-001
(pagos), RISK-003 (email), RISK-004 (SII), RISK-002 (privacidad).

## Deuda Técnica que Afecta la Planificación

Ver `docs/TECHNICAL_DEBT.md`. DEBT-002 (sin tests de backend en el flujo de
dinero) es la deuda que más riesgo agrega a cada despliegue previo al lanzamiento.

## Ideas Futuras (sin comprometer fecha)

- Integración OAuth real Google Calendar/Gmail para agendar entrevistas.
- Modularización de `functions/src/index.ts` en dominios.
- App móvil / PWA instalable con notificaciones push activas.

---
Toda modificación relevante de este Roadmap deberá quedar registrada (HTES 50 — Gestión del Conocimiento).
