# Postmortem: Hallazgos de seguridad en revisión previa al lanzamiento

**Fecha del incidente:** 2026-07-04 (revisión; sin explotación en producción) · **Severidad:** Nivel 2 (potencial, no materializado)
**Redactado por:** `[completar]` · **Fecha del documento:** 2026-07-04

> Blameless: el objeto de análisis es el sistema y sus reglas, no las personas.
> No hubo incidente en producción; los hallazgos se detectaron y corrigieron
> antes del lanzamiento. Se documenta para no repetir los patrones de origen.

## Resumen Ejecutivo

Una auditoría previa al lanzamiento encontró tres vulnerabilidades reales en el
flujo de dinero y privacidad: (1) un `paymentId` reutilizable para desbloquear
contactos ilimitados, (2) datos personales (URL del CV) expuestos en el perfil
público, y (3) una vía de escalada al rol `omil`/`admin` desde el cliente.
Ninguna se explotó en producción. Las tres se corrigieron con reglas, guardas de
Cloud Functions y tests de regresión.

## ¿Qué Ocurrió?

| Hora | Evento |
|---|---|
| — | Auditoría integral del producto previa al lanzamiento. |
| — | Hallazgo 1: `unlockWorkerContact` verificaba que el pago estuviera `paid`, pero no su propiedad ni uso único → un pago servía para N desbloqueos. |
| — | Hallazgo 2: `cvFileUrl` (PDF con nombre/RUT/teléfono) vivía en `workerPublicProfiles`, legible por cualquier autenticado. |
| — | Hallazgo 3: un usuario sin documento de rol que entrara por `/omil` quedaba con rol `omil` (las reglas permitían crear rol institucional desde el cliente). |
| — | Corrección y despliegue de las tres, con tests. |

## ¿Por Qué Ocurrió? (Causa Raíz)

- **Cinco Por Qué (Hallazgo 1):** el desbloqueo confiaba en el estado del pago
  → porque la verificación se pensó como "¿está pagado?" y no como "¿este pago,
  de esta empresa, para esta invitación, no usado antes?" → porque no existía
  una guarda explícita de propiedad/uso único → porque el flujo de dinero no
  tenía tests que forzaran a enunciar esas invariantes.
- **Patrón común:** las invariantes de seguridad estaban implícitas en la UI o
  en el "camino feliz", no explícitas en reglas/guardas verificables.

## ¿Qué Funcionó?

- La separación público/privado ya existía (facilitó mover `cvFileUrl`).
- Las colecciones de dinero ya eran write-locked (el ataque requería una
  Cloud Function mal validada, no escritura directa).

## ¿Qué Falló?

- Falta de tests del backend que obligaran a enunciar las invariantes del dinero.
- Reglas de creación de `users` demasiado permisivas (permitían rol institucional).
- Un dato que pasó a ser PII (`cvFileUrl`) no se reevaluó contra la regla de
  anonimato al agregarse.

## Impacto

- Servicios afectados: desbloqueo de contacto, perfil público, registro OMIL.
- Usuarios afectados: ninguno confirmado (detección previa al lanzamiento).
- Impacto de negocio: potencial (pérdida de ingresos por desbloqueos gratis;
  ruptura del anonimato como propuesta de valor). No materializado.

## Acciones Tomadas Durante el Incidente

1. Guarda de `unlockWorkerContact`: propiedad del pago + correspondencia con la
   invitación + uso único (hoy en `lib/unlock-guard.ts` con 12 tests).
2. `cvFileUrl` movido al perfil privado + prompt de IA que anonimiza el CV +
   función de purga de perfiles legacy.
3. Reglas: prohibida la creación de rol `omil`/`admin` desde el cliente;
   `auth-card` ya no crea el documento de roles institucionales.

## ¿Qué Cambiaremos?

| Acción preventiva | Responsable | Fecha límite | Estado |
|---|---|---|---|
| Tests de las invariantes del flujo de dinero | `[completar]` | — | Hecho (37 tests unit) |
| Regla: reevaluar anonimato ante cualquier campo nuevo del perfil | `[completar]` | — | Convención en AI_CONTEXT/ADR-002 |
| Checklist pre-producción con ítems de seguridad | `[completar]` | — | Hecho (`CHECKLIST_PRE_LANZAMIENTO.md`) |

## ¿Qué Aprenderá Hopper Tech?

Las invariantes de seguridad del dinero y la privacidad deben ser **explícitas y
testeadas**, no implícitas en la UI. Todo campo que pueda volverse PII debe
reevaluarse contra la regla de anonimato al introducirse. Extraer la lógica de
decisión a funciones puras hace las invariantes verificables y evita regresiones.
