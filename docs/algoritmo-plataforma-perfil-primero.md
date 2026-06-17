# Algoritmo operativo de Perfil Primero

Fecha: 2026-06-16

## 1. Principio central

Perfil Primero funciona como una plataforma de empleo invertida:

1. El postulante crea un perfil anonimo.
2. La plataforma extrae y ordena su informacion profesional.
3. La empresa verificada busca talento disponible.
4. La empresa envia una invitacion con sueldo, modalidad y condiciones visibles.
5. El postulante decide si acepta, rechaza o pide mas informacion.
6. El contacto privado se libera solo bajo reglas de cierre y pago.

## 2. Entidades principales

### Postulante

Datos publicos anonimos:

- Codigo de perfil.
- Cargo objetivo.
- Resumen profesional.
- Habilidades.
- Area.
- Region y comuna.
- Experiencia.
- Renta esperada.
- Modalidad.
- Disponibilidad.
- Tests opcionales.
- Perfil creado por IA.

Datos privados:

- Nombre legal.
- Email.
- Telefono.
- CV original.
- Portafolio.
- Datos de pago.
- Evaluaciones completas.

### Empresa

Datos:

- Nombre comercial.
- Razon social.
- RUT.
- Sitio web.
- Region y comuna.
- Rubro.
- Logo.
- Estado de verificacion.
- Publicaciones.
- Procesos.
- Pagos.
- Reputacion.

### OMIL

Datos:

- Cuenta institucional gratuita.
- Identificador OMIL 1 a 30.
- Postulantes cargados.
- Fecha de carga.
- Fecha de expiracion gratuita.
- Estado de conversion a suscripcion pagada.

### Administrador

Datos/control:

- Empresas.
- Postulantes.
- OMIL.
- Pagos.
- Facturacion.
- Cupones.
- Entrevistas.
- Alertas.
- Logs.
- Reportes.

## 3. Flujo del postulante

### Paso 1: Registro

Entrada:

- Email y contrasena, o Gmail.

Proceso:

1. Crear usuario en Firebase Auth.
2. Crear documento `users/{uid}` con rol `worker`.
3. Crear perfil inicial privado.
4. Asignar codigo anonimo.

Salida:

- Postulante entra al panel privado.

### Paso 2: Carga de CV

Entrada:

- Archivo PDF/DOC/DOCX/TXT.

Proceso:

1. Subir archivo a Storage.
2. Guardar referencia privada.
3. Enviar texto/archivo al backend IA.
4. Google Gen AI analiza el CV.
5. La IA devuelve JSON estructurado:
   - resumen,
   - experiencia,
   - educacion,
   - habilidades,
   - logros,
   - idiomas,
   - cargo sugerido,
   - nivel laboral,
   - areas recomendadas.
6. Guardar resultado editable en Firestore.

Salida:

- CV Perfil Primero generado.
- Perfil publico anonimo autocompletado.

### Paso 3: Edicion de perfil publico

Entrada:

- Ajustes manuales del postulante.

Proceso:

1. Validar campos minimos.
2. Separar informacion publica y privada.
3. Bloquear datos sensibles en vista empresa.
4. Calcular preparacion del perfil.

Salida:

- Perfil listo para activacion.

### Paso 4: Tests opcionales

Entrada:

- Respuestas del postulante.

Proceso:

1. Ejecutar test independiente.
2. Calcular resultado.
3. Guardar detalle privado.
4. Mostrar resumen anonimo como diferenciador.

Salida:

- Perfil con plus de evaluaciones.

### Paso 5: Activacion mensual

Entrada:

- Pago Mercado Pago.

Proceso:

1. Crear preferencia de pago.
2. Redirigir a Mercado Pago.
3. Recibir webhook.
4. Confirmar estado approved/paid.
5. Activar perfil por 30 dias.
6. Cambiar `visibilityStatus` a visible.

Salida:

- Perfil aparece en busquedas empresariales.

## 4. Flujo empresa

### Paso 1: Registro

Entrada:

- Email y contrasena, o Gmail.

Proceso:

1. Crear usuario en Firebase Auth.
2. Crear documento `users/{uid}` con rol `company`.
3. Crear perfil empresa en estado `draft`.

Salida:

- Empresa entra al panel privado.

### Paso 2: Verificacion

Entrada:

- Datos legales, RUT, sitio web, logo, rubro.

Proceso:

1. Guardar datos.
2. Marcar estado `pending`.
3. Enviar a consola admin.
4. Admin aprueba, rechaza o suspende.

Salida:

- Empresa verificada puede contactar postulantes reales.

### Paso 3: Crear publicacion

Entrada:

- Cargo, area, region, comuna, sueldo, modalidad, vacantes, requisitos.

Proceso:

1. Validar sueldo visible obligatorio.
2. Validar vacantes.
3. Guardar publicacion.
4. Activar visibilidad si empresa esta verificada.

Salida:

- Puesto disponible para busqueda/matching.

### Paso 4: Buscar talento

Entrada:

- Filtros empresariales.

Proceso:

1. Buscar perfiles visibles.
2. Excluir perfiles vencidos/suspendidos.
3. Ocultar datos privados.
4. Ordenar por calce:
   - area,
   - skills,
   - comuna/region,
   - renta,
   - modalidad,
   - disponibilidad,
   - tests,
   - experiencia.
5. Permitir comparacion lado a lado.

Salida:

- Lista de postulantes anonimos compatibles.

### Paso 5: IA de seleccion

Entrada:

- Texto de vacante + perfiles candidatos.

Proceso:

1. Normalizar descripcion de vacante.
2. Extraer criterios.
3. Comparar contra perfiles.
4. Devolver JSON:
   - score,
   - fortalezas,
   - brechas,
   - preguntas sugeridas,
   - recomendacion.

Salida:

- Decision asistida, no automatica.

### Paso 6: Invitacion

Entrada:

- Perfil seleccionado.
- Vacante.
- Plantilla o mensaje manual.

Proceso:

1. Crear invitacion.
2. Incluir sueldo, modalidad y condiciones.
3. Notificar al postulante.
4. Crear timeline.

Salida:

- Postulante recibe invitacion clara.

## 5. Flujo de entrevista y contacto

### Programacion

Entrada:

- Fecha y hora, minimo de un dia para otro.

Proceso:

1. Validar fecha futura.
2. Crear entrevista.
3. Enviar email.
4. Crear evento Google Calendar.
5. Enviar recordatorios.

Salida:

- Entrevista programada.

### Instructivo obligatorio

Antes de entrar a la entrevista:

1. Empresa acepta reglas.
2. Postulante acepta reglas.
3. La plataforma informa que el contacto privado esta bloqueado.
4. La plataforma informa que IA monitorea señales de intercambio de contacto.
5. Ambos aceptan que si se intenta cerrar por fuera, se activa bloqueo/pago.

### Monitoreo IA

Entrada:

- Chat/mensajes de entrevista.

Proceso:

1. Analizar texto con Google Gen AI.
2. Detectar email, telefono, WhatsApp, direccion o instrucciones de contacto externo.
3. Si hay intento de intercambio:
   - bloquear chat momentaneamente,
   - informar a empresa que debe pagar,
   - informar al postulante que empresa esta realizando pago,
   - crear evento de auditoria.

Salida:

- Contacto protegido hasta pago.

## 6. Flujo de pago por resultado

Entrada:

- Empresa intenta cerrar trato o liberar contacto.

Proceso:

1. Crear cobro Mercado Pago.
2. Bloquear contacto hasta confirmacion.
3. Recibir webhook.
4. Confirmar pago.
5. Liberar datos privados.
6. Registrar asiento contable.
7. Actualizar facturacion.
8. Marcar proceso como cerrado/contratado.
9. Descontar vacante.

Salida:

- Empresa obtiene datos.
- Postulante sabe que la empresa cerro trato.
- Plataforma registra ingreso.

## 7. Flujo OMIL

Entrada:

- Cuenta OMIL carga postulante.

Proceso:

1. Crear perfil con origen `omil`.
2. Saltar cobro inicial.
3. Activar visibilidad por 30 dias.
4. Guardar email personal del postulante.
5. Antes de vencer, enviar correo invitando a continuar.
6. Si el postulante paga, convertir a cuenta directa.
7. Si no paga, ocultar/expirar perfil.

Salida:

- OMIL puede apoyar gratis.
- Plataforma convierte postulantes a suscripcion.

## 8. Flujo administrativo

### Verificacion de empresas

1. Admin revisa empresas pendientes.
2. Aprueba/rechaza/suspende.
3. Registra motivo.
4. Genera log.

### Control de pagos

1. Lee pagos Mercado Pago.
2. Cruza con procesos.
3. Detecta pendientes.
4. Permite aprobacion manual documentada.

### Contabilidad

1. Cada pago confirmado crea movimiento.
2. Se genera asiento contable.
3. Se vincula a factura/boleta.
4. Se exporta reporte.

### Seguridad

1. Registrar eventos sensibles.
2. Detectar intentos de acceso indebido.
3. Bloquear lecturas privadas sin autorizacion.
4. Auditar cambios admin.

## 9. Reglas de privacidad

La plataforma nunca debe mostrar a empresas:

- Nombre legal.
- Email.
- Telefono.
- CV original.
- Portafolio privado.
- Datos personales.

Solo se liberan cuando:

1. Existe invitacion aceptada.
2. Existe proceso validado.
3. Existe pago de cierre confirmado.
4. Firestore Rules autorizan lectura.

## 10. Pseudoflujo general

```text
INICIO

SI usuario = postulante:
  registrar o iniciar sesion
  subir CV
  analizar CV con IA
  crear perfil anonimo
  completar datos publicos
  opcional: tests y carta
  pagar activacion mensual
  publicar perfil visible
  recibir invitaciones
  aceptar/rechazar
  programar entrevista
  mantener contacto privado bloqueado

SI usuario = empresa:
  registrar o iniciar sesion
  completar perfil empresa
  esperar verificacion admin
  crear vacante
  buscar postulantes
  comparar candidatos
  pedir recomendacion IA
  enviar invitacion con sueldo visible
  programar entrevista
  si desea contacto/cierre:
    pagar por resultado
    liberar contacto
    cerrar proceso

SI usuario = admin:
  verificar empresas
  controlar pagos
  revisar contabilidad
  monitorear entrevistas
  resolver alertas
  exportar reportes

FIN
```

## 11. Criterios de exito

- El postulante no postula a ciegas.
- La empresa no paga por publicar avisos sin resultado.
- El sueldo es visible desde el primer contacto serio.
- El contacto privado no se filtra antes del cierre.
- La administracion tiene trazabilidad.
- La contabilidad tiene comprobantes.
- La IA ayuda, pero no decide sola.
