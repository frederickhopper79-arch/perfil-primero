# Puesta en marcha Firebase y Mercado Pago

## Estado local

El proyecto ya tiene:

- Next.js instalado.
- Firebase SDK instalado.
- Firebase CLI instalada localmente.
- Cloud Functions compilando.
- Firestore rules.
- Storage rules.
- Checkout Mercado Pago preparado en Functions.
- Webhook Mercado Pago preparado.

## Comandos locales

Desde la raiz del proyecto:

```powershell
npm.cmd run dev
npm.cmd run build
npx.cmd firebase --version
```

Desde `functions`:

```powershell
npm.cmd run build
```

## Crear proyecto Firebase real

Esta parte requiere iniciar sesion con la cuenta Google propietaria del proyecto.

```powershell
npx.cmd firebase login
npx.cmd firebase projects:create perfil-primero
npx.cmd firebase use perfil-primero
```

Si el id `perfil-primero` no esta disponible, elegir otro id y actualizar `.firebaserc`.

## Activar servicios en Firebase Console

En la consola web de Firebase:

1. Authentication.
2. Sign-in method.
3. Activar Email/Password.
4. Activar Google.
5. Crear Firestore Database en modo production.
6. Activar Storage.
7. Activar Functions.
8. Asociar facturacion si Google lo solicita para Functions/Stripe.

## Variables web

Copiar `.env.example` a `.env.local` y completar:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Variables Functions

Copiar `functions/.env.example` a `functions/.env` y completar:

```text
APP_URL=http://localhost:3000
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_WORKER_PRICE_ID=
```

En produccion, `APP_URL` debe ser el dominio real.

## Mercado Pago

1. Crear cuenta Mercado Pago.
2. Entrar a credenciales de desarrollador.
3. Copiar `MERCADOPAGO_ACCESS_TOKEN`.
4. Configurar el webhook:

```text
https://us-central1-perfil-primero.cloudfunctions.net/mercadoPagoWebhook
```

5. Escuchar eventos de pago.

Los valores actuales son:

- Trabajador: $4.999 CLP por 30 dias de perfil visible.
- Empresa: $30.000 CLP una vez cerrado el trato con el trabajador.

## Stripe fallback

1. Crear cuenta Stripe.
2. Usar modo test.
3. Crear producto: `Perfil visible trabajador`.
4. Crear precio recurrente mensual: USD 10.
5. Copiar el `price_...` a `STRIPE_WORKER_PRICE_ID`.
6. Copiar secret key test a `STRIPE_SECRET_KEY`.
7. Crear webhook para `stripeWebhook`.
8. Escuchar evento `checkout.session.completed`.
9. Copiar webhook secret a `STRIPE_WEBHOOK_SECRET`.

El cobro empresa de USD 50 se crea dinamicamente desde Cloud Functions.

## Despliegue

Cuando las variables esten listas:

```powershell
npx.cmd firebase deploy --only firestore:rules,storage
npx.cmd firebase deploy --only functions
npx.cmd firebase deploy --only hosting
```

## Pruebas minimas antes de publicar

- Crear trabajador.
- Guardar perfil publico y privado.
- Confirmar que la empresa solo ve perfil anonimo.
- Crear empresa.
- Marcar empresa como verificada en Firestore.
- Enviar invitacion con sueldo.
- Aceptar invitacion como trabajador.
- Pagar desbloqueo empresa en Stripe test.
- Confirmar que se crea `contactUnlocks`.
- Confirmar que no se exponen datos privados sin desbloqueo.
