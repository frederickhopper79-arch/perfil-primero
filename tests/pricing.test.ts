import { describe, it, expect } from "vitest";
import { formatCLP, withIVA, withoutIVA, ivaAmount, annualPrice, IVA_RATE } from "../lib/domain/pricing";

describe("formatCLP", () => {
  it("formatea con separador de miles chileno", () => {
    expect(formatCLP(4990)).toBe("$4.990");
    expect(formatCLP(29990)).toBe("$29.990");
    expect(formatCLP(0)).toBe("$0");
  });
});

describe("IVA (19% Chile)", () => {
  it("withIVA agrega el 19% y redondea", () => {
    expect(withIVA(9990)).toBe(11888); // round(9990 * 1.19)
    expect(IVA_RATE).toBe(0.19);
  });
  it("withoutIVA es el neto (aprox. inverso)", () => {
    expect(withoutIVA(11888)).toBe(9990);
  });
  it("ivaAmount es la diferencia bruto - neto de entrada", () => {
    expect(ivaAmount(9990)).toBe(withIVA(9990) - 9990);
    expect(ivaAmount(9990)).toBe(1898);
  });
});

describe("annualPrice", () => {
  it("aplica 20% de descuento por defecto sobre 12 meses", () => {
    expect(annualPrice(29990)).toBe(287904); // 29990*12*0.8
  });
  it("respeta un descuento personalizado", () => {
    expect(annualPrice(1000, 0)).toBe(12000);
    expect(annualPrice(1000, 50)).toBe(6000);
  });
});
