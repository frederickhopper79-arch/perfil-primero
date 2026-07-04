# ADR-001: Export estático (Next.js) + Cloud Functions para toda la lógica de servidor

**Estado:** Aceptado
**Fecha:** 2026-07-04 (documentación retroactiva de una decisión ya vigente)
**Autor:** `[completar]`
**Capítulos HTES relacionados:** Cap. 3 — DevOps e Infraestructura

## Contexto

La plataforma es un SPA para postulantes y empresas más una consola admin.
Necesita hosting barato y escalable, y lógica de servidor para pagos,
invitaciones e IA. El equipo es pequeño y busca minimizar operación.

## Problema

¿Cómo servir el frontend y ejecutar la lógica de servidor con el mínimo de
infraestructura que operar y el menor costo fijo?

## Alternativas Consideradas

1. **Next.js con SSR en un servidor Node siempre encendido** — flexible, pero exige operar y escalar un servidor.
2. **Export estático (`output: "export"`) en Firebase Hosting + Cloud Functions v2 para la lógica** — sin servidor que mantener; el hosting es CDN estático y las Functions escalan a cero.
3. **Mantener todo en el cliente sin backend** — inviable: pagos, verificación y datos sensibles no pueden vivir solo en el cliente.

## Decisión

Frontend como **export estático** de Next.js (sin SSR ni API routes) servido
por Firebase Hosting; **toda** la lógica de servidor en **Cloud Functions v2**
(Node 22), con el cliente hablando directo a Firestore/Auth/Storage bajo reglas.

## Justificación

Elimina la operación de un servidor, aprovecha el CDN de Hosting, escala a cero
en costo y concentra el backend en un runtime administrado. Encaja con un equipo
pequeño previo al lanzamiento.

## Consecuencias

- Positivas: costo fijo casi nulo, despliegue simple, sin servidor que parchear.
- Negativas / trade-offs: no hay SSR (SEO depende de contenido estático y JSON-LD); no hay API routes de Next (toda API es Cloud Function); el primer render depende de JS del cliente.
- Efectos de segundo orden (Cap. 33): cualquier necesidad de personalización server-side por request obliga a una Cloud Function, no a una API route.

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Necesitar SSR más adelante (SEO dinámico) | Baja | Medio | El contenido indexable clave ya es estático con JSON-LD; migrar páginas puntuales a SSR sería un cambio acotado. |

## Referencias

`next.config.mjs` (`output: "export"`), `AI_CONTEXT.md` sección 2.
