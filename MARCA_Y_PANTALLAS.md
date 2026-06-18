# Marca y pantallas principales

> **Estado al 2026-06-17:** paleta implementada en produccion. Desplegado en https://perfil-primero.web.app

## Nombre

Perfil Primero

## Concepto

Plataforma laboral invertida: los trabajadores publican un perfil protegido y las empresas verificadas buscan talento disponible con condiciones transparentes desde el primer contacto.

## Frase principal

Que las empresas postulen por ti.

## Promesa al trabajador

Un perfil visible y anonimo para que empresas verificadas puedan invitarte con sueldo, modalidad y condiciones claras. Tu tiempo esta protegido.

## Promesa a la empresa

Encuentra talento disponible sin publicar avisos masivos. Ves lo que necesitas saber antes de contactar. Pagas solo cuando hay interes mutuo.

## Tono visual

- Profesional y claro.
- Confiable — no un portal de spam.
- Moderno sin parecer una red social ruidosa.
- Enfocado en datos utiles y decisiones rapidas.

---

## Paleta — implementada en globals.css

| Token | Valor | Uso |
|---|---|---|
| Fondo principal | `#f7f3ea` | Body, backgrounds |
| Superficie | `#fffaf1` | Cards, panels |
| Texto principal | `#17201b` | Headings, body text |
| Verde confianza | `#176b4d` | Primario, CTA positivo, marca |
| Verde oscuro | `#0f5039` | Hover de verde, enfasis |
| Azul accion | `#315f9b` | Accion secundaria, links |
| Coral alerta/acento | `#d96c4a` | Alertas, badges, acentos |
| Borde suave | `#d8d2c6` | Separadores, bordes de input |
| Borde fuerte | `#c0b9af` | Bordes con enfasis |
| Muted | `#7a7a72` | Texto secundario |
| Muted fuerte | `#4a5a52` | Texto terciario, labels |

La paleta evita el azul frio de portales tradicionales y comunica calidez profesional con base verde.

---

## Pantallas implementadas

### 1. Inicio

Ruta: `/`

Bloques actuales:
- Topbar con logo y navegacion (Soy trabajador / Soy empresa / Ingresar).
- Hero con tagline y acciones principales.
- Vista previa de perfiles anonimos.
- Buscador de talento para empresas.
- Explicacion del modelo invertido (storyboard).
- Categorias de rubros.
- Banner de momentum / estado de plataforma.

### 2. Panel trabajador (SPA)

Ruta: `/postulante`

Tabs dentro del panel:
- **Perfil**: onboarding con perfil publico, datos privados (separados visualmente con icono candado), carga y analisis de CV con IA, carta de presentacion.
- **Vista previa**: como ve la empresa el perfil antes del desbloqueo.
- **Invitaciones**: lista de invitaciones recibidas con estado. Chat en tiempo real via Firestore `onSnapshot`. Timeline del proceso.
- **Pagos**: historial de suscripciones. Retorno de Mercado Pago con estado claro.

Precio de suscripcion: `$999 CLP` por 30 dias de visibilidad (lanzamiento).
Codigo de perfil: formato `PP-XXXXXXXX` (8 caracteres del uid).

### 3. Panel empresa (SPA)

Ruta: `/empresa`

Tabs dentro del panel:
- **Buscar talento**: buscador con filtros server-side (region, sector, salario maximo). Comparador de hasta 3 candidatos (persistido en sessionStorage). Lista anonima de trabajadores.
- **Invitaciones**: formulario de invitacion con cargo, sueldo, modalidad, tipo de contrato, mensaje. Lista de procesos activos.
- **Proceso activo**: chat en tiempo real, timeline de estados, reglas de entrevista, desbloqueo de contacto, agendamiento, evaluacion.
- **Ofertas**: gestion de ofertas laborales publicadas.
- **Pagos**: historial y documentos de facturacion.

Precio de desbloqueo: `$999 CLP` por contacto (lanzamiento).

### 4. Consola admin

Ruta: `/consola-admin`

Funciones:
- Dashboard con metricas de mercado (reportes `marketAnalyticsReports`).
- Verificacion de empresas (pendientes / verificadas / rechazadas).
- Gestion de usuarios (crear, suspender, cambiar rol).
- Reportes contables y conciliacion de pagos.
- Aprobacion de transferencias manuales.
- Actualizacion de estado SII/OpenFactura.
- Generacion manual de reporte de mercado.

### 5. Panel OMIL

Ruta: `/omil`

Funcion: Oficinas Municipales de Intermediacion Laboral pueden crear perfiles de trabajadores gestionados en nombre de postulantes que no tienen acceso digital.

---

## Reglas de experiencia

Cada pantalla responde una pregunta clara:

- **Trabajador**: quien me vio, quien me invita, que datos estan ocultos, cuanto tiempo me queda visible.
- **Empresa**: que talento esta disponible, cuanto espera ganar, que debo transparentar, que proceso esta activo.
- **Admin**: que procesos estan sanos, cuales estan abandonados, donde hay riesgo de abuso, como va la contabilidad.
