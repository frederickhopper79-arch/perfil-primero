// Guarda pura del desbloqueo de contacto — decide permitir/denegar a partir de
// datos ya resueltos por el caller (Firestore). Sin dependencias de Firestore.

export interface UnlockInvitation { companyId?: string; status?: string; workerId?: string }
export interface UnlockPayment { status?: string; userId?: string; relatedInvitationId?: string | null }
export interface UnlockUnlimitedPlan { active?: boolean; renewsAtMillis?: number | null }

export type UnlockCode =
  | "unauthenticated" | "permission-denied" | "failed-precondition" | "invalid-argument";

export type UnlockDecision =
  | { ok: true; resolvedPaymentId: string; usedUnlimitedPlan: boolean }
  | { ok: false; code: UnlockCode; reason: string };

export interface UnlockContext {
  companyId: string | undefined;
  invitationExists: boolean;
  invitation: UnlockInvitation | undefined;
  invitationId: string;
  useUnlimitedPlan: boolean;
  paymentId: string;              // request.data.paymentId ?? ""
  paymentExists: boolean;
  payment: UnlockPayment | undefined;
  priorUnlockExists: boolean;     // ya existe un unlock con ese paymentId
  unlimitedPlan: UnlockUnlimitedPlan | undefined;
  nowMillis: number;
}

/**
 * Determina si una empresa puede desbloquear el contacto de una invitación.
 * Reglas: invitación propia y aceptada; y (a) plan ilimitado vigente, o
 * (b) pago confirmado, propio, correspondiente a la invitación y no usado antes.
 */
export function evaluateUnlock(ctx: UnlockContext): UnlockDecision {
  if (!ctx.companyId) {
    return { ok: false, code: "unauthenticated", reason: "Debes iniciar sesión." };
  }
  if (!ctx.invitationExists || ctx.invitation?.companyId !== ctx.companyId) {
    return { ok: false, code: "permission-denied", reason: "No puedes desbloquear este contacto." };
  }
  if (ctx.invitation?.status !== "accepted") {
    return { ok: false, code: "failed-precondition", reason: "La invitación debe estar aceptada." };
  }

  if (ctx.useUnlimitedPlan) {
    const plan = ctx.unlimitedPlan;
    if (!plan?.active || !plan.renewsAtMillis || plan.renewsAtMillis <= ctx.nowMillis) {
      return { ok: false, code: "failed-precondition", reason: "No tienes un plan ilimitado activo." };
    }
    return { ok: true, resolvedPaymentId: `unlimited:${plan.renewsAtMillis}`, usedUnlimitedPlan: true };
  }

  if (!ctx.paymentId) {
    return { ok: false, code: "invalid-argument", reason: "Se requiere paymentId." };
  }
  if (!ctx.paymentExists || ctx.payment?.status !== "paid") {
    return { ok: false, code: "failed-precondition", reason: "El pago no está confirmado." };
  }
  if (ctx.payment?.userId !== ctx.companyId) {
    return { ok: false, code: "permission-denied", reason: "El pago no pertenece a tu empresa." };
  }
  if (ctx.payment?.relatedInvitationId && ctx.payment.relatedInvitationId !== ctx.invitationId) {
    return { ok: false, code: "failed-precondition", reason: "El pago corresponde a otra invitación." };
  }
  if (ctx.priorUnlockExists) {
    return { ok: false, code: "failed-precondition", reason: "Este pago ya fue utilizado para desbloquear un contacto." };
  }

  return { ok: true, resolvedPaymentId: ctx.paymentId, usedUnlimitedPlan: false };
}
