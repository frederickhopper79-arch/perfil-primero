# ADR-005: Análisis de CV con IA (Groq/Gemini) y anonimización del perfil público

**Estado:** Aceptado
**Fecha:** 2026-07-04 (documentación retroactiva)
**Autor:** `[completar]`
**Capítulos HTES relacionados:** Cap. 17 — Privacidad · IA (principios 11-12)

## Contexto

Para bajar la fricción del postulante, la plataforma estructura su CV
automáticamente y sugiere mejoras usando IA. El CV contiene datos personales y
el perfil público debe permanecer anónimo.

## Problema

¿Cómo usar IA para procesar el CV sin filtrar datos personales al perfil público
ni depender de un solo proveedor de IA?

## Alternativas Consideradas

1. **Sin IA, formulario manual** — máxima privacidad, pero alta fricción.
2. **IA que estructura el CV, con el proveedor devolviendo también los datos personales por separado y un prompt que anonimiza el texto público** — baja fricción y anonimato controlado.
3. **Decisión automatizada que filtra o rankea candidatos por IA** — rechazado: implicaría decisión automatizada con efecto sobre personas (Ley 21.719) y exige revisión humana.

## Decisión

IA (Groq como principal, Gemini/`@google/genai` disponible) estructura el CV y
sugiere mejoras. El prompt **instruye anonimizar** el texto público (sin nombre,
RUT, teléfono, email, redes); los datos personales se devuelven en campos
`extracted*` que van solo al perfil **privado**. El matching es **informativo**,
no decide automáticamente por el usuario.

## Justificación

Reduce fricción manteniendo el anonimato del perfil público. Mantener el matching
como informativo evita entrar en el régimen de decisiones automatizadas con
efecto jurídico.

## Consecuencias

- Positivas: onboarding rápido, anonimato preservado, sin dependencia de un único proveedor de IA.
- Negativas / trade-offs: el texto del CV se envía a un proveedor externo (transferencia internacional); el prompt de anonimización no es infalible.
- Efectos de segundo orden (Cap. 33): un CV puede contener datos sensibles no solicitados que se envían a la IA (RISK-005, evaluar EIPD).

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Datos sensibles del CV enviados a la IA sin base | Media | Alto | RISK-005: evaluar minimización/EIPD; revisar retención del proveedor. |
| El perfil público conserva PII pese al prompt | Media | Alto | `cvFileUrl` movido al perfil privado; revisión de esquema en cada cambio. |

## Referencias

`functions/src/index.ts` (`analyzeCvWithAi`, `getProfileAiAdvice`), RAT Tratamiento N.° 04, RISK-005.
