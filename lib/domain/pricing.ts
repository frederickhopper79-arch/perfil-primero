export const PRICING = {
  // Fase lanzamiento
  workerActivationLaunch: 0,           // GRATIS durante lanzamiento
  companyContactUnlockLaunch: 4990,    // $4.990 CLP por contacto (lanzamiento)
  // Fase post-lanzamiento
  workerActivation: 999,               // $999 CLP por 30 días
  companyContactUnlock: 9990,          // $9.990 CLP por contacto
  companyUnlimitedPlan: 29990,         // $29.990 CLP/mes ilimitado
  // Meta
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
    name: "Exploración",
    priceMonthly: 0,
    cta: "Registrar empresa gratis",
    features: ["Búsqueda ilimitada de perfiles anónimos", "Enviar invitaciones sin costo", "Filtros por cargo, sector y región"],
    limits: { unlocks: 0, invitations: 30, teamMembers: 1 },
  },
  {
    id: "basic",
    name: "Por contacto",
    priceMonthly: PRICING.companyContactUnlockLaunch,
    cta: `Pagar por contacto`,
    features: [
      `$${PRICING.companyContactUnlockLaunch.toLocaleString("es-CL")} CLP por contacto (lanzamiento)`,
      `$${PRICING.companyContactUnlock.toLocaleString("es-CL")} CLP precio normal`,
      "Pagas solo cuando el postulante acepta",
      "Sin mensualidad ni permanencia",
    ],
    limits: { unlocks: 1, invitations: 30, teamMembers: 1 },
  },
  {
    id: "pro",
    name: "Ilimitado",
    priceMonthly: PRICING.companyUnlimitedPlan,
    cta: "Contratar plan ilimitado",
    highlighted: true,
    features: [
      "Contactos ilimitados por 30 días",
      "Sin costo extra por candidato",
      "Alertas automáticas de candidatos",
      "Soporte prioritario",
    ],
    limits: { unlocks: "unlimited", invitations: "unlimited", teamMembers: 3 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 0,
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
