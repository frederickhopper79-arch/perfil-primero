# AI_CONTEXT — Perfil Primero

> Este documento es el punto oficial de entrada para cualquier Inteligencia
> Artificial que trabaje en este proyecto (HTES Cap. 31). Toda IA deberá
> leer este archivo antes que cualquier otro, según el Orden Oficial de
> Lectura: README → **AI_CONTEXT** → Arquitectura → Roadmap → HTES → Código.

**Última actualización:** 2026-07-04 — quien la modifique por última vez actualiza esta línea.

## 1. Identidad del Proyecto

- **Nombre:** Perfil Primero (`perfil-primero`)
- **Objetivo de negocio:** Plataforma laboral invertida para Chile: los postulantes publican un perfil anónimo y son las empresas verificadas quienes los contactan con cargo, sueldo y condiciones claras desde el primer mensaje (invierte el flujo tradicional de postulación).
- **Estado actual:** En desarrollo — previo al lanzamiento. Base técnica desplegada en producción (`https://perfil-primero.web.app`); pendientes externos de activación (webhook Mercado Pago, SendGrid, SII/DTE) antes del cobro real.
- **HTES aplicable:** HTES v1.0 (ver `docs/HTES_v1.0.docx`). Sin excepciones documentadas al día de hoy.

## 2. Arquitectura (resumen)

Arquitectura **serverless / SPA estática**: el frontend es un Next.js con
`output: "export"` (sin SSR ni API routes) servido como sitio estático desde
Firebase Hosting. Toda la lógica de servidor vive en Cloud Functions (Firebase
Functions v2). El cliente habla directo con Firestore/Auth/Storage bajo reglas
de seguridad; las operaciones sensibles pasan por Cloud Functions con Admin SDK.

- **Módulos principales:**
  - `app/` — rutas y páginas del SPA (Next.js App Router, export estático).
  - `components/` — UI y workspaces por rol (postulante, empresa, admin, OMIL).
  - `lib/domain/` — tipos, catálogos, motor de matching, pricing.
  - `lib/firebase/` — init de cliente, auth, CRUD de workers/companies/OMIL, wrappers de callables admin.
  - `functions/src/index.ts` — backend completo (un solo archivo, ~5.400 líneas): pagos, invitaciones, IA, notificaciones, contabilidad, salud financiera, admin.
- **Base de datos:** Cloud Firestore. Colecciones de escritura de cliente: `users`, `workerPublicProfiles`, `workerPrivateProfiles`, `companyProfiles`, `jobOffers`. El resto (pagos, invitaciones, mensajes, cupones, contabilidad, auditoría, etc.) son **write-locked** (`allow write: if false`) y solo las escribe Cloud Functions.
- **Integraciones externas:**
  - **Mercado Pago** — pasarela de pago principal (Chile).
  - **Stripe** — pasarela de respaldo/secundaria.
  - **Groq / Google Gemini (`@google/genai`)** — análisis y estructuración de CV, asesoría de perfil.
  - **SendGrid** — correo transaccional (invitaciones, recordatorios, bienvenidas).
  - **web-push (VAPID)** — notificaciones push PWA.
  - **Google Analytics 4** — analítica de uso.

## 3. Stack Tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Frontend | Next.js (App Router, export estático) | ^15.0 | `output: "export"`, sin SSR ni API routes |
| Frontend | React | ^19.0 | |
| Lenguaje | TypeScript | ^5.6 | frontend y functions |
| Backend | Firebase Cloud Functions v2 | firebase-functions | runtime Node.js 22, región `us-central1` |
| SDK cliente | Firebase JS SDK | ^12.0 | Auth, Firestore, Storage, Functions |
| Infraestructura | Firebase Hosting + Firestore + Storage | — | proyecto GCP `perfil-primero` |
| Pagos | mercadopago / stripe | — | MP primario, Stripe fallback |
| IA | @google/genai (Gemini) + Groq | — | análisis de CV, asesoría de perfil |
| CI/CD | GitHub Actions | — | `.github/workflows/deploy.yml`: lint + build + tests de reglas + deploy hosting/functions/rules |

## 4. Restricciones del Proyecto

- **Aislamiento de proyecto (crítico):** este repositorio es exclusivamente
  Perfil Primero. Nunca tocar, mencionar ni ejecutar comandos en otros proyectos
  (Kineassistance, Hopper Tech, etc.). Una sesión = un proyecto = una carpeta.
- **Cuenta Firebase:** todo deploy debe hacerse autenticado como
  `perfilprimero7@gmail.com`. Verificar con `firebase login:list` antes de
  desplegar (PC multi-cliente donde la cuenta activa puede cambiar).
- **Colecciones write-locked:** no proponer escritura de cliente sobre colecciones
  de dinero/PII (pagos, invitaciones, cupones, contabilidad, auditoría…). Su
  integridad depende de que solo Cloud Functions las escriba.
- **Anonimato del postulante:** es la propuesta de valor central. No exponer en
  `workerPublicProfiles` datos que permitan identificar a la persona (nombre, RUT,
  teléfono, email, URL del CV original). Esos datos viven en `workerPrivateProfiles`.
- **No cambiar la pasarela de pagos ni tocar el flujo de cobro/facturación** sin
  revisión explícita.
- **Objetivo de negocio a largo plazo, límites comerciales y decisiones de precio definitivo:** `[completar]` (decisión humana).

## 5. Convenciones Específicas de este Proyecto

- **Static export:** no hay SSR ni API routes; toda lógica de servidor va en
  Cloud Functions. No introducir código que dependa de servidor Next.js en runtime.
- **Cuatro roles de usuario:** `worker | company | admin | omil` (en `lib/domain/types.ts`),
  guardados en `users/{uid}.role` y verificados server-side con `assertAdmin()` y
  client-side con `getUserRole()`.
- **Roles institucionales (omil/admin) no se crean desde el cliente:** solo el
  backend (`createManagedUser` / `claimAdminRole`) puede asignarlos.
- **Secretos:** `functions/.env` para secretos de Cloud Functions; `.env.local`
  para el frontend (`NEXT_PUBLIC_*`). Nunca commitear `.env` reales.
- **Idioma:** UI, copy y mensajes en español de Chile (es-CL).

## 6. Documentos de Referencia

- `README.md` — cómo instalar y ejecutar.
- `CLAUDE.md` — guía operativa del repositorio para IA (aislamiento, arquitectura, modelo de datos).
- `docs/HTES_v1.0.docx` — estándar de ingeniería aplicable (HTES v1.0).
- `docs/HTES_Cheatsheet.docx` — resumen del estándar.
- `/docs/adr/` — decisiones de arquitectura (ADR-001 a 005 documentadas).
- `/docs/DATABASE_DOC.md` — modelo de datos Firestore (colecciones, PII, write-locked).
- `/docs/API_DOC.md` — referencia de las Cloud Functions callable.
- `/docs/rfc/` — cambios importantes en curso o evaluados.
- `/docs/privacidad/RAT_REGISTRO_TRATAMIENTO.md` — registro de actividades de tratamiento (Ley 19.628 / 21.719).
- `/docs/ONBOARDING.md` — guía de entrada para desarrollar en el proyecto (Cap. 29).
- `/docs/plantillas/` — plantillas oficiales HTES (POSTMORTEM, INCIDENT_REPORT, API_DOC, etc.).
- `ROADMAP.md` — visión, objetivos del periodo y prioridades (raíz del proyecto).
- `/docs/RISK_REGISTER.md` — registro de riesgos vivo (HTES Cap. 16).
- `/docs/TECHNICAL_DEBT.md` — registro de deuda técnica vivo.
- Base de Conocimiento Hopper Tech: `[completar]`

## 7. Personas y Roles Responsables

| Rol (HTES Cap. 27) | Responsable | Contacto |
|---|---|---|
| Arquitectura | `[completar]` | `[completar]` |
| Producto | `[completar]` | `[completar]` |
| Seguridad | `[completar]` | `[completar]` |

## 8. Incidentes y Aprendizajes Relevantes

Aún no hay postmortems formales (`docs/plantillas/POSTMORTEM.md` disponible como
plantilla). Aprendizajes recientes relevantes que cambian cómo se trabaja aquí:

- **Anonimato y pagos son superficie crítica.** Se corrigieron fugas reales: el
  `cvFileUrl` (PDF con datos personales) vivía en el perfil público, y un
  `paymentId` podía reutilizarse para desbloquear contactos ilimitados. Toda
  función que toque pagos o perfiles públicos debe revisarse contra estos dos
  vectores.
- **Escalada de rol:** los perfiles institucionales (omil/admin) se creaban desde
  el cliente si el documento de rol no existía. Corregido en reglas y en `auth-card`.
- Detalle en el historial de commits (prefijos `fix(seguridad)`, `a11y`, `test`).

## 9. Notas para la IA

- Antes de **cualquier** operación de Firebase (deploy, functions, rules), correr
  `firebase login:list` y confirmar `perfilprimero7@gmail.com`. Si es otra cuenta,
  detenerse y pedir re-login (el login es interactivo, no automatizable).
- Antes de tocar `functions/` de pagos o `workerPublicProfiles`, releer las
  restricciones de las secciones 4 y 8 de este documento.
- No sobrescribir contenido preexistente del proyecto sin preguntar (regla general
  de la integración HTES).
- Verificar accesibilidad (contraste AA) y consola limpia tras cambios de UI: el
  proyecto mantiene 0 violaciones axe y 0 errores de consola como línea base.
- Tests de lógica pura del backend: `npm run test:unit` (firma webhook MP,
  semáforo financiero, cupones). Reglas: `npm run test:rules`.

## Excepciones al HTES documentadas (Cap. 42)

- **Commits directos a `master` sin Pull Request** (HTES Cap. 1-2 pide PR para
  integraciones importantes). Motivo: desarrollo de una sola persona previo al
  lanzamiento; se prioriza velocidad con commits pequeños y verificados. Al
  incorporar más personas, migrar a flujo de PR. El CI/CD queda listo pero
  desactivado hasta configurar Secrets (DEBT-003).
