# API — Cloud Functions (callable) de Perfil Primero

**Última actualización:** 2026-07-04 · Región `us-central1` · Firebase Functions v2 (Node 22).

> El backend expone **Cloud Functions callable** (`onCall`), no endpoints REST.
> Se invocan con el SDK de Firebase (`httpsCallable`). La autenticación es la
> sesión Firebase Auth del usuario (`request.auth`). Los webhooks (`onRequest`)
> sí son HTTP. Esta es una referencia de las funciones principales; el detalle
> exacto está en `functions/src/index.ts`.

## Convenciones

- **Auth:** salvo indicación, requieren sesión válida. Las admin exigen
  `role: admin` (`assertAdmin`). Errores como `HttpsError` con códigos
  `unauthenticated`, `permission-denied`, `failed-precondition`, `invalid-argument`.

## Invitaciones y contacto

### `createInvitation`
Empresa invita a un postulante. **Auth:** empresa. Rate limit: 10/min.
Entrada: `{ workerId, opportunityTitle, salaryMin, salaryMax, currency, workMode, contractType, message, ... }`. Crea la invitación en estado `sent`.

### `acceptInvitation` / `updateInvitationStatus`
Avanzan la máquina de estados de la invitación. **Auth:** parte involucrada.

### `unlockWorkerContact`
Desbloquea el contacto del postulante tras pago. **Auth:** empresa dueña de la invitación.
Entrada: `{ invitationId, paymentId?, useUnlimitedPlan? }`. Verifica: invitación aceptada, pago `paid`, **propiedad del pago** (`userId == empresa`), correspondencia con la invitación y **uso único** (sin unlock previo con ese `paymentId`). Errores: `failed-precondition` (pago no confirmado / ya usado), `permission-denied` (pago ajeno).

## Pagos

### `createWorkerSubscriptionCheckout` / `createCompanyUnlockCheckout` / `createCompanyMonthlyCheckout` / `createCompanyUnlimitedCheckout`
Crean la preferencia de pago (Mercado Pago). Entrada: `{ couponCode? }` u opciones. Devuelven `{ url }`.

### `mercadoPagoWebhook` (HTTP `onRequest`)
Recibe la notificación de MP. **Valida la firma HMAC** (`validateMpSignature`) y confirma el pago contra la API de MP antes de marcarlo `paid`. No confía en el body.

### `stripeWebhook` (HTTP)
Equivalente para Stripe (respaldo), con verificación de firma de Stripe.

## IA

### `analyzeCvWithAi`
Estructura el CV con IA. **Auth:** worker. Entrada: `{ fileName, mimeType, base64, preExtractedText? }`. Devuelve el perfil estructurado + campos `extracted*` (PII, van al perfil privado). El prompt anonimiza el texto público.

### `getProfileAiAdvice`
Sugerencias para mejorar el perfil. **Auth:** requerida.

## Admin

### `getAdminDashboard`
Panel operativo (empresas, postulantes, pagos, contabilidad…). **Auth:** admin. Entrada: `{ pageSize?, from?, to?, cursors? }`.

### `getFinancialHealth` / `updateFinancialConfig`
Semáforo de salud financiera y su configuración. **Auth:** admin. Lógica pura testeada en `functions/src/lib/financial-health.ts`.

### `createCoupon`
Crea un cupón. **Auth:** admin. Entrada: `{ code, name, discountPercent, maxUses, expiresAt }`. Valida y evita duplicados.

### `createManagedUser` / `claimAdminRole`
Creación de usuarios institucionales (omil) y bootstrap del admin propietario (allowlist de email). Ver ADR-004.

### `updateCompanyVerification` / `listCompaniesForReview`
Verificación de empresas. **Auth:** admin.

### `purgeLegacyCvFileUrls`
Mantenimiento: elimina `cvFileUrl` legacy de perfiles públicos. **Auth:** admin.

## OMIL

### `createOmilPostulantProfile`
La OMIL crea un perfil de postulante por cuenta del beneficiario. **Auth:** rol `omil` activo.

### `getOmilImpactPanel`
Métricas de impacto de la OMIL (perfiles, invitaciones, contrataciones), contando por lotes de 30 para no subcontar.

---

Errores comunes (todas): `unauthenticated` (sin sesión), `permission-denied`
(rol o propiedad incorrecta), `failed-precondition` (estado inválido),
`invalid-argument` (datos faltantes/ inválidos).
