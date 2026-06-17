# Informe Seguridad y Privacidad

## Protección de anonimato

Los datos visibles para empresas están separados de los datos privados del postulante.

Colecciones clave:

- `workerPublicProfiles`: cargo, habilidades, zona, renta, disponibilidad.
- `workerPrivateProfiles`: nombre, correo, teléfono, CV, carta, datos sensibles.

## Reglas aplicadas

Firestore bloquea escritura directa en pagos, invitaciones, mensajes, entrevistas, reviews, auditoría y contabilidad. Esas acciones pasan por Cloud Functions.

## Riesgos

- La privacidad legal exige política robusta y consentimiento explícito.
- Los archivos subidos deben mantenerse con reglas estrictas de Storage.
- No conviene exponer rutas administrativas en navegación pública.
- OMIL debe operar por función backend, no por escritura directa.
