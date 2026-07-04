# Perfil Primero

Plataforma laboral invertida donde postulantes publican perfiles protegidos y empresas verificadas buscan talento con sueldo y condiciones claras.

## Stack

- Next.js.
- React.
- TypeScript.
- Firebase Hosting.
- Firebase Auth.
- Cloud Firestore.
- Cloud Functions.
- Firebase Storage.

## Arquitectura Resumida

Arquitectura serverless / SPA estática: el frontend es un Next.js con
`output: "export"` (sin SSR ni API routes) servido como sitio estático desde
Firebase Hosting. Toda la lógica de servidor vive en Cloud Functions (v2, Node
22). El cliente habla directo con Firestore/Auth/Storage bajo reglas de
seguridad; las operaciones sensibles (pagos, invitaciones, admin) pasan por
Cloud Functions con Admin SDK. Colecciones de dinero y PII son write-locked
(solo las escribe el backend). Para el detalle completo, ver `AI_CONTEXT.md`.

## Modelo comercial de prueba

- Postulante: $999 CLP por 30 dias de perfil visible durante etapa de pruebas.
- Empresa: $999 CLP como pago de cierre/desbloqueo durante etapa de pruebas.
- Precio objetivo posterior: se ajustara cuando el producto este validado operacionalmente.

## Primeras rutas

- `/`: inicio operativo.
- `/trabajador` y `/postulante`: onboarding inicial del postulante.
- `/empresa`: buscador inicial de empresas.
- `/consola-admin`: consola interna separada para administracion, reportes, auditoria y contabilidad.

## URL publica

- https://perfil-primero.web.app

## Configuracion

1. Copiar `.env.example` a `.env.local`.
2. Completar las variables del proyecto Firebase.
3. Instalar dependencias con `npm install`.
4. Ejecutar `npm run dev`.

## Variables de Entorno

Frontend — `.env.local` (`NEXT_PUBLIC_*` se exponen al navegador; nunca poner secretos aquí):

| Variable | Descripción | Obligatoria | Ejemplo |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API key web de Firebase | Sí | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de Auth | Sí | `perfil-primero.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto GCP | Sí | `perfil-primero` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Storage | Sí | `perfil-primero.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de FCM | Sí | `000000000000` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID de Firebase | Sí | `1:000...:web:...` |
| `NEXT_PUBLIC_GA_ID` | Propiedad Google Analytics 4 | No | `G-XXXXXXX` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública Stripe (fallback) | No | `pk_live_...` |

Cloud Functions — `functions/.env` (secretos, nunca `NEXT_PUBLIC_*`):

| Variable | Descripción | Obligatoria | Ejemplo |
|---|---|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de producción Mercado Pago | Sí | `APP_USR-...` |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secreto para validar la firma del webhook | Sí | `[secreto del panel MP]` |
| `GROQ_API_KEY` | IA para análisis de CV | Sí | `gsk_...` |
| `SENDGRID_API_KEY` | Envío de correo transaccional | Sí | `SG....` |
| `SENDGRID_FROM_EMAIL` | Remitente verificado en SendGrid | Sí | `no-reply@dominio.cl` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Pasarela de respaldo | No | `sk_live_...` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_EMAIL` | Notificaciones push PWA | No | `[generar con web-push]` |
| `APP_URL` / `FUNCTIONS_BASE_URL` | URLs base (tienen valor por defecto) | No | `https://perfil-primero.web.app` |

Nunca commitear archivos `.env` reales. La lista completa y actualizada está en `.env.example` (frontend) y en el código de `functions/`.

## Puesta en marcha Firebase

1. Crear un proyecto en Firebase Console.
2. Activar Authentication con Email/Password y Google.
3. Crear Cloud Firestore en modo produccion.
4. Activar Firebase Storage.
5. Activar Functions y asociar facturacion si Google lo solicita.
6. Reemplazar `perfil-primero-dev` en `.firebaserc` por el id real del proyecto.
7. Copiar las credenciales web de Firebase a `.env.local`.

## Puesta en marcha Mercado Pago

1. Crear una cuenta Mercado Pago.
2. Obtener `MERCADOPAGO_ACCESS_TOKEN` desde credenciales de desarrollador.
3. Configurar `MERCADOPAGO_ACCESS_TOKEN` en `functions/.env`.
4. Usar como webhook:

```text
https://us-central1-perfil-primero.cloudfunctions.net/mercadoPagoWebhook
```

El cobro de postulante en pruebas es $999 CLP. El cobro de empresa en pruebas es $999 CLP y corresponde a pago por cierre/desbloqueo cuando el proceso ya avanzo.

## Firebase

Archivos incluidos:

- `firebase.json`.
- `.firebaserc`.
- `firestore.rules`.
- `storage.rules`.
- `firestore.indexes.json`.
- `functions/src/index.ts`.

Antes de produccion, probar reglas y funciones con Firebase Emulator Suite.

## Estado actual

La base tecnica incluye:

- Autenticacion por email/Google conectada a Firebase real.
- Guardado de perfil publico y privado del postulante.
- Guardado de perfil de empresa.
- Busqueda de perfiles anonimos.
- Creacion de invitaciones desde Cloud Functions.
- Aceptacion de invitaciones.
- Checkout Mercado Pago para $999 postulante.
- Checkout Mercado Pago para $999 empresa.
- Webhook Mercado Pago para activar suscripcion y registrar pago por exito.
- Gmail/Google como metodo de ingreso.
- IA de Google Gemini para analizar CV, generar CV con formato Perfil Primero y recomendar mejoras al perfil del postulante.
- Consola admin con empresas, postulantes, ofertas, pagos, contabilidad, cupones, entrevistas, reputacion, seguridad, auditoria, usuarios y reportes.
- Creacion de usuarios desde consola admin mediante cuenta Firebase con rol `admin`.
- Hosting publico desplegado.
- Firestore, Storage y Functions desplegados.
- Pruebas smoke publicas completadas.

Pendientes externos:

- Probar pagos reales de Mercado Pago con cuenta productiva y webhooks en ambiente definitivo.
- Crear una API key de Gemini y completar `GEMINI_API_KEY` si no esta configurada.
- Integrar proveedor real SII/OpenFactura para DTE, folio, PDF y XML.
- Integrar OAuth real Google Calendar/Gmail para escribir eventos y enviar correos en cuentas de usuarios.
- Ejecutar seed demo/cupones con credenciales Admin SDK o desde entorno con Application Default Credentials.

## Roadmap

La planificación operativa se gestiona en la consola admin (`/consola-admin` →
Hoja de ruta) y en el changelog interno. Plantilla oficial HTES disponible en
`docs/plantillas/ROADMAP.md` para formalizar un `ROADMAP.md` en la raíz cuando
se defina la planificación por hitos.

## Documentos Relacionados

- `AI_CONTEXT.md` — contexto oficial de entrada para cualquier IA que trabaje en este proyecto (HTES Cap. 31).
- `CLAUDE.md` — guía operativa del repositorio (aislamiento, arquitectura, modelo de datos).
- `docs/HTES_v1.0.docx` — estándar de ingeniería aplicable (HTES v1.0) y `docs/HTES_Cheatsheet.docx`.
- `docs/adr/` — decisiones de arquitectura (plantilla `ADR-template.md`).
- `docs/rfc/` — cambios importantes en curso o evaluados.
- `docs/privacidad/RAT_REGISTRO_TRATAMIENTO.md` — registro de actividades de tratamiento (Ley 21.719).
- `docs/plantillas/` — plantillas oficiales HTES.
- HTES aplicable: v1.0
