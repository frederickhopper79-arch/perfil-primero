import { describe, it, expect } from "vitest";
import { computeFinancialSummary, type FinancialConfigInput, type MesData } from "../functions/src/lib/financial-health";

function cfg(over: Partial<FinancialConfigInput> = {}): FinancialConfigInput {
  return {
    costosMensualesClp: [{ nombre: "hosting", montoClp: 50000 }],
    comisionMpPct: 3.49,
    ivaPct: 19,
    primeraCategoriaPct: 12.5,
    cajaDisponibleClp: 0,
    margenObjetivoPct: 20,
    mesesColchonCaja: 3,
    ...over,
  };
}
const meses = (...brutos: number[]): MesData[] =>
  brutos.map((b, i) => ({ label: `m${i}`, bruto: b, pagos: b > 0 ? 1 : 0 }));

describe("computeFinancialSummary — matemática tributaria", () => {
  it("desglosa IVA, comisión, impuesto y caja mínima correctamente", () => {
    const r = computeFinancialSummary(cfg(), meses(1_000_000, 1_000_000, 1_000_000));
    expect(r.resumen.ingresoNeto).toBe(840336);   // 1.000.000 / 1.19
    expect(r.resumen.ivaDebito).toBe(159664);
    expect(r.resumen.comisionMp).toBe(34900);     // 3.49%
    expect(r.resumen.costosTotales).toBe(84900);  // 50.000 + comisión
    expect(r.resumen.impuestoPrimeraCategoria).toBe(94430); // 12,5% sobre utilidad antes de impuesto
    expect(r.resumen.provisionTributariaMes).toBe(254094);  // IVA débito + 1ª categoría
    expect(r.resumen.cajaMinimaMensual).toBe(338994);       // costos + provisiones
    expect(r.resumen.cajaSustentoRecomendada).toBe(338994 * 3);
  });
});

describe("computeFinancialSummary — semáforo", () => {
  it("VERDE cuando la operación es sana (margen sobre objetivo, sin caídas)", () => {
    const r = computeFinancialSummary(cfg(), meses(1_000_000, 1_000_000, 1_000_000));
    expect(r.semaforo).toBe("verde");
    expect(r.resumen.margenPct).toBe(79);
    expect(r.resumen.utilidadNeta).toBeGreaterThan(0);
  });

  it("ROJO cuando la utilidad neta es negativa (quema caja)", () => {
    const r = computeFinancialSummary(cfg(), meses(0, 0, 0));
    expect(r.semaforo).toBe("rojo");
    expect(r.resumen.utilidadNeta).toBeLessThan(0);
    expect(r.resumen.burnMensual).toBe(50000);
    expect(r.resumen.runwayMeses).toBeNull(); // sin caja registrada
  });

  it("ROJO con runway < 3 meses cuando hay caja pero quema rápido", () => {
    const r = computeFinancialSummary(cfg({ cajaDisponibleClp: 100000 }), meses(0, 0, 0));
    expect(r.semaforo).toBe("rojo");
    expect(r.resumen.runwayMeses).toBe(2); // 100.000 / 50.000
    expect(r.recomendaciones.join(" ")).toMatch(/URGENTE/);
  });

  it("ROJO cuando la caja no cubre ni un mes de operación", () => {
    const r = computeFinancialSummary(cfg({ cajaDisponibleClp: 100000 }), meses(1_000_000, 1_000_000, 1_000_000));
    expect(r.semaforo).toBe("rojo");
    expect(r.razones.join(" ")).toMatch(/no cubre ni un mes/i);
  });

  it("AMARILLO cuando la caja está bajo el nivel de sustento", () => {
    const r = computeFinancialSummary(cfg({ cajaDisponibleClp: 500000 }), meses(1_000_000, 1_000_000, 1_000_000));
    expect(r.semaforo).toBe("amarillo");
    expect(r.resumen.brechaCaja).toBeLessThan(0);
  });

  it("AMARILLO cuando el margen neto está bajo el objetivo", () => {
    const r = computeFinancialSummary(cfg({ costosMensualesClp: [{ nombre: "todo", montoClp: 700000 }] }), meses(1_000_000, 1_000_000, 1_000_000));
    expect(r.semaforo).toBe("amarillo");
    expect(r.resumen.margenPct).toBeLessThan(20);
    expect(r.razones.join(" ")).toMatch(/objetivo/i);
  });

  it("AMARILLO cuando los ingresos caen más de 20% vs el mes anterior", () => {
    const r = computeFinancialSummary(cfg(), meses(2_000_000, 2_000_000, 1_000_000));
    expect(r.semaforo).toBe("amarillo");
    expect(r.resumen.variacionPct).toBe(-50);
    expect(r.razones.join(" ")).toMatch(/cayeron/i);
  });

  it("maneja historial vacío sin lanzar (bruto 0, sin meses)", () => {
    expect(() => computeFinancialSummary(cfg(), [])).not.toThrow();
    const r = computeFinancialSummary(cfg(), []);
    expect(r.resumen.ingresoBruto).toBe(0);
  });
});
