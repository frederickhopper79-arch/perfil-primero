# Estrategia de Comunicación.docx

Ruta original: `C:\Users\fabia\OneDrive\Escritorio\Perfil Primero\Estrategia de Comunicación.docx`

Vamos a diseñar tanto la estrategia de comunicación (los correos automáticos) como la estructura visual de la pantalla del postulante. Ambas piezas reflejarán tu precio de lanzamiento de $999 CLP, reforzando la idea de que la IA está trabajando en segundo plano mientras el usuario disfruta de su tiempo libre.

PARTE 1: Correos Automáticos de Bienvenida y Activación

Para no incurrir en gastos extras, puedes enviar estos correos de forma 100% gratuita utilizando la extensión Trigger Email de Firebase o mediante servicios como SendGrid o Mailgun integrados en Node.js.

Correo 1: Confirmación de Pago y Activación del Agente IA

Este correo se dispara automáticamente en milisegundos cuando el Webhook de Mercado Pago confirma los $999 CLP.

Asunto: 🤖 ¡Tu Agente de IA está activo! Ya empezamos a buscar trabajo por ti

Contenido:

¡Hola [Nombre del Postulante]!Confirmamos con éxito tu pago promocional de $999 CLP. A partir de este segundo, tu perfil profesional ha quedado 100% visible para los reclutadores internos de las empresas en nuestra plataforma.⏳ Tu mes de visibilidad está corriendo: Estará activo desde hoy hasta el [Fecha de Expiración].¿Qué pasa ahora?
Absolutamente nada por tu parte. Nuestro sistema basado en la IA de Google ya comenzó a escanear el mercado de forma científica. No necesitas actualizar tu currículum, enviar correos ni revisar vacantes a diario. La plataforma buscará coincidencias exactas con tus habilidades y el sueldo mínimo de $[Sueldo Mínimo] que configuraste.Cuando una empresa acepte tus términos económicos y técnicos, te enviaremos una alerta directa a tu WhatsApp para que entres a la sala de conversación.¡Disfruta tu tiempo libre! Tu IA se encarga del resto.

Correo 2: Alerta de Match Económico y Técnico Exitoso

Este correo se envía de inmediato cuando el algoritmo de similitud vectorial encuentra una empresa compatible.

Asunto: 🔥 ¡Tenemos un MATCH! Una empresa aceptó tus condiciones laborales

Contenido:

¡Buenas noticias, [Nombre del Postulante]!Mientras realizabas tus actividades personales, nuestro Agente de IA ha encontrado una coincidencia perfecta ([Porcentaje]% de Match Semántico).Detalles de la oportunidad encontrada:

Cargo: [Nombre del Puesto]

Presupuesto de la Empresa: Cumple o supera tu mínimo requerido de $[Sueldo Mínimo] CLP.

Modalidad: [Remoto / Presencial / Híbrido]

La empresa ya revisó tu ficha técnica estructurada y ha solicitado abrir una sala de entrevista privada contigo dentro de nuestra plataforma.👉 [Haz clic aquí para ingresar al Chat Seguro y coordinar los detalles]Nota: Recuerda que tus datos de contacto personales están protegidos por nuestro sistema hasta que el proceso avance de mutuo acuerdo.

PARTE 2: Pantalla de Perfil del Postulante (Frontend HTML/CSS)

Esta es la interfaz de usuario (UI) minimalista del candidato. Está diseñada para transmitir tranquilidad. Muestra el estado del agente, los días restantes de su suscripción de $999 CLP y el historial de matches.

Guarda este código en un archivo llamado perfil_postulante.html para que tu programador tenga la base visual construida con Tailwind CSS:

html

<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Mi Panel Autónomo - IA Recruiting</title>

<script src="https://tailwindcss.com"></script>

</head>

<body class="bg-gray-50 font-sans antialiased text-gray-800">

<!-- Barra de Navegación -->

<nav class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">

<div class="flex items-center gap-2">

<span class="p-2 bg-blue-600 text-white rounded-lg font-bold text-xs">🤖 IA</span>

<span class="font-bold text-gray-900 text-sm md:text-base">AutónomaLaboral</span>

</div>

<div class="flex items-center gap-4">

<span class="text-xs md:text-sm font-medium text-gray-600">Hola, Carlos Silva</span>

<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">C</div>

</div>

</nav>

<!-- Contenedor Principal -->

<main class="max-w-4xl mx-auto p-4 md:p-8 space-y-6">

<!-- Tarjeta de Estado del Agente Autónomo -->

<section class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

<div class="space-y-1">

<div class="flex items-center gap-2">

<!-- Estado Activo gracias al pago de $999 -->

<span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>

<span class="text-sm font-bold text-green-700 uppercase tracking-wider">Agente IA: Buscando activamente</span>

</div>

<h1 class="text-xl md:text-2xl font-black text-gray-900">Tu tiempo está protegido</h1>

<p class="text-xs md:text-sm text-gray-500">La Inteligencia Artificial está postulando y filtrando el mercado por ti 24/7.</p>

</div>

<!-- Contador de Días de Suscripción Promocional -->

<div class="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center w-full md:w-auto">

<span class="block text-2xl font-black text-blue-700">28 días</span>

<span class="text-xs text-blue-600 font-medium">Suscripción Promocional Vente (\$999)</span>

</div>

</section>

<!-- Bloque de Dos Columnas: Configuración vs Ficha -->

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">

<!-- Configuración Blindada de Filtros -->

<section class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-1 space-y-4"

>

<h2 class="font-bold text-gray-900 border-b pb-2">⚙️ Mis Filtros Blindados</h2>

<div>

<label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Sueldo Mínimo Requerido</label>

<div class="text-lg font-mono font-black text-gray-900 bg-gray-50 p-2 rounded-lg border border-dashed text-center">

$1.500.000 CLP

</div>

<p class="text-[11px] text-gray-400 mt-1">Ninguna empresa con presupuesto inferior podrá ver tu perfil ni forzar negociaciones.</p>

</div>

<div>

<label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Preferencia de Entorno</label>

<span class="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">100% Remoto</span>

</div>

</section>

<!-- Historial de Matches y Salas de Conversación -->

<section class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2 space-y-4">

<h2 class="font-bold text-gray-900 border-b pb-2">🔥 Matches Generados de forma Pasiva</h2>

<div class="space-y-3">

<!-- Match 1 listo para conversar -->

<div class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center gap-4">

<div class="space-y-1">

<div class="flex items-center gap-2">

<span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">96% Compatibilidad</span>

<span class="text-xs text-gray-400">Hace 2 horas</span>

</div>

<h3 class="text-sm font-bold text-gray-900">Empresa del Sector Tecnológico</h3>

<p class="text-xs text-gray-500">Aceptó tu sueldo mínimo y solicita entrevista de validación.</p>

</div>

<button class="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition shadow-sm whitespace-nowrap">

Entrar al Chat

</button>

</div>

<!-- Match 2 (Ejemplo Histórico) -->

<div class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center gap-4 opacity-60">

<div class="space-y-1">

<div class="flex items-center gap-2">

<span class="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">89% Compatibilidad</span>

<span class="text-xs text-gray-400">Hace 3 días</span>

</div>

<h3 class="text-sm font-bold text-gray-900">Empresa de Servicios Financieros</h3>

<p class="text-xs text-gray-500">Proceso finalizado por mutuo acuerdo.</p>

</div>

<span class="text-xs text-gray-400 font-medium pr-2">Cerrado</span>

</div>

</div>

</section>

</div>

</main>

</body>

</html>

Usa el código con precaución.

Siguientes pasos para consolidar tu plataforma

Tienes toda la documentación, código e ingeniería de negocio completada:

El Lean Canvas para tus inversionistas.

Las tablas de Base de Datos (Firestore / SQL).

El Backend de Inteligencia de Google (Node.js/Python) para parsear PDFs, calcular el porcentaje de Match y auditar chats.

El módulo de cobro de $999 CLP con Mercado Pago.

Las pantallas del Reclutador e interfaces del Postulante.

El sistema de estudios de mercado automáticos y la estrategia de correos.
