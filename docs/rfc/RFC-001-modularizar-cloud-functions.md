# RFC-001: Modularizar `functions/src/index.ts`

**Estado:** En implementación (paso 1 completado y validado en producción)
**Fecha:** 2026-07-04 · **Autor:** `[completar]`

> **Progreso:**
> - Paso 1-2 hechos — lógica pura en `lib/` (5 módulos, 67 tests) + toda la
>   infraestructura compartida en `shared.ts`. Desplegado y smoke-test OK.
> - Paso 3 hecho — primer módulo de dominio (`domains/referrals.ts`, 5 handlers)
>   re-exportado con `export *`. **Validado en producción:** el deploy mostró
>   "updating" (no "deleting") → Firebase descubre las funciones re-exportadas.
>   **El patrón de split por dominio está probado end-to-end.**
> - Pendiente: mover los ~95 handlers restantes a sus módulos de dominio
>   (payments, invitations, ai, notifications, admin, omil, etc.) — mecánico y
>   repetitivo, con el patrón ya validado. Verificar `diff` de conteo y deploy
>   "updating" en cada dominio.

## Objetivo

Dividir el archivo monolítico `functions/src/index.ts` (~5.400 líneas) en
módulos por dominio, sin cambiar el comportamiento ni los nombres exportados de
las Cloud Functions.

## Justificación

El archivo concentra toda la lógica del backend (pagos, invitaciones, IA,
notificaciones, contabilidad, admin, salud financiera). Es DEBT-001: dificulta
la navegación, la revisión y aumenta el riesgo de regresión en cada cambio.
La extracción reciente de lógica pura (`lib/mp-signature`, `lib/coupon`,
`lib/financial-health`, `lib/unlock-guard`) ya demostró el patrón y habilitó
tests unitarios; este RFC lo extiende a la organización de los handlers.

## Alcance

- Incluye: reorganizar los `export const` en módulos por dominio
  (`payments/`, `invitations/`, `ai/`, `notifications/`, `admin/`, `omil/`),
  re-exportándolos desde `index.ts` para preservar los nombres desplegados.
- No incluye: cambiar firmas, nombres de funciones, ni comportamiento. No
  incluye cambios de reglas ni de esquema de datos.

## Impacto

| Dimensión | Impacto esperado |
|---|---|
| Arquitectura | Positivo: cohesión por dominio, menor acoplamiento visual. |
| Usuarios | Ninguno (comportamiento idéntico). |
| Rendimiento | Ninguno (mismo bundle desplegado). |
| Seguridad | Neutro; facilita auditar cada dominio por separado. |
| Costos | Ninguno. |

## Riesgos

- Romper un nombre exportado → una función deja de desplegarse o se recrea.
  Mitigación: `index.ts` re-exporta todos los nombres actuales; comparar
  `firebase functions:list` antes y después.
- Ciclos de importación entre módulos y helpers compartidos. Mitigación:
  mover helpers puros a `lib/` (ya iniciado).

## Dependencias

Ninguna externa. Conviene hacerlo cuando no haya cambios de backend en vuelo
para evitar conflictos de merge grandes.

## Plan de Implementación

1. Mover helpers compartidos (`log`, `assertAdmin`, `writeAudit`, `sendEmail`,
   `sendFcmToUser`, config) a `functions/src/lib/`.
2. Extraer un dominio a la vez a su módulo, re-exportando desde `index.ts`.
3. Build + `firebase functions:list` para confirmar que la lista de funciones
   no cambia tras cada dominio.
4. Desplegar por lotes y verificar en producción.

## Plan de Rollback

Cada paso es un commit aislado. Si un despliegue falla o una función se recrea
indebidamente, revertir el commit del dominio afectado y redesplegar ese dominio
desde el estado anterior. El bundle previo queda en el historial de git y en las
versiones de Cloud Functions.

## Plan de Validación

- `functions/src` compila (`npm run build`).
- `npm run test:unit` y `npm run test:rules` en verde.
- `firebase functions:list` idéntico antes/después (mismos nombres y triggers).
- Smoke de un pago de prueba y una invitación tras el despliegue.

## Aprobación

| Rol requerido (HTES Cap. 27) | Nombre | Fecha | Decisión |
|---|---|---|---|
| Arquitectura | `[completar]` | | |

## Relación con ADR / Roadmap

- ADR relacionados: ADR-001 (arquitectura serverless).
- Ítem del Roadmap: "Post-lanzamiento — modularización de functions".
- Deuda: DEBT-001.
