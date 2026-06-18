# Roadmap tecnico: Perfil Primero

> **Estado al 2026-06-17:** plataforma desplegada y operativa en https://perfil-primero.web.app

## Objetivo

Plataforma laboral invertida donde trabajadores publican perfiles protegidos y empresas verificadas buscan, invitan y contratan talento con sueldo y condiciones claras desde el primer contacto.

Prioridades arquitectonicas:

- Desarrollo rapido sin servidores dedicados.
- Bajo costo inicial con Firebase sin costo en volumenes bajos.
- Seguridad de datos personales con perfiles anonimos.
- Suscripciones y pagos trazables con Mercado Pago y Stripe.
- Escalabilidad via Cloud Functions y Firestore.

---

## Stack implementado

### Frontend

- **Next.js** con `output: "export"` — exportacion estatica, sin SSR.
- **React + TypeScript**.
- Desplegado en **Firebase Hosting** con CDN global y SSL automatico.
- SPA con cuatro paneles: `/postulante`, `/empresa`, `/consola-admin`, `/omil`.

### Backend

- **Firebase Cloud Functions v2** (`onCall`, `onRequest`, `onSchedule`).
- Toda la logica de negocio critica vive en `functions/src/index.ts`.
- Sin endpoints REST propios; los clientes usan `httpsCallable`.

### Base de datos

- **Cloud Firestore** — NoSQL, tiempo real, reglas de seguridad granulares.
- Indice compuesto para busqueda de trabajadores por region, sector y salario.
- Colecciones write-locked: solo Cloud Functions pueden escribir en invitations, payments, conversationMessages, contactUnlocks, auditEvents, y otras colecciones criticas.

### Archivos

- **Firebase Storage** — CVs en PDF, logos de empresa, fotos de perfil.
- Acceso privado via `getDownloadURL` desde backend; nunca URLs publicas directas.

### Autenticacion

- **Firebase Auth** — email/password y Google OAuth.
- Cuatro roles: `worker`, `company`, `admin`, `omil`.
- Rol almacenado en `users/{uid}.role`; verificado server-side en Cloud Functions con `assertAdmin()`.

---

## Pagos — implementado

### Trabajador

- **$999 CLP** por 30 dias de visibilidad (precio de lanzamiento).
- Precio real: $9.990 CLP.
- Configurable desde Firestore en `configuracion_sistema/tarifas`.

### Empresa

- **$999 CLP** por desbloqueo de contacto (precio de lanzamiento).
- Precio real: $24.990 CLP.
- Configurable desde Firestore en `configuracion_sistema/tarifas`.

### Proveedores

- **Mercado Pago** (primario, Chile). SDK oficial en Cloud Functions. Webhook en `mercadoPagoWebhook`.
- **Stripe** (secundario/respaldo). Webhook en `stripeWebhook`.
- Precios gestionados desde `configuracion_sistema/tarifas` — no hardcodeados.

---

## Colecciones Firestore — implementadas

| Coleccion | Escritura |
|---|---|
| `users` | Cliente (owner) + Admin SDK |
| `workerPublicProfiles` | Cliente (owner) + Admin SDK |
| `workerPrivateProfiles` | Cliente (owner) + Admin SDK |
| `companyProfiles` | Cliente (owner) + Admin SDK |
| `jobOffers` | Cliente (owner) + Admin SDK |
| `invitations` | Solo Cloud Functions |
| `contactUnlocks` | Solo Cloud Functions |
| `payments` | Solo Cloud Functions |
| `conversationMessages` | Solo Cloud Functions |
| `scheduledInterviews` | Solo Cloud Functions |
| `platformReviews` | Solo Cloud Functions |
| `accountingEntries` | Solo Cloud Functions |
| `emailReminders` | Solo Cloud Functions |
| `aiUsageLogs` | Solo Cloud Functions |
| `marketAnalyticsReports` | Solo Cloud Functions |
| `configuracion_sistema` | Solo Cloud Functions |
| `auditEvents` | Solo Cloud Functions |

---

## Cloud Functions exportadas

`createInvitation`, `updateInvitationStatus`, `acceptInvitation`, `acceptInterviewRules`, `createWorkerSubscriptionCheckout`, `createCompanyUnlockCheckout`, `mercadoPagoWebhook`, `stripeWebhook`, `analyzeWorkerCv`, `analyzeCvWithAi`, `getProfileAiAdvice`, `getCandidateMatchAdvice`, `listCompaniesForReview`, `updateCompanyVerification`, `createManagedUser`, `getAdminDashboard`, `scheduleInterview`, `submitReview`, `sendConversationMessage`, `getUnlockedWorkerContact`, `listCompanyBillingDocuments`, `generateMarketAnalyticsNow`, `getPublicPricingConfig`, `updateBillingDocument`, `approveManualTransfer`.

---

## IA implementada

- **Gemini 2.5 Flash** via `@google/genai` SDK oficial.
- `GEMINI_MODEL` configurable por variable de entorno en `functions/.env`.
- Cada llamada registra `aiUsageLogs` con modelo, latencia, estado, tamaño de prompt y respuesta.
- Funciones IA activas: analisis de CV (`analyzeCvWithAi`), consejo de perfil (`getProfileAiAdvice`), compatibilidad empresa-candidato (`getCandidateMatchAdvice`).

---

## Fases de desarrollo

### Fase 1: MVP funcional — COMPLETADA

- [x] Registro y login (email + Google).
- [x] Onboarding de trabajador con perfil publico y datos privados separados.
- [x] Vista previa anonima del perfil.
- [x] Suscripcion del trabajador via Mercado Pago / Stripe.
- [x] Onboarding de empresa con verificacion.
- [x] Buscador de perfiles anonimos con filtros por region, sector y salario.
- [x] Invitaciones con sueldo obligatorio.
- [x] Panel de invitaciones para trabajador y empresa.
- [x] Aceptacion/rechazo de invitaciones.
- [x] Desbloqueo de contacto (pago empresa).
- [x] Panel admin con dashboard y verificacion de empresas.

### Fase 2: Confianza y control — COMPLETADA

- [x] Verificacion de empresas con estado `pending → verified`.
- [x] Reputacion y `reputationScore` en perfil de empresa.
- [x] Procesos con vencimiento (`expiresAt` en invitaciones).
- [x] Mensajeria en tiempo real via Firestore `onSnapshot`.
- [x] Agendamiento de entrevistas (`scheduledInterviews`).
- [x] Evaluaciones post-proceso (`platformReviews`).
- [x] Reportes cientificos de mercado semanales (`generateMarketAnalyticsReport`).
- [x] Panel contable para admin (CSV, asientos, conciliacion manual).
- [x] Analisis de CV con IA (Gemini).
- [x] Suite de Firestore Security Rules con 14 pruebas en emulador.
- [x] OMIL: creacion de perfiles gestionados por oficinas municipales.

### Fase 3: Matching inteligente — PARCIALMENTE COMPLETADA

- [x] Compatibilidad empresa-candidato con score IA (`getCandidateMatchAdvice`).
- [x] Consejos de mejora de perfil con IA (`getProfileAiAdvice`).
- [x] Filtros compuestos server-side con indices Firestore productivos.
- [ ] Busquedas guardadas para empresas.
- [ ] Alertas inteligentes por nuevos perfiles compatibles.
- [ ] Sugerencias de candidatos similares en panel empresa.

---

## Pendientes reales

- Integracion productiva con proveedor OpenFactura/SII para DTE real.
- Envio de correos transaccionales via SendGrid, Gmail API o Cloud Tasks.
- Paginacion con cursor real en buscador de talento (actualmente limite de 50).
- Prueba completa Mercado Pago con pago real/sandbox aprobado.
- Revision legal por abogado chileno antes de operar con datos reales masivos.

---

## Costos estimados Firebase (referencia junio 2026)

- **Hosting**: 10 GB almacenamiento y 360 MB/dia transferencia sin costo. Luego $0.026/GB y $0.15/GB.
- **Firestore**: 1 GiB, 50.000 lecturas/dia, 20.000 escrituras/dia sin costo.
- **Cloud Functions**: 2 millones de invocaciones/mes sin costo; luego $0.40/millon.
- **Firebase Storage**: cuotas sin costo segun tipo de bucket y region.

Fuentes: https://firebase.google.com/pricing
