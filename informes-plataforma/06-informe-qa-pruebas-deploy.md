# Informe QA, Pruebas y Deploy

## Pruebas existentes

- Suite de Firestore Rules.
- Smoke de rutas principales.
- Smoke autenticado por roles.
- Validación parcial Mercado Pago.

## Brechas duras

- Falta e2e profundo con recorrido completo autenticado: postulante, empresa, admin y OMIL.
- Mercado Pago debe probar pago aprobado real de punta a punta.
- Gemini debe probarse con cuota activa.
- Storage Rules requieren suite equivalente a Firestore.

## Criterio mínimo antes de producción

No abrir masivamente sin:

- Webhook Mercado Pago probado.
- Admin real Firebase.
- Legal revisado.
- Respaldos/exportación de datos.
- Monitoreo de errores Functions.
