# Checklist: Revisión Pre-Producción — Perfil Primero

**Objetivo:** verificar que la plataforma está lista para operar comercialmente (cobrar dinero real y tratar datos personales de usuarios reales).
**Responsable de aplicarlo:** `[completar]`
**Versión:** 1.0 · **Fecha:** 2026-07-04

> Estado a la fecha: base técnica desplegada y verificada. Los ítems `[ ]`
> abiertos son mayoritariamente activaciones externas (pagos, email, SII) y
> decisiones legales, no código.

## Seguridad (HTES Cap. 4)

- [x] Ningún `.env` real trackeado en git; `.env.local` y `functions/.env` gitignored.
- [x] Reglas de Firestore validadas con tests (25/25) y colecciones de dinero/PII write-locked.
- [x] Anonimato del postulante: PII fuera de `workerPublicProfiles`; `cvFileUrl` solo en perfil privado.
- [x] Perfiles públicos legibles solo por empresas verificadas, dueño, admin u OMIL creadora.
- [x] Escalada de rol omil/admin desde cliente bloqueada (reglas + auth-card).
- [x] Webhook de Mercado Pago valida firma HMAC; pagos confirmados contra la API del proveedor.
- [x] Reuso de `paymentId` bloqueado (propiedad + invitación + uso único).
- [x] Cabeceras HTTP de seguridad en `firebase.json`: HSTS con preload, CSP con allowlist, X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy, `object-src 'none'`, `base-uri 'self'`.
- [ ] Rotar la clave de IA expuesta históricamente en git y confirmar revocación (RISK-008).

## Pagos (RISK-001, RISK-004)

- [ ] Webhook de Mercado Pago registrado en el panel de desarrolladores.
- [ ] `MERCADOPAGO_WEBHOOK_SECRET` cargado en `functions/.env` y redeploy hecho.
- [ ] `MERCADOPAGO_ACCESS_TOKEN` confirmado como de producción (`APP_USR-...`).
- [ ] Pago de prueba real: pasa a `paid` y desbloquea contacto end-to-end.
- [ ] Inicio de actividades SII (RUT 78.449.783-6) y emisión de boleta/DTE operativa.

## Comunicaciones (RISK-003)

- [ ] Remitente verificado en SendGrid y `SENDGRID_FROM_EMAIL` configurado.
- [ ] Correo de prueba (bienvenida/invitación) entregado sin rebote.
- [ ] Claves VAPID configuradas si se habilitan notificaciones push.

## Legal y Privacidad (HTES Cap. 17 · Ley 21.719)

- [ ] RAT validado: base legal, plazos de retención y mecanismo de transferencia internacional (quitar todos los `[REVISAR]`).
- [x] Banner de consentimiento de cookies; analítica se desactiva al rechazar.
- [ ] Términos de uso y política de privacidad revisados legalmente.
- [ ] Evaluar EIPD por datos sensibles que puedan venir en el CV (RISK-005).

## Infraestructura y Despliegue (HTES Anexo C)

- [x] Hosting, Functions, reglas y Storage desplegados en `perfil-primero`.
- [x] Deploy hecho con la cuenta correcta (`perfilprimero7@gmail.com`).
- [ ] Dominio `perfil-primero.cl` conectado + sitemap en Search Console.
- [ ] Alertas de presupuesto GCP configuradas.
- [ ] GitHub Secrets del CI/CD cargados (DEBT-003) para deploy automatizado.

## Calidad (HTES Cap. 5, 13)

- [x] Build de frontend y functions sin errores.
- [x] Consola del navegador limpia (0 errores) en las páginas principales.
- [x] Accesibilidad WCAG AA (0 violaciones axe en 12 páginas auditadas).
- [x] Experiencia móvil verificada (sin overflow; tour y overlays secuenciados).
- [~] Tests del flujo de dinero en Cloud Functions (DEBT-002, P1): firma de webhook MP con 8 tests unitarios; falta `unlockWorkerContact` y cupones.

## Post-Despliegue (HTES Anexo D)

- [ ] Verificar los 3 logins en producción (postulante, empresa, OMIL) tras el release final.
- [ ] Monitorear el primer pago real y su registro contable.
- [ ] Revisar el semáforo de salud financiera tras los primeros movimientos.

## Resultado

[ ] Aprobado — cumple todos los elementos obligatorios
[x] **Aprobado con observaciones** — la base técnica, de seguridad, calidad y
    accesibilidad está lista. Bloquean el lanzamiento comercial las activaciones
    externas (webhook MP, SendGrid, SII) y la validación legal del RAT, todas
    registradas en `RISK_REGISTER.md`.
[ ] Rechazado

**Aplicado por:** `[completar]` · **Fecha:** 2026-07-04
