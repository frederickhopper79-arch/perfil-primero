export const PRICING = {
  workerActivation: 0,
  companyContactUnlock: 9990,
  companyMonthlyPlan: 9990,
  companyMonthlyContacts: 5,
  companyUnlimitedPlan: 29990,
  omilProfileDays: 60,
  workerProfileDays: 30,
  maxCvBytes: 5 * 1024 * 1024,
  maxLogoBytes: 2 * 1024 * 1024,
  omilMonthlyQuota: 100,
} as const;

export function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

/** IVA Chile vigente */
export const IVA_RATE = 0.19;

/** Precio con IVA */
export function withIVA(price: number): number {
  return Math.round(price * (1 + IVA_RATE));
}

/** Precio neto sin IVA */
export function withoutIVA(price: number): number {
  return Math.round(price / (1 + IVA_RATE));
}

/** Monto de IVA */
export function ivaAmount(price: number): number {
  return withIVA(price) - price;
}

/** Descuento anual — precio mensual × 12 × (1 - pct%) */
export function annualPrice(monthlyPrice: number, discountPct = 20): number {
  return Math.round(monthlyPrice * 12 * (1 - discountPct / 100));
}

export type PlanId = "free" | "basic" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  cta: string;
  highlighted?: boolean;
  features: string[];
  limits: { unlocks: number | "unlimited"; invitations: number | "unlimited"; teamMembers: number };
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    priceMonthly: 0,
    cta: "Comenzar gratis",
    features: ["Búsqueda de perfiles anónimos", "Filtros básicos", "5 invitaciones/mes"],
    limits: { unlocks: 0, invitations: 5, teamMembers: 1 },
  },
  {
    id: "basic",
    name: "Básico",
    priceMonthly: PRICING.companyContactUnlock,
    cta: `Activar por ${formatCLP(PRICING.companyContactUnlock)}`,
    features: ["1 desbloqueo de contacto", "30 días de acceso", "Pago único sin suscripción"],
    limits: { unlocks: 1, invitations: 30, teamMembers: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: PRICING.companyMonthlyPlan,
    cta: "Contratar Pro",
    highlighted: true,
    features: [
      `${PRICING.companyMonthlyContacts} desbloqueos/mes`,
      "Invitaciones ilimitadas",
      "Filtros avanzados con IA",
      "Soporte prioritario",
    ],
    limits: { unlocks: PRICING.companyMonthlyContacts, invitations: "unlimited", teamMembers: 3 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: PRICING.companyUnlimitedPlan,
    cta: "Hablar con ventas",
    features: [
      "Desbloqueos ilimitados",
      "Hasta 5 reclutadores",
      "API de integración con ATS",
      "Reportes de mercado laboral",
      "SLA 99.9% garantizado",
    ],
    limits: { unlocks: "unlimited", invitations: "unlimited", teamMembers: 5 },
  },
];
