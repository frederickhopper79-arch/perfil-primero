# Modelo de Datos — Perfil Primero (Cloud Firestore)

**Última actualización:** 2026-07-04 · Basado en `firestore.rules`, `lib/domain/types.ts` y `functions/src/index.ts`.

> Convención de seguridad: las colecciones marcadas **write-locked** solo las
> escribe Cloud Functions (Admin SDK); el cliente no puede escribirlas
> (`allow write: if false`). Ver ADR-002.

## Colecciones que el cliente puede escribir (bajo reglas)

| Colección | Doc ID | Contiene PII | Quién lee | Quién escribe |
|---|---|---|---|---|
| `users` | `uid` | Email, displayName | Dueño y admin | Dueño (solo rol worker/company, status active) y admin |
| `workerPublicProfiles` | `uid` | **No** (anónimo) | Dueño, admin, OMIL creadora, empresas verificadas | Dueño (worker) y admin |
| `workerPrivateProfiles` | `uid` | **Sí**: nombre legal, RUT, email, teléfono, `cvFileUrl` | Dueño y admin | Dueño (worker) y admin |
| `companyProfiles` | `uid` | Nombre representante, email, RUT empresa | Autenticados | Dueño (solo como `pending`) y admin |
| `jobOffers` | auto | No | Autenticados | Empresa dueña (`companyId == uid`) y admin |

## Colecciones write-locked (solo Cloud Functions)

| Colección | Contiene PII / dinero | Quién lee | Propósito |
|---|---|---|---|
| `invitations` | Datos de la oportunidad | Empresa/worker involucrados, admin | Máquina de estados `sent → viewed → accepted → unlocked → hired/closed` |
| `contactUnlocks` | Vincula empresa↔worker | Partes involucradas, admin | Registro de contacto desbloqueado tras pago |
| `payments` | **Dinero** | Dueño del pago, admin | Estado de pagos (`pending`/`paid`), montos, proveedor |
| `conversationMessages` | Mensajes | Partes involucradas, admin | Chat empresa↔worker |
| `scheduledInterviews` | — | Partes involucradas, admin | Entrevistas agendadas |
| `platformReviews` / `employerReviews` | — | Partes involucradas, admin | Reputación |
| `accountingEntries` | **Dinero/tributario** | Admin | Contabilidad / DTE |
| `coupons` | — | **Nadie** (solo backend) | Códigos de descuento (no enumerables) |
| `couponUsages` | — | Dueño, admin | Uso único por usuario |
| `emailReminders` | Email | Admin, OMIL propia | Recordatorios transaccionales |
| `aiUsageLogs` | — | Admin | Auditoría de uso de IA |
| `marketAnalyticsReports` | — | Admin | Reportes de mercado |
| `configuracion_sistema` | — | Admin (pricing legible por autenticados) | Tarifas, finanzas, health-check |
| `auditEvents` | — | Admin | Auditoría de acciones sensibles |
| `workerSegments` | — | Dueño, admin | Segmentación para nurturing |
| `rateLimits` | — | Admin | Límite de tasa persistente |
| `publicStats` / `searchAnalytics` | — | público / admin | Métricas públicas / analítica de búsqueda |

## Notas de privacidad (ver RAT)

- **Anonimato:** ningún dato identificable en `workerPublicProfiles`. El CV
  original (`cvFileUrl`) y la PII viven en `workerPrivateProfiles`.
- **Dinero:** los datos de tarjeta **no** se almacenan; los procesa el proveedor
  de pago. `payments` guarda montos, estado e IDs de proveedor.
- **Retención:** plazos por definir (`[REVISAR]` en el RAT). El perfil público
  expira a los 30 días de visibilidad; el dato persiste hasta borrado explícito.

## Máquina de estados de `invitations`

`sent` → `viewed` → `accepted` → `unlocked` (tras pago) → `in_process` →
`offer_sent` → `hired` / `closed`. Las transiciones las hacen Cloud Functions.
