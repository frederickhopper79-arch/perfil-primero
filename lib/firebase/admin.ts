import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { functions, storage } from "./client";
import type { CompanyProfile, CompanyVerificationStatus } from "@/lib/domain/types";

export type AdminDashboard = {
  summary: {
    companiesTotal: number;
    workersTotal: number;
    paymentsTotal: number;
    paymentsPaid: number;
    paymentsPending: number;
    revenuePaidClp: number;
    accountingPending: number;
    couponsActive: number;
    interviewsScheduled: number;
    reviewsTotal: number;
    reviewAverage: number;
    auditEventsTotal: number;
    securityAlerts: number;
    companyStatusCounts: Record<string, number>;
    paymentStatusCounts: Record<string, number>;
    invitationStatusCounts: Record<string, number>;
    userRoleCounts: Record<string, number>;
    workerVisibilityCounts: Record<string, number>;
    offerStatusCounts: Record<string, number>;
    usersTotal: number;
    jobOffersTotal: number;
    jobOffersVisible: number;
    messagesTotal: number;
    contactUnlocksTotal: number;
    emailRemindersTotal: number;
    marketReportsTotal: number;
  };
  companies: Array<Record<string, unknown>>;
  workers: Array<Record<string, unknown>>;
  privateWorkers: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  jobOffers: Array<Record<string, unknown>>;
  messages: Array<Record<string, unknown>>;
  contactUnlocks: Array<Record<string, unknown>>;
  emailReminders: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  accountingEntries: Array<Record<string, unknown>>;
  coupons: Array<Record<string, unknown>>;
  couponUsages: Array<Record<string, unknown>>;
  interviews: Array<Record<string, unknown>>;
  reviews: Array<Record<string, unknown>>;
  auditEvents: Array<Record<string, unknown>>;
  invitations: Array<Record<string, unknown>>;
  securityAlerts: Array<Record<string, unknown>>;
  marketAnalyticsReports: Array<Record<string, unknown>>;
  reports: {
    financial: Record<string, number>;
    operations: Record<string, number>;
    conversion: Record<string, number>;
    risk: Record<string, number>;
  };
  pagination?: {
    pageSize: number;
    from: string;
    to: string;
    nextCursors: Record<string, string>;
  };
};

export async function listCompaniesForReview() {
  const callable = httpsCallable(functions, "listCompaniesForReview");
  const result = await callable();
  return result.data as { companies: CompanyProfile[] };
}

export async function updateCompanyVerification(input: {
  companyId: string;
  status: Extract<CompanyVerificationStatus, "verified" | "rejected" | "suspended">;
  notes: string;
}) {
  const callable = httpsCallable(functions, "updateCompanyVerification");
  const result = await callable(input);
  return result.data as { companyId: string; status: CompanyVerificationStatus };
}

export async function uploadMunicipalityLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `municipality-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function createManagedUser(input: {
  email: string;
  password: string;
  role: "worker" | "company" | "admin" | "omil";
  status?: "active" | "suspended";
  omilMetadata?: {
    municipalityName: string;
    contactPersonName: string;
    contactPersonRut: string;
    contactPersonRole: string;
    municipalityLogoUrl?: string;
  };
}) {
  const callable = httpsCallable(functions, "createManagedUser");
  const result = await callable(input);
  return result.data as {
    userId: string;
    email: string;
    role: "worker" | "company" | "admin" | "omil";
    status: "active" | "suspended";
  };
}

export async function exportAccountingCsv() {
  const callable = httpsCallable(functions, "exportAccountingCsv");
  const result = await callable();
  return result.data as {
    filename: string;
    contentType: string;
    csv: string;
  };
}

export async function generateMarketAnalyticsNow() {
  const callable = httpsCallable(functions, "generateMarketAnalyticsNow");
  const result = await callable();
  return result.data as Record<string, unknown>;
}

export async function updateBillingDocument(input: {
  paymentId: string;
  folioSii?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  siiStatus: "pending_provider" | "issued" | "accepted" | "rejected" | "manual_transfer_pending" | "manual_transfer_paid";
  notes?: string;
}) {
  const callable = httpsCallable(functions, "updateBillingDocument");
  const result = await callable(input);
  return result.data as { paymentId: string; siiStatus: string };
}

export async function approveManualTransfer(input: {
  paymentId: string;
  bankReference: string;
  paidAt?: string;
  notes?: string;
}) {
  const callable = httpsCallable(functions, "approveManualTransfer");
  const result = await callable(input);
  return result.data as { paymentId: string; status: string };
}

export async function adminSearchUser(query: string) {
  const callable = httpsCallable(functions, "adminSearchUser");
  const result = await callable({ query });
  return result.data as {
    uid: string;
    email: string;
    displayName: string;
    disabled: boolean;
    emailVerified: boolean;
    creationTime: string;
    lastSignInTime: string;
    role: string | null;
    status: string | null;
    managedByAdmin: boolean;
  };
}

export async function adminUpdateUser(input: {
  uid: string;
  role?: "worker" | "company" | "admin" | "omil";
  status?: "active" | "suspended";
}) {
  const callable = httpsCallable(functions, "adminUpdateUser");
  const result = await callable(input);
  return result.data as { uid: string };
}

export async function createCoupon(input: {
  code: string;
  name: string;
  discountPercent: number;
  maxUses: number;
  expiresAt: string;
}) {
  const callable = httpsCallable(functions, "createCoupon");
  const result = await callable(input);
  return result.data as { couponCode: string };
}

export async function getAdminDashboard(input?: {
  pageSize?: number;
  from?: string;
  to?: string;
  cursors?: Record<string, string>;
}) {
  const callable = httpsCallable(functions, "getAdminDashboard");
  const result = await callable(input ?? {});
  return result.data as AdminDashboard;
}

// ── Semáforo financiero ──────────────────────────────────────────────────────
export interface FinancialCostItem { nombre: string; montoClp: number }

export interface FinancialHealthData {
  semaforo: "verde" | "amarillo" | "rojo";
  razones: string[];
  recomendaciones: string[];
  mes: string;
  resumen: {
    ingresoBruto: number;
    pagosConfirmados: number;
    ivaDebito: number;
    ingresoNeto: number;
    comisionMp: number;
    costosFijos: number;
    costosTotales: number;
    utilidadAntesImpuesto: number;
    impuestoPrimeraCategoria: number;
    utilidadNeta: number;
    margenPct: number | null;
    burnMensual: number;
    runwayMeses: number | null;
    variacionPct: number | null;
  };
  historial: Array<{ label: string; bruto: number; pagos: number }>;
  config: {
    costosMensualesClp: FinancialCostItem[];
    comisionMpPct: number;
    ivaPct: number;
    primeraCategoriaPct: number;
    cajaDisponibleClp: number;
    margenObjetivoPct: number;
  };
  generadoEl: string;
}

export async function getFinancialHealth() {
  const callable = httpsCallable(functions, "getFinancialHealth");
  const result = await callable({});
  return result.data as FinancialHealthData;
}

export async function updateFinancialConfig(input: {
  costosMensualesClp?: FinancialCostItem[];
  comisionMpPct?: number;
  ivaPct?: number;
  primeraCategoriaPct?: number;
  cajaDisponibleClp?: number;
  margenObjetivoPct?: number;
}) {
  const callable = httpsCallable(functions, "updateFinancialConfig");
  const result = await callable(input);
  return result.data as { ok: boolean };
}
