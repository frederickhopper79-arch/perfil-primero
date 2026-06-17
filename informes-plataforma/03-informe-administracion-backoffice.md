# Informe Administración y Backoffice

## Consola administrativa

La consola administra:

- Resumen operativo.
- Usuarios y roles.
- Empresas verificadas, rechazadas y suspendidas.
- Postulantes públicos y datos privados.
- Ofertas laborales.
- Invitaciones y pipeline.
- Mensajería interna.
- Pagos.
- Asientos contables.
- SII/OpenFactura.
- Cupones.
- Entrevistas.
- Reputación.
- Alertas de seguridad.
- Logs/auditoría.
- Reportes.

## Roles

- `worker`: postulante.
- `company`: empresa.
- `admin`: administración interna.
- `omil`: cuenta institucional exenta de cobro para crear postulantes.

## Control crítico

El acceso temporal `Admin / 1234` fue eliminado. Para producción y pruebas reales se exige cuenta admin real de Firebase Auth con rol `admin`.
