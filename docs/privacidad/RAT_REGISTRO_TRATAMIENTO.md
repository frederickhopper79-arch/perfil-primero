# Registro de Actividades de Tratamiento (RAT) — Perfil Primero

**Responsable del tratamiento:** Hopper Tech SpA (Perfil Primero SpA — RUT 78.449.783-6)
**Encargado de mantener este registro:** `[completar]`
**Última actualización:** 2026-07-04

> **Estado:** borrador preliminar generado automáticamente a partir del código
> fuente. Los campos marcados `[REVISAR]` requieren una decisión humana
> (base legal, plazo de conservación, mecanismo de transferencia internacional)
> y **no deben darse por válidos** hasta ser confirmados por el responsable.

---

## Tratamiento N.° 01: Registro y perfil de postulantes

| Campo | Detalle |
|---|---|
| Finalidad del tratamiento | Crear y publicar el perfil laboral del postulante (anónimo en su parte pública) para que empresas verificadas puedan contactarlo. |
| Base legal | `[REVISAR]` — probable "Ejecución de un contrato" (prestación del servicio) + "Consentimiento" al registrarse. Confirmar. |
| Categorías de titulares | Postulantes (personas naturales que buscan empleo). |
| Categorías de datos personales | Identificación: nombre legal (`legalName`), RUT (`rut`), correo (`email`), teléfono (`phone`). Profesionales: CV original (`cvFileUrl`), CV estructurado (`formattedCv`), carta de presentación, portafolio, región/comuna, experiencia, expectativa de renta. Datos de cuenta: email de login, rol. |
| ¿Incluye datos sensibles? | No de forma intencional. **[REVISAR]**: un CV cargado por el usuario puede contener datos sensibles no solicitados (salud, afiliación sindical, etc.). Evaluar minimización / EIPD. |
| Origen del dato | Directamente del titular (formulario de registro y onboarding) o de una OMIL que lo crea por cuenta del titular (`profileSource: "omil"`). |
| Destinatarios internos | Admin (`role: admin`) vía Cloud Functions; la OMIL creadora respecto de los perfiles que creó. |
| Destinatarios externos / encargados | Google Firebase (Auth, Firestore, Storage — hosting del dato); Google Gemini / Groq (procesamiento del CV, ver Tratamiento 04). |
| ¿Transferencia internacional? | Sí — Firebase/GCP (EE. UU.). Mecanismo: `[REVISAR]` (cláusulas contractuales / adecuación APDP). |
| Plazo de conservación | `[REVISAR]`. El perfil público expira a los 30 días (visibilidad), pero el dato persiste en Firestore hasta decisión de borrado. Definir política de retención. |
| Medidas de seguridad aplicadas | Separación de datos: PII en `workerPrivateProfiles` (solo dueño y admin), perfil público anonimizado en `workerPublicProfiles`. Reglas de Firestore por rol. Cifrado en tránsito (HTTPS) y en reposo (Firebase). `cvFileUrl` fuera del perfil público. |
| ¿Sujeto a decisión automatizada / perfilamiento por IA? | Sí — ver Tratamiento 04 (análisis de CV y matching). |
| Responsable interno de este tratamiento | `[completar]` |

---

## Tratamiento N.° 02: Registro y verificación de empresas

| Campo | Detalle |
|---|---|
| Finalidad del tratamiento | Registrar empresas, verificar su identidad legal y habilitarlas para buscar y contactar postulantes. |
| Base legal | `[REVISAR]` — probable "Ejecución de un contrato". Confirmar. |
| Categorías de titulares | Representantes de empresas (personas naturales que actúan por la empresa). |
| Categorías de datos personales | Nombre del responsable de RRHH / representante, correo de contacto (`email`, `contactEmail`). Datos de la empresa: razón social (`legalName`), RUT (`taxId`), sitio web, sector. |
| ¿Incluye datos sensibles? | No. |
| Origen del dato | Directamente del titular (registro de empresa). |
| Destinatarios internos | Admin (revisión de verificación) vía Cloud Functions. |
| Destinatarios externos / encargados | Google Firebase. `[REVISAR]`: verificación de RUT en SII (si se automatiza). |
| ¿Transferencia internacional? | Sí — Firebase/GCP (EE. UU.). Mecanismo: `[REVISAR]`. |
| Plazo de conservación | `[REVISAR]`. |
| Medidas de seguridad aplicadas | Reglas Firestore: la empresa solo se crea como `verificationStatus: "pending"`; el cambio a `verified` es solo por Cloud Function/admin. Cifrado en tránsito y reposo. |
| ¿Sujeto a decisión automatizada / perfilamiento por IA? | No (la verificación la aprueba un admin). |
| Responsable interno de este tratamiento | `[completar]` |

---

## Tratamiento N.° 03: Procesamiento de pagos

| Campo | Detalle |
|---|---|
| Finalidad del tratamiento | Cobrar la suscripción del postulante y el desbloqueo/plan de la empresa. |
| Base legal | `[REVISAR]` — "Ejecución de un contrato" + obligación legal tributaria (emisión de documentos). Confirmar. |
| Categorías de titulares | Postulantes y empresas que pagan. |
| Categorías de datos personales | Identificador de usuario (`userId`), monto, estado, referencia y ID de pago del proveedor. **Los datos de tarjeta NO se almacenan en la plataforma**: los captura el proveedor de pago. |
| ¿Incluye datos sensibles? | Datos financieros (medio de pago) — procesados por el proveedor, no almacenados directamente. |
| Origen del dato | Del titular (al pagar) y del proveedor de pago (confirmación vía webhook). |
| Destinatarios internos | Admin (contabilidad) vía Cloud Functions; colección `payments`/`accountingEntries` write-locked. |
| Destinatarios externos / encargados | Mercado Pago (Chile, principal); Stripe (EE. UU., respaldo). `[REVISAR]`: futuro proveedor DTE/SII (OpenFactura). |
| ¿Transferencia internacional? | Sí — Stripe (EE. UU.), Firebase (EE. UU.). Mercado Pago (Chile). Mecanismo: `[REVISAR]`. |
| Plazo de conservación | `[REVISAR]` — probable retención por obligación tributaria/contable (años). Confirmar con contador. |
| Medidas de seguridad aplicadas | Webhook de Mercado Pago con validación de firma HMAC; pagos confirmados contra la API del proveedor (no se confía en el body). Colecciones de pago write-locked. Verificación de propiedad y uso único del pago en el desbloqueo. |
| ¿Sujeto a decisión automatizada / perfilamiento por IA? | No. |
| Responsable interno de este tratamiento | `[completar]` |

---

## Tratamiento N.° 04: Análisis de CV y matching con IA (decisión automatizada)

| Campo | Detalle |
|---|---|
| Finalidad del tratamiento | Estructurar automáticamente el CV, sugerir mejoras al perfil, calcular compatibilidad (score de calce) entre perfiles y vacantes. |
| Base legal | `[REVISAR]`. |
| Categorías de titulares | Postulantes. |
| Categorías de datos personales | Contenido completo del CV (puede incluir historial laboral, formación, datos de contacto). Puntajes de evaluación (inglés, español, conductual). |
| ¿Incluye datos sensibles? | **[REVISAR]** — el CV puede contener datos sensibles no solicitados que se envían al modelo de IA. Evaluar EIPD y minimización. |
| Origen del dato | Del titular (carga del CV). |
| Destinatarios internos | El propio postulante; empresas ven el resultado anonimizado. |
| Destinatarios externos / encargados | Google Gemini (`@google/genai`) y/o Groq — procesan el texto del CV. `[REVISAR]`: política de retención/entrenamiento del proveedor de IA. |
| ¿Transferencia internacional? | Sí — proveedores de IA en EE. UU. Mecanismo: `[REVISAR]`. |
| Plazo de conservación | `[REVISAR]`. Los `aiUsageLogs` quedan en Firestore; definir retención. |
| Medidas de seguridad aplicadas | El prompt instruye anonimizar el CV público (quitar nombre, RUT, teléfono, email). Logs de uso de IA solo legibles por admin. |
| ¿Sujeto a decisión automatizada / perfilamiento por IA? | **Sí.** Estructuración de CV y score de matching. Ley 21.719: requiere describir la lógica general y garantizar revisión humana. **[REVISAR]**: el matching hoy es informativo (no rechaza automáticamente candidatos); confirmar que ninguna decisión con efecto jurídico se toma solo con IA. |
| Responsable interno de este tratamiento | `[completar]` |

---

## Tratamiento N.° 05: Comunicaciones transaccionales (email y push)

| Campo | Detalle |
|---|---|
| Finalidad del tratamiento | Enviar correos (bienvenida, invitaciones, recordatorios, alertas) y notificaciones push relacionadas con el uso del servicio. |
| Base legal | `[REVISAR]` — probable "Ejecución de un contrato" para transaccionales; consentimiento para marketing/nurturing. Separar ambos. |
| Categorías de titulares | Postulantes, empresas, admins. |
| Categorías de datos personales | Correo electrónico, nombre, suscripción push (endpoint del navegador). |
| ¿Incluye datos sensibles? | No. |
| Origen del dato | Del titular (registro) y generado por el sistema (eventos). |
| Destinatarios internos | Cloud Functions. |
| Destinatarios externos / encargados | SendGrid (EE. UU. — envío de correo); servicio de push del navegador (VAPID). |
| ¿Transferencia internacional? | Sí — SendGrid (EE. UU.). Mecanismo: `[REVISAR]`. |
| Plazo de conservación | `[REVISAR]`. `emailReminders` persisten en Firestore; definir retención. |
| Medidas de seguridad aplicadas | Claves VAPID/SendGrid en `functions/.env` (no en cliente). Colecciones de recordatorios write-locked. |
| ¿Sujeto a decisión automatizada / perfilamiento por IA? | Parcial — segmentación de usuarios para nurturing (`segmentWorkers`). `[REVISAR]`. |
| Responsable interno de este tratamiento | `[completar]` |

---

## Tratamiento N.° 06: Analítica de uso

| Campo | Detalle |
|---|---|
| Finalidad del tratamiento | Medir uso de la plataforma y conversión para mejorar el producto. |
| Base legal | `[REVISAR]` — probable "Consentimiento" (banner de cookies con opción "Solo esenciales"). Confirmar que la analítica se desactiva al rechazar. |
| Categorías de titulares | Todos los visitantes del sitio. |
| Categorías de datos personales | Identificadores de analítica, eventos de navegación, IP (según GA4). |
| ¿Incluye datos sensibles? | No. |
| Origen del dato | Generado por el sistema (navegación). |
| Destinatarios internos | Equipo (dashboards de métricas). |
| Destinatarios externos / encargados | Google Analytics 4 (EE. UU.). |
| ¿Transferencia internacional? | Sí — Google (EE. UU.). Mecanismo: `[REVISAR]`. |
| Plazo de conservación | `[REVISAR]` — según configuración de retención de GA4. |
| Medidas de seguridad aplicadas | Banner de consentimiento de cookies; al declinar se actualiza `consent` de GA a `denied`. No se usan cookies de publicidad. |
| ¿Sujeto a decisión automatizada / perfilamiento por IA? | No. |
| Responsable interno de este tratamiento | `[completar]` |

---

## Historial de Cambios de este Registro

| Fecha | Cambio | Responsable |
|---|---|---|
| 2026-07-04 | Creación inicial preliminar (generada desde el código durante integración HTES). Campos legales pendientes de revisión humana. | `[completar]` |

---

## Notas para Auditoría (HTES Cap. 17)

- Este registro deberá revisarse cada vez que se incorpore un nuevo tratamiento de datos, un nuevo proveedor externo, o se modifique el plazo de conservación de algún dato.
- Ante una brecha de datos, este registro es el primer documento que debe consultarse para determinar el alcance real de la exposición.
- Ante una fiscalización de la Agencia de Protección de Datos Personales (APDP), este documento debe poder presentarse actualizado, no reconstruirse de memoria.
- **Pendiente crítico:** todos los campos `[REVISAR]` (base legal, plazos de conservación, mecanismos de transferencia internacional) requieren validación legal antes del lanzamiento. Una transferencia internacional sin mecanismo válido es una infracción bajo la Ley 21.719.
