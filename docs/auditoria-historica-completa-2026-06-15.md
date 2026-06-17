# Auditoria historica completa - Perfil Primero

Fecha: 2026-06-15
Sitio: https://perfil-primero.web.app
Stack auditado: Next.js static export, Firebase Hosting, Firebase Auth, Firestore, Storage, Cloud Functions, Mercado Pago, Gemini.

## Veredicto ejecutivo

Perfil Primero ya no es solo una maqueta: tiene landing, cuentas por rol, perfiles anonimos, CV con IA, pagos, webhook, invitaciones, entrevista interna, bloqueo por intercambio de contacto, panel empresa, panel postulante, consola admin, reportes y reglas de seguridad. Aun asi, no debe venderse como sistema maduro sin pruebas autenticadas reales, proveedor tributario real, Calendar/Gmail OAuth real y monitoreo/rate limiting.

El producto esta en estado MVP funcional avanzado. No esta en estado produccion masiva con datos laborales sensibles.

## Reparaciones aplicadas durante esta auditoria

1. Panel empresa: se elimino `AuthCard` dentro del area post-login. Antes la empresa podia entrar y seguir viendo formulario de acceso dentro del panel.
2. Panel empresa: se agrego `Cerrar sesion`.
3. Panel empresa: se cambio texto de prueba `US$1` a `$999`.
4. Panel empresa: el detalle de candidato ahora muestra `formattedCv` cuando el CV Perfil Primero existe.
5. Panel postulante: se agrego carga real de perfil publico, perfil privado, scores, CV, estado de pago/visibilidad y pagos al volver a iniciar sesion.
6. Panel postulante: se evita desactivar accidentalmente un perfil ya pagado al editar datos.
7. Panel postulante: pagos ahora se listan con monto, tipo, estado y referencia.
8. README: se corrigieron precios antiguos `$4.999/$30.000`, lenguaje y estado actual.

## Matriz historica de instrucciones

| Instruccion / necesidad | Estado actual | Evidencia | Observacion critica |
|---|---|---|---|
| Sistema invertido: postulantes publican perfil, empresas buscan | Implementado | `workerPublicProfiles`, `company-workspace`, `listVisibleWorkers` | El modelo existe; falta volumen real de perfiles. |
| Cobro trabajador/postulante | Implementado en prueba | `createWorkerSubscriptionCheckout`, precio `$999` CLP | Precio historico cambio de USD/CLP a prueba; documentado. |
| Cobro empresa al cerrar trato | Implementado en prueba | `createCompanyUnlockCheckout`, `getOrCreateCompanySuccessCheckout` | Se cobra por desbloqueo/cierre; falta prueba real con webhook productivo. |
| Next.js/Firebase base | Implementado | `next.config.mjs`, `firebase.json`, `functions/src/index.ts` | Build genera `out`; Firebase Hosting apunta a `out`. |
| Firebase Auth email/Google | Implementado | `lib/firebase/auth.ts`, `AuthCard` | Falta prueba manual extensa con varias cuentas reales. |
| Login Gmail postulante | Implementado | `loginWithGoogle("worker")` | Reparado post-login para no mostrar formulario interno. |
| Login empresa | Implementado | `loginWithGoogle("company")`, `CompanyWorkspace` | Reparado post-login para no mostrar formulario interno. |
| Separar admin de navegacion publica | Implementado | `/consola-admin`, `/admin` redirige | Home ya no enlaza admin. |
| Admin `Admin/1234` | Parcial y deliberado | `AdminPanel` modo visual | No se convirtio en admin real por seguridad. Acciones reales exigen `role: admin`. |
| Crear usuarios desde admin | Implementado | `createManagedUser`, `AdministrationView` | Solo funciona con cuenta admin real Firebase. Correcto. |
| Consola admin completa | Implementado MVP | tabs: resumen, administracion, empresas, postulantes, ofertas, mensajes, pagos, contabilidad, SII, cupones, entrevistas, reputacion, seguridad, auditoria, reportes | Funciona como backoffice inicial; falta soporte/tickets y moderacion avanzada. |
| Listado de pagos | Implementado | Admin y paneles de empresa/postulante | Falta comprobante tributario real. |
| Asientos contables | Implementado | `accountingEntries`, `exportAccountingCsv` | Plan de cuentas debe validarlo contador. |
| SII/OpenFactura | Parcial | campos `siiStatus`, `folioSii`, `pdfUrl`, `xmlUrl` | No hay proveedor DTE real. Bloqueado por API/contrato/credenciales. |
| Cupones activos/usados | Implementado | `coupons`, `couponUsages`, admin | Seed depende de credenciales Admin SDK si se ejecuta local. |
| Entrevistas programadas | Implementado | `scheduleInterview`, `scheduledInterviews` | Crea URL Google Calendar; no escribe en calendarios por OAuth. |
| Recordatorio email/Gmail | Parcial | `emailReminders` queued | No hay envio real por Gmail API/proveedor transaccional. |
| Mensajeria interna | Implementado | `conversationMessages`, `sendConversationMessage` | Incluye bloqueo por contacto; falta moderacion humana/admin de conversaciones. |
| Reglas entrevista antes de chat | Implementado | `acceptInterviewRules`, `InterviewRulesCard` | Chat requiere aceptacion de ambas partes. |
| IA monitorea intercambio de contacto | Parcial | `detectContactSignal` + Gemini fallback | Hay deteccion deterministica/IA, pero no monitoreo audiovisual ni streaming. |
| Bloqueo por contacto y pago empresa | Implementado | `chatLockedForPayment`, checkout empresa | Flujo existe; requiere prueba real extremo a extremo con MP. |
| Trabajador ve aviso de pago empresa | Implementado | mensaje de sistema y estado en chat | Correcto a nivel UI/funcion. |
| CV subido por postulante | Implementado | Storage `workers/{uid}/cv` | Reglas limitan tipo y peso. |
| IA analiza CV | Implementado | `analyzeCvWithAi`, `GEMINI_MODEL`, `formattedCv` | Requiere `GEMINI_API_KEY` valida; sin eso falla correctamente. |
| IA crea perfil publico desde CV | Implementado | `handleCvAnalysis` actualiza y guarda perfil | Se guarda como borrador oculto si no hay pago. |
| CV con formato propio | Implementado | `formattedCv` en perfil publico/privado | Empresas lo ven si el campo existe en perfil seleccionado. |
| Mejorar perfil antes de publicar | Implementado | `AiProfileAdvisor` + aplicar resumen | La IA propone y el usuario aplica. |
| Perfil visible solo con pago | Implementado | Functions activa `visibilityStatus=visible`, `subscriptionStatus=active`; reglas bloquean autovisibilidad | Reparado para no desactivar al editar. |
| Regiones/comunas Chile | Implementado | `chileRegions` | Puede requerir ampliacion territorial fina si se quiere cobertura exhaustiva. |
| Tests opcionales | Implementado | `AssessmentTests` | Separados en formularios independientes; no obligatorios. |
| Tests profesionales | Parcial | guia y tests internos | No son psicometricos certificados. No deben venderse como ciencia dura. |
| Matching IA para empresas | Implementado | `getCandidateMatchAdvice` | Depende de vacante bien escrita; requiere campos estructurados mejores. |
| Plantillas invitacion empresa + manual | Implementado | `invitationTemplates`, selector manual | Correcto. |
| Ofertas de empleo y vacantes | Implementado | `jobOffers`, descuento al aceptar invitacion | Descuenta/cierra segun vacantes disponibles. |
| Comparacion de candidatos | Implementado MVP | `compareWorkers` max 3 | Falta vista mas ejecutiva/tabla avanzada. |
| Timeline/trazabilidad proceso | Parcial | pipeline + auditEvents | Falta timeline visual completo por evento. |
| Reputacion empresa/postulante | Implementado MVP | `platformReviews` | Falta agregacion publica robusta y politica antiabuso. |
| Banner empresas verificadas | Implementado | `VerifiedCompaniesBanner` | Usa placeholders si no hay 5 reales; debe reemplazarse con logos reales. |
| Home sin filtros empresariales | Implementado | filtros en `/empresa`, no hero | Correcto. |
| Home sin `92%` hardcodeado | Implementado | verificacion produccion `Compat92=False` | Correcto. |
| Home sin Admin publico | Implementado | verificacion produccion `TieneAdmin=False` | Correcto. |
| Profesionalizacion visual | Implementado parcial | CSS professional pass | Mejoro, pero aun falta identidad visual de marca premium. |
| Legal privacidad/terminos | Implementado basico | `/legal/privacidad`, `/legal/terminos` | Insuficiente para produccion real con CVs; requiere abogado. |
| Seguridad anti hackeo | Parcial | Firestore/Storage rules, headers, Auth roles | Falta App Check, rate limiting, tests de reglas, OWASP, monitoreo. |
| Reportes admin | Implementado MVP | `ReportsView`, CSV reportes | Falta analitica historica por fecha y dashboards con series temporales. |
| Usuarios demo reales | Parcial | scripts seed | Depende de Application Default Credentials/Admin SDK. |
| Word/PDF con accesos | Implementado historico | `ACCESOS_DEMO_PERFIL_PRIMERO.docx` | Puede quedar obsoleto si se crean usuarios reales nuevos. |

## Instrucciones no completamente realizadas y por que

1. Facturacion electronica real SII/OpenFactura:
   No esta implementada como emision real. Faltan proveedor contratado, API key, ambiente de certificacion, datos tributarios y validacion contable. Se dejo estado administrativo y campos preparados.

2. Google Calendar automatico en calendarios de ambos usuarios:
   No esta como insercion real OAuth. Se genera URL de Google Calendar y recordatorio queued. Para escribir en calendarios reales se necesitan OAuth consent screen, scopes, refresh tokens y manejo legal de permisos.

3. Envio real de recordatorios por Gmail:
   No hay envio real. Existe `emailReminders` como cola. Falta Gmail API/OAuth o proveedor transaccional.

4. Admin `Admin/1234` como operador real:
   No se implemento por seguridad. Seria una puerta trasera en una plataforma con datos laborales. Correcto es cuenta Firebase Auth con `role: admin`.

5. Tests psicometricos serios:
   No se puede cumplir solo con codigo. Requiere instrumento validado, revision de psicologo laboral, terminos legales y politica no discriminatoria.

6. Monitoreo IA profundo de entrevista:
   Existe deteccion de contacto en texto. No existe monitoreo audiovisual ni analisis en tiempo real de llamada/video porque no hay motor de videollamada ni consentimiento especifico.

7. Lanzamiento masivo seguro:
   No recomendado aun. Falta App Check, rate limits, pruebas e2e autenticadas, pruebas de reglas, monitoreo de errores y proceso de eliminacion de datos.

8. Datos demo reales en Auth:
   Scripts existen, pero ejecutarlos localmente requiere Application Default Credentials o credenciales de servicio. Sin eso no se pueden crear usuarios reales de Auth desde esta maquina.

## Riesgos tecnicos vivos

- No hay suite automatizada para Firestore Rules.
- No hay e2e autenticado con usuarios worker/company/admin reales.
- Mercado Pago debe probarse en flujo productivo completo: preference, redirect, webhook, pago aprobado, activacion/desbloqueo.
- Gemini depende de `GEMINI_API_KEY`; si falta, la UI muestra error, pero el flujo IA no opera.
- `firebase-functions` muestra advertencia de version al desplegar; no bloquea, pero conviene actualizar controladamente.
- Los reportes admin leen snapshots limitados; para escala real se requiere paginacion, filtros por fecha y agregados precomputados.
- Legal es insuficiente para produccion real.

## Verificacion tecnica recomendada antes de mercado

1. Crear una cuenta admin real en Firebase Auth y documento `users/{uid}` con `role: admin`.
2. Crear una cuenta postulante real con Gmail.
3. Subir CV PDF real menor a 5 MB y confirmar `formattedCv`.
4. Pagar `$999` postulante en Mercado Pago y verificar `subscriptionStatus=active`, `visibilityStatus=visible`.
5. Crear empresa real, subir logo, verificarla desde consola admin.
6. Crear oferta, invitar postulante, aceptar invitacion, aceptar reglas de entrevista por ambos lados.
7. Programar entrevista para al menos un dia despues.
8. Intentar escribir telefono/email en chat y verificar bloqueo + checkout empresa.
9. Pagar empresa y verificar `contactUnlocks`.
10. Exportar CSV contable y revisar asiento.

## Veredicto final de auditoria

La plataforma cumple la mayor parte de las instrucciones funcionales de MVP. Las brechas que quedan no son retoques: son integraciones externas, seguridad avanzada, legal y pruebas reales. La base ya puede seguir evolucionando, pero abrirla masivamente sin cerrar esas brechas seria imprudente.

