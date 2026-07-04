# ADR-003: Mercado Pago como pasarela principal, Stripe como respaldo

**Estado:** Aceptado
**Fecha:** 2026-07-04 (documentación retroactiva)
**Autor:** `[completar]`
**Capítulos HTES relacionados:** Cap. 4 — Seguridad · Cap. 3 — Infraestructura

## Contexto

La plataforma cobra en pesos chilenos a postulantes (suscripción) y empresas
(desbloqueo/planes). El mercado objetivo es Chile.

## Problema

¿Qué pasarela de pago usar para maximizar conversión local y minimizar fricción
en Chile, sin quedar atado a un único proveedor?

## Alternativas Consideradas

1. **Solo Stripe** — excelente DX, pero menor penetración y medios de pago locales en Chile.
2. **Solo Mercado Pago** — cubre tarjetas, transferencia y efectivo en Chile; riesgo de proveedor único.
3. **Mercado Pago principal + Stripe como respaldo** — cobertura local y una vía alternativa ante caídas o casos de borde.

## Decisión

**Mercado Pago** como pasarela principal (Chile); **Stripe** como respaldo.
El webhook de MP valida firma HMAC y confirma el pago contra la API del
proveedor antes de marcarlo `paid`.

## Justificación

MP maximiza la conversión local (tarjetas, transferencia, efectivo). Stripe da
una segunda vía sin reescribir el flujo. La confirmación server-side del pago
evita spoofing.

## Consecuencias

- Positivas: cobertura de medios de pago chilenos; resiliencia por doble proveedor.
- Negativas / trade-offs: mantener dos integraciones y dos webhooks; dos juegos de credenciales.
- Efectos de segundo orden (Cap. 33): la contabilidad y el DTE deben reconciliar pagos de ambos proveedores.

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Webhook sin secret → pagos no confirmados | Alta (hoy) | Alto | RISK-001: registrar el webhook y cargar `MERCADOPAGO_WEBHOOK_SECRET`. |
| Firma malformada tumba el handler | Baja | Medio | Validación de largo antes de `timingSafeEqual` + 8 tests (`mp-signature.test.ts`). |

## Referencias

`functions/src/index.ts` (`mercadoPagoWebhook`, `stripeWebhook`), `functions/src/lib/mp-signature.ts`, RISK-001.
