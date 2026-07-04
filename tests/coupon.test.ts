import { describe, it, expect } from "vitest";
import { evaluateCoupon, type CouponData } from "../functions/src/lib/coupon";

const NOW = new Date("2026-07-04T12:00:00Z");
const future = new Date("2026-12-31T00:00:00Z");
const past = new Date("2026-01-01T00:00:00Z");

function coupon(over: Partial<CouponData> = {}): CouponData {
  return { active: true, expiresAt: future, maxUses: 100, usedCount: 0, discountPercent: 10, ...over };
}

describe("evaluateCoupon — validaciones", () => {
  it("rechaza cupón inexistente o inactivo", () => {
    expect(evaluateCoupon(undefined, 999, NOW, false)).toEqual({ ok: false, reason: expect.stringMatching(/inválido o inactivo/i) });
    expect(evaluateCoupon(coupon({ active: false }), 999, NOW, false).ok).toBe(false);
  });

  it("rechaza cupón sin fecha de expiración", () => {
    expect(evaluateCoupon(coupon({ expiresAt: null }), 999, NOW, false).ok).toBe(false);
  });

  it("rechaza cupón vencido", () => {
    const r = evaluateCoupon(coupon({ expiresAt: past }), 999, NOW, false);
    expect(r).toEqual({ ok: false, reason: expect.stringMatching(/vencido/i) });
  });

  it("rechaza cupón que alcanzó su límite de uso", () => {
    const r = evaluateCoupon(coupon({ maxUses: 20, usedCount: 20 }), 999, NOW, false);
    expect(r.ok).toBe(false);
  });

  it("rechaza si el usuario ya usó el cupón", () => {
    const r = evaluateCoupon(coupon(), 999, NOW, true);
    expect(r).toEqual({ ok: false, reason: expect.stringMatching(/ya usó/i) });
  });
});

describe("evaluateCoupon — cálculo de descuento", () => {
  it("aplica 10% correctamente (redondeo)", () => {
    const r = evaluateCoupon(coupon({ discountPercent: 10 }), 999, NOW, false);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.discountAmount).toBe(100); // round(999*0.10)=100
      expect(r.finalAmount).toBe(899);
    }
  });

  it("cupón de 100% deja el monto final en 0", () => {
    const r = evaluateCoupon(coupon({ discountPercent: 100 }), 4990, NOW, false);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.finalAmount).toBe(0);
  });

  it("acota el porcentaje al rango 0-100", () => {
    const alto = evaluateCoupon(coupon({ discountPercent: 150 }), 1000, NOW, false);
    if (alto.ok) expect(alto.discountPercent).toBe(100);
    const bajo = evaluateCoupon(coupon({ discountPercent: -20 }), 1000, NOW, false);
    if (bajo.ok) { expect(bajo.discountPercent).toBe(0); expect(bajo.finalAmount).toBe(1000); }
  });
});
