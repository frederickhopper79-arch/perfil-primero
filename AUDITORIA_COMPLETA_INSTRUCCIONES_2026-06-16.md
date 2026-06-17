# Auditoria completa de instrucciones y plataforma - Perfil Primero

Fecha: 2026-06-16  
Proyecto auditado: `C:\Users\fabia\OneDrive\Documentos\Pagina de Empleos`  
Sitio productivo: https://perfil-primero.web.app  
Stack real: Next.js static export, Firebase Hosting, Firebase Auth, Firestore, Storage, Cloud Functions, Mercado Pago, Gemini.

## Avance ejecutado despues de esta auditoria

Se avanzo en todo lo que podia cerrarse sin nuevas credenciales externas:

- Se elimino el acceso temporal `Admin / 1234`; la consola exige cuenta Firebase Auth con rol `admin`.
- Se corrigio el copy visible pendiente de "trabajadores" a "postulantes".
- Se implemento `expireOmilProfiles`, funcion programada diaria para expirar perfiles OMIL vencidos.
- Se dejo cola de recordatorio OMIL vencido con estado `pending_email_provider`, porque el envio real depende de proveedor Gmail/SMTP.
- Se mejoro el fallback visible de Gemini para no mostrar errores crudos de cuota al postulante.
- Se aplico una capa visual fuerte inspirada en portales laborales modernos: barra superior tipo portal, hero con buscador, tarjetas blancas amplias, tabs redondeados, paneles internos mas densos y estados mas claros.
- Se movieron overrides de seguridad a `pnpm-workspace.yaml` para que pnpm los respete.
- Se desplego Hosting, Functions y Firestore Rules a `perfil-primero.web.app`.

Validacion posterior:

| Validacion | Resultado |
|---|---|
| Build Next.js final | Correcto |
| TypeScript Functions final | Correcto |
| Firestore Rules con emulador | 13/13 tests pasados |
| Audit pnpm con registry | Sin vulnerabilidades conocidas |
| Smoke local sobre `out` desktop/mobile | Correcto |
| Smoke produccion desktop/mobile | Correcto |
| Deploy Firebase Hosting/Functions/Rules | Completo |

## Veredicto ejecutivo duro

La plataforma avanzo bastante, pero no corresponde decir que "todas" las instrucciones estan completas. Hay una base MVP avanzada, con funciones reales y deploy productivo, pero todavia existen instrucciones no desarrolladas, instrucciones solo parcialmente implementadas y otras bloqueadas por dependencias externas.

La verdad incomoda: la plataforma ya tiene estructura de producto, pero aun no es un sistema maduro listo para operar masivamente con datos laborales reales. Lo que falta no es solo estetica. Faltan integraciones externas reales, seguridad avanzada, pruebas autenticadas completas, cierre tributario real, correo real, Calendar real y limpieza de inconsistencias de copy.

## Fuentes auditadas

### Chat e instrucciones conversacionales disponibles

Se revisaron las instrucciones acumuladas en esta conversacion: sistema invertido, modelo de cobro, arquitectura Firebase/GCP, Mercado Pago, Gemini, CV con IA, paneles postulante/empresa/admin, tests, entrevistas internas, OMIL, visual tipo Computrabajo, reportes, seguridad, legal, auditorias, cambio de "trabajadores" a "postulantes", consola admin y mejoras visuales.

### Documentos Word originales leidos

Se extrajo texto de:

- `C:\Users\fabia\OneDrive\Escritorio\Perfil Primero\Instrucciones Contables.docx`
- `C:\Users\fabia\OneDrive\Escritorio\Perfil Primero\Objetivos de la plataforma.docx`
- `C:\Users\fabia\OneDrive\Escritorio\Perfil Primero\Instrucciones.docx`

### Documentos y reportes del proyecto

Se revisaron:

- `docs/matriz-cumplimiento-instrucciones.md`
- `docs/backlog-implementacion-pendiente.md`
- `docs/auditoria-historica-completa-2026-06-15.md`
- `docs/auditoria-visual-computrabajo-laborum.md`
- `docs/guia-tests-profesionales.md`
- `informes-plataforma/*`
- `AUDITORIA_EXHAUSTIVA_CRITICA_2026-06-15.md`
- `AUDITORIA_CRITICA_DURA_PRODUCTO.md`

### Codigo auditado

Se revisaron rutas, componentes, funciones, reglas y scripts:

- `app/page.tsx`, `app/postulante/page.tsx`, `app/empresa/page.tsx`, `app/omil/page.tsx`, `app/consola-admin/page.tsx`
- `components/worker-onboarding.tsx`, `components/company-workspace.tsx`, `components/admin-panel.tsx`, `components/assessment-tests.tsx`, `components/omil-workspace.tsx`
- `functions/src/index.ts`
- `firestore.rules`, `storage.rules`
- `lib/firebase/*`, `lib/domain/*`
- `tests/firestore.rules.test.ts`
- `scripts/smoke-local.mjs`
- `functions/scripts/seed-demo-data.mjs`, `functions/scripts/seed-omil-accounts.mjs`

## Validaciones tecnicas ejecutadas durante esta auditoria

| Validacion | Resultado |
|---|---|
| `npm audit` raiz | 0 vulnerabilidades |
| `npm audit` functions | 0 vulnerabilidades |
| `next build` | Compila correctamente |
| `functions tsc` | Compila correctamente |
| Firestore Rules tests | 13/13 tests pasados |
| Smoke produccion desktop/mobile | Home, postulante, empresa, OMIL, admin, precios y legales OK |

## Matriz de cumplimiento por grandes bloques

### 1. Modelo central de negocio

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Plataforma invertida: postulantes publican perfil y empresas buscan | Implementado MVP | `workerPublicProfiles`, `CompanyWorkspace`, `listVisibleWorkers` | Funciona tecnicamente, pero falta inventario real de perfiles. |
| Cobro postulante mensual | Implementado en modo prueba | `createWorkerSubscriptionCheckout`, `testPriceClp = 999` | El precio esta en CLP $999, no USD ni $4.999. Correcto para prueba, no definitivo. |
| Cobro empresa al cerrar trato/desbloquear contacto | Implementado MVP | `createCompanyUnlockCheckout`, `contactUnlocks` | Falta prueba real completa de pago aprobado en Mercado Pago productivo/sandbox. |
| Pago por resultado como diferenciador comercial | Implementado en copy y flujo | Home + Functions | Operativamente aun depende de evitar bypass fuera de plataforma. |
| Evitar bypass por entrega de contacto | Parcial | Bloqueo por deteccion de contacto en chat | Sirve en texto dentro de plataforma; no evita contacto fuera por LinkedIn u otros canales. |

### 2. Arquitectura y hosting

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Next.js/Firebase base | Implementado | `next.config.mjs`, `firebase.json`, `out` | Correcto. |
| Firebase Hosting | Implementado y desplegado | `https://perfil-primero.web.app` | Falta dominio propio `.cl` o `.com` para confianza B2B. |
| Firestore | Implementado | colecciones en Functions/reglas | Modelo documental correcto para MVP. |
| Cloud Functions | Implementado | `functions/src/index.ts` | Varias funciones reales desplegadas. |
| Storage para CV/logos | Implementado | `storage.rules`, `uploadWorkerCv` | Falta suite automatizada especifica para Storage Rules. |
| Costos Google documentados | Implementado documental | `ROADMAP_TECNICO_GCP_FIREBASE.md` | No reemplaza monitoreo real de costos. |

### 3. Autenticacion y roles

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Ingreso con Gmail postulante | Implementado | `AuthCard`, `loginWithGoogle("worker")` | Requiere prueba manual con cuenta real en navegador. |
| Ingreso empresa | Implementado | `loginWithGoogle("company")` | Correcto para MVP. |
| Boton cerrar sesion postulante | Implementado | `WorkerOnboarding.handleLogout` | Correcto. |
| Boton cerrar sesion empresa | Implementado | `CompanyWorkspace` | Correcto. |
| Boton cerrar sesion admin | Implementado | `AdminPanel.handleLogout` | Correcto. |
| Admin separado de la pagina publica | Implementado | `/consola-admin` | Home ya no muestra Admin como nav principal. |
| Admin `Admin / 1234` operativo real | Cerrado por seguridad | `AdminPanel` exige cuenta Firebase Auth con rol admin | Usar `1234` como admin real seria una puerta trasera; el bypass temporal fue eliminado. |
| Crear usuarios desde admin | Implementado MVP | `createManagedUser`, `AdministrationView` | Solo funciona con cuenta Firebase admin real. Correcto. |
| Rol OMIL | Implementado | `UserRole = ... "omil"`, `/omil`, `createOmilPostulantProfile` | Las cuentas OMIL reales aun no fueron creadas por falta de credenciales Admin SDK. |

### 4. Perfil postulante y CV con IA

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Subir CV | Implementado | `uploadWorkerCv`, Storage | Valida tipo/peso. |
| Analisis CV con Google IA | Implementado con fallback | `analyzeCvWithAi` | Depende de `GEMINI_API_KEY` y cuota. No hay garantia si la cuenta Google no tiene cuota. |
| IA extrae datos y crea perfil | Implementado | `handleCvAnalysis` actualiza form y guarda | Funciona logicamente; falta prueba con Gemini activo y CV real. |
| Crear CV con formato propio | Implementado | `formattedCv` | Editable y guardado. |
| Traspasar datos al perfil publico | Implementado | `saveCurrentProfile` | Perfil queda no visible si no hay pago. |
| Mejorar perfil antes de publicar | Implementado | `AiProfileAdvisor` | Depende de Gemini o fallback. |
| Carta de presentacion | Implementado | vista `cover` en `WorkerOnboarding` | Generacion basada en datos del perfil, no IA avanzada. |
| Perfil visible solo con pago mensual | Implementado | reglas + webhook pago | Correcto en diseño. Requiere prueba MP aprobada real. |
| Region/comuna en perfil postulante | Implementado | `chileRegions` | La exhaustividad de comunas debe verificarse contra catalogo oficial chileno. |

### 5. Panel empresa

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Perfil empresa con region/comuna | Implementado | `CompanyWorkspace` | Correcto MVP. |
| Crear ofertas de empleo | Implementado | `jobOffers` | Correcto. |
| Actualizar/modificar perfil y publicaciones | Implementado MVP | `saveCompanyProfile`, `saveJobOffer` | Falta UX avanzada de edicion/listado tipo ATS. |
| Descontar vacantes/cerrar oferta | Implementado parcial | `updateInvitationStatus` / vacantes | Debe probarse con flujo real de multiples vacantes. |
| Buscar postulantes con filtros serios | Parcial | filtros region/area/renta/texto | Falta seniority, disponibilidad, tests, experiencia, comuna fina, modalidad multi-filtro. |
| Comparar candidatos lado a lado | Implementado MVP | `compareWorkers.slice(0,3)` | Basico; no es panel de decision empresarial fuerte. |
| IA ayuda a elegir candidato | Implementado MVP | `getCandidateMatchAdvice` | Depende de calidad de vacante; no impone datos estructurados suficientes. |
| Plantillas de invitacion + opcion manual | Implementado | `invitationTemplates` | Correcto MVP. |

### 6. Entrevistas, mensajeria y pago de cierre

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Entrevista dentro de la web | Parcial | chat interno + reglas | No hay videollamada ni sala audiovisual. Es mensajeria/entrevista textual interna. |
| Instructivo/reglas antes de entrevista | Implementado | `InterviewRulesCard` | Correcto. |
| Ambos aceptan reglas antes de avanzar | Implementado | `acceptInterviewRules` | Correcto. |
| IA monitorea contacto | Parcial | `detectContactSignal`, Gemini fallback | Detecta texto; no monitorea audio/video ni contexto completo. |
| Bloqueo al detectar datos de contacto | Implementado | `chatLockedForPayment`, mensaje sistema | Correcto para chat interno. |
| Mensaje al postulante mientras empresa paga | Implementado | mensaje sistema | Correcto. |
| Programar entrevista minimo de un dia para otro | Implementado | `scheduleInterview`, `minStart` | Correcto. |
| Integracion Google Calendar de cada persona | Parcial | `calendarUrl` | No crea evento real en calendarios personales por falta de OAuth Calendar. |
| Recordatorio por email/Gmail | Parcial | `emailReminders` queued | No envia correos reales. Falta Gmail API/OAuth o proveedor email. |

### 7. Tests y evaluaciones

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Tests opcionales, no obligatorios | Implementado | vista `tests` | Correcto. |
| Test ingles | Implementado orientativo | `AssessmentTests`, `testQuestions` | No es certificacion CEFR real. |
| Test espanol | Implementado orientativo | `AssessmentTests` | No es certificacion. |
| Test personalidad | Implementado orientativo | `AssessmentTests` | No es prueba psicometrica validada. |
| Cada test en formulario independiente | Implementado | `activeTest` | Correcto. |
| Investigar/profesionalizar tests | Parcial documental | `docs/guia-tests-profesionales.md` | Falta instrumento validado profesionalmente, baremos y consentimiento legal robusto. |

### 8. Consola administrativa

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Resumen operativo dashboard | Implementado MVP | `SummaryView` | Correcto inicial. |
| Listado pagos | Implementado | `PaymentsView` | Correcto. |
| Asientos contables | Implementado | `AccountingView`, `accountingEntries` | Plan contable debe revisarlo contador. |
| Estado SII/OpenFactura | Parcial | `InvoicingView` muestra campos | No emite DTE real. |
| Cupones activos/usados | Implementado | `CouponsView` | Correcto MVP. |
| Entrevistas programadas | Implementado | `InterviewsView` | Correcto MVP. |
| Evaluaciones/reputacion | Implementado MVP | `ReviewsView`, `platformReviews` | Falta moderacion y antiabuso. |
| Alertas de seguridad | Implementado MVP | `SecurityView` | Alertas basicas generadas desde snapshots. |
| Logs/auditoria | Implementado | `auditEvents`, `AuditView` | Correcto MVP. |
| Empresas verificadas/rechazadas/suspendidas con filtros | Implementado | `CompaniesView` | Correcto MVP. |
| Crear usuarios desde admin | Implementado | `createManagedUser` | Requiere admin real. |
| Reportes requeridos | Parcial | `ReportsView`, CSV | Falta PDF/Word automatico, series historicas, filtros profundos, reportes ejecutivos imprimibles. |

### 9. Contabilidad, Mercado Pago, SII/OpenFactura

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Mercado Pago como gestor de cobro | Implementado | `createMercadoPagoPreference`, webhooks | Falta prueba de pago aprobado completa. |
| Montos de prueba $999 CLP | Implementado | `testPriceClp = 999` | Correcto segun ajuste por Chile/no USD. |
| Webhook Mercado Pago | Implementado | `mercadoPagoWebhook` | Debe probarse con pago real aprobado. |
| Asiento contable bruto/neto/IVA/comision | Implementado | `writeAccountingEntry` | Formula estimada; requiere validacion contable real. |
| Export CSV contable | Implementado | `exportAccountingCsv` | Correcto MVP. |
| OpenFactura/SII real | No implementado | solo campos `siiStatus`, `folioSii`, `pdfUrl`, `xmlUrl` | Bloqueado por proveedor, API key, contrato, ambiente SII y datos tributarios. |
| Envio factura PDF/XML por correo | No implementado | no hay proveedor email ni DTE real | Pendiente. |
| Conciliacion Mercado Pago/Banco | Parcial documental | informes y contabilidad basica | No hay conciliacion bancaria real ni importacion cartola. |

### 10. OMIL

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Crear 30 cuentas OMIL Omil1-Omil30 | No ejecutado en Firebase real | `seed-omil-accounts.mjs` existe | No se pudieron crear por falta de Application Default Credentials. |
| OMIL sin cobro | Implementado en funcion | `billingExempt`, `createOmilPostulantProfile` | Correcto diseño. |
| OMIL crea postulantes ilimitados | Implementado en funcion | no hay limite | Correcto MVP. |
| Postulantes OMIL visibles 1 mes | Implementado | `profileExpiresAt` + `subscriptionStatus active` | Falta job programado que expire automaticamente. |
| Correo al vencer para suscribirse | Parcial | `emailReminders` queued | No hay envio real. |
| Ruta OMIL | Implementado | `/omil` | Correcto. |

### 11. UI/UX y estilo visual

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Asimilar Computrabajo/Laborum | Parcial | auditoria visual + mejoras home/paneles | No es asimilacion completa. Aun falta master-detail empresarial mas fuerte y visual propio consistente. |
| Home profesional moderna | Mejorada recientemente | `home-production-redesign.png` | Mejoro, pero todavia necesita identidad de marca mas distintiva. |
| Diferenciar botones empresa/postulante | Implementado | Home nav + CTA | Correcto. |
| Reducir home larga por paginas | Parcial | rutas separadas existen | Home sigue siendo scroll largo, aunque menos pesada. |
| Panel postulante tipo dashboard | Parcial | tabs + cards | No alcanza aun nivel Computrabajo completo. |
| Tests estilo listado profesional | Implementado parcial | `assessmentCatalog` | Visual mas cercano, pero sin ilustraciones reales como referencias. |
| Banner empresas loop derecha-izquierda | Implementado | `VerifiedCompaniesBanner` | Usa placeholders si no hay logos reales. |
| Logo | Implementado | `logo-perfil-primero.svg` | Basico, no necesariamente marca premium. |
| Iconos Mercado Pago/Google | Implementado | `brand-icons.tsx` | Correcto. |

### 12. Legal, seguridad y privacidad

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| Pagina legal privacidad/terminos | Implementado basico | `/legal/privacidad`, `/legal/terminos` | Insuficiente para produccion real con CVs, IA y datos laborales. |
| Separar datos publicos/privados | Implementado | `workerPublicProfiles`, `workerPrivateProfiles` | Correcto. |
| Firestore Rules | Implementado + tests | `firestore.rules`, 13 tests | Correcto MVP. |
| Storage Rules | Implementado | `storage.rules` | Falta suite automatizada. |
| Anti-hackeo avanzado | Parcial | reglas, headers, roles | Falta App Check, rate limiting, WAF, monitoreo, pentest, proteccion scraping. |
| Prohibicion scraping/ingenieria inversa | Parcial legal | terminos basicos | Falta enforcement tecnico real. |
| NDA/cesion derechos/registro marca | No implementado | fuera del codigo | Requiere gestion legal, no desarrollo web. |

### 13. Datos demo, documentos y entregables

| Instruccion | Estado | Evidencia | Critica |
|---|---|---|---|
| 5 postulantes demo, 2 empresas, 10 ofertas | Implementado como script/datos demo | `seed-demo-data.mjs`, `demo-data.ts` | No necesariamente creados en Auth real por falta credenciales. |
| Word con accesos | Implementado historico | `ACCESOS_DEMO_PERFIL_PRIMERO.docx` | Puede estar obsoleto si no se ejecutaron seeds reales. |
| Informes administracion/contabilidad/tecnicos | Implementado parcial | `informes-plataforma/*` | Son Markdown, no PDF/Word. Faltan versiones ejecutivas exportables si se requieren. |
| Pitch empresas/postulantes | Implementado documental | `docs/pitch-empresas.md`, `docs/pitch-postulantes.md` | Correcto como base. |
| Objetivos, vision, mision | Implementado documental | `docs/objetivos-plataforma.md` | Basico; podria profundizarse. |
| Matriz cumplimiento | Implementado | `docs/matriz-cumplimiento-instrucciones.md` | Debia mantenerse actualizada; este informe la reemplaza/amplia. |

## Instrucciones no desarrolladas completamente

### Criticas y de alto impacto

1. **Facturacion electronica real SII/OpenFactura**
   - Estado: No implementado.
   - Motivo real: requiere proveedor autorizado, API key, datos tributarios, ambiente de certificacion y validacion contable.
   - No basta con campos en Firestore. Eso es preparacion, no facturacion real.

2. **Envio real de facturas PDF/XML por correo**
   - Estado: No implementado.
   - Motivo real: depende de DTE real + proveedor email/Gmail API.

3. **Google Calendar automatico en calendarios de empresa y postulante**
   - Estado: Parcial.
   - Existe: URL para agregar a Google Calendar.
   - Falta: OAuth por usuario, scopes Calendar, refresh tokens, insercion real del evento.

4. **Recordatorios reales por Gmail**
   - Estado: Parcial.
   - Existe: `emailReminders` como cola.
   - Falta: envio real, proveedor, OAuth/API y control de rebotes.

5. **Creacion real de 30 cuentas OMIL en Firebase Auth**
   - Estado: No ejecutado.
   - Existe: script listo.
   - Motivo real: falta `gcloud auth application-default login` o credenciales Admin SDK.

6. **Usuarios demo reales en Firebase Auth**
   - Estado: Parcial.
   - Existe: script y documento.
   - Falta: ejecucion real con credenciales Admin SDK.

7. **Prueba Mercado Pago completa con pago aprobado**
   - Estado: No completada.
   - Existe: preference/webhook/logica.
   - Falta: prueba real extremo a extremo: redirect, pago aprobado, webhook, activacion/desbloqueo, asiento.

8. **Tests psicometricos serios**
   - Estado: No implementado como psicometria real.
   - Motivo: requiere instrumento profesional validado, baremos, consentimiento, no discriminacion, revision de psicologo laboral.

9. **Monitoreo IA real de entrevista**
   - Estado: Parcial.
   - Existe: deteccion textual de datos de contacto.
   - Falta: monitoreo audiovisual/streaming, consentimiento especifico, motor de videollamada, politica legal.

10. **Seguridad anti-hackeo avanzada**
    - Estado: Parcial.
    - Falta: App Check, rate limiting fuerte, WAF/CDN policy, alertas Cloud Monitoring, pentest, proteccion scraping, rotacion de secretos.

11. **Legal real de produccion**
    - Estado: Parcial.
    - Falta: abogado chileno, politica de tratamiento de datos, retencion/eliminacion, responsabilidad IA, reclamos, DPA, consentimiento explicito.

12. **Dominio propio**
    - Estado: No implementado.
    - Motivo: requiere compra/configuracion DNS.
    - Critica: vender B2B serio desde `web.app` resta confianza.

13. **Cambio completo de "trabajadores" a "postulantes"**
    - Estado: Corregido en codigo visible tras esta auditoria.
    - Evidencia: busqueda en `app`, `components` y `lib` no encuentra texto visible `trabajadores`.
    - Nota: codigo interno usa `worker`, lo cual es aceptable tecnicamente porque no queda expuesto al usuario.

14. **Expiracion automatica de perfiles OMIL despues de 30 dias**
    - Estado: Implementado tras esta auditoria.
    - Existe: `profileExpiresAt` y funcion programada `expireOmilProfiles`.
    - Falta: envio real del correo, porque depende de proveedor Gmail/SMTP.

15. **Reportes PDF/Word ejecutivos**
    - Estado: Parcial.
    - Existe: Markdown y CSV.
    - Falta: PDF/Word automaticos, formato ejecutivo, version imprimible y reportes por rango de fecha.

16. **Panel de decision empresarial fuerte tipo ATS**
    - Estado: Parcial.
    - Existe: comparacion basica de hasta 3 postulantes.
    - Falta: tabla avanzada, scoring explicable, ranking, notas internas, favoritos, historial, filtros combinados y pipeline visual robusto.

17. **Timeline visual completo**
    - Estado: Parcial.
    - Existe: estados, invitaciones y auditoria.
    - Falta: linea de tiempo visual por proceso con eventos fechados.

18. **Auditoria visual completa tipo Computrabajo**
    - Estado: Parcial.
    - Existe: mejoras y documentacion.
    - Falta: rediseño integral de todas las pantallas internas con master-detail, filtros superiores, estados activos y densidad visual profesional.

## Instrucciones implementadas pero fragiles

1. **Gemini CV**
   - Funciona logicamente, pero depende de cuota/clave. Ya hubo error 429 por cuota.
   - El fallback evita romper la UI, pero no reemplaza IA real.

2. **Mercado Pago**
   - La integracion existe, pero un sistema de cobro no se considera cerrado hasta probar pago aprobado real y conciliacion.

3. **Admin console**
   - Tiene muchas vistas, pero algunas son lectura de snapshots. Para escala necesita paginacion robusta, indices, agregados y filtros profundos.

4. **Reportes**
   - Existen, pero son mas inventario que inteligencia de negocio.

5. **Home/UI**
   - Mejoro despues de la ultima correccion, pero aun no tiene identidad visual de gran empresa. Tiene mejor presentacion, no marca memorable.

6. **Tests**
   - Sirven como señal inicial. No deben venderse como evaluacion seria.

## Riesgos vivos antes de abrir al publico

1. El acceso `Admin / 1234` fue eliminado; el riesgo vivo ahora es crear y custodiar correctamente la cuenta admin real de Firebase.
2. Usar datos laborales reales sin legal robusto expone a reclamos serios.
3. Si Mercado Pago no esta probado de punta a punta, el negocio puede cobrar mal o no activar perfiles.
4. Sin correos reales, entrevistas y vencimientos dependen de que el usuario revise la web.
5. Sin App Check/rate limiting, Functions de IA y pagos pueden recibir abuso.
6. Sin dominio propio, la confianza B2B es baja.
7. La expiracion automatica OMIL ya existe; falta probarla desplegada con datos reales vencidos.
8. La limpieza visible de "trabajadores" fue corregida; falta mantener esta regla en futuros textos.

## Backlog priorizado sin maquillaje

### Prioridad 0 - No abrir masivo sin esto

1. Crear y custodiar admin real Firebase Auth.
2. Probar Mercado Pago aprobado extremo a extremo.
3. Configurar envio real de email.
4. Probar expiracion automatica de perfiles vencidos/OMIL en entorno desplegado.
5. Revisar legal con abogado.

### Prioridad 1 - Producto serio

1. Google Calendar OAuth real.
2. App Check + rate limiting.
3. Reportes PDF/CSV avanzados por fecha.
4. Panel empresa tipo ATS: ranking, favoritos, notas, timeline.
5. UI interna mas cercana a Computrabajo/master-detail.
6. Dominio propio.

### Prioridad 2 - Escala y confianza

1. OpenFactura/SII real.
2. Conciliacion bancaria/Mercado Pago.
3. Tests profesionales o integracion con certificados externos.
4. Analitica de conversion.
5. Moderacion de perfiles, empresas e invitaciones.
6. Monitoreo Cloud Logging/Alerting.

## Conclusion final

No, no estan todas las instrucciones completas. La plataforma tiene un MVP avanzado, pero todavia hay instrucciones relevantes no desarrolladas o solo preparadas a medias. Las mas graves son: facturacion SII real, correo real, Calendar real, cuentas OMIL reales, pago aprobado Mercado Pago probado, seguridad avanzada y legal serio.

Lo que si existe es una base suficientemente amplia para seguir cerrando brechas de forma ordenada. Pero venderla hoy como "producto terminado" seria una exageracion peligrosa.
