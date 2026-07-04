// Lógica pura de validación y cálculo de cupones — sin Firestore, testable.

export interface CouponData {
  active?: boolean;
  expiresAt?: Date | null;
  maxUses?: number;
  usedCount?: number;
  maxTotalUses?: number;
  discountPercent?: number;
}

export type CouponResult =
  | { ok: false; reason: string }
  | { ok: true; discountPercent: number; discountAmount: number; finalAmount: number };

/**
 * Evalúa un cupón contra el monto base. Determinista: recibe los datos del
 * cupón, el "ahora" y si el usuario ya lo usó (ambos resueltos por el caller
 * contra Firestore). Devuelve el descuento o el motivo de rechazo.
 */
export function evaluateCoupon(
  data: CouponData | undefined,
  baseAmount: number,
  now: Date,
  alreadyUsedByUser: boolean
): CouponResult {
  if (!data || !data.active) {
    return { ok: false, reason: "Cupón inválido o inactivo." };
  }
  if (!data.expiresAt) {
    return { ok: false, reason: "El cupón no tiene fecha de expiración válida." };
  }
  if (data.expiresAt.getTime() < now.getTime()) {
    return { ok: false, reason: "El cupón está vencido." };
  }
  if (Number(data.maxUses ?? 0) > 0 && Number(data.usedCount ?? 0) >= Number(data.maxUses)) {
    return { ok: false, reason: "El cupón ya alcanzó su límite de uso." };
  }
  if (alreadyUsedByUser) {
    return { ok: false, reason: "Este usuario ya usó este cupón." };
  }
  if (Number(data.maxTotalUses ?? 0) > 0 && Number(data.usedCount ?? 0) >= Number(data.maxTotalUses)) {
    return { ok: false, reason: "El cupón ya alcanzó su límite total de usos." };
  }

  const discountPercent = Math.max(0, Math.min(Number(data.discountPercent ?? 0), 100));
  const rawDiscountAmount = Math.round(baseAmount * (discountPercent / 100));
  const finalAmount = Math.max(baseAmount - rawDiscountAmount, 0);
  const discountAmount = baseAmount - finalAmount;

  return { ok: true, discountPercent, discountAmount, finalAmount };
}
