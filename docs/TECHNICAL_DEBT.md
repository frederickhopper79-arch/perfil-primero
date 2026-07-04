# Registro de Deuda Técnica — Perfil Primero

**Última actualización:** 2026-07-04

| ID | Tipo | Fecha registro | Responsable | Riesgo | Prioridad | Plan | Estado |
|---|---|---|---|---|---|---|---|
| DEBT-001 | Arquitectura | 2026-07-04 | `[completar]` | Medio | P2 | `functions/src/index.ts` concentra ~5.400 líneas con toda la lógica backend. Modularizar por dominio (payments, invitations, admin, ai, notifications) para reducir riesgo de regresión y tiempos de deploy. | Abierta |
| DEBT-002 | Testing | 2026-07-04 | `[completar]` | Alto | P1 | Cobertura de tests del backend en el flujo de dinero. **Avance:** lógica pura extraída y testeada — (1) firma webhook MP (`mp-signature.ts`, 8 tests); (2) semáforo financiero (`financial-health.ts`, 9 tests); (3) validación/cálculo de cupones (`coupon.ts`, 8 tests). Total **25 tests unitarios** (`npm run test:unit`). **Pendiente:** `unlockWorkerContact` (propiedad/uso único del pago) — su guarda está fuertemente acoplada a Firestore; requiere extracción adicional o harness con emulador. | En progreso |
| DEBT-003 | Infraestructura | 2026-07-04 | `[completar]` | Medio | P2 | El workflow CI/CD (`.github/workflows/deploy.yml`) falla en cada push porque (a) `next lint` no tiene config de ESLint y abre prompt interactivo, y (b) faltan los GitHub Secrets (`FIREBASE_SERVICE_ACCOUNT`, `NEXT_PUBLIC_*`). **Mitigado:** cambiado a ejecución manual (`workflow_dispatch`) para no fallar/spamear en cada push; deploys manuales por ahora. **Pendiente para reactivar:** configurar ESLint + cargar los Secrets y volver a habilitar el trigger `push`. | En progreso |
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
