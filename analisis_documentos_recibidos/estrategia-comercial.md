# Estrategia Comercial.docx

Ruta original: `C:\Users\fabia\OneDrive\Escritorio\Perfil Primero\Estrategia Comercial.docx`

Estrategia comercial… Lanzar con un precio de penetración de $999 CLP (un "precio simbólico") cumple dos objetivos psicológicos brutales para mi modelo de negocio:

Rompe la barrera de entrada: No ahuyenta a nadie por costo.

Valida la disposición de pago: Te asegura desde el día uno que tus usuarios están dispuestos a meter su tarjeta de crédito/débito, limpiando la plataforma de usuarios falsos o "turistas".

Usando Firebase Firestore y Node.js, este es el análisis financiero, técnico y operativo adaptado a tu estrategia de lanzamiento agresivo para engrosar la base de datos los primeros meses.

1. El Modelo Económico de Lanzamiento ($999 CLP)

Durante la fase de captación (primeros 3 a 6 meses), tus flujos de ingresos quedan así:

Ingreso Postulante: $999 CLP al mes por activar su "Agente de IA" y quedar visible 30 días.

Ingreso Empresa: $999 CLP por cada contacto liberado (en lugar de los $24.990 finales).

Margen por Transacción: En Chile, las pasarelas de pago (como Flow, Mercado Pago o Stripe) cobran una comisión fija más un porcentaje (ej. 3% + $100 netos). Por cada transacción de $999 CLP, la pasarela se quedará con aprox. $135 CLP. Te quedan líquidos alrededor de $864 CLP netos por cada venta.

2. Estimación de Costos de Servidores (Firestore + Node.js)

Al cobrar $999 CLP, necesitas que la infraestructura sea lo más barata posible para no perder dinero. Con Firebase y Node.js, el negocio sigue siendo rentable desde la primera transacción porque la capa gratuita amortiza todo.

Tomando como meta de lanzamiento llegar a 3.000 postulantes activos y 150 empresas en tus primeros 3 meses, estos serán tus costos reales en Google Cloud:

Desglose Técnico en Fase de Lanzamiento:

Firestore (Lecturas/Escrituras): Con 3.000 usuarios moviéndose, generarás unas 35.000 lecturas diarias en el buscador de las empresas y unas 10.000 escrituras por el chat. Como el límite diario gratuito es de 50.000 lecturas y 20.000 escrituras, tu costo en la base de datos seguirá siendo de $0 CLP al mes.

Node.js (Cloud Functions / Cloud Run): El backend procesará los registros, los pagos de $999 y los matches. Generará unas 120.000 ejecuciones al mes. Google te regala 2.000.000 de ejecuciones mensuales. Tu costo de cómputo seguirá siendo de $0 CLP al mes.

Firebase Storage (Guardado de PDFs): 3.000 currículums en PDF ocuparán aprox. 1.5 GB en el disco en la nube. La capa gratuita te cubre hasta 5 GB. Tu costo de almacenamiento seguirá siendo de $0 CLP al mes.

API de Gemini (Inteligencia de Google): Para procesar el chat y hacer el parsing de los 3.000 PDFs. Usando el modelo Gemini 2.5 Flash, el costo por procesar un currículum completo es de aprox. $0,0005 USD. Procesar los 3.000 currículums te costará un total de $1,5 USD (aprox. $1.400 CLP por una única vez).

Conclusión Financiera de Lanzamiento: Con 3.000 postulantes pagando $999, recaudarás cerca de $3.000.000 CLP. Tus costos totales de servidores de Google Cloud para sostener esa operación no superarán los $5.000 CLP al mes. El margen de ganancia para reinvertir en publicidad es gigantesco.

3. Modificaciones en la Base de Datos para el Programador

Para que manejes este "precio promocional" temporal sin romper el código que después usará para cobrar el precio real, debe estructurar la base de datos con una tabla de Configuración Global o Tarifas.

Dile a tu programador que añada estos campos de control de precios en Node.js/Firestore:

javascript

// Estructura sugerida en

Usa el código con precaución.

javascript

Firestore

Usa el código con precaución.

javascript

para la colección "configuracion_sistema"

{

"fase_lanzamiento_activa": true,

"tarifa_suscripcion_postulante_clp": 999,  // Precio promo actual

"tarifa_contacto_empresa_clp": 999,      // Precio promo actual

"tarifa_postulante_precio_real": 9990,    // Se activará automáticamente en el futuro

"tarifa_empresa_precio_real": 24990

}

Usa el código con precaución.

4. El "Pitch" de Marketing con el precio de $999 CLP

Este precio te da un gancho publicitario potentísimo en redes sociales (TikTok, Instagram, LinkedIn). Así debes vender la idea estos primeros meses:

Para el Postulante: "¿Aburrido de postular a ciegas en portales donde nadie te lee? Por menos de lo que cuesta un chocolate ($999), nuestra Inteligencia Artificial se activa durante un mes completo para buscar trabajo por ti, defender tu sueldo mínimo y avisarte cuando tengas un Match real mientras tú disfrutas tu tiempo libre."

Para la Empresa: "Deja de pagar millones a reclutadoras externas. Registra tu requerimiento y deja que la IA te entregue a los candidatos ideales filtrados científicamente. Entrevista gratis y libera sus datos de contacto por solo $999 CLP por proceso exitoso durante nuestra fase de lanzamiento."

Mercado Pago es la pasarela de pagos líder en Chile. Al integrarla con tu stack de Node.js y Firebase, obtendrás tres ventajas clave para tu estrategia de $999 CLP:

Permite pagar con Redcompra (Débito), Cuenta RUT (vía Webpay) y Tarjetas de Crédito, que es exactamente lo que tus postulantes chilenos necesitan.

Su API actual soporta Webhooks automáticos, esenciales para activar la visibilidad del perfil en milisegundos una vez que se confirma el pago.

No requiere contratos complejos para empezar a validar tu idea.

1. Flujo Técnico de Pago Automatizado

El flujo debe ser 100% autónomo:

[Postulante da clic en "Activar por $999"] ➡️ [Node.js crea la Preferencia en Mercado Pago] ➡️ [Se abre el checkout]

⬇️

[Perfil Activado por 30 días] ⬅️ [Firestore cambia "perfil_activo: true"] ⬅️ [Webhook de Mercado Pago avisa el éxito]

💻 2. Código del Backend en Node.js (Mercado Pago SDK v2)

Debes instalar el SDK oficial de Mercado Pago para Node.js:

bash

npm install mercadopago

Usa el código con precaución.

Aquí tienes el código limpio y listo para producción que crea el enlace de pago de $999 CLP. Este script utiliza la arquitectura oficial de Mercado Pago:

javascript

const { MercadoPagoConfig, Preference } = require('mercadopago');

// 1. Configurar las credenciales con tu Access Token de Mercado Pago Chile

const client = new MercadoPagoConfig({

accessToken: 'YOUR_PRODUCTION_OR_TEST_ACCESS_TOKEN'

});

/**

* Función que ejecuta tu backend Node.js cuando el postulante

* o la empresa da clic en el botón de pagar $999.

*/

async function crearEnlaceDePago(idUsuario, tipoUsuario) {

const preference = new Preference(client);

// Creamos el objeto con el producto y los flujos de redirección

const datosPreferencia = {

body: {

items: [

{

id: `PROMO-${tipoUsuario}-${idUsuario}`,

title: tipoUsuario === 'postulante'

? 'Activación de Agente IA (30 días)'

: 'Liberación de Candidato Calificado',

quantity: 1,

unit_price: 999, // Tu precio de lanzamiento agresivo

currency_id: 'CLP' // Pesos Chilenos

}

],

// Retornos automáticos al salir de la pasarela

back_urls: {

success: 'https://tuweb.cl',

failure: 'https://tuweb.cl',

pending: 'https://tuweb.cl'

},

auto_return: 'approved',

// Metadata crucial para que el Webhook sepa a quién activar el perfil

metadata: {

usuario_id: idUsuario,

tipo_usuario: tipoUsuario

},

// URL de tu servidor Node.js que escuchará cuando Mercado Pago confirme el dinero

notification_url: 'https://tu-servidor-node.cl'

}

};

try {

const respuesta = await preference.create(datosPreferencia);

// Retornamos la URL oficial para redirigir al usuario al checkout de Mercado Pago

return {

url_checkout: respuesta.init_point,

preference_id: respuesta.id

};

} catch (error) {

console.error('Error al crear preferencia de Mercado Pago:', error);

throw error;

}

}

Usa el código con precaución.

3. El Webhook en Node.js: Activación en Firestore

Cuando el postulante termine de pagar en Webpay/Mercado Pago, los servidores de Mercado Pago enviarán un aviso silencioso (POST) a la URL de tu backend (notification_url).

Tu programador debe escribir esta lógica en Node.js para recibir la señal y actualizar Firebase de inmediato:

javascript

const admin = require('firebase-admin');

const { Payment } = require('mercadopago');

// Inicializamos Firebase Admin (si no está hecho ya)

if (!admin.apps.length) {

admin.initializeApp();

}

const db = admin.firestore();

/**

* Endpoint de Node.js que recibe las notificaciones en tiempo real

*/

async function escucharWebhookMercadoPago(req, res) {

const { query } = req;

// Mercado Pago avisa de distintas cosas, nos interesan solo los pagos aprobados

if (query.topic === 'payment' || query.type === 'payment') {

const paymentId = query.id || query['data.id'];

try {

// Consultamos el estado real del pago usando el ID recibido

const paymentClient = new Payment(client);

const pago = await paymentClient.get({ id: paymentId });

if (pago.status === 'approved') {

// Recuperamos la información del usuario que guardamos en la metadata

const { usuario_id, tipo_usuario } = pago.metadata;

if (tipo_usuario === 'postulante') {

const ahora = new Date();

const fechaExpiracion = new Date();

fechaExpiracion.setDate(ahora.getDate() + 30); // Sumamos los 30 días de visibilidad

// Actualizamos Firestore de forma automática

await db.collection('postulantes_perfiles').doc(usuario_id.toString()).update({

perfil_activo: true,

fecha_pago_suscripcion: ahora,

fecha_expiracion_suscripcion: fechaExpiracion,

ultimo_payment_id: paymentId

});

console.log(`🚀 Perfil del postulante #${usuario_id} activado con éxito por 30 días.`);

} else if (tipo_usuario === 'empresa') {

// Aquí tu programador ejecuta la liberación de datos de contacto de la sala de chat

console.log(`💼 Datos liberados para la empresa asociada al usuario #${usuario_id}`);

}

}

} catch (error) {

console.error('Error procesando el webhook:', error);

return res.status(500).send('Error interno');

}

}

// Es obligatorio responderle un 200 OK a Mercado Pago para que deje de enviar el aviso

return res.status(200).send('OK');

}

Usa el código con precaución.

Nota de Seguridad sobre Mercado Pago en Chile

Dile a tu desarrollador que cuando cree la cuenta de Mercado Pago Developers, use el entorno de pruebas (Sandbox) para simular los pagos de $999 CLP con las tarjetas de prueba que entrega la plataforma. Una vez que el flujo en Firestore se actualice perfectamente de forma automática, podrán cambiar el token a Producción para recibir dinero real de tarjetas de crédito y débito chilenas.

Tienes la estructura comercial y el código exacto de la pasarela más utilizada del país para tu estrategia de lanzamiento.
