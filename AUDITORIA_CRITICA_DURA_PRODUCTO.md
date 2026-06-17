# Auditoria critica dura - Perfil Primero

## Veredicto

La idea base es fuerte, pero la ejecucion todavia no puede venderse como "producto terminado" en sentido estricto. Antes era una landing con formularios; ahora ya empieza a parecer plataforma. Aun asi, si se lanza sin control operacional, puede caer en el mismo pecado que critica: prometer orden y terminar generando ansiedad.

## Lo que estaba mal

- La pagina se veia demasiado liviana para pedir dinero. Cobrar al trabajador exige confianza inmediata; si la UI parece maqueta, el usuario asume riesgo.
- El trabajador tenia que escribir todo manualmente. Eso mata conversion. Si el sistema no aprovecha el CV, no hay ventaja real frente a un portal tradicional.
- La empresa no tenia asistencia real para seleccionar. Ver perfiles anonimos sin ranking ni explicacion es solo otra lista.
- No existian datos objetivos del candidato. Sin test, CV analizado ni puntajes, el matching se sostiene en texto autodeclarado.
- Faltaba profundidad de portal: regiones, areas, niveles y puestos. Sin eso, la web parecia chica aunque la metodologia fuera buena.
- El proceso de empresas necesitaba logo y verificacion porque "empresa verificada" sin evidencia visual es frase vacia.

## Lo que se corrigio

- CV subido por trabajador y guardado en Storage.
- Analisis de CV con Google IA para extraer titular, resumen, habilidades, areas, experiencia y renta sugerida.
- Region y comuna por desplegable para trabajador y empresa.
- Area y nivel laboral estructurados.
- Tests de ingles, espanol y personalidad laboral.
- Matching asistido por Google IA para empresas verificadas.
- Logo de empresa en inscripcion.
- Banner de empresas verificadas.
- Directorio por provincia, area, nivel laboral y puestos buscados.
- Tipografia suavizada: menos peso visual, menos grito, mas producto.
- Script seed para crear admin, 5 trabajadores y 2 empresas cuando haya credenciales de Firebase Admin.

## Critica dura pendiente

- Los tests actuales son una primera version, no una evaluacion psicometrica seria. Sirven como filtro inicial, no como prueba cientifica.
- El matching IA todavia depende de la calidad del texto de vacante. Si la empresa escribe basura, la IA analizara basura.
- Falta panel de detalle de candidato. La empresa necesita comparar candidatos lado a lado.
- Falta trazabilidad visual de proceso: invitado, aceptado, entrevista, oferta, contratado.
- Falta mensajeria interna. Sin conversacion dentro de la plataforma, el valor se escapa a WhatsApp/correo.
- Falta comprobante fuerte de pago y estado post-Mercado Pago en UI.
- Falta politica legal/privacidad/terminos. Para CVs y datos laborales esto no es decoracion; es obligatorio.
- Falta una pagina de precios clara antes de cobrar.

## Leccion tomada del estilo Computrabajo/Laborum, sin copiarlos

Lo valioso no es la metodologia tradicional, sino la sensacion de volumen: regiones, areas, niveles, puestos, empresas, busqueda. El usuario debe sentir que esta entrando a un mercado grande, no a una presentacion bonita. Por eso se agrego el directorio y el banner de empresas.

## Proxima correccion realmente importante

Construir el flujo de detalle/comparacion de candidatos para empresas. Sin eso, el sistema encuentra perfiles pero no ayuda suficientemente a decidir.
