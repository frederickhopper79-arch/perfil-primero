# ADR-004: Cuatro roles de usuario y bootstrap de admin con allowlist

**Estado:** Aceptado
**Fecha:** 2026-07-04 (documentación retroactiva)
**Autor:** `[completar]`
**Capítulos HTES relacionados:** Cap. 4 — Seguridad · Cap. 27 — Roles

## Contexto

La plataforma tiene cuatro tipos de usuario con permisos muy distintos:
postulante, empresa, admin y OMIL (oficinas municipales que crean perfiles por
cuenta de terceros). El admin necesita un primer acceso sin que exista aún otro
admin que lo cree.

## Problema

¿Cómo modelar los roles de forma segura y cómo darle el primer acceso al admin
sin abrir una vía de escalada de privilegios?

## Alternativas Consideradas

1. **Custom claims de Firebase Auth** — robusto, pero requiere Admin SDK para cada asignación y complica el bootstrap inicial.
2. **Rol en `users/{uid}.role` validado por reglas y por `assertAdmin()` en Functions** — simple y auditable; el rol vive en Firestore.
3. **Endpoint público de bootstrap** — rechazado: sería una puerta de escalada de privilegios.

## Decisión

- Rol en `users/{uid}.role` (`worker | company | admin | omil`), verificado
  server-side con `assertAdmin()` y client-side con `getUserRole()`.
- Los roles **institucionales (omil/admin) no se crean desde el cliente**: solo
  el backend (`createManagedUser`) o el bootstrap.
- Bootstrap del primer admin vía `claimAdminRole`, una Cloud Function con
  **allowlist del email del propietario** (`perfilprimero7@gmail.com`): solo esa
  cuenta autenticada puede reclamarse admin.

## Justificación

El rol en Firestore es simple y auditable. La allowlist del bootstrap resuelve
el problema del huevo y la gallina sin exponer una vía de escalada: ninguna otra
cuenta puede usar la función.

## Consecuencias

- Positivas: modelo simple, auditable (`auditEvents`), sin endpoint público peligroso.
- Negativas / trade-offs: el email del propietario queda fijado en el código del servidor; cambiarlo exige un deploy.
- Efectos de segundo orden (Cap. 33): las reglas de `users` deben impedir que un usuario se auto-asigne rol; testeado.

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Escalada a omil/admin desde el cliente | Media (histórica) | Alto | Corregido: reglas ya no permiten crear rol institucional desde cliente + test de regresión. |

## Referencias

`firestore.rules`, `functions/src/index.ts` (`claimAdminRole`, `assertAdmin`, `createManagedUser`), `components/auth-card.tsx`.
