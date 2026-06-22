# CLAUDE.md

> **AISLAMIENTO DE PROYECTO — LEER PRIMERO**
> Este repositorio es EXCLUSIVAMENTE Perfil Primero (Pagina de Empleos).
> NUNCA tocar, mencionar ni ejecutar comandos en: Kineassistance, hopper-tech-web, ni ningún otro proyecto.
> Si el usuario pide algo que involucre otro proyecto, recordarle que debe abrir una sesión separada desde esa carpeta.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Perfil Primero** — plataforma laboral invertida donde postulantes publican perfiles protegidos y empresas verificadas buscan talento con sueldo y condiciones claras. Deployed at `https://perfil-primero.web.app`.

## Commands

```bash
# Development
pnpm dev              # next dev on localhost:3000
pnpm build            # static export to out/
pnpm lint             # ESLint

# Testing
npm run test:rules    # Firestore security rules (requires Firebase emulators)
npm run test:e2e:auth # Auth roles smoke test (live)

# Firebase
npm run firebase:emulators  # start local emulators
npm run firebase:deploy     # deploy hosting + functions + rules
```

Cloud Functions have their own build step inside `functions/`. When modifying them, `cd functions && npm run build` before deploying.

## Architecture

### Next.js static export

`next.config.mjs` sets `output: "export"` — no SSR, no API routes. All dynamic server logic lives in Cloud Functions. The app is a pure client-side SPA hosted on Firebase Hosting.

### Four user roles

`UserRole = "worker" | "company" | "admin" | "omil"` (defined in `lib/domain/types.ts`). Role is stored in `users/{uid}.role` in Firestore and checked server-side via `assertAdmin()` inside Cloud Functions and client-side via `getUserRole()` in `lib/firebase/auth.ts`.

- **worker** (`/postulante`, `/trabajador`): publishes anonymous profile, pays 999 CLP for 30-day visibility.
- **company** (`/empresa`): searches anonymous profiles, pays 999 CLP to unlock contact after invitation is accepted.
- **admin** (`/consola-admin`): full read/write via Cloud Functions.
- **omil**: Municipal Employment Offices can create worker profiles on behalf of job seekers.

### Write-locked Firestore collections

Several collections are `allow write: if false` in `firestore.rules` — they can only be written by Cloud Functions (using Firebase Admin SDK): `invitations`, `contactUnlocks`, `payments`, `conversationMessages`, `scheduledInterviews`, `platformReviews`, `accountingEntries`, `emailReminders`, `aiUsageLogs`, `marketAnalyticsReports`, `configuracion_sistema`, `auditEvents`.

Client code can only write: `users`, `workerPublicProfiles`, `workerPrivateProfiles`, `companyProfiles`, `jobOffers`.

### Cloud Functions (`functions/src/index.ts`)

Single file with all backend logic. Key exported functions include: `createInvitation`, `updateInvitationStatus`, `createWorkerCheckout`, `createCompanyCheckout`, `mercadoPagoWebhook`, `stripeWebhook`, `analyzeWorkerCv` (Gemini), `listCompaniesForReview`, `updateCompanyVerification`, `createManagedUser`, `getAdminDashboard`, `scheduleInterview`, `submitReview`.

Uses Firebase Functions v2 (`onCall`, `onRequest`, `onSchedule`). All `onCall` functions receive `request.auth?.uid` for identity.

### lib/ layout

```
lib/
  domain/
    types.ts          # shared TypeScript types and interfaces
    catalogs.ts       # static lists (sectors, regions, skills)
    matching-engine.ts # profile completeness scoring
    demo-data.ts      # seed data for demos
  firebase/
    client.ts         # Firebase app init (auth, db, storage, functions)
    auth.ts           # registerWithEmail, loginWithGoogle, getUserRole
    workers.ts        # Firestore CRUD for worker profiles
    companies.ts      # Firestore CRUD for company profiles
    omil.ts           # OMIL-specific operations
    admin.ts          # Admin SDK calls (callable functions wrappers)
```

### Payment flow

Primary: **Mercado Pago** (Chile). `MERCADOPAGO_ACCESS_TOKEN` goes in `functions/.env`. Webhook endpoint: `https://us-central1-perfil-primero.cloudfunctions.net/mercadoPagoWebhook`.

Secondary/fallback: **Stripe**. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_WORKER_PRICE_ID` go in root `.env.local`.

### Environment variables

Root `.env.local` — frontend (Next.js `NEXT_PUBLIC_*`) and some function-call URLs. See `.env.example`.

`functions/.env` — secrets used only by Cloud Functions: `MERCADOPAGO_ACCESS_TOKEN`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Firestore data model highlights

- `workerPublicProfiles/{workerId}` — anonymous public profile; `workerId == uid`. `visibilityStatus` controls whether the profile appears in search.
- `workerPrivateProfiles/{workerId}` — contact details visible only to owner and admin.
- `companyProfiles/{companyId}` — company must pass verification (`verificationStatus: "pending" → "verified"`).
- `invitations/{invitationId}` — created only by Cloud Functions; status machine: `sent → viewed → accepted → in_process → offer_sent → hired/closed`.
- `payments/{paymentId}` — written only by webhook Cloud Functions.
