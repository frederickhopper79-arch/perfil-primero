# Informe Contabilidad, Pagos y Facturación

## Modelo de cobro actual de prueba

Los cobros están configurados para prueba operativa a bajo monto. La plataforma debe mantener trazabilidad por:

- `payments`: intención, estado, proveedor, monto, cupón, usuario y relación.
- `accountingEntries`: bruto, neto, IVA, comisión estimada, estado SII/OpenFactura.
- `couponUsages`: uso de descuentos.
- `contactUnlocks`: liberación de datos por pago de empresa.

## Mercado Pago

El flujo técnico incluye:

1. Creación de preference.
2. Redirección checkout.
3. Webhook/consulta de pago.
4. Marcado `paid`.
5. Activación de perfil o desbloqueo de contacto.
6. Asiento contable.

## Riesgo contable

El sistema deja preparado el estado SII/OpenFactura, pero la emisión tributaria real requiere integración definitiva con proveedor autorizado y revisión contable chilena.
