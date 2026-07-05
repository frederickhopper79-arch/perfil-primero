# Release Notes — v1.1.0 (endurecimiento previo al lanzamiento)

**Fecha:** 2026-07-04

Ciclo de endurecimiento sobre la base técnica ya desplegada: seguridad,
accesibilidad, experiencia móvil, gobernanza HTES y tests del backend.

## Mejoras

- **Seguridad del flujo de dinero:** guarda de desbloqueo de contacto con
  verificación de propiedad del pago, correspondencia con la invitación y uso
  único. Validación de firma del webhook Mercado Pago robustecida.
- **Anonimato:** la URL del CV original y la PII viven solo en el perfil privado;
  el análisis de CV con IA anonimiza el texto público. Perfiles públicos
  visibles solo para empresas verificadas.
- **Accesibilidad WCAG AA:** 0 violaciones axe en las páginas auditadas
  (contraste de color y `aria-label` en selects). Banner de cookies duplicado
  eliminado.
- **Experiencia móvil:** tour guiado usable en móvil (hoja inferior), overlays
  secuenciados, áreas táctiles ≥44px.
- **Salud financiera:** semáforo con caja de sustento mensual y alerta proactiva.
- **Gobernanza HTES:** AI_CONTEXT, ROADMAP, RISK_REGISTER, TECHNICAL_DEBT, RAT,
  ADRs (001-005), documentación de datos y API, checklist pre-lanzamiento.
- **Tests:** 37 unitarios (firma webhook, semáforo financiero, cupones, guarda de
  desbloqueo) + 25 de reglas Firestore.

## Correcciones

- React #418 (hydration mismatch) en todas las páginas: `useOnlineStatus`
  inicializaba estado desde `navigator.onLine`. Consola limpia.
- Sitemap duplicado consolidado (65 URLs).
- Panel de impacto OMIL: cuenta invitaciones por lotes de 30 (antes subcontaba).
- Firma de webhook malformada ya no puede tumbar el handler (guarda de largo).
- Logs: `createContactTicket` ya no registra el email completo (Cap. 10).

## Cambios Incompatibles (Breaking Changes)

- Ninguno para usuarios finales.
- Interno: `cvFileUrl` se lee ahora del perfil privado; perfiles antiguos se
  limpian con la función admin `purgeLegacyCvFileUrls`.

## Observaciones

- Pasos manuales pendientes antes del lanzamiento comercial (ver
  `CHECKLIST_PRE_LANZAMIENTO.md` y `RISK_REGISTER.md`): registrar webhook de
  Mercado Pago + secret, verificar remitente SendGrid, inicio de actividades SII,
  validación legal del RAT.
- CI/CD desactivado en automático hasta configurar GitHub Secrets (DEBT-003);
  los despliegues se hacen manualmente con `firebase deploy`.
