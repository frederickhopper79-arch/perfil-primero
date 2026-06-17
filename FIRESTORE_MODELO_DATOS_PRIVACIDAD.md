# Modelo de datos Firestore y privacidad

## Objetivo

Definir una estructura de base de datos para una plataforma laboral invertida donde los trabajadores pueden mostrarse ante empresas sin revelar datos sensibles hasta que exista una condicion autorizada.

Condicion autorizada inicial:

- Empresa verificada.
- Invitacion laboral valida.
- Rango salarial visible.
- Trabajador acepta el contacto.
- Pago o desbloqueo registrado segun la regla comercial.

## Principio central

Los datos publicos y privados del trabajador deben vivir separados.

La interfaz nunca debe decidir por si sola que mostrar u ocultar. La seguridad debe aplicarse en Firestore Security Rules y Cloud Functions.

## Colecciones principales

### users

Coleccion:

```text
users/{userId}
```

Uso:

Guarda datos minimos comunes para autenticacion, rol y estado general.

Campos:

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

Roles posibles:

- worker.
- company.
- admin.

## Perfil del trabajador

### workerPublicProfiles

Coleccion:

```text
workerPublicProfiles/{workerId}
```

Uso:

Contiene la informacion visible en busquedas de empresas.

No debe contener telefono, correo personal, nombre legal completo ni archivos descargables privados.

Campos:

```json
{
  "workerId": "uid",
  "profileCode": "TL-8F29",
  "displayName": "Profesional de marketing digital",
  "headline": "Especialista en campanas pagadas y analitica",
  "summary": "5 anos de experiencia en crecimiento digital para ecommerce y servicios.",
  "skills": ["Google Ads", "Meta Ads", "GA4", "SEO", "Looker Studio"],
  "sectors": ["Marketing", "Ecommerce", "Tecnologia"],
  "experienceLevel": "mid",
  "yearsOfExperience": 5,
  "region": "Region Metropolitana",
  "city": "Santiago",
  "workModes": ["remote", "hybrid"],
  "expectedSalaryMin": 1200,
  "expectedSalaryMax": 1800,
  "currency": "USD",
  "availability": "listening",
  "visibilityStatus": "visible",
  "subscriptionStatus": "active",
  "profileExpiresAt": "timestamp",
  "lastActiveAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Estados de disponibilidad:

- actively_looking: busca activamente.
- listening: escucha ofertas.
- unavailable: no disponible.

Estados de visibilidad:

- visible.
- paused.
- hidden.
- expired.
- suspended.

### workerPrivateProfiles

Coleccion:

```text
workerPrivateProfiles/{workerId}
```

Uso:

Contiene datos sensibles. Solo el trabajador, administradores autorizados y procesos desbloqueados pueden acceder.

Campos:

```json
{
  "workerId": "uid",
  "legalName": "Nombre Apellido",
  "preferredName": "Nombre",
  "email": "usuario@correo.com",
  "phone": "+56912345678",
  "nationality": "CL",
  "documentIdHash": "hash-no-reversible",
  "cvFilePath": "workers/uid/cv/cv.pdf",
  "photoFilePath": "workers/uid/profile/photo.jpg",
  "portfolioFiles": [
    "workers/uid/portfolio/caso-1.pdf"
  ],
  "portfolioLinks": [
    "https://portafolio.com"
  ],
  "contactPreferences": {
    "email": true,
    "phone": false,
    "whatsapp": false
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Regla:

Esta coleccion nunca se consulta desde listados publicos ni buscadores de empresas.

## Perfil de empresa

### companyProfiles

Coleccion:

```text
companyProfiles/{companyId}
```

Campos:

```json
{
  "companyId": "uid",
  "companyName": "Empresa SpA",
  "legalName": "Empresa Legal SpA",
  "taxId": "rut-o-id-fiscal",
  "website": "https://empresa.com",
  "industry": "Tecnologia",
  "size": "11-50",
  "verificationStatus": "verified",
  "billingStatus": "active",
  "reputationScore": 100,
  "responseRate": 0.92,
  "averageResponseTimeHours": 18,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Estados de verificacion:

- pending.
- verified.
- rejected.
- suspended.

## Invitaciones laborales

### invitations

Coleccion:

```text
invitations/{invitationId}
```

Campos:

```json
{
  "invitationId": "id",
  "companyId": "uid_empresa",
  "workerId": "uid_trabajador",
  "opportunityTitle": "Especialista en marketing digital",
  "opportunitySummary": "Buscamos apoyar crecimiento de ecommerce regional.",
  "salaryMin": 1300,
  "salaryMax": 1700,
  "currency": "USD",
  "workMode": "hybrid",
  "location": "Santiago",
  "contractType": "full_time",
  "message": "Nos interesa conversar por tu experiencia en performance.",
  "status": "sent",
  "expiresAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Estados:

- sent.
- viewed.
- accepted.
- rejected.
- more_info_requested.
- unlocked.
- in_process.
- offer_sent.
- hired.
- closed.
- expired.

Reglas:

- No se permite crear invitacion sin rango salarial.
- No se permite crear invitacion desde empresa no verificada.
- No se permite mantener invitaciones abiertas indefinidamente.

## Desbloqueos de contacto

### contactUnlocks

Coleccion:

```text
contactUnlocks/{unlockId}
```

Uso:

Registra que una empresa tiene permiso para ver datos privados de un trabajador en el contexto de una invitacion especifica.

Campos:

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

Estados:

- pending_payment.
- active.
- revoked.
- expired.
- refunded.

Regla:

Una empresa solo puede leer datos privados del trabajador si existe un `contactUnlocks` activo para esa combinacion `companyId + workerId + invitationId`.

## Pagos

### payments

Coleccion:

```text
payments/{paymentId}
```

Campos:

```json
{
  "paymentId": "id",
  "userId": "uid",
  "payerRole": "worker",
  "provider": "stripe",
  "providerPaymentId": "pi_123",
  "amount": 10,
  "currency": "USD",
  "paymentType": "worker_subscription",
  "status": "paid",
  "relatedWorkerId": "uid_trabajador",
  "relatedCompanyId": null,
  "relatedInvitationId": null,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

Tipos de pago:

- worker_subscription: USD 10 por 30 dias.
- company_contact_unlock: USD 50 por desbloqueo/contacto.
- company_success_fee: USD 50 por contratacion confirmada, si se usa ese modelo.

## Eventos de auditoria

### auditEvents

Coleccion:

```text
auditEvents/{eventId}
```

Campos:

```json
{
  "eventId": "id",
  "actorId": "uid",
  "actorRole": "company",
  "eventType": "private_profile_unlocked",
  "targetType": "worker",
  "targetId": "uid_trabajador",
  "metadata": {
    "invitationId": "id",
    "paymentId": "id"
  },
  "createdAt": "timestamp"
}
```

Eventos importantes:

- worker_profile_created.
- worker_profile_published.
- worker_subscription_paid.
- company_verified.
- worker_profile_viewed.
- invitation_sent.
- invitation_viewed.
- invitation_accepted.
- contact_unlock_paid.
- private_profile_unlocked.
- process_closed.

## Cloud Functions necesarias

### onWorkerSubscriptionPaid

Evento:

Webhook de Stripe o Mercado Pago.

Acciones:

- Crear registro en `payments`.
- Marcar `workerPublicProfiles/{workerId}.subscriptionStatus` como active.
- Actualizar `profileExpiresAt` a 30 dias.
- Registrar evento de auditoria.

### createInvitation

Evento:

Empresa envia invitacion.

Validaciones:

- Empresa verificada.
- Trabajador visible.
- Invitacion con sueldo minimo y maximo.
- Mensaje no vacio.

Acciones:

- Crear documento en `invitations`.
- Registrar auditoria.
- Notificar al trabajador.

### acceptInvitation

Evento:

Trabajador acepta invitacion.

Acciones:

- Cambiar estado a accepted.
- Registrar auditoria.
- Habilitar siguiente paso de pago/desbloqueo para empresa.

### unlockWorkerContact

Evento:

Empresa paga o confirma desbloqueo.

Validaciones:

- Invitacion aceptada.
- Pago exitoso.
- Empresa corresponde a la invitacion.
- Trabajador corresponde a la invitacion.

Acciones:

- Crear `contactUnlocks`.
- Cambiar invitacion a unlocked.
- Registrar auditoria.

## Borrador de reglas de seguridad

Este es un esquema conceptual. Las reglas finales deben probarse con emuladores de Firebase antes de produccion.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return signedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    function isCompany() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "company";
    }

    match /workerPublicProfiles/{workerId} {
      allow read: if signedIn();
      allow create, update: if isOwner(workerId) || isAdmin();
      allow delete: if isAdmin();
    }

    match /workerPrivateProfiles/{workerId} {
      allow read: if isOwner(workerId) || isAdmin();
      allow create, update: if isOwner(workerId) || isAdmin();
      allow delete: if isAdmin();
    }

    match /companyProfiles/{companyId} {
      allow read: if signedIn();
      allow create, update: if isOwner(companyId) || isAdmin();
      allow delete: if isAdmin();
    }

    match /invitations/{invitationId} {
      allow read: if signedIn()
        && (
          resource.data.companyId == request.auth.uid
          || resource.data.workerId == request.auth.uid
          || isAdmin()
        );
      allow create, update, delete: if false;
    }

    match /payments/{paymentId} {
      allow read: if signedIn()
        && (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if false;
    }

    match /contactUnlocks/{unlockId} {
      allow read: if signedIn()
        && (
          resource.data.companyId == request.auth.uid
          || resource.data.workerId == request.auth.uid
          || isAdmin()
        );
      allow write: if false;
    }

    match /auditEvents/{eventId} {
      allow read: if isAdmin();
      allow write: if false;
    }
  }
}
```

## Nota importante sobre datos privados

Firestore Security Rules no pueden hacer consultas complejas para buscar permisos en colecciones arbitrarias de forma flexible. Por eso, para produccion conviene usar una de estas estrategias:

- Mantener los datos privados accesibles solo para el trabajador y admin, y entregar datos de contacto mediante una Cloud Function callable que verifique `contactUnlocks`.
- Crear subdocumentos de acceso por empresa, por ejemplo `workerPrivateProfiles/{workerId}/authorizedCompanies/{companyId}`.
- Duplicar un resumen de contacto autorizado dentro de `invitations/{invitationId}` solo cuando el trabajador acepta y la empresa paga.

Recomendacion inicial:

Usar Cloud Functions para entregar datos privados autorizados. Es mas auditable, mas facil de controlar y reduce riesgos de exposicion accidental.

