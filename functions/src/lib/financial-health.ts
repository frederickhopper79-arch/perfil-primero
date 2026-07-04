// Lógica pura del semáforo de salud financiera — sin dependencias de Firestore,
// para poder testearla de forma determinista.

export interface FinancialConfigInput {
  costosMensualesClp: { nombre: string; montoClp: number }[];
  comisionMpPct: number;
  ivaPct: number;
  primeraCategoriaPct: number;
  cajaDisponibleClp: number;
  margenObjetivoPct: number;
  mesesColchonCaja: number;
}

export interface MesData {
  label: string;
  bruto: number; // ingreso bruto del mes (IVA incluido)
  pagos: number;
}

/**
 * Calcula el estado de resultados operativo del mes, el semáforo (verde /
 * amarillo / rojo) y la caja de sustento, a partir de la configuración y de
 * los ingresos brutos de los últimos meses. Función pura y determinista.
 *
 * `meses` debe venir ordenado ascendente (el último es el mes actual).
 */
export function computeFinancialSummary(config: FinancialConfigInput, meses: MesData[]) {
  const mesActual = meses[meses.length - 1] ?? { label: "", bruto: 0, pagos: 0 };
  const mesAnterior = meses[meses.length - 2];

  // Desglose tributario del mes actual (precios al consumidor incluyen IVA)
  const ivaFactor = 1 + config.ivaPct / 100;
  const ingresoNeto = Math.round(mesActual.bruto / ivaFactor);
  const ivaDebito = mesActual.bruto - ingresoNeto;
  const comisionMp = Math.round(mesActual.bruto * (config.comisionMpPct / 100));
  const costosFijos = config.costosMensualesClp.reduce((s, c) => s + c.montoClp, 0);
  const costosTotales = costosFijos + comisionMp;
  const utilidadAntesImpuesto = ingresoNeto - costosTotales;
  const impuestoPrimeraCategoria = Math.max(0, Math.round(utilidadAntesImpuesto * (config.primeraCategoriaPct / 100)));
  const utilidadNeta = utilidadAntesImpuesto - impuestoPrimeraCategoria;
  const margenPct = ingresoNeto > 0 ? Math.round((utilidadNeta / ingresoNeto) * 100) : null;

  // Burn y runway (meses de caja disponibles al ritmo actual)
  const burnMensual = utilidadNeta < 0 ? -utilidadNeta : 0;
  const runwayMeses = burnMensual > 0 && config.cajaDisponibleClp > 0
    ? Math.round((config.cajaDisponibleClp / burnMensual) * 10) / 10
    : null;

  // Tendencia mes contra mes
  const brutoAnterior = mesAnterior?.bruto ?? 0;
  const variacionPct = brutoAnterior > 0
    ? Math.round(((mesActual.bruto - brutoAnterior) / brutoAnterior) * 100)
    : null;

  // Caja de sustento: costos de operar + provisiones tributarias del período
  const provisionTributariaMes = ivaDebito + impuestoPrimeraCategoria;
  const cajaMinimaMensual = costosTotales + provisionTributariaMes;
  const cajaSustentoRecomendada = cajaMinimaMensual * config.mesesColchonCaja;
  const brechaCaja = config.cajaDisponibleClp - cajaSustentoRecomendada;

  // ── Semáforo ──
  let semaforo: "verde" | "amarillo" | "rojo";
  const razones: string[] = [];
  const recomendaciones: string[] = [];

  if (utilidadNeta < 0) {
    semaforo = "rojo";
    razones.push(`La operación quema $${Math.abs(utilidadNeta).toLocaleString("es-CL")} CLP al mes: los costos superan los ingresos netos.`);
    recomendaciones.push("Revisar y recortar costos variables de plataforma (APIs de IA, servicios no esenciales).");
    recomendaciones.push("Acelerar conversión de empresas: cada contacto desbloqueado es margen directo.");
    if (runwayMeses !== null) {
      razones.push(`Runway estimado: ${runwayMeses} meses de caja al ritmo actual.`);
      if (runwayMeses < 3) recomendaciones.push("⚠️ URGENTE: menos de 3 meses de caja. Definir plan de contingencia esta semana.");
    } else if (config.cajaDisponibleClp === 0) {
      recomendaciones.push("Registrar la caja disponible en la configuración para calcular el runway.");
    }
  } else if (runwayMeses !== null && runwayMeses < 3) {
    semaforo = "rojo";
    razones.push(`Runway crítico: ${runwayMeses} meses de caja disponibles.`);
    recomendaciones.push("Priorizar ingresos inmediatos y congelar gastos no esenciales.");
  } else if (config.cajaDisponibleClp > 0 && config.cajaDisponibleClp < cajaMinimaMensual) {
    semaforo = "rojo";
    razones.push(`La caja disponible ($${config.cajaDisponibleClp.toLocaleString("es-CL")} CLP) no cubre ni un mes de operación con provisiones ($${cajaMinimaMensual.toLocaleString("es-CL")} CLP).`);
    recomendaciones.push("Inyectar caja o recortar costos de inmediato: sin un mes de cobertura cualquier imprevisto detiene la plataforma.");
  } else if (config.cajaDisponibleClp > 0 && brechaCaja < 0) {
    semaforo = "amarillo";
    razones.push(`Caja bajo el nivel de sustento: faltan $${Math.abs(brechaCaja).toLocaleString("es-CL")} CLP para cubrir ${config.mesesColchonCaja} meses de operación.`);
    recomendaciones.push(`Acumular caja hasta $${cajaSustentoRecomendada.toLocaleString("es-CL")} CLP antes de asumir nuevos gastos fijos.`);
  } else if (margenPct !== null && margenPct < config.margenObjetivoPct) {
    semaforo = "amarillo";
    razones.push(`Margen neto ${margenPct}% bajo el objetivo de ${config.margenObjetivoPct}%.`);
    recomendaciones.push("Optimizar costos por transacción o evaluar ajuste gradual de tarifas post-lanzamiento.");
  } else if (variacionPct !== null && variacionPct < -20) {
    semaforo = "amarillo";
    razones.push(`Ingresos cayeron ${Math.abs(variacionPct)}% respecto al mes anterior.`);
    recomendaciones.push("Investigar causa de la caída: churn de empresas, estacionalidad o fricción en el checkout.");
  } else if (ingresoNeto === 0) {
    semaforo = "amarillo";
    razones.push("Sin ingresos confirmados este mes (fase de lanzamiento).");
    recomendaciones.push("Verificar que el flujo de pagos esté operativo (webhook Mercado Pago) y activar campañas de adquisición de empresas.");
  } else {
    semaforo = "verde";
    razones.push(`Margen neto ${margenPct}% sobre el objetivo, sin caídas relevantes de ingresos.`);
    recomendaciones.push("Mantener monitoreo mensual y provisionar IVA e impuesto de 1ª categoría en cuenta separada.");
  }

  return {
    semaforo,
    razones,
    recomendaciones,
    mes: mesActual.label,
    resumen: {
      ingresoBruto: mesActual.bruto,
      pagosConfirmados: mesActual.pagos,
      ivaDebito,
      ingresoNeto,
      comisionMp,
      costosFijos,
      costosTotales,
      utilidadAntesImpuesto,
      impuestoPrimeraCategoria,
      utilidadNeta,
      margenPct,
      burnMensual,
      runwayMeses,
      variacionPct,
      provisionTributariaMes,
      cajaMinimaMensual,
      cajaSustentoRecomendada,
      cajaDisponible: config.cajaDisponibleClp,
      brechaCaja,
    },
    historial: meses,
    config,
  };
}
