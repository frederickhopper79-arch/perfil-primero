# ADR-002: Anonimato del postulante por separación de colecciones y colecciones write-locked

**Estado:** Aceptado
**Fecha:** 2026-07-04 (documentación retroactiva)
**Autor:** `[completar]`
**Capítulos HTES relacionados:** Cap. 4 — Seguridad · Cap. 17 — Privacidad

## Contexto

La propuesta de valor central es que el postulante es **anónimo** hasta que
decide avanzar, y que las empresas verificadas pagan por desbloquear el
contacto. Los datos de dinero y estado del proceso no pueden ser manipulables
desde el cliente.

## Problema

¿Cómo garantizar técnicamente el anonimato y la integridad del dinero cuando el
cliente habla directo con Firestore?

## Alternativas Consideradas

1. **Un solo documento de perfil con control por UI** — inseguro: el cliente puede leer Firestore directo y saltarse la UI.
2. **Separar perfil público (anónimo) y privado (PII), y bloquear la escritura de las colecciones sensibles salvo desde Cloud Functions** — el anonimato y la integridad quedan en las reglas, no en la UI.
3. **Todo el acceso a datos vía Cloud Functions** — máximo control, pero pierde la simplicidad y el tiempo real del SDK cliente.

## Decisión

- `workerPublicProfiles` (anónimo, sin PII) vs `workerPrivateProfiles` (PII, solo dueño y admin).
- Perfiles públicos legibles solo por dueño, admin, la OMIL creadora y **empresas verificadas**.
- Colecciones de dinero/estado (`payments`, `invitations`, `contactUnlocks`, `coupons`, `accountingEntries`, etc.) son **write-locked** (`allow write: if false`): solo las escribe Cloud Functions con Admin SDK.

## Justificación

Pone el anonimato y la integridad del dinero en la capa de reglas de seguridad,
que el cliente no puede eludir. La UI puede fallar; las reglas no.

## Consecuencias

- Positivas: anonimato e integridad garantizados server-side; superficie de manipulación mínima.
- Negativas / trade-offs: toda mutación de datos sensibles obliga a una Cloud Function (más código backend); el cliente no puede escribir esos datos aunque fuera cómodo.
- Efectos de segundo orden (Cap. 33): cualquier campo que pase a ser PII debe migrarse del público al privado (ver el caso `cvFileUrl`).

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Que un dato identificable quede en el perfil público | Media | Alto | Tests de reglas (25) + prompt de IA que anonimiza el CV + revisión en cada cambio de esquema. |

## Referencias

`firestore.rules`, `lib/domain/types.ts`, `tests/firestore.rules.test.ts`, RAT.
