# Modelo de datos Firestore y privacidad

> **Estado al 2026-06-17:** refleja el modelo de produccion real desplegado en Firebase project `perfil-primero`.

## Principio central

Los datos publicos y privados del trabajador viven en colecciones separadas. La interfaz nunca decide por si sola que mostrar u ocultar. La seguridad se aplica en Firestore Security Rules y Cloud Functions.

Condicion para desbloquear datos privados:
- Empresa verificada (`verificationStatus: "verified"`).
- Invitacion laboral valida con rango salarial visible.
- Trabajador acepta el contacto.
- Pago de desbloqueo registrado en `payments` y confirmado por webhook.
- `contactUnlocks` activo creado por Cloud Function.

---

## Colecciones — escritura cliente

### users `users/{userId}`

```json
{
  "email": "usuario@correo.com",
  "role": "worker",
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

Roles posibles: `worker`, `company`, `admin`, `omil`.

---

### workerPublicProfiles `workerPublicProfiles/{workerId}`

Informacion visible en busquedas. No contiene telefono, correo personal, nombre legal ni archivos privados.

```json
{
  "workerId": "uid",
  "profileCode": "PP-a1b2c3d4",
  "displayName": "Profesional de marketing digital",
  "headline": "Especialista en campanas pagadas y analitica",
  "summary": "5 anos de experiencia en crecimiento digital.",
  "skills": ["Google Ads", "Meta Ads", "GA4"],
  "sectors": ["Marketing", "Ecommerce"],
  "experienceLevel": "mid",
  "yearsOfExperience": 5,
  "region": "Region Metropolitana",
  "city": "Santiago",
  "workModes": ["remote", "hybrid"],
  "expectedSalaryMin": 1200000,
  "expectedSalaryMax": 1800000,
  "currency": "CLP",
  "availability": "listening",
  "visibilityStatus": "visible",
  "subscriptionStatus": "active",
  "profileExpiresAt": "timestamp",
  "lastActiveAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

`availability`: `actively_looking` / `listening` / `unavailable`.
`visibilityStatus`: `visible` / `paused` / `hidden` / `expired` / `suspended`.
`profileCode`: formato `PP-XXXXXXXX` (8 caracteres del uid).

---

### workerPrivateProfiles `workerPrivateProfiles/{workerId}`

Solo el trabajador, administradores y Cloud Functions con desbloqueo activo pueden acceder.

```json
{
  "workerId": "uid",
  "legalName": "Nombre Apellido",
  "preferredName": "Nombre",
  "email": "usuario@correo.com",
  "phone": "+56912345678",
  "portfolioLinks": ["https://portafolio.com"],
  "cvAnalysisSummary": "Texto generado por Gemini",
  "formattedCv": "CV estructurado en Markdown",
  "coverLetter": "Carta de presentacion",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Esta coleccion nunca se consulta desde listados publicos ni buscadores.

---

### companyProfiles `companyProfiles/{companyId}`

```json
{
  "companyId": "uid",
  "companyName": "Empresa SpA",
  "legalName": "Empresa Legal SpA",
  "taxId": "12.345.678-9",
  "website": "https://empresa.com",
  "logoUrl": "https://storage...",
  "industry": "Tecnologia",
  "size": "11-50",
  "region": "Region Metropolitana",
  "city": "Santiago",
  "verificationStatus": "verified",
  "billingStatus": "active",
  "reputationScore": 100,
  "responseRate": 0.92,
  "averageResponseTimeHours": 18,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

`verificationStatus`: `pending` / `verified` / `rejected` / `suspended`.

---

### jobOffers `jobOffers/{jobOfferId}`

Ofertas laborales publicadas por la empresa.

```json
{
  "jobOfferId": "id",
  "companyId": "uid",
  "title": "Desarrollador Full Stack",
  "description": "...",
  "salaryMin": 1500000,
  "salaryMax": 2500000,
  "currency": "CLP",
  "workMode": "hybrid",
  "contractType": "full_time",
  "region": "Region Metropolitana",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Colecciones — solo Cloud Functions pueden escribir

### invitations `invitations/{invitationId}`

```json
{
  "invitationId": "id",
  "companyId": "uid_empresa",
  "workerId": "uid_trabajador",
  "opportunityTitle": "Especialista en marketing digital",
  "opportunitySummary": "Buscamos apoyar crecimiento de ecommerce.",
  "salaryMin": 1300000,
  "salaryMax": 1700000,
  "currency": "CLP",
  "workMode": "hybrid",
  "location": "Santiago",
  "contractType": "full_time",
  "message": "Nos interesa conversar.",
  "status": "sent",
  "expiresAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Estados: `sent → viewed → accepted → rejected / more_info_requested → in_process → offer_sent → hired / closed / expired`.

Reglas: sueldo obligatorio, empresa verificada, no durar indefinidamente.

---

### contactUnlocks `contactUnlocks/{unlockId}`

```json
{
  "unlockId": "id",
  "companyId": "uid_empresa",
  "workerId": "uid_trabajador",
  "invitationId": "id_invitacion",
  "paymentId": "id_pago",
  "status": "active",
  "createdAt": "timestamp",
  "expiresAt": "timestamp"
}
```

`status`: `pending_payment` / `active` / `revoked` / `expired` / `refunded`.

Una empresa solo puede leer datos privados del trabajador si existe un `contactUnlocks` activo para esa combinacion `companyId + workerId + invitationId`.

---

### payments `payments/{paymentId}`

```json
{
  "paymentId": "id",
  "userId": "uid",
  "payerRole": "worker",
  "provider": "mercadopago",
  "providerPaymentId": "mp_123",
  "amount": 999,
  "currency": "CLP",
  "paymentType": "worker_subscription",
  "status": "paid",
  "relatedWorkerId": "uid_trabajador",
  "relatedCompanyId": null,
  "relatedInvitationId": null,
  "folioSii": null,
  "pdfUrl": null,
  "xmlUrl": null,
  "siiStatus": "pending",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Tipos: `worker_subscription` ($999 CLP lanzamiento / $9.990 real), `company_contact_unlock` ($999 CLP lanzamiento / $24.990 real).
Proveedores: `mercadopago` (primario), `stripe` (secundario).

---

### conversationMessages `conversationMessages/{messageId}`

```json
{
  "messageId": "id",
  "invitationId": "id_invitacion",
  "senderId": "uid",
  "senderRole": "company",
  "body": "Hola, nos gustaria conversar.",
  "createdAt": "timestamp"
}
```

Leidos via `onSnapshot` para chat en tiempo real. Limite de 80 mensajes por query.

---

### auditEvents `auditEvents/{eventId}`

```json
{
  "eventId": "id",
  "actorId": "uid",
  "actorRole": "company",
  "eventType": "private_profile_unlocked",
  "targetType": "worker",
  "targetId": "uid_trabajador",
  "metadata": { "invitationId": "id", "paymentId": "id" },
  "createdAt": "timestamp"
}
```

---

### aiUsageLogs `aiUsageLogs/{logId}`

Registro de cada llamada a Gemini: modelo, latencia, estado, tamaño de prompt y respuesta, si hubo archivo adjunto.

---

### marketAnalyticsReports `marketAnalyticsReports/{reportId}`

Reportes semanales (o generados manualmente desde admin) con: trabajadores visibles, empresas verificadas, salario promedio, skills mas frecuentes, bloqueos de chat, metricas de IA.

---

### configuracion_sistema `configuracion_sistema/tarifas`

```json
{
  "fase_lanzamiento_activa": true,
  "tarifa_suscripcion_postulante_clp": 999,
  "tarifa_contacto_empresa_clp": 999,
  "tarifa_postulante_precio_real": 9990,
  "tarifa_empresa_precio_real": 24990
}
```

---

## Indices Firestore compuestos — productivos

Para la busqueda de trabajadores visibles con filtros:

| Campos | Uso |
|---|---|
| `visibilityStatus` + `subscriptionStatus` + `expectedSalaryMax` | Busqueda base |
| `visibilityStatus` + `subscriptionStatus` + `region` + `expectedSalaryMax` | Filtro por region |
| `visibilityStatus` + `subscriptionStatus` + `sectors (ARRAY_CONTAINS)` + `expectedSalaryMax` | Filtro por sector |
| `visibilityStatus` + `subscriptionStatus` + `region` + `sectors (ARRAY_CONTAINS)` + `expectedSalaryMax` | Filtro combinado |

---

## Reglas de seguridad — implementadas

Las reglas reales estan en `firestore.rules`. Resumen:

- `workerPublicProfiles`: lectura autenticada; escritura solo owner o admin.
- `workerPrivateProfiles`: lectura y escritura solo owner o admin.
- `companyProfiles`: lectura autenticada; escritura solo owner o admin.
- `invitations`: lectura solo company o worker involucrado, o admin; escritura `if false` (solo Cloud Functions).
- `payments`: lectura solo owner o admin; escritura `if false`.
- `contactUnlocks`: lectura solo company o worker involucrado, o admin; escritura `if false`.
- `conversationMessages`, `auditEvents`, `aiUsageLogs`, `marketAnalyticsReports`, `configuracion_sistema`: lectura solo admin; escritura `if false`.

Suite de pruebas: 14 tests con emulador Firestore. Todos pasan en produccion.

---

## Estrategia para datos privados

Los datos privados del trabajador se entregan via Cloud Function callable `getUnlockedWorkerContact`, que verifica:
1. Existe `contactUnlocks` activo para `companyId + workerId + invitationId`.
2. El llamante es la empresa correcta (`request.auth.uid == companyId`).

Esto es mas auditable que reglas Firestore complejas y reduce riesgo de exposicion accidental.
