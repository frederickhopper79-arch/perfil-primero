# Roadmap tecnico: plataforma laboral invertida

## Objetivo

Construir una plataforma donde trabajadores publican perfiles laborales y empresas verificadas buscan, invitan y contratan talento.

La arquitectura debe priorizar:

- Desarrollo rapido.
- Bajo costo inicial.
- Seguridad de datos personales.
- Perfiles anonimos o parcialmente anonimos.
- Suscripciones y pagos trazables.
- Escalabilidad sin servidores dedicados.

## Stack recomendado

### Frontend

Tecnologia recomendada:

- Next.js.
- React.
- TypeScript.

Motivo:

- Permite construir una experiencia web moderna, rapida y responsiva.
- Facilita SEO para paginas publicas.
- Permite separar vistas de trabajador, empresa y administracion.
- Tiene buen ecosistema para integrarse con Firebase, Stripe y Mercado Pago.

### Backend

Tecnologia recomendada:

- Firebase Cloud Functions.

Motivo:

- Modelo serverless.
- Bajo costo cuando hay poco trafico.
- Buena integracion con Firebase Auth, Firestore, Cloud Storage y pagos.
- Ideal para acciones puntuales: crear usuario, procesar pagos, enviar invitaciones, actualizar estados y validar permisos.

### Base de datos

Tecnologia recomendada:

- Google Firestore.

Motivo:

- Base de datos NoSQL flexible.
- Buena para perfiles, invitaciones, estados de procesos y actividad en tiempo real.
- Permite reglas de seguridad granulares.
- Escala sin administrar servidores.

### Archivos privados

Tecnologia recomendada:

- Firebase Storage / Google Cloud Storage.

Uso:

- CV originales en PDF.
- Imagenes de perfil.
- Portafolios.
- Documentos de verificacion de empresas.

Regla clave:

Los archivos privados no deben ser publicos. El acceso debe autorizarse mediante reglas de seguridad o URLs firmadas generadas por backend.

### Autenticacion

Tecnologia recomendada:

- Firebase Authentication.

Roles iniciales:

- Trabajador.
- Empresa.
- Administrador.

## Pagos

### Trabajador

Cobro:

- USD 10 por 30 dias de perfil activo.

Modelo tecnico:

- Suscripcion mensual.
- El backend recibe eventos del proveedor de pago.
- El perfil se marca como activo, vencido, cancelado o suspendido.

### Empresa

Cobro:

- USD 50 por trabajador encontrado.

Opciones tecnicas:

- Cobro al aceptar contacto.
- Cobro al liberar datos completos del candidato.
- Cobro al marcar contratacion confirmada.

Recomendacion inicial:

Cobrar cuando la empresa desbloquea el contacto completo o confirma interes formal aceptado por el trabajador. Es mas facil de auditar que esperar a una contratacion externa.

### Proveedores de pago

Opciones:

- Stripe.
- Mercado Pago.

Recomendacion:

Empezar con Stripe si el mercado objetivo y la cuenta comercial lo permiten. Usar Mercado Pago si se prioriza Chile/Latam y metodos locales.

## Estructura de datos inicial

### users

Datos comunes:

- uid.
- email.
- role.
- createdAt.
- lastLoginAt.
- status.

### workerProfiles

Datos:

- userId.
- publicName.
- anonymizedName.
- headline.
- summary.
- skills.
- experienceLevel.
- sectors.
- location.
- workMode.
- expectedSalaryMin.
- expectedSalaryMax.
- availability.
- visibilityStatus.
- subscriptionStatus.
- profileExpiresAt.
- cvFilePath.
- portfolioLinks.
- contactPrivacy.

### companyProfiles

Datos:

- userId.
- companyName.
- legalName.
- taxId.
- website.
- industry.
- verificationStatus.
- reputationScore.
- responseRate.
- averageResponseTime.

### invitations

Datos:

- companyId.
- workerId.
- opportunityTitle.
- salaryMin.
- salaryMax.
- workMode.
- location.
- contractType.
- message.
- status.
- expiresAt.
- createdAt.
- updatedAt.

Estados:

- sent.
- viewed.
- accepted.
- rejected.
- more_info_requested.
- in_process.
- offer_sent.
- hired.
- closed.
- expired.

### payments

Datos:

- userId.
- payerRole.
- provider.
- providerPaymentId.
- amount.
- currency.
- paymentType.
- status.
- createdAt.

Tipos:

- worker_subscription.
- company_unlock.
- company_success_fee.

## Seguridad y privacidad

### Perfiles anonimos

El trabajador debe poder aparecer en busquedas sin exponer datos sensibles.

Datos publicos posibles:

- Nombre parcial o alias profesional.
- Rubro.
- Experiencia.
- Habilidades.
- Region.
- Rango de renta esperada.
- Disponibilidad.

Datos privados:

- Nombre legal completo.
- Telefono.
- Email personal.
- CV descargable.
- Documentos.

### Reglas de acceso

La empresa solo debe ver datos completos cuando:

- Esta verificada.
- Envia una invitacion con sueldo y condiciones.
- El trabajador acepta el contacto.
- O la empresa paga por desbloqueo, segun la regla comercial elegida.

### Auditoria

Guardar eventos relevantes:

- Perfil visto.
- Invitacion enviada.
- Invitacion vista.
- Contacto aceptado.
- Datos desbloqueados.
- Pago realizado.
- Proceso cerrado.

## Alojamiento

### Frontend

Opcion recomendada:

- Firebase Hosting.

Ventajas:

- SSL automatico.
- CDN global.
- Buen costo inicial.
- Integracion natural con Firebase.

Nota:

Si se usa Next.js con renderizado avanzado del lado servidor, puede evaluarse Firebase App Hosting o Cloud Run. Para un MVP, tambien se puede empezar con una app React/Next exportada de forma estatica si las vistas dinamicas se cargan desde Firebase.

### Backend

Opcion recomendada:

- Cloud Functions for Firebase.

### Archivos

Opcion recomendada:

- Firebase Storage / Google Cloud Storage.

## Costos estimados

Estos costos deben confirmarse antes del lanzamiento porque dependen del plan, region, consumo y cambios de precio de Google.

Segun la pagina oficial de precios de Firebase consultada el 14 de junio de 2026:

- Firebase Hosting incluye 10 GB de almacenamiento sin costo y 360 MB diarios de transferencia sin costo. Luego el almacenamiento figura desde USD 0.026/GB y la transferencia desde USD 0.15/GB.
- Cloud Firestore incluye 1 GiB almacenado, 50.000 lecturas diarias, 20.000 escrituras diarias y 20.000 eliminaciones diarias sin costo en la edicion estandar.
- Cloud Functions incluye 2 millones de invocaciones mensuales sin costo; luego figura USD 0.40 por millon de invocaciones, mas computo y red segun uso.
- Cloud Storage para Firebase tiene cuotas sin costo que dependen del tipo de bucket y region.

Fuentes oficiales:

- https://firebase.google.com/pricing
- https://firebase.google.com/docs/hosting/usage-quotas-pricing
- https://firebase.google.com/docs/firestore/quotas
- https://cloud.google.com/functions/pricing

## Gasto fijo inicial

### Dominio

Comprar un dominio propio:

- .com.
- .cl.

Estimacion:

- USD 10 a USD 15 anuales para muchos dominios .com.
- El precio de dominios .cl puede variar segun proveedor.

## Fases de desarrollo

### Fase 1: MVP funcional

Objetivo:

Validar que trabajadores pagan por visibilidad y empresas pagan por encontrar talento.

Incluye:

- Registro y login.
- Perfil de trabajador.
- Estado de disponibilidad.
- Perfil de empresa.
- Buscador basico de trabajadores.
- Invitaciones con sueldo obligatorio.
- Panel de invitaciones.
- Suscripcion del trabajador.
- Cobro o simulacion de cobro a empresa.

### Fase 2: Confianza y control

Objetivo:

Evitar que la plataforma repita los errores de las bolsas tradicionales.

Incluye:

- Verificacion de empresas.
- Reputacion de empresas.
- Procesos con vencimiento automatico.
- Metricas de visitas al perfil.
- Reportes y moderacion.
- Perfiles anonimos mejorados.

### Fase 3: Matching inteligente

Objetivo:

Mejorar conversion sin filtros injustos.

Incluye:

- Recomendaciones de mejora del perfil.
- Compatibilidad trabajador-empresa.
- Alertas inteligentes.
- Busquedas guardadas para empresas.
- Sugerencias de candidatos similares.

## Primer backlog tecnico

- Crear proyecto Next.js con TypeScript.
- Configurar Firebase.
- Definir colecciones de Firestore.
- Crear reglas de seguridad iniciales.
- Crear autenticacion por rol.
- Construir onboarding de trabajador.
- Construir onboarding de empresa.
- Construir buscador de perfiles.
- Crear flujo de invitacion.
- Crear estados de invitacion.
- Integrar proveedor de pagos.
- Crear panel administrativo minimo.

