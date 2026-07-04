# Registro de Deuda Técnica — Perfil Primero

**Última actualización:** 2026-07-04

| ID | Tipo | Fecha registro | Responsable | Riesgo | Prioridad | Plan | Estado |
|---|---|---|---|---|---|---|---|
| DEBT-001 | Arquitectura | 2026-07-04 | `[completar]` | Medio | P2 | `functions/src/index.ts` concentra ~5.400 líneas con toda la lógica backend. Modularizar por dominio (payments, invitations, admin, ai, notifications) para reducir riesgo de regresión y tiempos de deploy. | Abierta |
| DEBT-002 | Testing | 2026-07-04 | `[completar]` | Alto | P1 | No hay tests unitarios de Cloud Functions; solo 25 tests de reglas Firestore. Añadir cobertura al flujo de dinero: `unlockWorkerContact`, webhooks de MP/Stripe, validación de cupones. | Abierta |
| DEBT-003 | Infraestructura | 2026-07-04 | `[completar]` | Medio | P2 | El workflow CI/CD (`.github/workflows/deploy.yml`) despliega functions/reglas/hosting, pero los GitHub Secrets (`FIREBASE_SERVICE_ACCOUNT`, `NEXT_PUBLIC_*`) no están configurados: el pipeline está inactivo. Configurar secrets y validar un run. | Abierta |
| DEBT-004 | Código / Privacidad | 2026-07-04 | `[completar]` | Bajo | P3 | Perfiles públicos guardados antes de la migración de anonimato pueden conservar `cvFileUrl` hasta que el postulante re-guarde. Existe función admin `purgeLegacyCvFileUrls`; ejecutarla una vez en producción para limpiar el histórico. | Abierta |
| DEBT-005 | Código / UX | 2026-07-04 | `[completar]` | Bajo | P3 | Reglas `.button` con `min-height` inconsistente entre breakpoints (40/42/44px): en móvil algunos CTA renderizan a 42px, bajo el mínimo táctil de 44px. Unificar el `min-height` de `.button` en todas las media queries. | Abierta |
| DEBT-006 | Código | 2026-07-04 | `[completar]` | Bajo | P3 | Coexisten dos mecanismos de rate limit (en memoria y persistente en Firestore). El de memoria se resetea con cold starts. Consolidar en el persistente donde el límite sea crítico. | En progreso |

## Cómo Registrar un Nuevo Ítem

1. Asignar el siguiente ID secuencial disponible.
2. Describir el problema concreto, no una queja genérica ("el módulo X no valida
   entradas duplicadas" en vez de "el módulo X está mal hecho").
3. Estimar el riesgo de no resolverlo y la prioridad relativa frente a otras
   deudas ya registradas.
4. Vincular, si corresponde, al Roadmap o a una RFC.

Toda deuda técnica que condicione una decisión del Roadmap deberá reflejarse
también en `ROADMAP.md` (HTES Cap. 20 — Gestión del Ciclo de Vida del Producto).
