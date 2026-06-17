# Perfil Primero

Plataforma laboral invertida donde postulantes publican perfiles protegidos y empresas verificadas buscan talento con sueldo y condiciones claras.

## Stack

- Next.js.
- React.
- TypeScript.
- Firebase Hosting.
- Firebase Auth.
- Cloud Firestore.
- Cloud Functions.
- Firebase Storage.

## Modelo comercial de prueba

- Postulante: $999 CLP por 30 dias de perfil visible durante etapa de pruebas.
- Empresa: $999 CLP como pago de cierre/desbloqueo durante etapa de pruebas.
- Precio objetivo posterior: se ajustara cuando el producto este validado operacionalmente.

## Primeras rutas

- `/`: inicio operativo.
- `/trabajador` y `/postulante`: onboarding inicial del postulante.
- `/empresa`: buscador inicial de empresas.
- `/consola-admin`: consola interna separada para administracion, reportes, auditoria y contabilidad.

## URL publica

- https://perfil-primero.web.app

## Configuracion

1. Copiar `.env.example` a `.env.local`.
2. Completar las variables del proyecto Firebase.
3. Instalar dependencias con `npm install`.
4. Ejecutar `npm run dev`.

## Puesta en marcha Firebase

1. Crear un proyecto en Firebase Console.
2. Activar Authentication con Email/Password y Google.
3. Crear Cloud Firestore en modo produccion.
4. Activar Firebase Storage.
5. Activar Functions y asociar facturacion si Google lo solicita.
6. Reemplazar `perfil-primero-dev` en `.firebaserc` por el id real del proyecto.
7. Copiar las credenciales web de Firebase a `.env.local`.

## Puesta en marcha Mercado Pago

1. Crear una cuenta Mercado Pago.
2. Obtener `MERCADOPAGO_ACCESS_TOKEN` desde credenciales de desarrollador.
3. Configurar `MERCADOPAGO_ACCESS_TOKEN` en `functions/.env`.
4. Usar como webhook:

```text
https://us-central1-perfil-primero.cloudfunctions.net/mercadoPagoWebhook
```

El cobro de postulante en pruebas es $999 CLP. El cobro de empresa en pruebas es $999 CLP y corresponde a pago por cierre/desbloqueo cuando el proceso ya avanzo.

## Firebase

Archivos incluidos:

- `firebase.json`.
- `.firebaserc`.
- `firestore.rules`.
- `storage.rules`.
- `firestore.indexes.json`.
- `functions/src/index.ts`.

Antes de produccion, probar reglas y funciones con Firebase Emulator Suite.

## Estado actual

La base tecnica incluye:

- Autenticacion por email/Google conectada a Firebase real.
- Guardado de perfil publico y privado del postulante.
- Guardado de perfil de empresa.
- Busqueda de perfiles anonimos.
- Creacion de invitaciones desde Cloud Functions.
- Aceptacion de invitaciones.
- Checkout Mercado Pago para $999 postulante.
- Checkout Mercado Pago para $999 empresa.
- Webhook Mercado Pago para activar suscripcion y registrar pago por exito.
- Gmail/Google como metodo de ingreso.
- IA de Google Gemini para analizar CV, generar CV con formato Perfil Primero y recomendar mejoras al perfil del postulante.
- Consola admin con empresas, postulantes, ofertas, pagos, contabilidad, cupones, entrevistas, reputacion, seguridad, auditoria, usuarios y reportes.
- Creacion de usuarios desde consola admin mediante cuenta Firebase con rol `admin`.
- Hosting publico desplegado.
- Firestore, Storage y Functions desplegados.
- Pruebas smoke publicas completadas.

Pendientes externos:

- Probar pagos reales de Mercado Pago con cuenta productiva y webhooks en ambiente definitivo.
- Crear una API key de Gemini y completar `GEMINI_API_KEY` si no esta configurada.
- Integrar proveedor real SII/OpenFactura para DTE, folio, PDF y XML.
- Integrar OAuth real Google Calendar/Gmail para escribir eventos y enviar correos en cuentas de usuarios.
- Ejecutar seed demo/cupones con credenciales Admin SDK o desde entorno con Application Default Credentials.
