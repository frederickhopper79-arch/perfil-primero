# Flujo de navegacion del usuario

## Objetivo

Definir las pantallas principales de la plataforma laboral invertida y el recorrido de cada tipo de usuario:

- Trabajador.
- Empresa.
- Administrador.

La experiencia debe reforzar la idea central: las empresas buscan talento disponible y deben entregar informacion clara antes de contactar.

## Entrada principal

### Landing publica

Ruta sugerida:

```text
/
```

Objetivo:

Explicar rapidamente el sistema invertido y enviar al usuario al flujo correcto.

Acciones principales:

- Soy trabajador.
- Soy empresa.

Mensaje central:

```text
Que las empresas postulen por ti.
```

Elementos clave:

- Promesa para trabajadores: crea tu perfil, define tu renta y recibe invitaciones transparentes.
- Promesa para empresas: encuentra talento disponible sin publicar avisos masivos.
- Enlace a iniciar sesion.

## Flujo del trabajador

### 1. Seleccion de tipo de cuenta

Ruta sugerida:

```text
/registro
```

El usuario elige:

- Crear perfil como trabajador.
- Crear cuenta de empresa.

### 2. Registro del trabajador

Ruta sugerida:

```text
/registro/trabajador
```

Datos minimos:

- Email.
- Contrasena o ingreso con Google.
- Aceptacion de terminos.

Despues del registro:

Enviar al onboarding del perfil.

### 3. Onboarding del perfil publico

Ruta sugerida:

```text
/trabajador/onboarding/perfil-publico
```

Objetivo:

Crear la version visible del trabajador sin datos sensibles.

Campos:

- Titulo profesional o laboral.
- Resumen breve.
- Rubros.
- Habilidades.
- Nivel de experiencia.
- Anos de experiencia.
- Region o ciudad.
- Modalidad preferida.
- Renta esperada.
- Disponibilidad.

Regla:

En esta pantalla no se pide telefono ni correo visible para empresas.

### 4. Datos privados

Ruta sugerida:

```text
/trabajador/onboarding/datos-privados
```

Objetivo:

Guardar datos que solo se revelaran con autorizacion.

Campos:

- Nombre completo.
- Telefono.
- Email de contacto.
- CV en PDF.
- Foto opcional.
- Portafolio opcional.

Mensaje de confianza:

```text
Estos datos no seran visibles para empresas hasta que aceptes una invitacion autorizada.
```

### 5. Vista previa anonima

Ruta sugerida:

```text
/trabajador/onboarding/vista-previa
```

Objetivo:

Mostrar exactamente como vera una empresa el perfil antes del desbloqueo.

Debe mostrar:

- Titulo.
- Resumen.
- Habilidades.
- Experiencia.
- Rango de renta.
- Modalidad.
- Disponibilidad.

Debe ocultar:

- Nombre legal.
- Telefono.
- Email.
- CV descargable.

Acciones:

- Editar perfil.
- Continuar al pago.

### 6. Pago de suscripcion

Ruta sugerida:

```text
/trabajador/pago
```

Objetivo:

Activar visibilidad por 30 dias.

Producto:

```text
Perfil visible por 30 dias - USD 10
```

Despues de pago exitoso:

- Activar `subscriptionStatus`.
- Establecer fecha de expiracion.
- Publicar perfil.
- Enviar al panel del trabajador.

### 7. Panel del trabajador

Ruta sugerida:

```text
/trabajador/panel
```

Objetivo:

Mostrar el estado real del perfil y oportunidades recibidas.

Secciones:

- Estado del perfil.
- Dias restantes de visibilidad.
- Visitas al perfil.
- Invitaciones recibidas.
- Procesos activos.
- Recomendaciones para mejorar perfil.

Acciones:

- Pausar perfil.
- Editar perfil.
- Renovar suscripcion.
- Ver invitaciones.

### 8. Invitaciones recibidas

Ruta sugerida:

```text
/trabajador/invitaciones
```

Cada invitacion debe mostrar:

- Empresa.
- Cargo u oportunidad.
- Rango salarial.
- Modalidad.
- Ubicacion.
- Tipo de contrato.
- Mensaje.
- Fecha de vencimiento.

Acciones:

- Aceptar invitacion.
- Rechazar.
- Pedir mas informacion.

Regla:

El trabajador nunca debe aceptar una invitacion sin ver sueldo, modalidad y empresa.

### 9. Invitacion aceptada

Ruta sugerida:

```text
/trabajador/invitaciones/{invitationId}
```

Cuando acepta:

- La empresa puede pasar al pago/desbloqueo.
- El trabajador ve el estado del proceso.
- El sistema registra auditoria.

Estados visibles:

- Invitacion aceptada.
- Esperando desbloqueo de empresa.
- Contacto desbloqueado.
- En entrevista.
- Oferta enviada.
- Cerrado.

## Flujo de la empresa

### 1. Registro de empresa

Ruta sugerida:

```text
/registro/empresa
```

Datos:

- Email corporativo.
- Contrasena o ingreso con Google.
- Nombre de empresa.
- Sitio web.
- Rubro.

Despues del registro:

Enviar a verificacion.

### 2. Verificacion de empresa

Ruta sugerida:

```text
/empresa/verificacion
```

Objetivo:

Evitar empresas falsas o contactos abusivos.

Campos:

- Razon social.
- Identificador tributario.
- Sitio web.
- Persona responsable.
- Cargo del responsable.
- Documento o comprobante opcional.

Estado:

- Pendiente.
- Verificada.
- Rechazada.

Regla:

Una empresa no verificada no puede enviar invitaciones.

### 3. Panel de empresa

Ruta sugerida:

```text
/empresa/panel
```

Secciones:

- Busqueda de trabajadores.
- Invitaciones enviadas.
- Procesos activos.
- Contactos desbloqueados.
- Pagos.
- Reputacion de respuesta.

### 4. Buscador de talento

Ruta sugerida:

```text
/empresa/buscar
```

Filtros:

- Cargo o palabra clave.
- Habilidades.
- Rubro.
- Region.
- Modalidad.
- Renta esperada.
- Disponibilidad.
- Nivel de experiencia.

Resultados:

Tarjetas anonimas de trabajadores.

Cada tarjeta muestra:

- Titulo.
- Habilidades principales.
- Experiencia.
- Renta esperada.
- Modalidad.
- Disponibilidad.

No muestra:

- Nombre legal.
- Email.
- Telefono.
- CV descargable.

### 5. Perfil anonimo del trabajador

Ruta sugerida:

```text
/empresa/talento/{workerId}
```

Objetivo:

Permitir evaluar compatibilidad sin revelar identidad completa.

Acciones:

- Guardar perfil.
- Enviar invitacion.

### 6. Crear invitacion laboral

Ruta sugerida:

```text
/empresa/invitaciones/nueva/{workerId}
```

Campos obligatorios:

- Titulo de oportunidad.
- Resumen.
- Rango salarial minimo.
- Rango salarial maximo.
- Moneda.
- Modalidad.
- Ubicacion.
- Tipo de contrato.
- Mensaje.
- Fecha limite de respuesta.

Reglas:

- No se permite sueldo oculto.
- No se permite mensaje vacio.
- No se permite enviar si la empresa no esta verificada.

### 7. Invitaciones enviadas

Ruta sugerida:

```text
/empresa/invitaciones
```

Estados:

- Enviada.
- Vista.
- Aceptada.
- Rechazada.
- Mas informacion solicitada.
- Expirada.

Cuando una invitacion es aceptada:

- Se habilita el pago de desbloqueo.

### 8. Pago de desbloqueo

Ruta sugerida:

```text
/empresa/invitaciones/{invitationId}/desbloquear
```

Producto:

```text
Desbloqueo de contacto - USD 50
```

Despues del pago:

- Se crea `contactUnlocks`.
- Se muestra la informacion autorizada del trabajador.
- Se registra auditoria.
- El proceso pasa a `unlocked`.

### 9. Proceso activo

Ruta sugerida:

```text
/empresa/procesos/{invitationId}
```

Estados:

- Contacto desbloqueado.
- Contactado.
- Entrevista agendada.
- Oferta enviada.
- Contratado.
- Cerrado sin contratacion.

Regla:

Todo proceso debe cerrarse. Si la empresa abandona, afecta su reputacion.

## Flujo administrador

### Panel admin

Ruta sugerida:

```text
/admin
```

Funciones:

- Ver trabajadores.
- Ver empresas.
- Revisar empresas pendientes.
- Revisar reportes.
- Ver pagos.
- Ver auditoria.
- Suspender usuarios.
- Cerrar procesos abusivos.

## Mapa resumido

```text
/
  /registro
    /registro/trabajador
    /registro/empresa

  /trabajador
    /trabajador/onboarding/perfil-publico
    /trabajador/onboarding/datos-privados
    /trabajador/onboarding/vista-previa
    /trabajador/pago
    /trabajador/panel
    /trabajador/invitaciones
    /trabajador/invitaciones/{invitationId}

  /empresa
    /empresa/verificacion
    /empresa/panel
    /empresa/buscar
    /empresa/talento/{workerId}
    /empresa/invitaciones
    /empresa/invitaciones/nueva/{workerId}
    /empresa/invitaciones/{invitationId}/desbloquear
    /empresa/procesos/{invitationId}

  /admin
```

## Prioridad para el MVP

Primero construir:

1. Landing con seleccion trabajador/empresa.
2. Registro e inicio de sesion.
3. Onboarding del trabajador.
4. Pago simulado o real de USD 10.
5. Panel del trabajador.
6. Registro de empresa.
7. Buscador de perfiles anonimos.
8. Envio de invitacion.
9. Aceptacion de invitacion.
10. Desbloqueo de contacto por USD 50.

## Principio de experiencia

Cada pantalla debe responder una pregunta clara:

- Trabajador: que ven de mi, quien me busca y que condiciones ofrecen.
- Empresa: que talento esta disponible, cuanto espera ganar y como puedo contactarlo correctamente.
- Plataforma: que procesos estan sanos, cuales estan abandonados y donde hay riesgo de abuso.

