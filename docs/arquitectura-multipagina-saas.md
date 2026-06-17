# Arquitectura multipagina y navegacion interna SaaS

Fecha: 2026-06-16
Plataforma: Perfil Primero

## Objetivo del rediseño

La interfaz actual concentra demasiadas funciones en una sola pantalla. Eso genera saturacion visual, formularios extensos y baja sensacion de plataforma consolidada. El nuevo enfoque debe dividir la experiencia en modulos, pantallas y subpantallas independientes, con navegacion lateral o superior fija segun el rol.

El principio rector es simple: cada pantalla debe resolver una sola tarea principal.

## Estructura general post-login

### Layout base para todos los roles

Elementos visuales comunes:

- Header compacto con logo, nombre del modulo activo, estado de sesion y boton cerrar sesion.
- Sidebar lateral en desktop con iconos y etiquetas.
- Navegacion inferior en mobile con 4 accesos principales.
- Area central de trabajo con ancho controlado.
- Panel derecho contextual solo cuando aporte valor, por ejemplo estado de pago, resumen del perfil o alertas.
- Breadcrumb corto cuando exista profundidad: `Panel > Perfil > Curriculum`.
- Boton primario unico por pantalla.
- Estados vacios profesionales: icono, titulo, explicacion y accion siguiente.

## Panel postulante

### 1. Inicio postulante

Proposito: mostrar estado general y proximos pasos.

Elementos:

- Tarjeta principal: "Tu perfil esta privado / visible / vencido".
- Indicador de avance del perfil en porcentaje.
- Acciones rapidas:
  - Subir o actualizar CV.
  - Mejorar perfil con IA.
  - Crear carta de presentacion.
  - Activar visibilidad.
- Resumen de invitaciones recibidas.
- Resumen de entrevistas programadas.
- Resumen de tests opcionales completados.
- Tarjeta de pago mensual: activo, pendiente, vencido.

No debe incluir formularios largos.

### 2. Mi curriculum

Proposito: gestionar el CV y el perfil generado por IA.

Subpantallas:

- `CV original`: subir PDF/DOC/DOCX/TXT, ver archivo cargado, reemplazar archivo.
- `Analisis IA`: boton "Analizar CV con Google IA", estado de procesamiento, resultado estructurado.
- `CV Perfil Primero`: version editable del curriculum con formato propio.
- `Datos privados`: nombre legal, telefono, correo, portafolio, archivos privados.

Elementos:

- Upload box grande y limpio.
- Estado de IA: pendiente, analizado, error de cuota, actualizado.
- Editor dividido en secciones accordion:
  - Resumen profesional.
  - Experiencia.
  - Educacion.
  - Habilidades.
  - Logros.
  - Idiomas.
- Botones:
  - Guardar cambios.
  - Regenerar con IA.
  - Publicar cambios.

### 3. Perfil publico anonimo

Proposito: controlar lo que ve la empresa antes de liberar datos.

Elementos:

- Preview de tarjeta anonima como la vera la empresa.
- Formulario breve por secciones:
  - Cargo objetivo.
  - Region y comuna.
  - Area.
  - Nivel laboral.
  - Renta esperada.
  - Modalidad.
  - Disponibilidad.
  - Habilidades visibles.
- Switches:
  - Visible para empresas verificadas.
  - Disponible para entrevista.
  - Recibir invitaciones por email.
- Aviso claro: "Nombre, telefono, correo y CV original no se muestran hasta aceptar una invitacion y cerrar el proceso".

### 4. Carta de presentacion

Proposito: crear carta comercial-profesional para empresas.

Elementos:

- Selector de objetivo:
  - Carta general.
  - Carta para ventas.
  - Carta para administracion.
  - Carta para tecnologia.
  - Carta personalizada.
- Editor de texto.
- Boton "Mejorar con IA".
- Preview final.
- Guardar como predeterminada.

### 5. Tests y evaluaciones

Proposito: diferenciar al postulante sin obligarlo.

Pantalla tipo lista, estilo Computrabajo pero propio.

Tarjetas:

- Test de ingles.
- Test de espanol.
- Test de personalidad laboral.

Cada tarjeta incluye:

- Ilustracion o icono.
- Nombre del test.
- Duracion estimada.
- Que mide.
- Estado: no iniciado, en progreso, completado.
- Boton: "Realizar test".

Subpantalla de test:

- Una pregunta por pantalla o bloques cortos.
- Barra de avance.
- Boton anterior/siguiente.
- Resultado final guardado en el perfil privado y mostrado como plus anonimo en el perfil publico.

### 6. Invitaciones

Proposito: revisar ofertas recibidas con sueldo y condiciones visibles.

Elementos:

- Lista de invitaciones.
- Filtros:
  - Nuevas.
  - Aceptadas.
  - Rechazadas.
  - En entrevista.
  - Cerradas.
- Tarjeta por invitacion:
  - Cargo.
  - Empresa verificada.
  - Sueldo.
  - Modalidad.
  - Comuna/region.
  - Mensaje de empresa.
  - Botones: aceptar, rechazar, pedir mas informacion.

### 7. Entrevistas

Proposito: gestionar entrevistas programadas dentro de la web.

Elementos:

- Calendario de entrevistas.
- Timeline del proceso:
  - Invitado.
  - Aceptado.
  - Entrevista agendada.
  - Entrevista realizada.
  - Oferta.
  - Cerrado.
- Sala de entrevista web.
- Instructivo previo obligatorio:
  - reglas de contacto,
  - bloqueo por pago,
  - monitoreo IA,
  - aceptacion de ambas partes.
- Chat interno con bloqueo automatico si se detecta intercambio de contacto antes de pago.

### 8. Pagos y suscripcion

Proposito: que el postulante entienda y gestione su visibilidad.

Elementos:

- Estado de suscripcion.
- Fecha de activacion.
- Fecha de vencimiento.
- Historial de pagos.
- Comprobantes.
- Boton Mercado Pago.
- Cupones aplicados.

### 9. Reputacion

Proposito: mostrar evaluaciones de procesos.

Elementos:

- Opiniones recibidas por empresas.
- Historial de asistencia a entrevistas.
- Puntaje de seriedad.
- Derecho a respuesta o reclamo.

## Panel empresa

### 1. Inicio empresa

Proposito: tablero diario de contratacion.

Elementos:

- Estado de verificacion.
- Numero de publicaciones activas.
- Procesos abiertos.
- Entrevistas proximas.
- Pagos pendientes.
- Acciones rapidas:
  - Crear vacante.
  - Buscar postulantes.
  - Ver entrevistas.
  - Revisar pagos.

### 2. Perfil empresa

Proposito: administrar datos y verificacion.

Subpantallas:

- Datos legales.
- Logo y marca.
- Contactos internos.
- Documentos de verificacion.
- Estado de revision admin.

Elementos:

- Formulario dividido en accordions.
- Upload de logo.
- Badge de estado: borrador, pendiente, verificada, rechazada, suspendida.

### 3. Publicaciones

Proposito: crear y administrar vacantes reales.

Elementos:

- Tabla de publicaciones.
- Filtros por estado:
  - borrador,
  - visible,
  - pausada,
  - cerrada.
- Boton "Crear puesto".
- Subpantalla crear/editar vacante:
  - Cargo.
  - Area.
  - Region/comuna.
  - Sueldo minimo/maximo obligatorio.
  - Modalidad.
  - Jornada.
  - Contrato.
  - Vacantes disponibles.
  - Requisitos.
  - Beneficios.
  - Boton mejorar descripcion con IA.

### 4. Buscar talento

Proposito: herramienta de busqueda densa tipo SaaS.

Elementos:

- Barra superior de busqueda.
- Filtros laterales:
  - cargo,
  - area,
  - region,
  - comuna,
  - renta,
  - modalidad,
  - experiencia,
  - tests completados,
  - disponibilidad,
  - OMIL/directo.
- Lista de postulantes anonimos.
- Vista de detalle al costado.
- Botones:
  - comparar,
  - guardar,
  - invitar.

### 5. Comparacion de candidatos

Proposito: ayudar a decidir, no solo listar perfiles.

Elementos:

- Tabla lado a lado de hasta 3 postulantes.
- Indicadores:
  - experiencia,
  - habilidades,
  - renta,
  - disponibilidad,
  - tests,
  - calce IA,
  - riesgos o brechas.
- Boton "Enviar invitacion".

### 6. Invitaciones y procesos

Proposito: controlar avances.

Elementos:

- Kanban o timeline:
  - invitado,
  - aceptado,
  - entrevista,
  - oferta,
  - contratado,
  - cerrado.
- Plantillas de invitacion.
- Opcion manual.
- Mensajeria interna.

### 7. Entrevistas

Proposito: programar entrevistas con integracion calendario.

Elementos:

- Agenda.
- Selector de fecha desde manana en adelante.
- Invitacion por email.
- Integracion Google Calendar.
- Sala de entrevista.
- Instructivo de reglas.
- Monitoreo IA.

### 8. Pagos y cierre

Proposito: pagar solo cuando hay resultado.

Elementos:

- Procesos que requieren pago.
- Boton pagar con Mercado Pago.
- Estado webhook.
- Contacto bloqueado/desbloqueado.
- Comprobantes.
- Historial.

### 9. Reputacion de postulantes

Proposito: evaluar seriedad posterior.

Elementos:

- Evaluar asistencia.
- Evaluar comunicacion.
- Evaluar cumplimiento.
- Historial de evaluaciones realizadas.

## Consola administrador

### 1. Dashboard operativo

Elementos:

- KPIs generales:
  - postulantes activos,
  - empresas verificadas,
  - publicaciones visibles,
  - invitaciones,
  - entrevistas,
  - pagos,
  - alertas.
- Graficos compactos.
- Alertas prioritarias.

### 2. Empresas

Elementos:

- Tabla con filtros avanzados.
- Estados:
  - pendiente,
  - verificada,
  - rechazada,
  - suspendida.
- Vista detalle.
- Acciones:
  - aprobar,
  - rechazar,
  - suspender,
  - solicitar documentos.

### 3. Postulantes

Elementos:

- Tabla de perfiles.
- Filtros por estado, origen, region, pago, expiracion.
- Vista detalle:
  - CV,
  - perfil IA,
  - datos privados,
  - tests,
  - pagos,
  - reputacion.

### 4. OMIL

Elementos:

- Cuentas OMIL 1 a 30.
- Perfiles cargados por cada OMIL.
- Fechas de expiracion.
- Emails enviados para suscripcion.
- Estado de conversion a postulante pagado.

### 5. Pagos

Elementos:

- Listado de pagos.
- Filtros por rol, fecha, estado, proveedor.
- Estado Mercado Pago.
- Webhook recibido.
- Reintento de sincronizacion.

### 6. Contabilidad

Elementos:

- Asientos contables.
- Ingresos por tipo.
- Comisiones.
- Cupones.
- Estados de factura.
- Exportacion CSV/XLSX.

### 7. Facturacion SII/OpenFactura

Elementos:

- Documento tributario.
- Folio.
- Estado.
- PDF/XML.
- Reintento.
- Auditoria.

### 8. Cupones

Elementos:

- Crear cupon.
- Listado activos/usados.
- Fecha expiracion.
- Limite de uso.
- Rol aplicable.

### 9. Entrevistas y monitoreo IA

Elementos:

- Entrevistas programadas.
- Aceptacion de reglas.
- Alertas por intercambio de contacto.
- Bloqueos por pago.
- Logs IA.

### 10. Seguridad y auditoria

Elementos:

- Alertas de seguridad.
- Logs de acciones.
- Intentos sospechosos.
- Cambios administrativos.
- Exportacion.

### 11. Reportes

Elementos:

- Reporte comercial.
- Reporte contable.
- Reporte tecnico.
- Reporte de mercado.
- Reporte de conversion.
- Descarga PDF/CSV.

## Reduccion de longitud de formularios

Todos los formularios largos deben cambiarse a:

- Pasos cortos.
- Accordions colapsables.
- Guardado automatico por seccion.
- Boton primario unico.
- Indicador de progreso.
- Validacion por bloque.
- Resumen final antes de publicar.

## Navegacion mobile

Postulante:

- Inicio.
- CV.
- Invitaciones.
- Entrevistas.
- Mas.

Empresa:

- Inicio.
- Publicar.
- Buscar.
- Procesos.
- Mas.

Admin:

- Dashboard.
- Empresas.
- Pagos.
- Alertas.
- Mas.

## Criterio visual premium

- Menos contenido por pantalla.
- Mas acciones por contexto.
- Tablas densas donde hay operacion diaria.
- Formularios progresivos donde hay carga de datos.
- Tarjetas solo para resumen, no para todo.
- Sidebar profesional con iconos.
- Tipografia compacta y jerarquia limpia.
- Estados vacios bien disenados.
- Mobile sin columnas comprimidas.
