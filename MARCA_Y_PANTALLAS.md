# Marca y pantallas principales

## Nombre provisional

Perfil Primero

## Idea de marca

Perfil Primero es una plataforma laboral invertida: los trabajadores publican un perfil protegido y las empresas verificadas buscan talento disponible con condiciones transparentes.

## Frase principal

Que las empresas postulen por ti.

## Promesa

Un perfil visible, anonimo y medible para que empresas verificadas puedan invitarte con sueldo, modalidad y condiciones claras.

## Tono visual

- Profesional.
- Claro.
- Confiable.
- Moderno sin parecer una red social ruidosa.
- Enfocado en datos utiles y decisiones rapidas.

## Paleta inicial

- Fondo principal: #f7f3ea.
- Texto principal: #17201b.
- Verde confianza: #176b4d.
- Azul accion: #315f9b.
- Coral alerta/acento: #d96c4a.
- Borde suave: #d8d2c6.
- Superficie: #fffaf1.

La paleta evita parecer una bolsa tradicional fria y tambien evita depender de un solo color.

## Pantallas del MVP

### 1. Inicio

Ruta:

```text
/
```

Objetivo:

Separar rapidamente a trabajador y empresa.

Bloques:

- Barra superior con nombre y accesos.
- Mensaje principal.
- Acciones: Soy trabajador / Soy empresa.
- Resumen de como funciona.
- Vista previa de perfiles anonimos.
- Reglas de transparencia.

### 2. Onboarding trabajador

Ruta:

```text
/trabajador
```

Objetivo:

Crear un perfil publico y datos privados en pasos separados.

Bloques:

- Estado de avance.
- Perfil publico.
- Datos privados.
- Vista previa anonima.
- Activacion por USD 10.

### 3. Panel trabajador

Ruta:

```text
/trabajador/panel
```

Objetivo:

Mostrar valor al usuario que paga.

Bloques:

- Dias visibles restantes.
- Visitas al perfil.
- Invitaciones.
- Estados de procesos.
- Recomendaciones.

### 4. Buscador empresa

Ruta:

```text
/empresa
```

Objetivo:

Permitir buscar talento anonimo por habilidades, renta, modalidad y disponibilidad.

Bloques:

- Filtros.
- Lista de perfiles anonimos.
- Boton enviar invitacion.
- Recordatorio de sueldo obligatorio.

### 5. Invitacion

Ruta:

```text
/empresa/invitacion
```

Objetivo:

Crear una invitacion laboral valida.

Campos obligatorios:

- Cargo.
- Rango salarial.
- Modalidad.
- Tipo de contrato.
- Ubicacion.
- Mensaje.

### 6. Desbloqueo

Ruta:

```text
/empresa/desbloqueo
```

Objetivo:

Cobrar USD 50 a la empresa cuando el trabajador acepta y liberar datos de contacto.

## Regla de experiencia

Cada pantalla debe mostrar el beneficio y el control:

- Trabajador: quien me vio, quien me invito, que datos estan ocultos.
- Empresa: que perfiles cumplen, que debo transparentar, que proceso esta abierto.
