# Informe OMIL

## Objetivo

Crear 30 cuentas institucionales OMIL para cargar postulantes gratuitamente.

## Diseño operativo

- Cuentas: `Omil1` a `Omil30`.
- Rol: `omil`.
- Sin cobro de publicación.
- Creación ilimitada de postulantes.
- Visibilidad inicial: 30 días.
- Al vencimiento: cola de correo para que el postulante continúe con suscripción normal.

## Implementación

- Ruta: `/omil`.
- Función backend: `createOmilPostulantProfile`.
- Script: `functions/scripts/seed-omil-accounts.mjs`.
- Comando: `npm run seed:omil` dentro de `functions`.

## Riesgo

El envío real de correo depende de proveedor Gmail/SMTP/SendGrid o integración equivalente. Actualmente queda trazado como recordatorio en cola administrativa.
