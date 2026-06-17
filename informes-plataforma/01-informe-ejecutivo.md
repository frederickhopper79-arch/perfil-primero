# Informe Ejecutivo

Perfil Primero es una plataforma laboral invertida: el postulante publica un perfil anónimo y las empresas verificadas buscan talento disponible con sueldo y modalidad claros.

## Estado actual

La plataforma ya opera como MVP funcional con landing, panel postulante, panel empresa, consola administrativa, Mercado Pago, reglas de Firestore, Storage, IA Gemini con fallback, tests opcionales, entrevistas programadas, mensajería, reputación y reportes administrativos.

## Diferenciadores

- El postulante no queda expuesto desde el primer contacto.
- La empresa paga por resultado, no por publicar avisos vacíos.
- El proceso queda trazable: invitación, aceptación, entrevista, desbloqueo, pago y reputación.
- OMIL puede cargar postulantes sin cobro inicial, ampliando inclusión laboral.

## Riesgos ejecutivos

- No debe abrirse masivamente con datos reales sin validar pagos completos en producción.
- La parte legal necesita revisión profesional externa.
- La IA depende de cuota y facturación activa de Google.
- La consola admin ya concentra control, pero debe sumar exportaciones más robustas a medida que escale.
