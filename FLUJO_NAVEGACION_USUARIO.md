# Flujo de navegación del usuario

> **Estado al 2026-06-17:** rutas y flujos reflejan la implementación real en producción.

## Rutas reales de la aplicación

```text
/                  Landing pública
/como-funciona     Explicación del modelo invertido
/postulante        Panel SPA del trabajador (onboarding + perfil + invitaciones + pagos)
/empresa           Panel SPA de empresa (búsqueda + invitaciones + proceso + ofertas + pagos)
/consola-admin     Panel SPA de administración
/omil              Panel SPA de OMIL
/legal/terminos    Términos y condiciones
/legal/privacidad  Política de privacidad
```

Rutas legacy con redirección automática:
```text
/trabajador  →  /postulante
/admin       →  /consola-admin
```

> Nota: la aplicación es una SPA estática (Next.js `output: "export"`). No hay rutas dinámicas del lado servidor. Cada panel es una SPA con tabs internos, no rutas separadas.

---

## Entrada principal

### Landing pública `/`

Objetivo: explicar rápidamente el sistema invertido y dirigir al flujo correcto.

Mensaje central: **"Publica tu perfil y recibe ofertas con sueldo claro desde el primer contacto."**

Bloques:
- Topbar con logo, navegación y accesos (Postulante / Empresa).
- Hero con tagline y acciones principales.
- Strip de 3 pasos del modelo invertido.
- Footer global con links legales y crédito de diseño.

### Cómo funciona `/como-funciona`

Página explicativa con:
- Storyboard de 3 pasos.
- Perfiles anónimos de ejemplo.
- Beneficios para postulantes y empresas.
- Banner de empresas verificadas.

---

## Flujo del trabajador

### 1. Registro

El usuario crea cuenta vía Firebase Auth (email/password o Google). Al registrarse elige rol `worker`. Llega al panel `/postulante`.

### 2. Onboarding del perfil público

Tab "Perfil" en `/postulante`.

Campos del perfil público:
- Título profesional.
- Resumen breve.
- Área / rubro.
- Habilidades (separadas por coma).
- Nivel de seniority y años de experiencia.
- Región y ciudad.
- Modalidad preferida (remoto / híbrido / presencial).
- Renta esperada (mín / máx en CLP).
- Disponibilidad (buscando activamente / escucho ofertas / no disponible).

Regla: en esta sección no se pide teléfono ni correo visible para empresas.

### 3. Datos privados

Misma tab "Perfil", sección inferior visualmente separada con fondo ámbar e ícono candado.

Campos privados:
- Nombre legal completo.
- Teléfono.
- Links de portafolio o LinkedIn.
- CV en PDF (con análisis IA opcional vía Gemini).
- Carta de presentación.

Mensaje de confianza: "Estos datos no serán visibles para empresas hasta que aceptes una invitación autorizada."

### 4. CV con análisis de IA

Tab "CV + IA" (integrado en tab "Perfil").

- Subida de CV en PDF (hasta 5 MB).
- Cloud Function `analyzeWorkerCv` con Gemini extrae: cargo, experiencia, habilidades, sectores, resumen.
- El postulante revisa y aprueba el perfil generado.
- El perfil público se actualiza con los datos analizados.

### 5. Carta de presentación

Tab "Carta" en `/postulante`.

Generador con datos del perfil actual. Editable antes de guardar.

### 6. Tests opcionales

Tab "Tests" en `/postulante`.

Tres evaluaciones opcionales:
- **Test de inglés laboral** (22 preguntas, niveles A2–C1, resultado CEFR).
- **Test de español profesional** (20 preguntas, ortografía, redacción, comprensión).
- **Evaluación conductual laboral** (20 preguntas, tipo Situational Judgment Test).

Resultados visibles en el perfil público para empresas verificadas como señal adicional.
Nivel CEFR mostrado en etiquetas: A1, A2, B1, B2, C1, C2.

### 7. Activación de visibilidad

Tab "Activación" o desde el checklist lateral.

Precio: `$999 CLP` por 30 días (período de lanzamiento).
Proveedor: Mercado Pago (primario) / Stripe (secundario).

Al pagar exitosamente:
- Se activa `subscriptionStatus: "active"`.
- Se establece `profileExpiresAt` a 30 días.
- El perfil queda visible en búsquedas de empresas.

### 8. Panel de invitaciones

Tab "Invitaciones" en `/postulante`.

Cada invitación muestra:
- Empresa (verificada).
- Cargo u oportunidad.
- Rango salarial (obligatorio).
- Modalidad y tipo de contrato.
- Ubicación.
- Mensaje.
- Fecha de vencimiento.

Acciones: Aceptar / Rechazar.

Regla: el trabajador nunca acepta sin ver sueldo, modalidad y empresa verificada.

### 9. Proceso activo (chat)

Al abrir una invitación aceptada, se abre el chat en tiempo real (Firestore `onSnapshot`).
El chat se actualiza automáticamente sin recargar. Auto-scroll al último mensaje.

Estados visibles del proceso:
`sent → viewed → accepted → in_process → offer_sent → hired / closed`

---

## Flujo de la empresa

### 1. Registro y verificación

La empresa crea cuenta vía Firebase Auth. Al registrarse elige rol `company`. Llega al panel `/empresa`.

Primera vez: completa datos de empresa (razón social, RUT, sitio web, rubro, tamaño).
El estado queda `verificationStatus: "pending"`. Admin verifica y cambia a `"verified"`.

Una empresa no verificada no puede enviar invitaciones ni contactar postulantes.

### 2. Panel izquierdo — checklist de pasos

Columna izquierda en `/empresa` muestra 6 pasos del proceso de contratación con estado visual (pendiente / completado):
1. Cuenta creada.
2. Datos empresa completados.
3. Verificación aprobada.
4. Primera búsqueda realizada.
5. Invitación enviada.
6. Cierre pagado.

### 3. Búsqueda de talento

Tab "Buscar talento" en `/empresa`.

Filtros server-side (Firestore con índices compuestos):
- Palabra clave (filtro client-side sobre resultados).
- Región.
- Sector / rubro.
- Salario máximo esperado.

Resultados: tarjetas anónimas de trabajadores con badges de nivel de tests si los completaron.

Funciones adicionales:
- Comparador de hasta 3 candidatos (persistido en sessionStorage entre tabs).
- Análisis IA con Gemini por candidato.
- Botón "Invitar" directamente desde cada tarjeta.

### 4. Crear invitación laboral

Formulario en tab "Buscar" o "Invitaciones" en `/empresa`.

Campos obligatorios:
- Título de oportunidad.
- Resumen.
- Rango salarial (mín y máx en CLP).
- Modalidad de trabajo.
- Tipo de contrato.
- Ubicación.
- Mensaje personalizado.

Al enviar: Cloud Function `createInvitation` crea el documento en Firestore.
El trabajador recibe la invitación en su panel en tiempo real.

### 5. Proceso activo

Tab "Proceso activo" en `/empresa`.

- Chat en tiempo real con el trabajador.
- Timeline de estados del proceso.
- Reglas de entrevista (ambas partes deben aceptar).
- Desbloqueo de contacto: pago de `$999 CLP` vía Mercado Pago / Stripe.
- Agendamiento de entrevista.
- Evaluación post-proceso.

### 6. Panel derecho — centro de contratación

Columna derecha en `/empresa` muestra:
- Descripción del modelo de pago por resultado.
- KPIs: invitaciones enviadas, respuestas recibidas, cierres pagados.
- Estado de verificación de la empresa.

---

## Flujo administrador

### Panel admin `/consola-admin`

Acceso: solo usuarios con `role: "admin"`. Login con Google o email/password.
Cuenta administradora: `fabiancarrillo@gmail.com`.

Tabs:
- **Dashboard**: métricas de mercado (trabajadores visibles, empresas verificadas, invitaciones activas, salario promedio, skills más frecuentes).
- **Empresas**: revisar pendientes, verificar o rechazar empresas.
- **Usuarios**: crear usuarios gestionados (especialmente cuentas OMIL), suspender cuentas, cambiar roles.
- **Contabilidad**: asientos contables, conciliación de pagos, aprobación de transferencias manuales, actualización de estado DTE/SII.
- **Reportes**: reportes científicos de mercado generados semanalmente o manualmente.

---

## Flujo OMIL

### Panel OMIL `/omil`

Acceso: usuarios con `role: "omil"` (Oficinas Municipales de Intermediación Laboral).
Las cuentas OMIL son creadas por el administrador desde `/consola-admin` → tab "Usuarios".
No existe autoregistro OMIL; solo login institucional con credenciales asignadas.

Función: crear y gestionar perfiles de trabajadores en nombre de postulantes que no tienen acceso digital directo.
Los perfiles creados por OMIL se marcan con `profileSource: "omil"` y `createdByOmilId`.

---

## Principio de experiencia

Cada pantalla responde una pregunta clara:

- **Trabajador**: qué ven de mí, quién me busca, qué condiciones ofrecen, cuánto tiempo me queda visible.
- **Empresa**: qué talento está disponible, cuánto espera ganar, cómo contactarlo correctamente, qué proceso está activo.
- **Plataforma**: qué procesos están sanos, cuáles están abandonados, dónde hay riesgo de abuso, cómo va la contabilidad.
