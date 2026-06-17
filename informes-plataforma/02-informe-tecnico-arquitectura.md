# Informe Técnico y Arquitectura

## Stack

- Frontend: Next.js exportado como sitio estático.
- Hosting: Firebase Hosting.
- Backend: Firebase Cloud Functions v2.
- Base de datos: Cloud Firestore.
- Archivos: Firebase Storage / Google Cloud Storage.
- Autenticación: Firebase Auth.
- Pagos: Mercado Pago.
- IA: Gemini API.

## Flujo de build y despliegue

El build genera carpeta `out`, que es la carpeta publicada por Firebase Hosting según `firebase.json`.

Comandos base:

```powershell
npm install
npm run build
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Observación técnica dura

La arquitectura serverless es correcta para costo bajo y velocidad inicial. El riesgo no está en la elección del stack; está en disciplina operacional: pruebas e2e, monitoreo de webhooks, paginación real, legal y manejo de errores de proveedores.
