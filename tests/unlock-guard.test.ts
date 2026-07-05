import { describe, it, expect } from "vitest";
import { evaluateUnlock, type UnlockContext } from "../functions/src/lib/unlock-guard";

const NOW = 1_800_000_000_000;

function ctx(over: Partial<UnlockContext> = {}): UnlockContext {
  return {
    companyId: "company-1",
    invitationExists: true,
    invitation: { companyId: "company-1", status: "accepted", workerId: "worker-1" },
    invitationId: "inv-1",
    useUnlimitedPlan: false,
    paymentId: "pay-1",
    paymentExists: true,
    payment: { status: "paid", userId: "company-1", relatedInvitationId: "inv-1" },
    priorUnlockExists: false,
    unlimitedPlan: undefined,
    nowMillis: NOW,
    ...over,
  };
}

describe("evaluateUnlock — denegaciones", () => {
  it("sin sesión → unauthenticated", () => {
    const d = evaluateUnlock(ctx({ companyId: undefined }));
    expect(d.ok).toBe(false);
    if (!d.ok) expect(d.code).toBe("unauthenticated");
  });

  it("invitación inexistente o de otra empresa → permission-denied", () => {
    expect(evaluateUnlock(ctx({ invitationExists: false })).ok).toBe(false);
    const d = evaluateUnlock(ctx({ invitation: { companyId: "otra", status: "accepted" } }));
    if (!d.ok) expect(d.code).toBe("permission-denied");
  });

  it("invitación no aceptada → failed-precondition", () => {
    const d = evaluateUnlock(ctx({ invitation: { companyId: "company-1", status: "sent" } }));
    if (!d.ok) { expect(d.code).toBe("failed-precondition"); expect(d.reason).toMatch(/aceptada/i); }
  });

  it("sin paymentId (y sin plan) → invalid-argument", () => {
    const d = evaluateUnlock(ctx({ paymentId: "", paymentExists: false, payment: undefined }));
    if (!d.ok) expect(d.code).toBe("invalid-argument");
  });

  it("pago no confirmado → failed-precondition", () => {
    const d = evaluateUnlock(ctx({ payment: { status: "pending", userId: "company-1" } }));
    if (!d.ok) expect(d.reason).toMatch(/no está confirmado/i);
  });

  it("pago de otra empresa → permission-denied (anti-reuso de pago ajeno)", () => {
    const d = evaluateUnlock(ctx({ payment: { status: "paid", userId: "otra", relatedInvitationId: "inv-1" } }));
    if (!d.ok) { expect(d.code).toBe("permission-denied"); expect(d.reason).toMatch(/no pertenece/i); }
  });

  it("pago de otra invitación → failed-precondition", () => {
    const d = evaluateUnlock(ctx({ payment: { status: "paid", userId: "company-1", relatedInvitationId: "inv-OTRA" } }));
    if (!d.ok) expect(d.reason).toMatch(/otra invitación/i);
  });

  it("pago ya usado → failed-precondition (uso único)", () => {
    const d = evaluateUnlock(ctx({ priorUnlockExists: true }));
    if (!d.ok) expect(d.reason).toMatch(/ya fue utilizado/i);
  });

  it("plan ilimitado inactivo o vencido → failed-precondition", () => {
    expect(evaluateUnlock(ctx({ useUnlimitedPlan: true, unlimitedPlan: { active: false, renewsAtMillis: NOW + 1000 } })).ok).toBe(false);
    expect(evaluateUnlock(ctx({ useUnlimitedPlan: true, unlimitedPlan: { active: true, renewsAtMillis: NOW - 1000 } })).ok).toBe(false);
  });
});

describe("evaluateUnlock — permitidos", () => {
  it("pago válido, propio, de la invitación y no usado → ok", () => {
    const d = evaluateUnlock(ctx());
    expect(d.ok).toBe(true);
    if (d.ok) { expect(d.resolvedPaymentId).toBe("pay-1"); expect(d.usedUnlimitedPlan).toBe(false); }
  });

  it("pago sin relatedInvitationId (genérico) → ok", () => {
    const d = evaluateUnlock(ctx({ payment: { status: "paid", userId: "company-1", relatedInvitationId: null } }));
    expect(d.ok).toBe(true);
  });

  it("plan ilimitado vigente → ok con paymentId virtual", () => {
    const d = evaluateUnlock(ctx({ useUnlimitedPlan: true, unlimitedPlan: { active: true, renewsAtMillis: NOW + 1000 } }));
    expect(d.ok).toBe(true);
    if (d.ok) { expect(d.usedUnlimitedPlan).toBe(true); expect(d.resolvedPaymentId).toMatch(/^unlimited:/); }
  });
});
