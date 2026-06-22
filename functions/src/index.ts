import * as crypto from "crypto";
import * as webpush from "web-push";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import type { CallableOptions } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import Stripe from "stripe";
import { GoogleGenAI, Type } from "@google/genai";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
import MercadoPagoConfig, { Payment, Preference } from "mercadopago";

initializeApp();

const db = getFirestore();
const appUrl = process.env.APP_URL ?? "https://perfil-primero.web.app";
const launchPriceClp = 999;

// Opciones de runtime para funciones de alta frecuencia
export const CALL_OPTS_FAST: CallableOptions = { timeoutSeconds: 30, memory: "256MiB", minInstances: 0 };
export const CALL_OPTS_HEAVY: CallableOptions = { timeoutSeconds: 120, memory: "512MiB", minInstances: 0 };

// ── Structured logger ─────────────────────────────────────────────────────
export function log(severity: "INFO" | "WARNING" | "ERROR", msg: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ severity, message: msg, ...data, timestamp: new Date().toISOString() }));
}

// ── Input sanitizer ───────────────────────────────────────────────────────
export function sanitize(input: unknown, maxLen = 2000): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").slice(0, maxLen).trim();
}

// ── Typed error helpers ───────────────────────────────────────────────────
export function assertString(val: unknown, field: string): string {
  if (typeof val !== "string" || !val.trim()) throw new HttpsError("invalid-argument", `${field} es requerido.`);
  return sanitize(val);
}

export function assertPositiveInt(val: unknown, field: string): number {
  const n = Number(val);
  if (!Number.isInteger(n) || n <= 0) throw new HttpsError("invalid-argument", `${field} debe ser un número entero positivo.`);
  return n;
}

// ── Validación RUT chileno (módulo 11) ────────────────────────────────────
function validateRutCl(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 8) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return dv === expected;
}

// ── Rate limiting in-memory (por UID) ─────────────────────────────────────
const _rateLimitStore = new Map<string, number[]>();
function checkRateLimit(uid: string, key: string, maxRequests: number, windowMs: number): void {
  const storeKey = `${uid}:${key}`;
  const now = Date.now();
  const timestamps = (_rateLimitStore.get(storeKey) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    throw new HttpsError("resource-exhausted", "Demasiadas solicitudes. Espera un momento antes de intentarlo nuevamente.");
  }
  _rateLimitStore.set(storeKey, [...timestamps, now]);
}

// ── Mercado Pago: validar firma x-signature ───────────────────────────────
function validateMercadoPagoSignature(
  request: { headers: Record<string, string | string[] | undefined>; query: Record<string, string | string[] | undefined> }
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("MERCADOPAGO_WEBHOOK_SECRET no configurado — rechazando webhook por seguridad");
    return false;
  }
  const xSignature = String(request.headers["x-signature"] ?? "");
  const xRequestId = String(request.headers["x-request-id"] ?? "");
  const dataId = String(request.query["data.id"] ?? "");
  if (!xSignature || !xRequestId) return false;
  const parts = xSignature.split(",");
  const tsPart = parts.find(p => p.startsWith("ts="))?.split("=")[1] ?? "";
  const v1Part = parts.find(p => p.startsWith("v1="))?.split("=")[1] ?? "";
  if (!tsPart || !v1Part) return false;
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${tsPart};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1Part));
}

type CreateInvitationInput = {
  workerId: string;
  jobOfferId?: string;
  opportunityTitle: string;
  opportunitySummary: string;
  salaryMin: number;
  salaryMax: number;
  currency: "USD" | "CLP";
  workMode: "remote" | "hybrid" | "onsite";
  location: string;
  contractType: "full_time" | "part_time" | "contractor" | "temporary";
  message: string;
  decisionDeadline?: string;
};

type ScheduleInterviewInput = {
  invitationId: string;
  startsAt: string;
  durationMinutes?: number;
};

type ReviewInput = {
  invitationId: string;
  targetRole: "company" | "worker";
  score: number;
  comment: string;
  attendedInPerson?: boolean;
};

type CouponValidation = {
  couponCode: string;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
};

type CheckoutCouponInput = {
  couponCode?: string;
};

type AdminDashboardInput = {
  pageSize?: number;
  from?: string;
  to?: string;
  cursors?: Record<string, string>;
};

type BillingDocumentInput = {
  paymentId: string;
  folioSii?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  siiStatus: "pending_provider" | "issued" | "accepted" | "rejected" | "manual_transfer_pending" | "manual_transfer_paid";
  notes?: string;
};

type ManualTransferApprovalInput = {
  paymentId: string;
  bankReference: string;
  paidAt?: string;
  notes?: string;
};

type AdminCompanyStatus = "verified" | "rejected" | "suspended";

type JsonSchema = Record<string, unknown>;
type ManagedUserRole = "worker" | "company" | "admin" | "omil";
const invitationFlowStatuses = ["sent", "accepted", "in_process", "offer_sent", "hired", "closed", "rejected"] as const;

type PricingConfig = {
  launchPhaseActive: boolean;
  workerSubscriptionClp: number;
  companyContactClp: number;
  workerRegularClp: number;
  companyRegularClp: number;
};

async function assertAdmin(uid?: string) {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const user = await db.collection("users").doc(uid).get();

  if (!user.exists || user.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "No tienes permisos de administrador.");
  }

  return uid;
}

export const listCompaniesForReview = onCall(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const snap = await db
    .collection("companyProfiles")
    .where("verificationStatus", "in", ["pending", "rejected", "suspended", "verified"])
    .limit(80)
    .get();

  await writeAudit(adminId, "admin", "company_review_queue_opened", "company", "all", {
    count: String(snap.size)
  });

  return {
    companies: snap.docs.map((doc) => doc.data())
  };
});

export const updateCompanyVerification = onCall<{
  companyId: string;
  status: AdminCompanyStatus;
  notes?: string;
}>(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const { companyId, status, notes } = request.data;

  if (!companyId || !["verified", "rejected", "suspended"].includes(status)) {
    throw new HttpsError("invalid-argument", "Estado de empresa inválido.");
  }

  const companyRef = db.collection("companyProfiles").doc(companyId);
  const company = await companyRef.get();

  if (!company.exists) {
    throw new HttpsError("not-found", "La empresa no existe.");
  }

  const trialUpdate =
    status === "verified"
      ? {
          "monthlyPlan.active": true,
          "monthlyPlan.contactCreditsTotal": 3,
          "monthlyPlan.contactCreditsUsed": 0,
          "monthlyPlan.trial": true,
          "monthlyPlan.activatedAt": FieldValue.serverTimestamp(),
          "monthlyPlan.renewsAt": Timestamp.fromDate(
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          )
        }
      : {};

  await companyRef.set(
    {
      verificationStatus: status,
      verificationNotes: notes ?? "",
      verifiedAt: status === "verified" ? FieldValue.serverTimestamp() : null,
      rejectedAt: status === "rejected" ? FieldValue.serverTimestamp() : null,
      suspendedAt: status === "suspended" ? FieldValue.serverTimestamp() : null,
      reviewedBy: adminId,
      updatedAt: FieldValue.serverTimestamp(),
      ...trialUpdate
    },
    { merge: true }
  );

  if (status === "verified") {
    const companyData = company.data();
    const email: string | undefined = companyData?.contactEmail ?? companyData?.email;
    if (email) {
      await sendEmail(
        email,
        "¡Tu empresa fue verificada en Perfil Primero!",
        `<p>Hola equipo de <strong>${companyData?.companyName ?? "tu empresa"}</strong>,</p>
         <p>Tu empresa fue <strong>verificada</strong>. Ya puedes buscar postulantes y enviar invitaciones.</p>
         <p>Como regalo de bienvenida, tienes <strong>30 días de plan mensual gratis</strong> con 3 créditos de contacto incluidos.</p>
         <p><a href="${appUrl}/empresa" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Buscar talento ahora →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );
    }
  }

  await writeAudit(adminId, "admin", `company_${status}`, "company", companyId, {
    companyId,
    status
  });

  return { companyId, status };
});

export const createManagedUser = onCall<{
  email: string;
  password: string;
  role: ManagedUserRole;
  status?: "active" | "suspended";
  omilMetadata?: {
    municipalityName: string;
    contactPersonName: string;
    contactPersonRut: string;
    contactPersonRole: string;
    municipalityLogoUrl?: string;
  };
}>(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const { email, password, role, status, omilMetadata } = request.data;

  if (!email || !password || password.length < 6 || !["worker", "company", "admin", "omil"].includes(role)) {
    throw new HttpsError("invalid-argument", "Email, contraseña y rol son obligatorios.");
  }

  if (role === "omil") {
    if (!omilMetadata?.municipalityName || !omilMetadata?.contactPersonName ||
        !omilMetadata?.contactPersonRut || !omilMetadata?.contactPersonRole) {
      throw new HttpsError("invalid-argument", "Municipalidad, persona a cargo, RUT y cargo son obligatorios para cuentas OMIL.");
    }
    if (!validateRutCl(omilMetadata.contactPersonRut)) {
      throw new HttpsError("invalid-argument", "RUT inválido. Verifica el dígito verificador.");
    }
  }

  let userId = "";

  try {
    const user = await getAuth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: status === "suspended"
    });
    userId = user.uid;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "auth/email-already-exists") {
      throw new HttpsError("internal", error instanceof Error ? error.message : "No se pudo crear el usuario.");
    }
    const existing = await getAuth().getUserByEmail(email);
    userId = existing.uid;
    await getAuth().updateUser(userId, {
      password,
      disabled: status === "suspended"
    });
  }

  const userDoc: Record<string, unknown> = {
    email,
    role,
    status: status ?? "active",
    managedByAdmin: true,
    billingExempt: role === "omil",
    canCreateUnlimitedPostulants: role === "omil",
    createdBy: adminId,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  };

  if (role === "omil" && omilMetadata) {
    userDoc.omil = {
      municipalityName: omilMetadata.municipalityName.trim(),
      contactPersonName: omilMetadata.contactPersonName.trim(),
      contactPersonRut: omilMetadata.contactPersonRut.trim().toUpperCase(),
      contactPersonRole: omilMetadata.contactPersonRole.trim(),
      ...(omilMetadata.municipalityLogoUrl ? { municipalityLogoUrl: omilMetadata.municipalityLogoUrl } : {})
    };
  }

  await db.collection("users").doc(userId).set(userDoc, { merge: true });

  await writeAudit(adminId, "admin", "managed_user_created", "user", userId, {
    email,
    role,
    ...(role === "omil" && omilMetadata ? { municipality: omilMetadata.municipalityName } : {})
  });

  return { userId, email, role, status: status ?? "active" };
});

export const createOmilPostulantProfile = onCall<{
  legalName: string;
  email: string;
  phone?: string;
  headline: string;
  summary: string;
  skills: string[];
  area: string;
  region: string;
  city: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  workMode?: "remote" | "hybrid" | "onsite";
}>(async (request) => {
  const omilId = request.auth?.uid;

  if (!omilId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion como OMIL.");
  }

  const omilUser = await db.collection("users").doc(omilId).get();

  if (!omilUser.exists || omilUser.data()?.role !== "omil" || omilUser.data()?.status === "suspended") {
    throw new HttpsError("permission-denied", "Esta cuenta no esta habilitada como OMIL.");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const omilMonthlyCount = await db.collection("workerPublicProfiles")
    .where("createdByOmilId", "==", omilId)
    .where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
    .where("createdAt", "<", Timestamp.fromDate(startOfNextMonth))
    .count()
    .get();
  if (omilMonthlyCount.data().count >= 100) {
    throw new HttpsError("resource-exhausted", "Has alcanzado el límite de 100 perfiles por mes para esta OMIL.");
  }

  const data = request.data;
  const legalName = String(data.legalName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const headline = String(data.headline ?? "").trim();
  const area = String(data.area ?? "").trim();
  const region = String(data.region ?? "").trim();
  const city = String(data.city ?? "").trim();

  if (!legalName || !email || !headline || !area || !region || !city) {
    throw new HttpsError("invalid-argument", "Nombre, email, cargo, área, región y comuna son obligatorios.");
  }

  const workerRef = db.collection("workerPublicProfiles").doc();
  const OMIL_DAYS = 60;
  const profileExpiresAt = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * OMIL_DAYS);
  const preExpiryReminderAt = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * (OMIL_DAYS - 7));
  const cleanSkills = Array.isArray(data.skills)
    ? data.skills.map((skill) => String(skill).trim()).filter(Boolean).slice(0, 12)
    : [];

  await workerRef.set({
    workerId: workerRef.id,
    profileCode: `OMIL-${workerRef.id.slice(0, 5).toUpperCase()}`,
    displayName: headline,
    headline,
    summary: String(data.summary ?? "").slice(0, 900),
    skills: cleanSkills,
    sectors: [area],
    experienceLevel: "mid",
    yearsOfExperience: 0,
    region,
    city,
    workModes: [data.workMode ?? "onsite"],
    expectedSalaryMin: Number(data.expectedSalaryMin ?? 0),
    expectedSalaryMax: Number(data.expectedSalaryMax ?? 0),
    currency: "CLP",
    availability: "actively_looking",
    visibilityStatus: "visible",
    subscriptionStatus: "active",
    profileSource: "omil",
    createdByOmilId: omilId,
    billingExempt: true,
    profileExpiresAt,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await db.collection("workerPrivateProfiles").doc(workerRef.id).set({
    workerId: workerRef.id,
    legalName,
    preferredName: legalName.split(" ")[0] ?? "",
    email,
    phone: String(data.phone ?? ""),
    profileSource: "omil",
    createdByOmilId: omilId,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("emailReminders").doc(`omil-preexpiry-${workerRef.id}`).set({
    reminderId: `omil-preexpiry-${workerRef.id}`,
    workerId: workerRef.id,
    omilId,
    targetEmail: email,
    status: "queued",
    type: "omil_pre_expiry",
    sendAt: preExpiryReminderAt,
    profileExpiresAt,
    createdAt: FieldValue.serverTimestamp()
  });

  await writeAudit(omilId, "omil", "omil_postulant_profile_created", "worker", workerRef.id, {
    email,
    profileExpiresAt: profileExpiresAt.toDate().toISOString()
  });

  return {
    workerId: workerRef.id,
    profileCode: `OMIL-${workerRef.id.slice(0, 5).toUpperCase()}`,
    profileExpiresAt: profileExpiresAt.toDate().toISOString()
  };
});

export const expireOmilProfiles = onSchedule(
  {
    schedule: "every day 02:15",
    timeZone: "America/Santiago",
    region: "us-central1"
  },
  async () => {
    const now = Timestamp.now();
    const snap = await db
      .collection("workerPublicProfiles")
      .where("profileSource", "==", "omil")
      .where("visibilityStatus", "==", "visible")
      .where("profileExpiresAt", "<=", now)
      .limit(200)
      .get();

    if (snap.empty) {
      return;
    }

    const batch = db.batch();

    snap.docs.forEach((doc) => {
      // Convierte a postulante normal: elimina flags OMIL para que pueda pagar como cualquier worker
      batch.set(
        doc.ref,
        {
          visibilityStatus: "expired",
          subscriptionStatus: "expired",
          profileSource: "worker",
          billingExempt: false,
          createdByOmilId: FieldValue.delete(),
          omilConvertedAt: FieldValue.serverTimestamp(),
          expiredAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      const privateRef = db.collection("workerPrivateProfiles").doc(doc.id);
      batch.set(privateRef, {
        profileSource: "worker",
        createdByOmilId: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();

    await writeAudit("system", "admin", "omil_profiles_expired", "worker", "bulk", {
      count: String(snap.size)
    });
  }
);

export const sendOmilPreExpiryReminders = onSchedule(
  {
    schedule: "every day 09:00",
    timeZone: "America/Santiago",
    region: "us-central1"
  },
  async () => {
    const now = Timestamp.now();
    // Busca recordatorios OMIL pendientes cuyo sendAt ya llegó
    const remSnap = await db.collection("emailReminders")
      .where("type", "==", "omil_pre_expiry")
      .where("status", "==", "queued")
      .where("sendAt", "<=", now)
      .limit(200)
      .get();

    if (remSnap.empty) return;

    for (const remDoc of remSnap.docs) {
      const rem = remDoc.data();
      const email: string | undefined = rem.targetEmail;
      if (!email) continue;

      const expiresAt: Timestamp | undefined = rem.profileExpiresAt;
      const expiresDate = expiresAt ? expiresAt.toDate().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" }) : "pronto";

      try {
        await sendEmail(
          email,
          "⏰ Tu perfil gratuito OMIL vence en 7 días — activa tu suscripción para seguir visible",
          `<p>Hola,</p>
           <p>Tu perfil laboral publicado a través de la OMIL <strong>vence el ${expiresDate}</strong>.</p>
           <p>Cuando venza, tu perfil dejará de aparecer en las búsquedas de empresas. Si quieres seguir visible en <strong>Perfil Primero</strong>, solo necesitas activar tu propia suscripción mensual por <strong>$999 CLP</strong> — igual que cualquier otro postulante.</p>
           <p><a href="${appUrl}/postulante" style="background:#0055ff;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:12px 0">Activar mi suscripción →</a></p>
           <p>Si no deseas continuar, no necesitas hacer nada — tu perfil se desactivará automáticamente al vencer.</p>
           <p>— Equipo Perfil Primero</p>`
        );

        await remDoc.ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp() });
      } catch {
        await remDoc.ref.update({ status: "error_sending", updatedAt: FieldValue.serverTimestamp() });
      }
    }
  }
);

export const generateMarketAnalyticsReport = onSchedule(
  {
    schedule: "every monday 06:00",
    timeZone: "America/Santiago",
    region: "us-central1"
  },
  async () => {
    await createMarketAnalyticsReport("weekly_schedule", "system");
  }
);

export const generateMarketAnalyticsNow = onCall(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const report = await createMarketAnalyticsReport("manual_admin", adminId);
  return report;
});

export const getPublicPricingConfig = onCall(async () => {
  return await getPricingConfig();
});

export const updateBillingDocument = onCall<BillingDocumentInput>(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const { paymentId, folioSii, pdfUrl, xmlUrl, siiStatus, notes } = request.data;

  if (!paymentId || !siiStatus) {
    throw new HttpsError("invalid-argument", "paymentId y estado SII son obligatorios.");
  }

  const entryRef = db.collection("accountingEntries").doc(paymentId);
  const entry = await entryRef.get();

  if (!entry.exists) {
    throw new HttpsError("not-found", "No existe asiento contable para ese pago.");
  }

  await entryRef.set(
    {
      folioSii: folioSii ?? entry.data()?.folioSii ?? null,
      pdfUrl: pdfUrl ?? entry.data()?.pdfUrl ?? null,
      xmlUrl: xmlUrl ?? entry.data()?.xmlUrl ?? null,
      siiStatus,
      billingNotes: notes ?? "",
      billingReviewedBy: adminId,
      billingReviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await writeAudit(adminId, "admin", "billing_document_updated", "accounting", paymentId, {
    paymentId,
    siiStatus,
    folioSii: folioSii ?? ""
  });

  return { paymentId, siiStatus };
});

export const approveManualTransfer = onCall<ManualTransferApprovalInput>(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const { paymentId, bankReference, paidAt, notes } = request.data;

  if (!paymentId || !bankReference) {
    throw new HttpsError("invalid-argument", "paymentId y referencia bancaria son obligatorios.");
  }

  const entryRef = db.collection("accountingEntries").doc(paymentId);
  const paymentRef = db.collection("payments").doc(paymentId);
  const [entry, payment] = await Promise.all([entryRef.get(), paymentRef.get()]);

  if (!entry.exists || !payment.exists) {
    throw new HttpsError("not-found", "No existe pago/asiento para aprobar transferencia.");
  }

  const transferDate = paidAt ? Timestamp.fromDate(new Date(paidAt)) : FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    transaction.set(paymentRef, {
      status: "paid",
      provider: "manual_transfer",
      providerPaymentId: bankReference,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    transaction.set(entryRef, {
      source: "manual_transfer",
      status: "paid_manual_transfer",
      siiStatus: "manual_transfer_paid",
      bankReference,
      paidAt: transferDate,
      manualApprovalNotes: notes ?? "",
      manualApprovedBy: adminId,
      manualApprovedAt: FieldValue.serverTimestamp(),
      glosaContable: `Abono manual por transferencia bancaria - Pago ${paymentId} - Referencia banco: ${bankReference}`,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });

  await writeAudit(adminId, "admin", "manual_transfer_approved", "accounting", paymentId, {
    paymentId,
    bankReference
  });

  return { paymentId, status: "paid_manual_transfer" };
});

export const exportAccountingCsv = onCall(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const snap = await db
    .collection("accountingEntries")
    .orderBy("createdAt", "desc")
    .limit(1000)
    .get();

  const header = [
    "Fecha",
    "Payment ID",
    "Proveedor Pago",
    "Tipo",
    "Moneda",
    "Monto Bruto",
    "Neto",
    "IVA 19%",
    "Comision MP Estimada",
    "Folio SII",
    "PDF",
    "XML",
    "Estado"
  ];
  const rows = snap.docs.map((doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.().toISOString?.() ?? "";
    return [
      createdAt,
      data.paymentId ?? doc.id,
      data.providerPaymentId ?? "",
      data.paymentType ?? "",
      data.currency ?? "CLP",
      data.grossAmount ?? "",
      data.netRevenue ?? "",
      data.ivaDebitoFiscal ?? "",
      data.estimatedMercadoPagoCommission ?? "",
      data.folioSii ?? "",
      data.pdfUrl ?? "",
      data.xmlUrl ?? "",
      data.status ?? ""
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((value) => csvCell(value)).join(";"))
    .join("\n");

  await writeAudit(adminId, "admin", "accounting_csv_exported", "accounting", "all", {
    count: String(rows.length)
  });

  return {
    filename: `cartola_contable_perfil_primero_${new Date().toISOString().slice(0, 10)}.csv`,
    contentType: "text/csv; charset=utf-8",
    csv
  };
});

export const getAdminDashboard = onCall<AdminDashboardInput | undefined>(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const pageSize = Math.max(25, Math.min(500, Number(request.data?.pageSize ?? 250)));
  const from = request.data?.from ? Timestamp.fromDate(new Date(request.data.from)) : null;
  const to = request.data?.to ? Timestamp.fromDate(new Date(request.data.to)) : null;
  const cursors = request.data?.cursors ?? {};

  const [
    companiesSnap,
    paymentsSnap,
    accountingSnap,
    couponsSnap,
    couponUsagesSnap,
    interviewsSnap,
    reviewsSnap,
    auditSnap,
    invitationsSnap,
    workersSnap,
    privateWorkersSnap,
    usersSnap,
    offersSnap,
    messagesSnap,
    unlocksSnap,
    remindersSnap,
    marketReportsSnap
  ] = await Promise.all([
    getAdminCollectionPage("companyProfiles", pageSize, from, to, cursors.companyProfiles),
    getAdminCollectionPage("payments", pageSize, from, to, cursors.payments),
    getAdminCollectionPage("accountingEntries", pageSize, from, to, cursors.accountingEntries),
    getAdminCollectionPage("coupons", Math.min(pageSize, 250), from, to, cursors.coupons),
    getAdminCollectionPage("couponUsages", pageSize, from, to, cursors.couponUsages),
    getAdminCollectionPage("scheduledInterviews", pageSize, from, to, cursors.scheduledInterviews),
    getAdminCollectionPage("platformReviews", pageSize, from, to, cursors.platformReviews),
    getAdminCollectionPage("auditEvents", pageSize, from, to, cursors.auditEvents),
    getAdminCollectionPage("invitations", pageSize, from, to, cursors.invitations),
    getAdminCollectionPage("workerPublicProfiles", pageSize, from, to, cursors.workerPublicProfiles),
    getAdminCollectionPage("workerPrivateProfiles", pageSize, from, to, cursors.workerPrivateProfiles),
    getAdminCollectionPage("users", pageSize, from, to, cursors.users),
    getAdminCollectionPage("jobOffers", pageSize, from, to, cursors.jobOffers),
    getAdminCollectionPage("conversationMessages", pageSize, from, to, cursors.conversationMessages),
    getAdminCollectionPage("contactUnlocks", pageSize, from, to, cursors.contactUnlocks),
    getAdminCollectionPage("emailReminders", pageSize, from, to, cursors.emailReminders),
    getAdminCollectionPage("marketAnalyticsReports", Math.min(pageSize, 80), from, to, cursors.marketAnalyticsReports)
  ]);

  const companies = companiesSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const payments = paymentsSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const accountingEntries = accountingSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const coupons = couponsSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const couponUsages = couponUsagesSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const interviews = interviewsSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const reviews = reviewsSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const auditEvents = auditSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const invitations = invitationsSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const workers = workersSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const privateWorkers = privateWorkersSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const users = usersSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const jobOffers = offersSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const messages = messagesSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const contactUnlocks = unlocksSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const emailReminders = remindersSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));
  const marketAnalyticsReports = marketReportsSnap.docs.map((doc) => serializeDoc(doc.id, doc.data()));

  const now = Date.now();
  const paidPayments = payments.filter((payment) => payment.status === "paid");
  const pendingPayments = payments.filter((payment) => payment.status === "pending");
  const pendingInvoices = accountingEntries.filter((entry) => entry.siiStatus === "pending_provider");
  const contactBlocks = auditEvents.filter((event) => event.eventType === "contact_exchange_blocked_payment_required");
  const stalePendingInvitations = invitations.filter((invitation) => {
    const updatedAt = Date.parse(String(invitation.updatedAt ?? invitation.createdAt ?? ""));
    return invitation.status === "sent" && updatedAt && now - updatedAt > 1000 * 60 * 60 * 24 * 7;
  });

  const securityAlerts = [
    ...contactBlocks.slice(0, 20).map((event) => ({
      alertId: `contact-${event.eventId}`,
      severity: "high",
      title: "Intento de intercambio de contacto",
      detail: `Proceso ${event.targetId ?? "sin id"} activo bloqueo por pago.`,
      createdAt: event.createdAt ?? ""
    })),
    ...pendingInvoices.slice(0, 20).map((entry) => ({
      alertId: `invoice-${entry.entryId}`,
      severity: "medium",
      title: "Factura pendiente de proveedor SII/OpenFactura",
      detail: `Pago ${entry.paymentId ?? entry.entryId} requiere folio, PDF y XML.`,
      createdAt: entry.createdAt ?? ""
    })),
    ...stalePendingInvitations.slice(0, 20).map((invitation) => ({
      alertId: `stale-${invitation.invitationId}`,
      severity: "low",
      title: "Invitacion sin respuesta hace mas de 7 dias",
      detail: invitation.opportunityTitle ?? "Proceso sin titulo",
      createdAt: invitation.updatedAt ?? invitation.createdAt ?? ""
    }))
  ];

  const companyStatusCounts = countBy(companies, "verificationStatus");
  const paymentStatusCounts = countBy(payments, "status");
  const invitationStatusCounts = countBy(invitations, "status");
  const userRoleCounts = countBy(users, "role");
  const workerVisibilityCounts = countBy(workers, "visibilityStatus");
  const offerStatusCounts = countBy(jobOffers, "visibilityStatus");
  const reviewAverage = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + Number(review.score ?? 0), 0) / reviews.length).toFixed(2))
    : 0;
  const hiredInvitations = invitations.filter((invitation) => ["hired", "closed", "unlocked"].includes(String(invitation.status)));
  const acceptedInvitations = invitations.filter((invitation) => ["accepted", "in_process", "offer_sent", "hired", "closed", "unlocked"].includes(String(invitation.status)));
  const visibleWorkers = workers.filter((worker) => worker.visibilityStatus === "visible");
  const activeSubscriptions = workers.filter((worker) => worker.subscriptionStatus === "active");
  const visibleOffers = jobOffers.filter((offer) => offer.visibilityStatus === "visible");
  const totalVacanciesAvailable = jobOffers.reduce((sum, offer) => sum + Number(offer.vacanciesAvailable ?? 0), 0);
  const workersWithTests = workers.filter((worker) => {
    const scores = worker.assessmentScores as Record<string, unknown> | undefined;
    return scores && Object.values(scores).some((value) => Number(value) > 0);
  });
  const reports = {
    financial: {
      paidRevenueClp: paidPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
      pendingRevenueClp: pendingPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
      paidPayments: paidPayments.length,
      pendingPayments: pendingPayments.length,
      accountingEntries: accountingEntries.length,
      invoicesPendingProvider: pendingInvoices.length
    },
    operations: {
      companiesTotal: companies.length,
      companiesVerified: Number(companyStatusCounts.verified ?? 0),
      companiesPending: Number(companyStatusCounts.pending ?? 0),
      workersTotal: workers.length,
      workersVisible: visibleWorkers.length,
      activeSubscriptions: activeSubscriptions.length,
      jobOffersTotal: jobOffers.length,
      jobOffersVisible: visibleOffers.length,
      totalVacanciesAvailable,
      interviewsScheduled: interviews.length,
      messagesTotal: messages.length,
      contactUnlocks: contactUnlocks.length
    },
    conversion: {
      invitationsTotal: invitations.length,
      invitationsAccepted: acceptedInvitations.length,
      invitationsClosedOrUnlocked: hiredInvitations.length,
      acceptanceRate: invitations.length ? Number(((acceptedInvitations.length / invitations.length) * 100).toFixed(1)) : 0,
      closeRate: invitations.length ? Number(((hiredInvitations.length / invitations.length) * 100).toFixed(1)) : 0,
      workersWithOptionalTests: workersWithTests.length,
      testCompletionRate: workers.length ? Number(((workersWithTests.length / workers.length) * 100).toFixed(1)) : 0
    },
    risk: {
      securityAlerts: securityAlerts.length,
      stalePendingInvitations: stalePendingInvitations.length,
      contactBlocks: contactBlocks.length,
      auditEvents: auditEvents.length,
      emailRemindersPending: emailReminders.filter((reminder) => reminder.status !== "sent").length,
      latestMarketReportGeneratedAt: String(marketAnalyticsReports[0]?.createdAt ?? "")
    }
  };

  await writeAudit(adminId, "admin", "admin_dashboard_opened", "admin", "dashboard", {
    companies: String(companies.length),
    payments: String(payments.length),
    pageSize: String(pageSize),
    from: request.data?.from ?? "",
    to: request.data?.to ?? ""
  });

  return {
    summary: {
      companiesTotal: companies.length,
      workersTotal: workers.length,
      paymentsTotal: payments.length,
      paymentsPaid: paidPayments.length,
      paymentsPending: pendingPayments.length,
      revenuePaidClp: paidPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
      accountingPending: pendingInvoices.length,
      couponsActive: coupons.filter((coupon) => coupon.active).length,
      interviewsScheduled: interviews.length,
      reviewsTotal: reviews.length,
      reviewAverage,
      auditEventsTotal: auditEvents.length,
      securityAlerts: securityAlerts.length,
      companyStatusCounts,
      paymentStatusCounts,
      invitationStatusCounts,
      userRoleCounts,
      workerVisibilityCounts,
      offerStatusCounts,
      usersTotal: users.length,
      jobOffersTotal: jobOffers.length,
      jobOffersVisible: visibleOffers.length,
      messagesTotal: messages.length,
      contactUnlocksTotal: contactUnlocks.length,
      emailRemindersTotal: emailReminders.length,
      marketReportsTotal: marketAnalyticsReports.length
    },
    companies,
    workers,
    privateWorkers,
    users,
    jobOffers,
    messages,
    contactUnlocks,
    emailReminders,
    payments,
    accountingEntries,
    coupons,
    couponUsages,
    interviews,
    reviews,
    auditEvents,
    invitations,
    securityAlerts,
    marketAnalyticsReports,
    reports,
    pagination: {
      pageSize,
      from: request.data?.from ?? "",
      to: request.data?.to ?? "",
      nextCursors: {
        companyProfiles: pageCursor(companiesSnap),
        payments: pageCursor(paymentsSnap),
        accountingEntries: pageCursor(accountingSnap),
        coupons: pageCursor(couponsSnap),
        couponUsages: pageCursor(couponUsagesSnap),
        scheduledInterviews: pageCursor(interviewsSnap),
        platformReviews: pageCursor(reviewsSnap),
        auditEvents: pageCursor(auditSnap),
        invitations: pageCursor(invitationsSnap),
        workerPublicProfiles: pageCursor(workersSnap),
        workerPrivateProfiles: pageCursor(privateWorkersSnap),
        users: pageCursor(usersSnap),
        jobOffers: pageCursor(offersSnap),
        conversationMessages: pageCursor(messagesSnap),
        contactUnlocks: pageCursor(unlocksSnap),
        emailReminders: pageCursor(remindersSnap),
        marketAnalyticsReports: pageCursor(marketReportsSnap)
      }
    }
  };
});

export const listCompanyBillingDocuments = onCall(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const snap = await db
    .collection("payments")
    .where("relatedCompanyId", "==", companyId)
    .where("status", "==", "paid")
    .limit(80)
    .get();

  // Batch all accountingEntry reads in a single RPC (avoid N+1)
  const accountingRefs = snap.docs.map((d) =>
    db.collection("accountingEntries").doc(d.data().paymentId ?? d.id)
  );
  const accountingSnaps = accountingRefs.length
    ? await db.getAll(...accountingRefs)
    : [];
  const accountingMap = new Map(accountingSnaps.map((s) => [s.id, s.data() ?? {}]));

  const documents = snap.docs.map((paymentDoc) => {
    const payment = paymentDoc.data();
    const entry = accountingMap.get(payment.paymentId ?? paymentDoc.id) ?? {};
    return {
      paymentId: payment.paymentId,
      providerPaymentId: payment.providerPaymentId ?? "",
      amount: payment.amount ?? 0,
      currency: payment.currency ?? "CLP",
      paymentType: payment.paymentType ?? "",
      status: payment.status ?? "",
      folioSii: (entry as Record<string, unknown>).folioSii ?? "",
      pdfUrl: (entry as Record<string, unknown>).pdfUrl ?? "",
      xmlUrl: (entry as Record<string, unknown>).xmlUrl ?? "",
      siiStatus: (entry as Record<string, unknown>).siiStatus ?? "pending_provider",
      createdAt: payment.createdAt?.toDate?.().toISOString?.() ?? ""
    };
  });

  return { documents };
});

export const createInvitation = onCall<CreateInvitationInput>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  checkRateLimit(companyId, "createInvitation", 10, 60_000);

  const company = await db.collection("companyProfiles").doc(companyId).get();

  if (!company.exists || company.data()?.verificationStatus !== "verified") {
    throw new HttpsError("permission-denied", "La empresa debe estar verificada.");
  }

  // Límite de 20 invitaciones por empresa por día calendario
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const dailySnap = await db.collection("invitations")
    .where("companyId", "==", companyId)
    .where("createdAt", ">=", Timestamp.fromDate(startOfDay))
    .count()
    .get();
  if (dailySnap.data().count >= 20) {
    throw new HttpsError("resource-exhausted", "Límite de 20 invitaciones por día alcanzado. Reintenta mañana.");
  }

  const data = request.data;

  if (!data.workerId || !data.opportunityTitle || !data.message) {
    throw new HttpsError("invalid-argument", "Faltan datos obligatorios.");
  }

  if (!data.salaryMin || !data.salaryMax || data.salaryMax < data.salaryMin) {
    throw new HttpsError("invalid-argument", "La invitación requiere un rango salarial válido.");
  }

  const worker = await db.collection("workerPublicProfiles").doc(data.workerId).get();

  if (!worker.exists || worker.data()?.visibilityStatus !== "visible") {
    throw new HttpsError("failed-precondition", "El perfil no está visible.");
  }

  const invitationRef = db.collection("invitations").doc();
  const now = FieldValue.serverTimestamp();
  const expiresAt = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 10);

  const companyData = company.data()!;
  await invitationRef.set({
    invitationId: invitationRef.id,
    companyId,
    workerId: data.workerId,
    jobOfferId: data.jobOfferId ?? null,
    opportunityTitle: data.opportunityTitle,
    opportunitySummary: data.opportunitySummary,
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    currency: data.currency,
    workMode: data.workMode,
    location: data.location,
    contractType: data.contractType,
    message: data.message,
    status: "sent",
    expiresAt,
    createdAt: now,
    updatedAt: now,
    companyHiredCount: companyData.hiredCount ?? 0,
    companyVerified: true,
    ...(data.decisionDeadline ? (() => {
      const deadline = new Date(data.decisionDeadline!);
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
      const urgencyLevel = daysUntil <= 2 ? "high" : daysUntil <= 5 ? "medium" : "low";
      return {
        decisionDeadline: Timestamp.fromDate(deadline),
        urgencyLevel
      };
    })() : {})
  });

  await writeAudit(companyId, "company", "invitation_sent", "worker", data.workerId, {
    invitationId: invitationRef.id
  });

  // Registrar primera invitación recibida (time-to-first-match)
  await db.collection("workerPublicProfiles").doc(data.workerId).set(
    { firstInvitationAt: FieldValue.serverTimestamp() },
    { merge: true }
  );

  // Notificar al postulante (fire-and-forget — no bloquea la respuesta)
  notifyWorkerInvitationReceived(invitationRef.id).catch(() => {});

  return { invitationId: invitationRef.id };
});

export const acceptInvitation = onCall<{ invitationId: string }>(async (request) => {
  const workerId = request.auth?.uid;

  if (!workerId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();

  if (!invitation.exists || invitation.data()?.workerId !== workerId) {
    throw new HttpsError("permission-denied", "No puedes aceptar esta invitación.");
  }

  const invitationData = invitation.data() ?? {};

  // Validar que la invitación no esté expirada
  if (invitationData.status !== "sent") {
    throw new HttpsError("failed-precondition", `Esta invitación ya fue ${invitationData.status === "expired" ? "expirada" : "procesada"}.`);
  }
  if (invitationData.expiresAt && invitationData.expiresAt.toMillis() < Date.now()) {
    await invitationRef.update({ status: "expired", updatedAt: FieldValue.serverTimestamp() });
    throw new HttpsError("deadline-exceeded", "Esta invitación ya expiró. Pide a la empresa que te envíe una nueva.");
  }

  await db.runTransaction(async (transaction) => {
    transaction.update(invitationRef, {
      status: "accepted",
      acceptedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    if (invitationData.jobOfferId) {
      const offerRef = db.collection("jobOffers").doc(String(invitationData.jobOfferId));
      const offer = await transaction.get(offerRef);
      const available = Number(offer.data()?.vacanciesAvailable ?? 0);
      const nextAvailable = Math.max(available - 1, 0);

      transaction.set(
        offerRef,
        {
          vacanciesAvailable: nextAvailable,
          visibilityStatus: nextAvailable > 0 ? "visible" : "closed",
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    }
  });

  // Si la empresa está verificada, incrementar contador de "invitado por empresa verificada"
  const companySnap = await db.collection("companyProfiles").doc(String(invitationData.companyId)).get();
  if (companySnap.exists && companySnap.data()?.verificationStatus === "verified") {
    await db.collection("workerPrivateProfiles").doc(workerId).set(
      { verifiedInviteCount: FieldValue.increment(1) },
      { merge: true }
    );
  }

  await writeAudit(workerId, "worker", "invitation_accepted", "invitation", invitationRef.id, {
    invitationId: invitationRef.id
  });

  // Notificar a la empresa (fire-and-forget)
  notifyCompanyInvitationAccepted(invitationRef.id).catch(() => {});

  return { status: "accepted" };
});

export const scheduleInterview = onCall<ScheduleInterviewInput>(async (request) => {
  const actorId = request.auth?.uid;

  if (!actorId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const { invitationId, startsAt, durationMinutes = 45 } = request.data;
  const start = new Date(startsAt);
  const minStart = new Date(Date.now() + 1000 * 60 * 60 * 24);

  if (!invitationId || Number.isNaN(start.getTime())) {
    throw new HttpsError("invalid-argument", "Debes seleccionar una fecha válida.");
  }

  if (start < minStart) {
    throw new HttpsError("failed-precondition", "La entrevista debe programarse al menos con un día de anticipación.");
  }

  const invitationRef = db.collection("invitations").doc(invitationId);
  const invitation = await invitationRef.get();
  const data = invitation.data();

  if (!invitation.exists || !data || (data.companyId !== actorId && data.workerId !== actorId)) {
    throw new HttpsError("permission-denied", "No puedes programar esta entrevista.");
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const interviewRef = db.collection("scheduledInterviews").doc();
  const calendarUrl = buildGoogleCalendarUrl({
    title: `Entrevista Perfil Primero - ${data.opportunityTitle ?? "Proceso laboral"}`,
    startsAt: start,
    endsAt: end,
    details: "Entrevista dentro de Perfil Primero. No compartir datos de contacto antes del cierre y pago de empresa.",
    location: `${appUrl}/empresa`
  });

  await interviewRef.set({
    interviewId: interviewRef.id,
    invitationId,
    companyId: data.companyId,
    workerId: data.workerId,
    startsAt: Timestamp.fromDate(start),
    endsAt: Timestamp.fromDate(end),
    status: "scheduled",
    calendarUrl,
    reminderStatus: "queued",
    createdBy: actorId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await invitationRef.set(
    {
      scheduledInterviewId: interviewRef.id,
      scheduledInterviewAt: Timestamp.fromDate(start),
      status: data.status === "accepted" ? "in_process" : data.status,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const messageRef = db.collection("conversationMessages").doc();
  await messageRef.set({
    messageId: messageRef.id,
    invitationId,
    companyId: data.companyId,
    workerId: data.workerId,
    senderId: "system",
    senderRole: "system",
    body: `Entrevista programada para ${start.toLocaleString("es-CL")}. Agregar a Google Calendar: ${calendarUrl}`,
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("emailReminders").doc(interviewRef.id).set({
    reminderId: interviewRef.id,
    interviewId: interviewRef.id,
    invitationId,
    status: "queued",
    channel: "gmail",
    sendAt: Timestamp.fromMillis(start.getTime() - 1000 * 60 * 60 * 3),
    createdAt: FieldValue.serverTimestamp()
  });

  await writeAudit(actorId, data.companyId === actorId ? "company" : "worker", "interview_scheduled", "invitation", invitationId, {
    interviewId: interviewRef.id
  });

  return { interviewId: interviewRef.id, calendarUrl };
});

export const submitPlatformReview = onCall<ReviewInput>(async (request) => {
  const actorId = request.auth?.uid;

  if (!actorId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const { invitationId, targetRole, score, comment, attendedInPerson } = request.data;

  if (!invitationId || !["company", "worker"].includes(targetRole) || score < 1 || score > 5) {
    throw new HttpsError("invalid-argument", "Evaluación inválida.");
  }

  const invitation = await db.collection("invitations").doc(invitationId).get();
  const data = invitation.data();

  if (!invitation.exists || !data) {
    throw new HttpsError("not-found", "La invitacion no existe.");
  }

  const canRateCompany = targetRole === "company" && data.workerId === actorId;
  const canRateWorker = targetRole === "worker" && data.companyId === actorId;

  if (!canRateCompany && !canRateWorker) {
    throw new HttpsError("permission-denied", "No puedes evaluar este proceso.");
  }

  if (!["hired", "closed", "offer_sent", "in_process"].includes(data.status)) {
    throw new HttpsError("failed-precondition", "Solo puedes evaluar procesos avanzados o cerrados.");
  }

  const reviewId = `${invitationId}_${targetRole}`;
  const reviewRef = db.collection("platformReviews").doc(reviewId);
  await reviewRef.set(
    {
      reviewId,
      invitationId,
      companyId: data.companyId,
      workerId: data.workerId,
      targetRole,
      score,
      comment: String(comment ?? "").slice(0, 600),
      attendedInPerson: Boolean(attendedInPerson),
      createdBy: actorId,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await writeAudit(actorId, canRateWorker ? "company" : "worker", "platform_review_submitted", "invitation", invitationId, {
    targetRole,
    score: String(score)
  });

  return (await reviewRef.get()).data();
});

export const acceptInterviewRules = onCall<{ invitationId: string }>(async (request) => {
  const actorId = request.auth?.uid;

  if (!actorId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();
  const invitationData = invitation.data();

  if (!invitation.exists || !invitationData) {
    throw new HttpsError("not-found", "La invitacion no existe.");
  }

  const isCompany = invitationData.companyId === actorId;
  const isWorker = invitationData.workerId === actorId;

  if (!isCompany && !isWorker) {
    throw new HttpsError("permission-denied", "No puedes aceptar reglas de esta entrevista.");
  }

  const acceptedField = isCompany ? "interviewRulesAccepted.company" : "interviewRulesAccepted.worker";

  await invitationRef.update({
    [acceptedField]: true,
    status: invitationData.status === "accepted" ? "in_process" : invitationData.status,
    updatedAt: FieldValue.serverTimestamp()
  });

  await writeAudit(actorId, isCompany ? "company" : "worker", "interview_rules_accepted", "invitation", invitationRef.id, {
    invitationId: invitationRef.id
  });

  return { accepted: true, role: isCompany ? "company" : "worker" };
});

export const updateInvitationStatus = onCall<{ invitationId: string; status: string }>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  if (!invitationFlowStatuses.includes(request.data.status as typeof invitationFlowStatuses[number])) {
    throw new HttpsError("invalid-argument", "Estado de proceso inválido.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();

  if (!invitation.exists || invitation.data()?.companyId !== companyId) {
    throw new HttpsError("permission-denied", "No puedes actualizar esta invitación.");
  }

  await invitationRef.update({
    status: request.data.status,
    updatedAt: FieldValue.serverTimestamp()
  });

  if (request.data.status === "hired") {
    await db.collection("companyProfiles").doc(companyId).set(
      { hiredCount: FieldValue.increment(1) },
      { merge: true }
    );
  }

  if (request.data.status === "rejected") {
    await writeAudit(
      invitation.data()!.workerId,
      "worker",
      "invitation_rejected",
      "invitation",
      invitationRef.id,
      { companyId, reason: "worker_rejected" }
    );
  }

  await writeAudit(companyId, "company", "invitation_status_updated", "invitation", invitationRef.id, {
    status: request.data.status
  });

  return { status: request.data.status };
});

export const sendConversationMessage = onCall<{ invitationId: string; body: string }>(async (request) => {
  const senderId = request.auth?.uid;

  if (!senderId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  checkRateLimit(senderId, "sendMessage", 30, 60_000);

  const body = String(request.data.body ?? "").trim();

  if (!body || body.length > 1200) {
    throw new HttpsError("invalid-argument", "El mensaje debe tener contenido y menos de 1200 caracteres.");
  }

  const invitation = await db.collection("invitations").doc(request.data.invitationId).get();
  const invitationData = invitation.data();

  if (!invitation.exists || !invitationData) {
    throw new HttpsError("not-found", "La invitacion no existe.");
  }

  const isCompany = invitationData.companyId === senderId;
  const isWorker = invitationData.workerId === senderId;

  if (!isCompany && !isWorker) {
    throw new HttpsError("permission-denied", "No puedes escribir en esta conversacion.");
  }

  const rules = invitationData.interviewRulesAccepted ?? {};

  if (!rules.company || !rules.worker) {
    throw new HttpsError("failed-precondition", "Ambos deben aceptar las reglas de entrevista antes de abrir el chat.");
  }

  const hasUnlock = await hasActiveContactUnlock(request.data.invitationId, invitationData.companyId);

  if (invitationData.chatLockedForPayment && !hasUnlock) {
    const checkout = isCompany
      ? await getOrCreateCompanySuccessCheckout(request.data.invitationId, invitationData)
      : null;
    return {
      messageId: "",
      paymentRequired: true,
      checkoutUrl: checkout?.url ?? "",
      reason: "El chat esta bloqueado hasta que la empresa confirme el pago de cierre."
    };
  }

  const contactSignal = await detectContactSignal(body);

  if (contactSignal && !hasUnlock) {
    const checkout = await getOrCreateCompanySuccessCheckout(request.data.invitationId, invitationData);
    const systemMessageRef = db.collection("conversationMessages").doc();
    await systemMessageRef.set({
      messageId: systemMessageRef.id,
      invitationId: request.data.invitationId,
      companyId: invitationData.companyId,
      workerId: invitationData.workerId,
      senderId: "system",
      senderRole: "system",
      body: "La entrevista detecto intento de intercambio de datos de contacto. El chat queda bloqueado mientras la empresa realiza el pago de cierre por Mercado Pago. El postulante vera este aviso y la empresa podra continuar al confirmar el pago.",
      paymentRequired: true,
      createdAt: FieldValue.serverTimestamp()
    });
    await db.collection("invitations").doc(request.data.invitationId).update({
      chatLockedForPayment: true,
      paymentRequiredAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    await writeAudit(senderId, isCompany ? "company" : "worker", "contact_exchange_blocked_payment_required", "invitation", request.data.invitationId, {
      invitationId: request.data.invitationId,
      signal: contactSignal
    });
    return {
      messageId: "",
      paymentRequired: true,
      checkoutUrl: isCompany ? checkout.url : "",
      reason: "Detectamos datos de contacto. Para cerrar trato, la empresa debe pagar antes de continuar el chat."
    };
  }

  const messageRef = db.collection("conversationMessages").doc();

  await messageRef.set({
    messageId: messageRef.id,
    invitationId: request.data.invitationId,
    companyId: invitationData.companyId,
    workerId: invitationData.workerId,
    senderId,
    senderRole: isCompany ? "company" : "worker",
    body,
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("invitations").doc(request.data.invitationId).update({
    lastMessageAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  await writeAudit(senderId, isCompany ? "company" : "worker", "conversation_message_sent", "invitation", request.data.invitationId, {
    invitationId: request.data.invitationId
  });

  return { messageId: messageRef.id };
});

export const unlockWorkerContact = onCall<{ invitationId: string; paymentId?: string; useUnlimitedPlan?: boolean }>(
  async (request) => {
    const companyId = request.auth?.uid;

    if (!companyId) {
      throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    }

    const invitationRef = db.collection("invitations").doc(request.data.invitationId);
    const invitation = await invitationRef.get();
    const invitationData = invitation.data();

    if (!invitation.exists || invitationData?.companyId !== companyId) {
      throw new HttpsError("permission-denied", "No puedes desbloquear este contacto.");
    }

    if (invitationData.status !== "accepted") {
      throw new HttpsError("failed-precondition", "La invitación debe estar aceptada.");
    }

    let resolvedPaymentId = request.data.paymentId ?? "";

    if (request.data.useUnlimitedPlan) {
      const companySnap = await db.collection("companyProfiles").doc(companyId).get();
      const plan = companySnap.data()?.unlimitedPlan;
      if (!plan?.active || !plan.renewsAt || plan.renewsAt.toMillis() <= Date.now()) {
        throw new HttpsError("failed-precondition", "No tienes un plan ilimitado activo.");
      }
      resolvedPaymentId = `unlimited:${plan.renewsAt.toMillis()}`;
    } else {
      if (!resolvedPaymentId) throw new HttpsError("invalid-argument", "Se requiere paymentId.");
      const payment = await db.collection("payments").doc(resolvedPaymentId).get();
      if (!payment.exists || payment.data()?.status !== "paid") {
        throw new HttpsError("failed-precondition", "El pago no está confirmado.");
      }
    }

    const unlockRef = db.collection("contactUnlocks").doc();
    const now = FieldValue.serverTimestamp();

    await unlockRef.set({
      unlockId: unlockRef.id,
      companyId,
      workerId: invitationData.workerId,
      invitationId: invitationRef.id,
      paymentId: resolvedPaymentId,
      usedUnlimitedPlan: request.data.useUnlimitedPlan ?? false,
      status: "active",
      createdAt: now,
      expiresAt: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    await invitationRef.update({
      status: "unlocked",
      updatedAt: now
    });

    await writeAudit(companyId, "company", "private_profile_unlocked", "worker", invitationData.workerId, {
      invitationId: invitationRef.id,
      paymentId: resolvedPaymentId,
      usedUnlimitedPlan: String(request.data.useUnlimitedPlan ?? false)
    });

    return { unlockId: unlockRef.id };
  }
);

export const getUnlockedWorkerContact = onCall<{ invitationId: string }>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const invitation = await db.collection("invitations").doc(request.data.invitationId).get();
  const invitationData = invitation.data();

  if (!invitation.exists || invitationData?.companyId !== companyId) {
    throw new HttpsError("permission-denied", "No puedes leer este contacto.");
  }

  const unlockSnap = await db
    .collection("contactUnlocks")
    .where("invitationId", "==", request.data.invitationId)
    .where("companyId", "==", companyId)
    .where("status", "==", "active")
    .limit(1)
    .get();

  if (unlockSnap.empty) {
    throw new HttpsError("failed-precondition", "El contacto aún no está desbloqueado por pago confirmado.");
  }

  const privateProfile = await db.collection("workerPrivateProfiles").doc(invitationData.workerId).get();

  if (!privateProfile.exists) {
    throw new HttpsError("not-found", "El perfil privado no existe.");
  }

  const data = privateProfile.data() ?? {};

  await writeAudit(companyId, "company", "private_profile_viewed", "worker", invitationData.workerId, {
    invitationId: request.data.invitationId
  });

  return {
    legalName: data.legalName ?? "",
    preferredName: data.preferredName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    portfolioLinks: Array.isArray(data.portfolioLinks) ? data.portfolioLinks : []
  };
});

export const createWorkerSubscriptionCheckout = onCall<CheckoutCouponInput | undefined>(async (request) => {
  const workerId = request.auth?.uid;

  if (!workerId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const paymentRef = db.collection("payments").doc();
  const pricing = await getPricingConfig();
  const baseAmount = pricing.workerSubscriptionClp;
  const coupon = await validateCoupon(request.data?.couponCode, baseAmount, workerId);
  const amount = coupon?.finalAmount ?? baseAmount;

  await paymentRef.set({
    paymentId: paymentRef.id,
    userId: workerId,
    payerRole: "worker",
    provider: "mercadopago",
    providerPaymentId: null,
    amount,
    currency: "CLP",
    paymentType: "worker_subscription",
    status: "pending",
    couponCode: coupon?.couponCode ?? null,
    discountAmount: coupon?.discountAmount ?? 0,
    pricingPhase: pricing.launchPhaseActive ? "launch" : "regular",
    relatedWorkerId: workerId,
    relatedCompanyId: null,
    relatedInvitationId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const preference = await createMercadoPagoPreference({
    title: "Perfil visible por 30 dias - Perfil Primero",
    unitPrice: amount,
    paymentId: paymentRef.id,
    metadata: {
      type: "worker_subscription",
      workerId,
      couponCode: coupon?.couponCode ?? ""
    },
    backPath: "/postulante"
  });

  await paymentRef.update({
    providerPaymentId: preference.id,
    updatedAt: FieldValue.serverTimestamp()
  });

  return { url: preference.initPoint };
});

export const createCompanyUnlockCheckout = onCall<{ invitationId: string; couponCode?: string }>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();
  const invitationData = invitation.data();

  if (!invitation.exists || invitationData?.companyId !== companyId) {
    throw new HttpsError("permission-denied", "No puedes pagar esta invitación.");
  }

  if (!["accepted", "in_process", "offer_sent", "hired", "closed"].includes(invitationData.status)) {
    throw new HttpsError("failed-precondition", "El pago de empresa se realiza cuando el trato ya avanzo o se cerro.");
  }

  const checkout = await getOrCreateCompanySuccessCheckout(invitationRef.id, invitationData, request.data.couponCode);

  return { url: checkout.url };
});

export const stripeWebhook = onRequest(async (request, response) => {
  const signature = request.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    response.status(400).send("Missing Stripe webhook configuration.");
    return;
  }

  let event: Stripe.Event;

  try {
    const rawBody = (request as unknown as { rawBody: Buffer }).rawBody;
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    response.status(400).send(error instanceof Error ? error.message : "Invalid signature.");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await handleCheckoutCompleted(session);
  }

  response.json({ received: true });
});

export const mercadoPagoWebhook = onRequest(async (request, response) => {
  if (!validateMercadoPagoSignature(request as unknown as { headers: Record<string, string | string[] | undefined>; query: Record<string, string | string[] | undefined> })) {
    response.status(401).json({ error: "Invalid signature" });
    return;
  }

  const type = String(request.query.type ?? request.query.topic ?? request.body?.type ?? "");
  const rawId = String(request.query["data.id"] ?? request.body?.data?.id ?? "").trim().slice(0, 64);
  const paymentIdFromProvider = /^[a-zA-Z0-9\-_]+$/.test(rawId) ? rawId : "";

  if (type !== "payment" || !paymentIdFromProvider) {
    response.json({ received: true, ignored: true });
    return;
  }

  const payment = await getMercadoPagoPayment(paymentIdFromProvider);

  if (payment.status === "approved" && payment.external_reference) {
    await handleProviderPaymentApproved(
      payment.external_reference,
      String(payment.id),
      payment.metadata ?? {}
    );
  }

  response.json({ received: true });
});

export const getProfileAiAdvice = onCall<{
  headline: string;
  summary: string;
  skills: string;
}>(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const { headline, summary, skills } = request.data;

  if (!headline || !summary || !skills) {
    throw new HttpsError("invalid-argument", "Completa título, resumen y habilidades.");
  }

  const prompt = [
    "Eres un asesor laboral experto en Chile.",
    "Mejora este perfil para que sea claro, profesional y atractivo para empresas.",
    "No inventes experiencia ni datos personales.",
    "Devuelve 4 recomendaciones concretas y una version mejorada de resumen en menos de 120 palabras.",
    "",
    `Titulo: ${headline}`,
    `Resumen: ${summary}`,
    `Habilidades: ${skills}`
  ].join("\n");

  let parsed: Record<string, unknown>;
  let source = "gemini";

  try {
    parsed = await generateJsonWithGemini(prompt, profileAdviceSchema());
  } catch (error) {
    if (!isGeminiRecoverableError(error)) {
      throw error;
    }

    source = "fallback";
    parsed = {
      advice: [
        "Recomendaciones inmediatas:",
        "1. Resume tu experiencia en una frase concreta con cargo, rubro y años de experiencia.",
        "2. Agrega habilidades verificables separadas por coma.",
        "3. Indica modalidad, comuna/region y rango de renta esperado.",
        "4. Evita datos privados en el resumen publico.",
        "",
        "Resumen sugerido:",
        `${headline}. Experiencia en ${skills}. Disponible para conversar con empresas verificadas con sueldo y condiciones claras.`
      ].join("\n")
    };
  }

  await writeAudit(request.auth.uid, "worker", "ai_profile_advice_generated", "worker", request.auth.uid, {
    source
  });

  return { advice: String(parsed.advice ?? "") };
});

export const analyzeCvWithAi = onCall<{
  fileName: string;
  mimeType: string;
  base64: string;
}>({ region: "us-central1", timeoutSeconds: 120 }, async (request) => {
  const workerId = request.auth?.uid;

  if (!workerId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  checkRateLimit(workerId, "analyzeCv", 5, 3_600_000);

  const { fileName, mimeType, base64 } = request.data;

  if (!fileName || !mimeType || !base64) {
    throw new HttpsError("invalid-argument", "Falta el archivo del CV.");
  }

  // Extraer texto del PDF para usar quota de texto (no multimodal)
  let cvText = "";
  try {
    const buffer = Buffer.from(base64, "base64");
    if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      const parsed = await pdfParse(buffer);
      cvText = parsed.text?.trim() ?? "";
    } else {
      cvText = buffer.toString("utf-8").trim();
    }
  } catch {
    // Si falla la extraccion, igual intentamos con el archivo
  }

  const cvContent = cvText
    ? `Texto extraido del CV:\n${cvText.slice(0, 12000)}`
    : `Nombre archivo: ${fileName} (no se pudo extraer texto, infiere desde el nombre)`;

  const prompt = [
    "Eres un analista laboral chileno. Extrae informacion de un curriculum.",
    "No inventes datos. Si un dato no existe, usa una inferencia prudente o valor neutro.",
    "Devuelve SOLO JSON valido con estas claves exactas:",
    "headline, summary, skills, sectors, yearsOfExperience, suggestedSalaryMin, suggestedSalaryMax, cvAnalysisSummary, formattedCv.",
    "skills y sectors deben ser arrays de strings. Salarios en CLP como numeros.",
    "formattedCv debe ser un curriculum profesional breve con secciones: Perfil, Experiencia, Habilidades, Educacion/Certificaciones si existen.",
    "El resumen no debe incluir nombre, telefono, correo ni datos privados.",
    cvContent
  ].join("\n");

  let parsed: Record<string, unknown>;
  let aiStatus: "completed" | "quota_exceeded" = "completed";

  try {
    parsed = await generateJsonWithGemini(prompt, cvAnalysisSchema());
  } catch (error) {
    if (!isGeminiRecoverableError(error)) {
      throw error;
    }
    aiStatus = "quota_exceeded";
    parsed = buildCvQuotaFallback(fileName);
  }

  await writeAudit(workerId, "worker", aiStatus === "completed" ? "cv_analyzed_with_ai" : "cv_uploaded_ai_quota_pending", "worker", workerId, {
    fileName
  });

  return {
    headline: String(parsed.headline ?? "Perfil profesional"),
    summary: String(parsed.summary ?? ""),
    skills: Array.isArray(parsed.skills) ? parsed.skills.map(String).slice(0, 12) : [],
    sectors: Array.isArray(parsed.sectors) ? parsed.sectors.map(String).slice(0, 4) : ["Servicios"],
    yearsOfExperience: Number(parsed.yearsOfExperience ?? 0),
    suggestedSalaryMin: Number(parsed.suggestedSalaryMin ?? 750000),
    suggestedSalaryMax: Number(parsed.suggestedSalaryMax ?? 1000000),
    cvAnalysisSummary: String(parsed.cvAnalysisSummary ?? ""),
    formattedCv: String(parsed.formattedCv ?? parsed.summary ?? ""),
    aiStatus
  };
});

export const getCandidateMatchAdvice = onCall<{
  opportunityTitle: string;
  opportunitySummary: string;
  requiredSkills: string;
  worker: unknown;
}>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }

  const company = await db.collection("companyProfiles").doc(companyId).get();

  if (!company.exists || company.data()?.verificationStatus !== "verified") {
    throw new HttpsError("permission-denied", "La empresa debe estar verificada.");
  }

  const prompt = [
    "Eres un especialista en seleccion laboral en Chile.",
    "Evalua compatibilidad entre una vacante y un perfil anonimo.",
    "No discrimines por edad, genero, nacionalidad, nombre, direccion o datos privados.",
    "Devuelve SOLO JSON valido con claves exactas: score, verdict, reasons, risks.",
    "score debe ser 0 a 100. reasons y risks arrays de strings breves.",
    "",
    `Vacante: ${request.data.opportunityTitle}`,
    `Resumen vacante: ${request.data.opportunitySummary}`,
    `Habilidades requeridas: ${request.data.requiredSkills}`,
    `Perfil postulante: ${JSON.stringify(request.data.worker)}`
  ].join("\n");

  let parsed: Record<string, unknown>;
  let source = "gemini";

  try {
    parsed = await generateJsonWithGemini(prompt, candidateMatchSchema());
  } catch (error) {
    if (!isGeminiRecoverableError(error)) {
      throw error;
    }

    source = "fallback";
    parsed = {
      score: calculateFallbackMatchScore(request.data.requiredSkills, request.data.worker),
      verdict: "Analisis automatico pendiente. Revisa manualmente experiencia, renta, comuna, disponibilidad y habilidades declaradas.",
      reasons: ["Comparacion base generada sin IA por configuracion/cuota de Google."],
      risks: ["La recomendacion no reemplaza revision humana de antecedentes y entrevista."]
    };
  }

  await writeAudit(companyId, "company", "candidate_match_ai_generated", "worker", "anonymous", {
    source
  });

  return {
    score: Math.max(0, Math.min(100, Number(parsed.score ?? 0))),
    verdict: String(parsed.verdict ?? "Sin veredicto"),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String).slice(0, 5) : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks.map(String).slice(0, 5) : []
  };
});

async function writeAudit(
  actorId: string,
  actorRole: "worker" | "company" | "admin" | "omil",
  eventType: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, string>
) {
  const eventRef = db.collection("auditEvents").doc();

  await eventRef.set({
    eventId: eventRef.id,
    actorId,
    actorRole,
    eventType,
    targetType,
    targetId,
    metadata,
    createdAt: FieldValue.serverTimestamp()
  });
}

async function hasActiveContactUnlock(invitationId: string, companyId: string) {
  const unlockSnap = await db
    .collection("contactUnlocks")
    .where("invitationId", "==", invitationId)
    .where("companyId", "==", companyId)
    .where("status", "==", "active")
    .limit(1)
    .get();

  return !unlockSnap.empty;
}

async function detectContactSignal(text: string) {
  const normalized = text.toLowerCase();
  const patterns: Array<[string, RegExp]> = [
    ["email", /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i],
    ["phone", /(\+?56\s?)?(\(?9\)?\s?)?\d[\d\s.-]{7,}\d/],
    ["whatsapp", /\b(whatsapp|wsp|wasap|wa\.me)\b/i],
    ["linkedin", /\b(linkedin\.com|linkedin|perfil de linkedin)\b/i],
    ["contact_request", /\b(correo|mail|email|telefono|teléfono|celular|numero|número|llamame|llámame|contactame|contáctame)\b/i]
  ];

  const deterministic = patterns.find(([, pattern]) => pattern.test(normalized))?.[0] ?? "";

  if (deterministic) {
    return deterministic;
  }

  try {
    const aiResult = await generateJsonWithGemini([
      "Eres un monitor de seguridad de entrevistas laborales.",
      "Detecta si el mensaje intenta compartir o pedir datos de contacto externos antes del pago.",
      "Datos de contacto incluyen telefono, correo, WhatsApp, LinkedIn, redes sociales, direccion, reunion externa o instrucciones para salir de la plataforma.",
      "Devuelve JSON con contactDetected boolean y signal string.",
      "",
      `Mensaje: ${text}`
    ].join("\n"), contactSignalSchema());

    return aiResult.contactDetected ? String(aiResult.signal ?? "ai_contact_intent") : "";
  } catch {
    return "";
  }
}

async function getOrCreateCompanySuccessCheckout(
  invitationId: string,
  invitationData: FirebaseFirestore.DocumentData,
  couponCode?: string
) {
  const existingPaymentSnap = await db
    .collection("payments")
    .where("relatedInvitationId", "==", invitationId)
    .where("paymentType", "==", "company_success_fee")
    .where("status", "==", "pending")
    .limit(1)
    .get();

  if (!existingPaymentSnap.empty) {
    const payment = existingPaymentSnap.docs[0].data();
    if (payment.checkoutUrl) {
      return { paymentId: payment.paymentId, url: payment.checkoutUrl as string };
    }
  }

  const paymentRef = existingPaymentSnap.empty
    ? db.collection("payments").doc()
    : existingPaymentSnap.docs[0].ref;
  const paymentId = existingPaymentSnap.empty ? paymentRef.id : existingPaymentSnap.docs[0].id;
  const pricing = await getPricingConfig();
  const baseAmount = pricing.companyContactClp;
  const coupon = await validateCoupon(couponCode, baseAmount, invitationData.companyId);
  const amount = coupon?.finalAmount ?? baseAmount;

  if (existingPaymentSnap.empty) {
    await paymentRef.set({
      paymentId,
      userId: invitationData.companyId,
      payerRole: "company",
      provider: "mercadopago",
      providerPaymentId: null,
      amount,
      currency: "CLP",
      paymentType: "company_success_fee",
      status: "pending",
      couponCode: coupon?.couponCode ?? null,
      discountAmount: coupon?.discountAmount ?? 0,
      pricingPhase: pricing.launchPhaseActive ? "launch" : "regular",
      relatedWorkerId: invitationData.workerId,
      relatedCompanyId: invitationData.companyId,
      relatedInvitationId: invitationId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  const preference = await createMercadoPagoPreference({
    title: "Pago por cierre de entrevista - Perfil Primero",
    unitPrice: amount,
    paymentId,
    metadata: {
      paymentId,
      type: "company_success_fee",
      companyId: invitationData.companyId,
      workerId: invitationData.workerId,
      invitationId,
      couponCode: coupon?.couponCode ?? ""
    },
    backPath: "/empresa"
  });

  await paymentRef.update({
    providerPaymentId: preference.id,
    checkoutUrl: preference.initPoint,
    updatedAt: FieldValue.serverTimestamp()
  });

  return { paymentId, url: preference.initPoint };
}

function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new HttpsError("failed-precondition", "Falta STRIPE_SECRET_KEY.");
  }

  return new Stripe(secret);
}

async function validateCoupon(
  rawCouponCode: string | undefined,
  baseAmount: number,
  userId: string
): Promise<CouponValidation | null> {
  const couponCode = String(rawCouponCode ?? "").trim().toUpperCase();

  if (!couponCode) {
    return null;
  }

  const couponRef = db.collection("coupons").doc(couponCode);
  const coupon = await couponRef.get();
  const data = coupon.data();

  if (!coupon.exists || !data?.active) {
    throw new HttpsError("failed-precondition", "Cupón inválido o inactivo.");
  }

  const expiresAt = data.expiresAt?.toDate?.() as Date | undefined;

  if (!expiresAt) {
    throw new HttpsError("failed-precondition", "El cupón no tiene fecha de expiración válida.");
  }

  if (expiresAt.getTime() < Date.now()) {
    throw new HttpsError("failed-precondition", "El cupón está vencido.");
  }

  if (Number(data.maxUses ?? 0) > 0 && Number(data.usedCount ?? 0) >= Number(data.maxUses)) {
    throw new HttpsError("failed-precondition", "El cupón ya alcanzó su límite de uso.");
  }

  const previousUse = await db
    .collection("couponUsages")
    .where("couponCode", "==", couponCode)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (!previousUse.empty) {
    throw new HttpsError("failed-precondition", "Este usuario ya usó este cupón.");
  }

  const discountPercent = Math.max(0, Math.min(Number(data.discountPercent ?? 0), 100));
  const rawDiscountAmount = Math.round(baseAmount * (discountPercent / 100));
  const finalAmount = Math.max(baseAmount - rawDiscountAmount, 1);
  const discountAmount = baseAmount - finalAmount;

  return {
    couponCode,
    discountPercent,
    discountAmount,
    finalAmount
  };
}

async function markCouponUsed(couponCode: string | undefined, userId: string | undefined, paymentId: string) {
  if (!couponCode || !userId) {
    return;
  }

  const couponRef = db.collection("coupons").doc(couponCode);
  const usageRef = db.collection("couponUsages").doc(`${couponCode}_${userId}`);

  await db.runTransaction(async (transaction) => {
    const usage = await transaction.get(usageRef);
    if (usage.exists) {
      return;
    }

    transaction.set(usageRef, {
      couponCode,
      userId,
      paymentId,
      createdAt: FieldValue.serverTimestamp()
    });
    transaction.set(
      couponRef,
      {
        usedCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  });
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return `"${escaped}"`;
}

async function getAdminCollectionPage(
  collectionName: string,
  pageSize: number,
  from: Timestamp | null,
  to: Timestamp | null,
  cursor?: string
) {
  let query: Query = db.collection(collectionName).orderBy("createdAt", "desc");

  if (from) {
    query = query.where("createdAt", ">=", from);
  }

  if (to) {
    query = query.where("createdAt", "<=", to);
  }

  if (cursor) {
    query = query.startAfter(Timestamp.fromDate(new Date(cursor)));
  }

  return query.limit(pageSize).get();
}

function pageCursor(snapshot: { docs: Array<{ data: () => Record<string, unknown> }> }) {
  const last = snapshot.docs[snapshot.docs.length - 1];
  const createdAt = last?.data().createdAt as { toDate?: () => Date } | undefined;
  return createdAt?.toDate?.().toISOString?.() ?? "";
}

function serializeDoc(id: string, data: Record<string, unknown>): Record<string, unknown> {
  return {
    id,
    ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, serializeValue(value)]))
  };
}

function serializeValue(value: unknown): unknown {
  if (!value) return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toISOString();
    }
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serializeValue(item)]));
  }
  return value;
}

function countBy(items: Array<Record<string, unknown>>, field: string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = String(item[field] ?? "unknown");
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

async function getPricingConfig(): Promise<PricingConfig> {
  const defaults: PricingConfig = {
    launchPhaseActive: true,
    workerSubscriptionClp: launchPriceClp,
    companyContactClp: launchPriceClp,
    workerRegularClp: 9990,
    companyRegularClp: 24990
  };

  const snap = await db.collection("configuracion_sistema").doc("tarifas").get();
  const data = snap.data();

  if (!snap.exists || !data) {
    await db.collection("configuracion_sistema").doc("tarifas").set(
      {
        fase_lanzamiento_activa: defaults.launchPhaseActive,
        tarifa_suscripcion_postulante_clp: defaults.workerSubscriptionClp,
        tarifa_contacto_empresa_clp: defaults.companyContactClp,
        tarifa_postulante_precio_real: defaults.workerRegularClp,
        tarifa_empresa_precio_real: defaults.companyRegularClp,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return defaults;
  }

  return {
    launchPhaseActive: data.fase_lanzamiento_activa !== false,
    workerSubscriptionClp: Math.max(1, Number(data.tarifa_suscripcion_postulante_clp ?? defaults.workerSubscriptionClp)),
    companyContactClp: Math.max(1, Number(data.tarifa_contacto_empresa_clp ?? defaults.companyContactClp)),
    workerRegularClp: Math.max(1, Number(data.tarifa_postulante_precio_real ?? defaults.workerRegularClp)),
    companyRegularClp: Math.max(1, Number(data.tarifa_empresa_precio_real ?? defaults.companyRegularClp))
  };
}

async function createMarketAnalyticsReport(period: "weekly_schedule" | "manual_admin", actorId: string) {
  const [workersSnap, offersSnap, auditSnap, aiLogsSnap, paymentsSnap] = await Promise.all([
    db.collection("workerPublicProfiles").where("visibilityStatus", "==", "visible").limit(800).get(),
    db.collection("jobOffers").where("visibilityStatus", "==", "visible").limit(800).get(),
    db.collection("auditEvents").orderBy("createdAt", "desc").limit(800).get(),
    db.collection("aiUsageLogs").orderBy("createdAt", "desc").limit(800).get(),
    db.collection("payments").where("status", "==", "paid").where("paymentType", "==", "worker_subscription").limit(800).get()
  ]);

  const workers = workersSnap.docs.map((doc) => doc.data());
  const offers = offersSnap.docs.map((doc) => doc.data());
  const audits = auditSnap.docs.map((doc) => doc.data());
  const aiLogs = aiLogsSnap.docs.map((doc) => doc.data());
  const paidPayments = paymentsSnap.docs.map((doc) => doc.data());

  // Retención: usuarios con 2+ pagos = renovaron
  const paymentsByUser = paidPayments.reduce<Record<string, number>>((acc, p) => {
    const uid = String(p.userId ?? "");
    if (uid) acc[uid] = (acc[uid] ?? 0) + 1;
    return acc;
  }, {});
  const uniquePayers = Object.keys(paymentsByUser).length;
  const renewedPayers = Object.values(paymentsByUser).filter((n) => n >= 2).length;
  const retentionRate = uniquePayers > 0 ? Math.round((renewedPayers / uniquePayers) * 100) : 0;
  const salaryValues = workers
    .map((worker) => Number(worker.expectedSalaryMax ?? worker.expectedSalaryMin ?? 0))
    .filter((value) => value > 0);
  const skillCounts = workers.reduce<Record<string, number>>((acc, worker) => {
    const skills = Array.isArray(worker.skills) ? worker.skills : [];
    skills.forEach((skill) => {
      const key = String(skill).trim();
      if (key) acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});
  const areaCounts = workers.reduce<Record<string, number>>((acc, worker) => {
    const sectors = Array.isArray(worker.sectors) ? worker.sectors : [worker.area];
    sectors.forEach((sector) => {
      const key = String(sector ?? "Sin area").trim();
      if (key) acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, {});
  const contactBlocks = audits.filter((audit) => audit.eventType === "contact_exchange_blocked_payment_required").length;
  const failedAiCalls = aiLogs.filter((log) => log.status !== "success").length;
  const successfulAiCalls = aiLogs.filter((log) => log.status === "success");
  const avgAiLatencyMs = successfulAiCalls.length
    ? Math.round(successfulAiCalls.reduce((sum, log) => sum + Number(log.latencyMs ?? 0), 0) / successfulAiCalls.length)
    : 0;
  const reportRef = db.collection("marketAnalyticsReports").doc();
  const report = {
    reportId: reportRef.id,
    period,
    activePostulants: workers.length,
    activeJobOffers: offers.length,
    totalVacanciesAvailable: offers.reduce((sum, offer) => sum + Number(offer.vacanciesAvailable ?? 0), 0),
    salaryAverageClp: salaryValues.length ? Math.round(salaryValues.reduce((sum, value) => sum + value, 0) / salaryValues.length) : 0,
    topSkills: Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([skill, count]) => ({ skill, count })),
    areas: Object.entries(areaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([area, count]) => ({ area, count })),
    chatEvasionBlocks: contactBlocks,
    aiCallsAnalyzed: aiLogs.length,
    aiFailures: failedAiCalls,
    avgAiLatencyMs,
    retention: {
      uniquePayers,
      renewedPayers,
      retentionRate
    }
  };

  await reportRef.set({
    ...report,
    createdBy: actorId,
    createdAt: FieldValue.serverTimestamp()
  });

  await writeAudit(actorId, actorId === "system" ? "admin" : "admin", "market_analytics_report_generated", "admin", reportRef.id, {
    activePostulants: String(workers.length),
    activeJobOffers: String(offers.length),
    chatEvasionBlocks: String(contactBlocks)
  });

  return report;
}

function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new HttpsError("failed-precondition", "Falta MERCADOPAGO_ACCESS_TOKEN.");
  }

  return new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 8000
    }
  });
}

async function createMercadoPagoPreference({
  title,
  unitPrice,
  paymentId,
  metadata,
  backPath
}: {
  title: string;
  unitPrice: number;
  paymentId: string;
  metadata: Record<string, string>;
  backPath: string;
}) {
  try {
    const client = getMercadoPagoClient();
    const preferenceClient = new Preference(client);
    const preference = await preferenceClient.create({
      body: {
      items: [
        {
          id: paymentId,
          title,
          quantity: 1,
          unit_price: unitPrice,
          currency_id: "CLP"
        }
      ],
      back_urls: {
        success: `${appUrl}${backPath}?checkout=success`,
        failure: `${appUrl}${backPath}?checkout=failure`,
        pending: `${appUrl}${backPath}?checkout=pending`
      },
      auto_return: "approved",
      external_reference: paymentId,
      notification_url: `${process.env.FUNCTIONS_BASE_URL ?? "https://us-central1-perfil-primero.cloudfunctions.net"}/mercadoPagoWebhook`,
      metadata: {
        ...metadata,
        paymentId
      }
      }
    });

    return {
      id: String(preference.id ?? ""),
      initPoint: preference.init_point ?? preference.sandbox_init_point ?? ""
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    throw new HttpsError("internal", `Mercado Pago no pudo crear la preferencia: ${message}`);
  }
}

async function getMercadoPagoPayment(providerPaymentId: string) {
  try {
    const client = getMercadoPagoClient();
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: providerPaymentId });

    return {
      id: Number(payment.id ?? 0),
      status: String(payment.status ?? ""),
      external_reference: payment.external_reference,
      metadata: payment.metadata as Record<string, string> | undefined
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    throw new HttpsError("internal", `No se pudo consultar el pago en Mercado Pago: ${message}`);
  }
}

async function handleProviderPaymentApproved(
  paymentId: string,
  providerPaymentId: string,
  metadata: Record<string, string>
) {
  const paymentRef = db.collection("payments").doc(paymentId);

  let paymentData: FirebaseFirestore.DocumentData | undefined;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef);
    if (!snap.exists || snap.data()?.status === "paid") return;
    paymentData = snap.data();
    tx.update(paymentRef, {
      status: "paid",
      providerPaymentId,
      receiptUrl: `https://www.mercadopago.cl/activities/detail/${providerPaymentId}`,
      receiptNumber: providerPaymentId,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  if (!paymentData) return; // ya procesado o inexistente

  await markCouponUsed(paymentData?.couponCode, paymentData?.userId, paymentId);
  await writeAccountingEntry(paymentId, providerPaymentId, paymentData);

  if (paymentData?.paymentType === "worker_subscription" && paymentData.relatedWorkerId) {
    await db.collection("workerPublicProfiles").doc(paymentData.relatedWorkerId).set(
      {
        subscriptionStatus: "active",
        visibilityStatus: "visible",
        profileExpiresAt: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await writeAudit(paymentData.relatedWorkerId, "worker", "worker_subscription_paid", "worker", paymentData.relatedWorkerId, {
      paymentId
    });
  }

  if (paymentData?.paymentType === "company_monthly_plan" && paymentData.relatedCompanyId) {
    const renewsAt = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
    await db.collection("companyProfiles").doc(paymentData.relatedCompanyId as string).set(
      {
        monthlyPlan: {
          active: true,
          contactCreditsTotal: companyMonthlyContactCredits,
          contactCreditsUsed: 0,
          activatedAt: FieldValue.serverTimestamp(),
          renewsAt,
          paymentId
        },
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    const companySnap = await db.collection("companyProfiles").doc(paymentData.relatedCompanyId as string).get();
    const contactEmail: string = companySnap.data()?.email ?? companySnap.data()?.contactEmail ?? "";
    if (contactEmail) {
      await sendEmail(
        contactEmail,
        "Plan mensual activado — Perfil Primero",
        `<p>¡Hola!</p>
         <p>Tu plan empresa mensual está activo. Tienes <strong>${companyMonthlyContactCredits} contactos incluidos</strong> válidos por 30 días.</p>
         <p><a href="${appUrl}/empresa">Buscar candidatos ahora →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );
    }
    await writeAudit(paymentData.relatedCompanyId as string, "company", "company_monthly_plan_activated", "company", paymentData.relatedCompanyId as string, { paymentId });
  }

  if (paymentData?.paymentType === "company_unlimited_plan" && paymentData.relatedCompanyId) {
    const renewsAt = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30));
    await db.collection("companyProfiles").doc(paymentData.relatedCompanyId as string).set(
      {
        unlimitedPlan: {
          active: true,
          activatedAt: FieldValue.serverTimestamp(),
          renewsAt,
          paymentId
        },
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    const companySnap = await db.collection("companyProfiles").doc(paymentData.relatedCompanyId as string).get();
    const contactEmail: string = companySnap.data()?.email ?? companySnap.data()?.contactEmail ?? "";
    if (contactEmail) {
      await sendEmail(
        contactEmail,
        "Plan Ilimitado activado — Perfil Primero",
        `<p>¡Hola!</p>
         <p>Tu <strong>Plan Empresa Ilimitado</strong> está activo. Puedes desbloquear contactos sin límite durante los próximos 30 días.</p>
         <p><a href="${appUrl}/empresa">Buscar candidatos ahora →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );
    }
    await writeAudit(paymentData.relatedCompanyId as string, "company", "company_unlimited_plan_activated", "company", paymentData.relatedCompanyId as string, { paymentId });
  }

  if (paymentData?.paymentType === "company_success_fee" && paymentData.relatedInvitationId) {
    const unlockRef = db.collection("contactUnlocks").doc();

    await unlockRef.set({
      unlockId: unlockRef.id,
      companyId: paymentData.relatedCompanyId,
      workerId: paymentData.relatedWorkerId,
      invitationId: paymentData.relatedInvitationId,
      paymentId,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    await db.collection("invitations").doc(paymentData.relatedInvitationId).update({
      status: "hired",
      chatLockedForPayment: false,
      updatedAt: FieldValue.serverTimestamp()
    });

    await writeAudit(
      paymentData.relatedCompanyId,
      "company",
      "company_success_fee_paid",
      "worker",
      paymentData.relatedWorkerId,
      { invitationId: paymentData.relatedInvitationId, paymentId, providerPaymentId, source: metadata.type ?? "mercadopago" }
    );
  }
}

async function writeAccountingEntry(
  paymentId: string,
  providerPaymentId: string,
  paymentData: Record<string, unknown> | undefined
) {
  if (!paymentData?.amount || !paymentData?.paymentType) {
    return;
  }

  const gross = Number(paymentData.amount);
  const netRevenue = Number((gross / 1.19).toFixed(2));
  const iva = Number((gross - netRevenue).toFixed(2));
  // Tasa MP configurable en configuracion_sistema/pricing.mpCommissionRate; default 3.99%
  const configSnap = await db.collection("configuracion_sistema").doc("pricing").get();
  const mpRate = Number(configSnap.data()?.mpCommissionRate ?? 0.0399);
  const mpCommission = Number((gross * mpRate).toFixed(2));
  const entryRef = db.collection("accountingEntries").doc(paymentId);

  await entryRef.set({
    entryId: paymentId,
    paymentId,
    providerPaymentId,
    source: "mercadopago",
    paymentType: paymentData.paymentType,
    currency: paymentData.currency ?? "USD",
    grossAmount: gross,
    netRevenue,
    ivaDebitoFiscal: iva,
    estimatedMercadoPagoCommission: mpCommission,
    status: "pending_accounting_review",
    siiStatus: "pending_provider",
    folioSii: null,
    pdfUrl: null,
    xmlUrl: null,
    couponCode: paymentData.couponCode ?? null,
    createdAt: FieldValue.serverTimestamp(),
    accounts: {
      fundsInTransit: "1.1.01.02 Mercado Pago Fondos en Transito",
      ivaDebit: "2.1.03.01 IVA Debito Fiscal 19%",
      revenue: "4.1.01.01 Ingresos por Servicios de Reclutamiento",
      mpFee: "5.1.02.01 Gasto Comision Mercado Pago"
    },
    lines: [
      { account: "1.1.01.02", debit: gross, credit: 0, description: "Cobro bruto aprobado por Mercado Pago" },
      { account: "4.1.01.01", debit: 0, credit: netRevenue, description: "Ingreso neto servicio Perfil Primero" },
      { account: "2.1.03.01", debit: 0, credit: iva, description: "IVA debito fiscal estimado 19%" },
      { account: "5.1.02.01", debit: mpCommission, credit: 0, description: "Comision Mercado Pago estimada" },
      { account: "1.1.01.02", debit: 0, credit: mpCommission, description: "Descuento comision Mercado Pago estimada" }
    ]
  });
}

function buildGoogleCalendarUrl({
  title,
  startsAt,
  endsAt,
  details,
  location
}: {
  title: string;
  startsAt: Date;
  endsAt: Date;
  details: string;
  location: string;
}) {
  const format = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${format(startsAt)}/${format(endsAt)}`,
    details,
    location
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const paymentId = metadata.paymentId ?? session.client_reference_id ?? "";

  if (!paymentId) return;

  const paymentRef = db.collection("payments").doc(paymentId);

  let alreadyProcessed = false;
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(paymentRef);
    if (!snap.exists || snap.data()?.status === "paid") { alreadyProcessed = true; return; }
    const expectedAmount = Number(snap.data()?.amount ?? 0);
    const receivedAmount = Math.round((session.amount_total ?? 0) / 100);
    if (expectedAmount > 0 && Math.abs(receivedAmount - expectedAmount) > 5) {
      throw new HttpsError("failed-precondition", `Monto Stripe no coincide: esperado ${expectedAmount}, recibido ${receivedAmount}`);
    }
    tx.update(paymentRef, {
      status: "paid",
      providerPaymentId: session.id,
      receiptUrl: session.invoice as string ?? "",
      receiptNumber: session.id,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  if (alreadyProcessed) return;

  if (metadata.type === "worker_subscription" && metadata.workerId) {
    await db.collection("workerPublicProfiles").doc(metadata.workerId).set(
      {
        subscriptionStatus: "active",
        visibilityStatus: "visible",
        profileExpiresAt: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await writeAudit(metadata.workerId, "worker", "worker_subscription_paid", "worker", metadata.workerId, {
      paymentId
    });
  }

  if (
    metadata.type === "company_contact_unlock"
    && metadata.companyId
    && metadata.workerId
    && metadata.invitationId
  ) {
    const unlockRef = db.collection("contactUnlocks").doc();

    await unlockRef.set({
      unlockId: unlockRef.id,
      companyId: metadata.companyId,
      workerId: metadata.workerId,
      invitationId: metadata.invitationId,
      paymentId,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30)
    });

    await db.collection("invitations").doc(metadata.invitationId).update({
      status: "unlocked",
      updatedAt: FieldValue.serverTimestamp()
    });

    await writeAudit(
      metadata.companyId,
      "company",
      "private_profile_unlocked",
      "worker",
      metadata.workerId,
      { invitationId: metadata.invitationId, paymentId }
    );
  }
}

function buildCvQuotaFallback(fileName: string) {
  const cleanName = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    headline: "Perfil profesional disponible",
    summary: "CV subido correctamente. La extracción automática con Google IA quedó pendiente por cuota disponible; completa o ajusta este resumen antes de publicar.",
    skills: [],
    sectors: ["Servicios"],
    yearsOfExperience: 0,
    suggestedSalaryMin: 750000,
    suggestedSalaryMax: 1000000,
    cvAnalysisSummary: "CV recibido. Analisis IA pendiente por cuota de Google.",
    formattedCv: [
      "Perfil",
      "CV recibido en Perfil Primero. Completa este resumen con experiencia, logros y disponibilidad para que las empresas puedan evaluar el perfil.",
      "",
      "Archivo recibido",
      cleanName || fileName,
      "",
      "Estado",
      "Analisis automatico pendiente por cuota de Google IA. El perfil puede editarse manualmente y volver a analizarse cuando la cuota este disponible.",
      "",
      "Habilidades",
      "Agrega habilidades clave separadas por coma.",
      "",
      "Experiencia",
      "Agrega cargos, rubros, anos de experiencia y responsabilidades principales."
    ].join("\n")
  };
}

function isGeminiRecoverableError(error: unknown) {
  if (!(error instanceof HttpsError)) {
    return false;
  }

  return ["resource-exhausted", "failed-precondition"].includes(error.code);
}

function calculateFallbackMatchScore(requiredSkills: string, worker: unknown) {
  const requirements = requiredSkills
    .toLowerCase()
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const workerText = JSON.stringify(worker ?? {}).toLowerCase();
  const matched = requirements.filter((skill) => workerText.includes(skill)).length;
  const base = requirements.length ? Math.round((matched / requirements.length) * 70) : 35;
  const availabilityBoost = workerText.includes("listening") || workerText.includes("visible") ? 15 : 0;
  return Math.max(20, Math.min(85, base + availabilityBoost));
}

function profileAdviceSchema(): JsonSchema {
  return {
    type: Type.OBJECT,
    properties: {
      advice: { type: Type.STRING }
    },
    required: ["advice"]
  };
}

function cvAnalysisSchema(): JsonSchema {
  return {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      summary: { type: Type.STRING },
      skills: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      sectors: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      yearsOfExperience: { type: Type.NUMBER },
      suggestedSalaryMin: { type: Type.NUMBER },
      suggestedSalaryMax: { type: Type.NUMBER },
      cvAnalysisSummary: { type: Type.STRING },
      formattedCv: { type: Type.STRING }
    },
    required: [
      "headline",
      "summary",
      "skills",
      "sectors",
      "yearsOfExperience",
      "suggestedSalaryMin",
      "suggestedSalaryMax",
      "cvAnalysisSummary",
      "formattedCv"
    ]
  };
}

function candidateMatchSchema(): JsonSchema {
  return {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER },
      verdict: { type: Type.STRING },
      reasons: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      risks: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["score", "verdict", "reasons", "risks"]
  };
}

function contactSignalSchema(): JsonSchema {
  return {
    type: Type.OBJECT,
    properties: {
      contactDetected: { type: Type.BOOLEAN },
      signal: { type: Type.STRING }
    },
    required: ["contactDetected", "signal"]
  };
}

function buildGeminiError(error: unknown, model: string) {
  const status = typeof error === "object" && error !== null && "status" in error
    ? Number((error as { status?: number }).status)
    : 0;
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: string | number }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : String(error);
  const lower = `${code} ${message}`.toLowerCase();

  if (status === 429 || lower.includes("resource_exhausted") || lower.includes("quota")) {
    return new HttpsError(
      "resource-exhausted",
      `Google IA no tiene cuota disponible para el modelo ${model}. El archivo puede quedar guardado y el perfil se puede completar manualmente mientras se activa facturacion o se aumenta cuota.`
    );
  }

  if (status === 404 || lower.includes("not found") || lower.includes("not supported")) {
    return new HttpsError("not-found", `Modelo ${model} no disponible en esta version de la API. Contacta soporte.`);
  }

  if (status === 400 || lower.includes("invalid")) {
    return new HttpsError("invalid-argument", "Google IA rechazo el archivo. Sube un PDF o TXT legible y vuelve a intentar.");
  }

  if (status === 401 || status === 403 || lower.includes("permission") || lower.includes("api key")) {
    return new HttpsError("permission-denied", "Google IA no pudo validar la clave o permisos configurados.");
  }

  return new HttpsError("internal", "Google IA no pudo responder en este momento. Intenta nuevamente mas tarde.");
}


// ── ATS Public API ─────────────────────────────────────────────────────────────
// Authenticated via X-API-Key header. Keys stored in configuracion_sistema/atsApiKeys.

async function validateAtsApiKey(key: string): Promise<boolean> {
  if (!key) return false;
  const snap = await db.collection("configuracion_sistema").doc("atsApiKeys").get();
  if (!snap.exists) return false;
  const keys = snap.data()!.keys as string[] | undefined;
  return Array.isArray(keys) && keys.includes(key);
}

export const atsListProfiles = onRequest(async (req, res) => {
  // Restrict CORS to known ATS integrators — wildcards not safe for authenticated APIs
  const allowedOrigins = (process.env.ATS_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.origin ?? "";
  if (allowedOrigins.length && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const apiKey = req.headers["x-api-key"] as string | undefined;
  if (!await validateAtsApiKey(apiKey ?? "")) {
    res.status(401).json({ error: "API key inválida o ausente." });
    return;
  }

  const pageSize = Math.min(50, Number(req.query.pageSize ?? 20));
  const region = req.query.region as string | undefined;
  const area = req.query.area as string | undefined;

  const constraints: FirebaseFirestore.Query = db.collection("workerPublicProfiles")
    .where("visibilityStatus", "==", "visible")
    .where("subscriptionStatus", "==", "active");

  let q = region ? constraints.where("region", "==", region) : constraints;
  if (area) q = q.where("sectors", "array-contains", area);
  q = q.limit(pageSize);

  const snap = await q.get();
  const profiles = snap.docs.map((d) => {
    const data = d.data();
    return {
      profileCode: data.profileCode,
      headline: data.headline,
      region: data.region,
      sectors: data.sectors,
      skills: data.skills,
      workModes: data.workModes,
      expectedSalaryMin: data.expectedSalaryMin,
      expectedSalaryMax: data.expectedSalaryMax,
      availability: data.availability,
      assessmentScores: data.assessmentScores ?? null
    };
  });

  res.json({ profiles, total: profiles.length, pageSize });
});

export const atsCreateInvitation = onRequest(async (req, res) => {
  const allowedOrigins2 = (process.env.ATS_ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin2 = req.headers.origin ?? "";
  if (allowedOrigins2.length && allowedOrigins2.includes(origin2)) {
    res.set("Access-Control-Allow-Origin", origin2);
  }
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido." }); return; }

  const apiKey = req.headers["x-api-key"] as string | undefined;
  if (!await validateAtsApiKey(apiKey ?? "")) {
    res.status(401).json({ error: "API key inválida o ausente." });
    return;
  }

  const { profileCode, opportunityTitle, salaryMin, salaryMax, workMode, location, message, companyId } = req.body as Record<string, string | number>;
  if (!profileCode || !opportunityTitle || !companyId) {
    res.status(400).json({ error: "Faltan campos requeridos: profileCode, opportunityTitle, companyId." });
    return;
  }

  // Verificar que la empresa existe y está verificada
  const companyVerifySnap = await db.collection("companyProfiles").doc(String(companyId)).get();
  if (!companyVerifySnap.exists || companyVerifySnap.data()?.verificationStatus !== "verified") {
    res.status(403).json({ error: "Empresa no verificada o no encontrada." });
    return;
  }

  const profileSnap = await db.collection("workerPublicProfiles")
    .where("profileCode", "==", profileCode)
    .limit(1)
    .get();

  if (profileSnap.empty) {
    res.status(404).json({ error: "Perfil no encontrado." });
    return;
  }

  const profile = profileSnap.docs[0];
  const invRef = db.collection("invitations").doc();
  await invRef.set({
    invitationId: invRef.id,
    workerId: profile.id,
    companyId,
    opportunityTitle,
    opportunitySummary: message ?? "",
    salaryMin: Number(salaryMin) || 0,
    salaryMax: Number(salaryMax) || 0,
    currency: "CLP",
    workMode: workMode ?? "hybrid",
    location: location ?? "",
    contractType: "full_time",
    message: message ?? "",
    status: "sent",
    source: "ats_api",
    createdAt: FieldValue.serverTimestamp()
  });

  res.json({ invitationId: invRef.id, status: "sent" });
});

// ── Public stats (landing counter) ────────────────────────────────────────────

export const updatePublicStats = onSchedule("every 60 minutes", async () => {
  const [workersSnap, companiesSnap] = await Promise.all([
    db.collection("workerPublicProfiles").where("visibilityStatus", "==", "visible").count().get(),
    db.collection("companyProfiles").where("verificationStatus", "==", "verified").count().get()
  ]);
  await db.collection("publicStats").doc("main").set({
    workers: workersSnap.data().count,
    companies: companiesSnap.data().count,
    updatedAt: FieldValue.serverTimestamp()
  });
});

// ── Email transaccional (SendGrid) ────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "contacto@perfil-primero.cl";
  if (!apiKey) return; // email disabled if key not set
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: "Perfil Primero" },
      subject,
      content: [{ type: "text/html", value: html }]
    })
  });
}

// Notifica al postulante cuando recibe una nueva invitación (función interna — no callable)
async function notifyWorkerInvitationReceived(invitationId: string): Promise<void> {
  const invSnap = await db.collection("invitations").doc(invitationId).get();
  if (!invSnap.exists) return;
  const inv = invSnap.data()!;
  const privateSnap = await db.collection("workerPrivateProfiles").doc(inv.workerId).get();
  if (!privateSnap.exists) return;
  const email: string = privateSnap.data()!.email;
  if (!email) return;
  await sendEmail(
    email,
    "Tienes una nueva invitación en Perfil Primero",
    `<p>Hola,</p>
     <p>Una empresa verificada te envió una invitación para el cargo <strong>${inv.opportunityTitle}</strong>
     con rango de sueldo $${inv.salaryMin?.toLocaleString("es-CL")} – $${inv.salaryMax?.toLocaleString("es-CL")} CLP.</p>
     <p>Entra a <a href="${appUrl}/postulante">tu panel</a> para aceptar o rechazar antes de que venza la invitación.</p>
     <p>— Equipo Perfil Primero</p>`
  );
}

// Notifica a la empresa cuando el postulante acepta (función interna — no callable)
async function notifyCompanyInvitationAccepted(invitationId: string): Promise<void> {
  const invSnap = await db.collection("invitations").doc(invitationId).get();
  if (!invSnap.exists) return;
  const inv = invSnap.data()!;
  const companyPrivSnap = await db.collection("companyProfiles").doc(inv.companyId).get();
  if (!companyPrivSnap.exists) return;
  const companyEmail: string = companyPrivSnap.data()!.email ?? companyPrivSnap.data()!.contactEmail;
  if (!companyEmail) return;
  await sendEmail(
    companyEmail,
    "El postulante aceptó tu invitación — Perfil Primero",
    `<p>Hola,</p>
     <p>El postulante al que invitaste para <strong>${inv.opportunityTitle}</strong> aceptó tu invitación.</p>
     <p>Entra a <a href="${appUrl}/empresa">tu panel</a> para continuar el proceso y coordinar la entrevista.</p>
     <p>— Equipo Perfil Primero</p>`
  );
}

// Recordatorio de perfil por vencer (llamado desde expireOmilProfiles o manualmente)
export const dailyHealthCheck = onSchedule("every 24 hours", async () => {
  const issues: string[] = [];
  const warnings: string[] = [];

  // 1. Verificar claves de entorno críticas
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) issues.push("MERCADOPAGO_ACCESS_TOKEN no configurada");
  // GEMINI_API_KEY ya no es requerida — se usa Vertex AI con credenciales del service account
  if (!process.env.SENDGRID_API_KEY) warnings.push("SENDGRID_API_KEY no configurada — emails desactivados");
  if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) warnings.push("MERCADOPAGO_WEBHOOK_SECRET no configurada — validación de firma omitida");

  // 2. Cupones activos sin fecha de expiración
  const couponsSnap = await db.collection("coupons").where("active", "==", true).get();
  const couponsWithoutExpiry = couponsSnap.docs.filter(d => !d.data().expiresAt);
  if (couponsWithoutExpiry.length > 0) {
    issues.push(`${couponsWithoutExpiry.length} cupones activos sin expiración: ${couponsWithoutExpiry.map(d => d.id).join(", ")}`);
  }

  // 3. Workers con perfil visible pero suscripción vencida
  const expiredSnap = await db.collection("workerPublicProfiles")
    .where("visibilityStatus", "==", "visible")
    .where("profileExpiresAt", "<", Timestamp.now())
    .limit(20)
    .get();
  if (!expiredSnap.empty) {
    warnings.push(`${expiredSnap.size} perfiles visibles con suscripción vencida`);
  }

  // 4. Pagos pendientes de más de 48 horas
  const stalePendingSnap = await db.collection("payments")
    .where("status", "==", "pending")
    .where("createdAt", "<", Timestamp.fromMillis(Date.now() - 172_800_000))
    .limit(10)
    .get();
  if (!stalePendingSnap.empty) {
    warnings.push(`${stalePendingSnap.size} pagos en estado "pending" por más de 48h`);
  }

  const status = issues.length > 0 ? "degraded" : warnings.length > 0 ? "warning" : "healthy";

  await db.collection("configuracion_sistema").doc("healthCheck").set({
    status,
    issues,
    warnings,
    lastCheckedAt: FieldValue.serverTimestamp(),
    checksRan: 4
  });

  if (issues.length > 0) {
    await writeAudit("system", "admin", "health_check_failed", "system", "healthCheck", {
      issues: issues.join(" | ").slice(0, 500)
    });
  }
});

export const sendDeadlineReminders = onSchedule("every 60 minutes", async () => {
  const now = Date.now();
  const window48h = Timestamp.fromMillis(now + 1000 * 60 * 60 * 48);

  const snap = await db.collection("invitations")
    .where("decisionDeadline", "<=", window48h)
    .where("decisionDeadline", ">=", Timestamp.fromMillis(now))
    .where("status", "in", ["sent", "viewed"])
    .get();

  for (const doc of snap.docs) {
    const reminderId = `deadline-${doc.id}`;
    const reminderRef = db.collection("emailReminders").doc(reminderId);
    const existing = await reminderRef.get();
    if (existing.exists) continue;

    const inv = doc.data();
    const workerSnap = await db.collection("workerPrivateProfiles").doc(inv.workerId).get();
    if (!workerSnap.exists) continue;

    const email: string = workerSnap.data()!.email;
    const deadline = (inv.decisionDeadline as Timestamp).toDate();
    const daysLeft = Math.ceil((deadline.getTime() - now) / 86400000);
    const urgency = daysLeft <= 1 ? "⚠️ Urgente" : "📅";

    await sendEmail(
      email,
      `${urgency} Tienes ${daysLeft} día${daysLeft === 1 ? "" : "s"} para responder una invitación`,
      `<p>Hola,</p>
       <p>La empresa te invitó al cargo <strong>${inv.opportunityTitle}</strong> y la fecha límite para responder es el <strong>${deadline.toLocaleDateString("es-CL")}</strong>.</p>
       <p>Entra a <a href="${appUrl}/postulante">tu panel</a> para aceptar o revisar la invitación antes de que venza.</p>
       <p>— Equipo Perfil Primero</p>`
    );

    await reminderRef.set({
      type: "deadline_reminder",
      invitationId: doc.id,
      workerId: inv.workerId,
      sentAt: FieldValue.serverTimestamp(),
      status: "sent"
    });
  }
});

export const sendExpiryReminder = onCall<{ workerId: string }>(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Se requiere autenticación.");
  const { workerId } = request.data;
  const privateSnap = await db.collection("workerPrivateProfiles").doc(workerId).get();
  if (!privateSnap.exists) return;
  const email: string = privateSnap.data()!.email;
  await sendEmail(
    email,
    "Tu perfil en Perfil Primero vence pronto",
    `<p>Hola,</p>
     <p>Tu perfil activo vence en los próximos 7 días. Renueva tu suscripción por $999 CLP para seguir visible.</p>
     <p>Entra a <a href="${appUrl}/postulante">tu panel</a> para renovar.</p>
     <p>— Equipo Perfil Primero</p>`
  );
});

// ─────────────────────────────────────────────────────────────────────────────

function getGeminiAI(): GoogleGenAI {
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "perfil-primero",
    location: "us-central1"
  });
}

async function generateJsonWithGemini(
  prompt: string,
  responseSchema: JsonSchema,
  file?: { mimeType: string; base64: string }
) {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const startedAt = Date.now();

  const ai = getGeminiAI();
  const parts = file
    ? [
        { text: prompt },
        {
          inlineData: {
            mimeType: file.mimeType,
            data: file.base64
          }
        }
      ]
    : [{ text: prompt }];

  let responseText = "";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
      config: {
        temperature: 0.25,
        maxOutputTokens: 1800,
        responseMimeType: "application/json",
        responseSchema
      }
    });
    responseText = response.text?.trim() ?? "";
    await db.collection("aiUsageLogs").doc().set({
      endpointApi: "gemini-json",
      model,
      status: "success",
      latencyMs: Date.now() - startedAt,
      promptChars: prompt.length,
      responseChars: responseText.length,
      hasFile: Boolean(file),
      createdAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("[Gemini] raw error:", JSON.stringify(error, Object.getOwnPropertyNames(error as object)));
    const geminiError = buildGeminiError(error, model);
    await db.collection("aiUsageLogs").doc().set({
      endpointApi: "gemini-json",
      model,
      status: "error",
      errorCode: geminiError.code,
      errorMessage: geminiError.message,
      latencyMs: Date.now() - startedAt,
      promptChars: prompt.length,
      hasFile: Boolean(file),
      createdAt: FieldValue.serverTimestamp()
    });
    throw geminiError;
  }

  if (!responseText) {
    throw new HttpsError("internal", "Gemini no devolvió JSON.");
  }

  try {
    return JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new HttpsError("internal", "La IA no devolvió un JSON válido.");
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PLAN EMPRESA MENSUAL — $9.990 CLP/mes · 5 contactos incluidos
// ══════════════════════════════════════════════════════════════════════════════

const companyMonthlyPriceClp = 9990;
const companyMonthlyContactCredits = 5;

// ══════════════════════════════════════════════════════════════════════════════
// PLAN EMPRESA ILIMITADO — $29.990 CLP/mes · contactos ilimitados
// ══════════════════════════════════════════════════════════════════════════════

const companyUnlimitedPriceClp = 29990;

export const createCompanyMonthlyCheckout = onCall(async (request) => {
  const companyId = request.auth?.uid;
  if (!companyId) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  checkRateLimit(companyId, "monthly_checkout", 3, 60_000);

  const companySnap = await db.collection("companyProfiles").doc(companyId).get();
  if (!companySnap.exists) throw new HttpsError("not-found", "Perfil de empresa no encontrado.");
  const company = companySnap.data()!;
  if (company.verificationStatus !== "verified") {
    throw new HttpsError("failed-precondition", "Tu empresa debe estar verificada para contratar el plan mensual.");
  }

  const existingPlan = company.monthlyPlan;
  if (existingPlan?.active && existingPlan.renewsAt?.toMillis?.() > Date.now()) {
    throw new HttpsError("already-exists", "Ya tienes un plan mensual activo.");
  }

  const paymentId = db.collection("payments").doc().id;
  const renewsAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.collection("payments").doc(paymentId).set({
    paymentId,
    userId: companyId,
    relatedCompanyId: companyId,
    amount: companyMonthlyPriceClp,
    currency: "CLP",
    paymentType: "company_monthly_plan",
    status: "pending",
    renewsAt: Timestamp.fromDate(renewsAt),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const mp = getMercadoPagoClient();
  const preference = new Preference(mp);
  const result = await preference.create({
    body: {
      items: [{
        id: paymentId,
        title: "Plan Empresa Mensual — Perfil Primero",
        quantity: 1,
        unit_price: companyMonthlyPriceClp,
        currency_id: "CLP"
      }],
      external_reference: paymentId,
      back_urls: {
        success: `${appUrl}/empresa?checkout=success`,
        failure: `${appUrl}/empresa?checkout=failure`,
        pending: `${appUrl}/empresa?checkout=pending`
      },
      auto_return: "approved",
      notification_url: `${process.env.FUNCTIONS_BASE_URL ?? "https://us-central1-perfil-primero.cloudfunctions.net"}/mercadoPagoWebhook`
    }
  });

  await db.collection("payments").doc(paymentId).update({ mpPreferenceId: result.id });
  return { url: result.init_point ?? "" };
});

export const createCompanyUnlimitedCheckout = onCall(async (request) => {
  const companyId = request.auth?.uid;
  if (!companyId) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  checkRateLimit(companyId, "unlimited_checkout", 3, 60_000);

  const companySnap = await db.collection("companyProfiles").doc(companyId).get();
  if (!companySnap.exists) throw new HttpsError("not-found", "Perfil de empresa no encontrado.");
  const company = companySnap.data()!;
  if (company.verificationStatus !== "verified") {
    throw new HttpsError("failed-precondition", "Tu empresa debe estar verificada para contratar el plan ilimitado.");
  }

  const existing = company.unlimitedPlan;
  if (existing?.active && existing.renewsAt?.toMillis?.() > Date.now()) {
    throw new HttpsError("already-exists", "Ya tienes un plan ilimitado activo.");
  }

  const paymentId = db.collection("payments").doc().id;
  const renewsAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.collection("payments").doc(paymentId).set({
    paymentId,
    userId: companyId,
    relatedCompanyId: companyId,
    amount: companyUnlimitedPriceClp,
    currency: "CLP",
    paymentType: "company_unlimited_plan",
    status: "pending",
    renewsAt: Timestamp.fromDate(renewsAt),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const mp = getMercadoPagoClient();
  const preference = new Preference(mp);
  const result = await preference.create({
    body: {
      items: [{
        id: paymentId,
        title: "Plan Empresa Ilimitado — Perfil Primero",
        quantity: 1,
        unit_price: companyUnlimitedPriceClp,
        currency_id: "CLP"
      }],
      external_reference: paymentId,
      back_urls: {
        success: `${appUrl}/empresa?checkout=success`,
        failure: `${appUrl}/empresa?checkout=failure`,
        pending: `${appUrl}/empresa?checkout=pending`
      },
      auto_return: "approved",
      notification_url: `${process.env.FUNCTIONS_BASE_URL ?? "https://us-central1-perfil-primero.cloudfunctions.net"}/mercadoPagoWebhook`
    }
  });

  await db.collection("payments").doc(paymentId).update({ mpPreferenceId: result.id });
  return { url: result.init_point ?? "" };
});

export const saveCompanyAlertPreferences = onCall<{
  enabled: boolean;
  areas: string[];
  regions: string[];
  salaryMax: number;
  workModes: string[];
}>(async (request) => {
  const companyId = request.auth?.uid;
  if (!companyId) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");

  const { enabled, areas, regions, salaryMax, workModes } = request.data;
  await db.collection("companyProfiles").doc(companyId).set(
    {
      alertPreferences: { enabled, areas, regions, salaryMax: Number(salaryMax) || 0, workModes },
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
  return { saved: true };
});

// ══════════════════════════════════════════════════════════════════════════════
// MATCHING DIARIO — notifica a empresas cuando aparecen candidatos afines
// ══════════════════════════════════════════════════════════════════════════════

export const dailyMatchingAlerts = onSchedule(
  { schedule: "every day 07:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const since = Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 24);

    const [newWorkersSnap, companiesSnap] = await Promise.all([
      db.collection("workerPublicProfiles")
        .where("visibilityStatus", "==", "visible")
        .where("updatedAt", ">=", since)
        .limit(200)
        .get(),
      db.collection("companyProfiles")
        .where("verificationStatus", "==", "verified")
        .limit(200)
        .get()
    ]);

    if (newWorkersSnap.empty) return;
    const workers = newWorkersSnap.docs.map(d => d.data());

    for (const companyDoc of companiesSnap.docs) {
      const company = companyDoc.data();
      const prefs = company.alertPreferences;
      if (!prefs?.enabled) continue;

      const contactEmail: string = company.email ?? company.contactEmail ?? "";
      if (!contactEmail) continue;

      const matches = workers.filter(w => {
        if (prefs.areas?.length && !prefs.areas.some((a: string) => w.sectors?.includes(a))) return false;
        if (prefs.regions?.length && !prefs.regions.includes(w.region)) return false;
        if (prefs.salaryMax && w.expectedSalaryMin > prefs.salaryMax) return false;
        if (prefs.workModes?.length && !prefs.workModes.some((m: string) => w.workModes?.includes(m))) return false;
        return true;
      });

      if (!matches.length) continue;

      const rows = matches.slice(0, 5).map(w =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${w.headline}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #eee">${w.region}</td>
         <td style="padding:6px 8px;border-bottom:1px solid #eee">$${(w.expectedSalaryMin ?? 0).toLocaleString("es-CL")} – $${(w.expectedSalaryMax ?? 0).toLocaleString("es-CL")} CLP</td></tr>`
      ).join("");

      await sendEmail(
        contactEmail,
        `${matches.length} candidato${matches.length > 1 ? "s" : ""} nuevo${matches.length > 1 ? "s" : ""} en Perfil Primero`,
        `<p>Hola ${company.companyName ?? ""},</p>
         <p>Hoy encontramos <strong>${matches.length} perfil${matches.length > 1 ? "es" : ""}</strong> que coincide${matches.length === 1 ? "" : "n"} con tus criterios de búsqueda:</p>
         <table style="width:100%;border-collapse:collapse;font-size:14px">
           <thead><tr style="background:#f0f3f7">
             <th style="padding:6px 8px;text-align:left">Cargo objetivo</th>
             <th style="padding:6px 8px;text-align:left">Región</th>
             <th style="padding:6px 8px;text-align:left">Renta esperada</th>
           </tr></thead>
           <tbody>${rows}</tbody>
         </table>
         ${matches.length > 5 ? `<p>...y ${matches.length - 5} más.</p>` : ""}
         <p><a href="${appUrl}/empresa" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Ver candidatos →</a></p>
         <p style="font-size:12px;color:#888">Para desactivar estas alertas entra a tu panel empresa → Configuración de alertas.</p>
         <p>— Equipo Perfil Primero</p>`
      );
    }
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// NURTURING POSTULANTES — reactivación de perfiles vencidos/inactivos
// ══════════════════════════════════════════════════════════════════════════════

export const workerReactivationNurturing = onSchedule(
  { schedule: "every day 10:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const now = Date.now();
    const sevenDaysAgo = Timestamp.fromMillis(now - 1000 * 60 * 60 * 24 * 7);
    const fourteenDaysAgo = Timestamp.fromMillis(now - 1000 * 60 * 60 * 24 * 14);
    const threeDaysAgo = Timestamp.fromMillis(now - 1000 * 60 * 60 * 24 * 3);

    // Grupo 1: perfiles vencidos hace 3–14 días → reactivación
    const expiredSnap = await db.collection("workerPublicProfiles")
      .where("visibilityStatus", "==", "expired")
      .where("profileExpiresAt", ">=", fourteenDaysAgo)
      .where("profileExpiresAt", "<=", threeDaysAgo)
      .limit(100)
      .get();

    for (const doc of expiredSnap.docs) {
      const profile = doc.data();
      const alreadySent = await db.collection("emailReminders")
        .where("workerId", "==", doc.id)
        .where("type", "==", "worker_reactivation")
        .where("createdAt", ">=", sevenDaysAgo)
        .limit(1)
        .get();
      if (!alreadySent.empty) continue;

      const privateSnap = await db.collection("workerPrivateProfiles").doc(doc.id).get();
      if (!privateSnap.exists) continue;
      const email: string = privateSnap.data()!.email;
      if (!email) continue;

      await sendEmail(
        email,
        "Tu perfil en Perfil Primero está inactivo — reactívalo hoy",
        `<p>Hola,</p>
         <p>Tu perfil <strong>${profile.headline || "en Perfil Primero"}</strong> venció hace unos días y ya no aparece en búsquedas de empresas verificadas.</p>
         <p>Reactívalo por <strong>$999 CLP/mes</strong> y vuelve a ser visible.</p>
         <p><a href="${appUrl}/postulante" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Reactivar mi perfil →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );

      await db.collection("emailReminders").add({
        workerId: doc.id,
        type: "worker_reactivation",
        email,
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      });
    }

    // Grupo 2: perfiles ocultos (nunca activados) con más de 7 días sin activar
    const hiddenSnap = await db.collection("workerPublicProfiles")
      .where("visibilityStatus", "==", "hidden")
      .where("subscriptionStatus", "==", "inactive")
      .where("createdAt", "<=", sevenDaysAgo)
      .limit(100)
      .get();

    for (const doc of hiddenSnap.docs) {
      const profile = doc.data();
      const alreadySent = await db.collection("emailReminders")
        .where("workerId", "==", doc.id)
        .where("type", "==", "worker_activation_nudge")
        .limit(1)
        .get();
      if (!alreadySent.empty) continue;

      const privateSnap = await db.collection("workerPrivateProfiles").doc(doc.id).get();
      if (!privateSnap.exists) continue;
      const email: string = privateSnap.data()!.email;
      if (!email) continue;

      await sendEmail(
        email,
        "Tu perfil está listo — solo falta activarlo",
        `<p>Hola,</p>
         <p>Creaste tu perfil en Perfil Primero${profile.headline ? ` como <strong>${profile.headline}</strong>` : ""}, pero aún no está visible para empresas.</p>
         <p>Con <strong>$999 CLP/mes</strong> tu perfil aparece en búsquedas de empresas verificadas que publican sueldo desde el primer contacto.</p>
         <p><a href="${appUrl}/postulante" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Activar mi perfil →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );

      await db.collection("emailReminders").add({
        workerId: doc.id,
        type: "worker_activation_nudge",
        email,
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      });
    }
  }
);

// ── resetWeeklyImpressions — lunes 00:00 Santiago: resetea contador semanal ───
export const resetWeeklyImpressions = onSchedule(
  { schedule: "every monday 00:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const snap = await db
      .collection("workerPublicProfiles")
      .where("visibilityStatus", "==", "visible")
      .limit(500)
      .get();

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let batch = db.batch();
    let count = 0;

    for (const docSnap of snap.docs) {
      batch.update(docSnap.ref, {
        "analytics.weekImpressions": 0,
        "analytics.weekResetsAt": FieldValue.serverTimestamp()
      });
      count++;
      if (count % 400 === 0) {
        batches.push(batch);
        batch = db.batch();
      }
    }
    if (count % 400 !== 0) batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));
  }
);

// ── calculateAndPersistBadges — calcula y persiste badges en todos los perfiles
export const calculateAndPersistBadges = onSchedule(
  { schedule: "every day 06:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const snap = await db
      .collection("workerPublicProfiles")
      .where("visibilityStatus", "in", ["visible", "paused"])
      .limit(500)
      .get();

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let batch = db.batch();
    let count = 0;

    for (const docSnap of snap.docs) {
      const p = docSnap.data();
      const badges: string[] = [];
      let completeness = 0;
      if ((p.skills ?? []).length >= 3) completeness += 20;
      if ((p.summary ?? "").length >= 80) completeness += 20;
      if ((p.workModes ?? []).length) completeness += 15;
      if ((p.expectedSalaryMin ?? 0) > 0) completeness += 15;
      if (p.cvAnalysisSummary) completeness += 15;
      if (p.assessmentScores && Object.values(p.assessmentScores as Record<string, number>).some((v) => v > 0)) completeness += 15;

      if (completeness >= 90) badges.push("perfil_completo");
      if (p.cvAnalysisSummary) badges.push("cv_validado");
      const sc = p.assessmentScores as Record<string, number> | undefined;
      if (sc && (sc.english ?? 0) > 0 && (sc.spanish ?? 0) > 0 && (sc.personality ?? 0) > 0) badges.push("tests_completos");
      if (p.availability === "actively_looking") badges.push("busca_activamente");
      if (p.experienceLevel === "senior" || p.experienceLevel === "lead") badges.push("senior");
      if ((p.workModes ?? []).length >= 2) badges.push("multimodalidad");

      batch.update(docSnap.ref, { badges });
      count++;
      if (count % 400 === 0) {
        batches.push(batch);
        batch = db.batch();
      }
    }
    if (count % 400 !== 0) batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));
  }
);

// ── segmentWorkers — clasifica postulantes: inactive / active / hired ─────────
export const segmentWorkers = onSchedule(
  { schedule: "every day 05:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const [visibleSnap, hiddenSnap, hiredInvSnap] = await Promise.all([
      db.collection("workerPublicProfiles").where("visibilityStatus", "==", "visible").limit(500).get(),
      db.collection("workerPublicProfiles").where("visibilityStatus", "in", ["hidden", "paused", "expired"]).limit(500).get(),
      db.collection("invitations").where("status", "==", "hired").limit(500).get()
    ]);

    const hiredWorkerIds = new Set(hiredInvSnap.docs.map((d) => d.data().workerId as string));

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let batch = db.batch();
    let count = 0;

    const writeSegment = (ref: FirebaseFirestore.DocumentReference, segment: string) => {
      batch.update(ref, { segment });
      count++;
      if (count % 400 === 0) {
        batches.push(batch);
        batch = db.batch();
      }
    };

    for (const docSnap of visibleSnap.docs) {
      writeSegment(docSnap.ref, hiredWorkerIds.has(docSnap.id) ? "hired" : "active");
    }
    for (const docSnap of hiddenSnap.docs) {
      writeSegment(docSnap.ref, hiredWorkerIds.has(docSnap.id) ? "hired" : "inactive");
    }

    if (count % 400 !== 0) batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));
  }
);

// ── semanticWorkerSearch — Gemini extrae filtros desde lenguaje natural ────────
export const semanticWorkerSearch = onCall(
  { region: "us-central1", timeoutSeconds: 30 },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    checkRateLimit(uid, "semanticSearch", 10, 60_000);

    const query = String((request.data as { query?: string }).query ?? "").slice(0, 500);
    if (!query) return { filters: {} };

    const ai = getGeminiAI();
    const schema = {
      type: Type.OBJECT,
      properties: {
        region: { type: Type.STRING, description: "Región de Chile o vacío" },
        area: { type: Type.STRING, description: "Área laboral o vacío" },
        salaryMax: { type: Type.NUMBER, description: "Renta máxima CLP o 0" },
        keywords: { type: Type.STRING, description: "Palabras clave de cargo o habilidades" }
      }
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [{ text: `Extrae filtros de búsqueda laboral en Chile del siguiente texto. Devuelve JSON.\n\nTexto: ${query}` }]
      }],
      config: { responseMimeType: "application/json", responseSchema: schema }
    });

    const parsed = JSON.parse(result.text ?? "{}") as { region?: string; area?: string; salaryMax?: number; keywords?: string };
    return {
      filters: {
        region: parsed.region ?? "",
        area: parsed.area ?? "",
        salaryMax: parsed.salaryMax ? String(parsed.salaryMax) : "",
        query: parsed.keywords ?? ""
      }
    };
  }
);

// ── recordProfileImpression — incrementa contador de visitas semanales ────────
export const recordProfileImpression = onCall(
  { region: "us-central1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    checkRateLimit(uid, "impression", 50, 60_000);

    const workerId = String((request.data as { workerId?: string }).workerId ?? "");
    if (!workerId) throw new HttpsError("invalid-argument", "workerId requerido.");

    const profileRef = db.collection("workerPublicProfiles").doc(workerId);
    await profileRef.update({
      "analytics.totalImpressions": FieldValue.increment(1),
      "analytics.weekImpressions": FieldValue.increment(1)
    });

    return { ok: true };
  }
);

// ── recordSearchAnalytics — persiste los filtros de búsqueda de empresa ──────
export const recordSearchAnalytics = onCall(
  { region: "us-central1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    checkRateLimit(uid, "searchAnalytics", 60, 60_000);

    const { region, area, salaryMax, query: searchQuery } = request.data as {
      region?: string; area?: string; salaryMax?: number; query?: string;
    };

    await db.collection("searchAnalytics").add({
      companyId: uid,
      region: region ?? "",
      area: area ?? "",
      salaryMax: Number(salaryMax ?? 0),
      query: String(searchQuery ?? "").slice(0, 200),
      createdAt: FieldValue.serverTimestamp()
    });

    return { ok: true };
  }
);

// ── companyPlanExpiryReminders — avisa a empresas 3 días antes de vencimiento ─
export const companyPlanExpiryReminders = onSchedule(
  { schedule: "every day 09:30", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const in3Days = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 3);
    const now = Timestamp.now();

    const snap = await db.collection("companyProfiles")
      .where("monthlyPlan.active", "==", true)
      .where("monthlyPlan.renewsAt", ">=", now)
      .where("monthlyPlan.renewsAt", "<=", in3Days)
      .limit(100)
      .get();

    for (const doc of snap.docs) {
      const company = doc.data();
      const email: string = company.contactEmail ?? company.email ?? "";
      if (!email) continue;

      const reminderId = `company-plan-expiry-${doc.id}`;
      const reminderRef = db.collection("emailReminders").doc(reminderId);
      const existing = await reminderRef.get();
      if (existing.exists) continue;

      const renewsAt = (company.monthlyPlan?.renewsAt as Timestamp)?.toDate();
      const dateStr = renewsAt?.toLocaleDateString("es-CL", { day: "2-digit", month: "long" }) ?? "pronto";

      await sendEmail(
        email,
        `⏰ Tu plan Perfil Primero vence el ${dateStr} — renuévalo para no perder acceso`,
        `<p>Hola equipo de <strong>${company.companyName}</strong>,</p>
         <p>Tu plan mensual empresa vence el <strong>${dateStr}</strong>. Cuando venza, ya no podrás enviar nuevas invitaciones ni desbloquear contactos.</p>
         <p>Renueva ahora para mantener el acceso continuo.</p>
         <p><a href="${appUrl}/empresa" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Renovar plan →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );

      await reminderRef.set({
        type: "company_plan_expiry",
        companyId: doc.id,
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      });
    }
  }
);

// ── invitationNoResponseReminder — recuerda al postulante invitaciones sin ver ─
export const invitationNoResponseReminder = onSchedule(
  { schedule: "every day 10:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    // Invitaciones enviadas hace 3 días que siguen en estado "sent" (no "viewed")
    const threeDaysAgo = Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 24 * 3);
    const sixDaysAgo  = Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 24 * 6);

    const snap = await db.collection("invitations")
      .where("status", "==", "sent")
      .where("createdAt", "<=", threeDaysAgo)
      .where("createdAt", ">=", sixDaysAgo)
      .limit(100)
      .get();

    for (const doc of snap.docs) {
      const inv = doc.data();
      const reminderId = `inv-noresponse-${doc.id}`;
      const existing = await db.collection("emailReminders").doc(reminderId).get();
      if (existing.exists) continue;

      const privateSnap = await db.collection("workerPrivateProfiles").doc(inv.workerId).get();
      if (!privateSnap.exists) continue;
      const email: string = privateSnap.data()!.email;
      if (!email) continue;

      await sendEmail(
        email,
        "Tienes una invitación pendiente de respuesta — Perfil Primero",
        `<p>Hola,</p>
         <p>Hace 3 días recibiste una invitación para el cargo <strong>${inv.opportunityTitle}</strong>
         con sueldo $${inv.salaryMin?.toLocaleString("es-CL")} – $${inv.salaryMax?.toLocaleString("es-CL")} CLP.</p>
         <p>La invitación vence pronto. Entra a tu panel para aceptarla o rechazarla.</p>
         <p><a href="${appUrl}/postulante" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Ver invitación →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );

      await db.collection("emailReminders").doc(reminderId).set({
        type: "invitation_no_response",
        invitationId: doc.id,
        workerId: inv.workerId,
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      });
    }
  }
);

// ── workerWelcomeEmail — da bienvenida a trabajadores nuevos con checklist ────
export const workerWelcomeEmail = onSchedule(
  { schedule: "every 2 hours", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    // Perfiles creados entre 1h y 3h atrás que no han recibido bienvenida
    const oneHourAgo   = Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 1);
    const threeHoursAgo = Timestamp.fromMillis(Date.now() - 1000 * 60 * 60 * 3);

    const snap = await db.collection("workerPublicProfiles")
      .where("createdAt", "<=", oneHourAgo)
      .where("createdAt", ">=", threeHoursAgo)
      .limit(50)
      .get();

    for (const doc of snap.docs) {
      const reminderId = `worker-welcome-${doc.id}`;
      const existing = await db.collection("emailReminders").doc(reminderId).get();
      if (existing.exists) continue;

      const privateSnap = await db.collection("workerPrivateProfiles").doc(doc.id).get();
      if (!privateSnap.exists) continue;
      const email: string = privateSnap.data()!.email;
      if (!email) continue;

      const name: string = (privateSnap.data()!.preferredName ?? "").split(" ")[0] ?? "Hola";

      await sendEmail(
        email,
        "Bienvenido/a a Perfil Primero — 3 pasos para recibir tu primera invitación",
        `<p>Hola ${name},</p>
         <p>Ya tienes tu perfil creado en <strong>Perfil Primero</strong>. Para que las empresas verificadas puedan encontrarte, sigue estos 3 pasos:</p>
         <ol>
           <li><strong>Completa tu perfil</strong> — agrega al menos 3 habilidades y un resumen de 80+ caracteres.</li>
           <li><strong>Sube tu CV</strong> — la IA lo analiza y mejora tu perfil automáticamente.</li>
           <li><strong>Activa la visibilidad</strong> — $999 CLP/mes. Sin visibilidad activa, las empresas no te encuentran.</li>
         </ol>
         <p><a href="${appUrl}/postulante" style="background:#0094d4;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Completar mi perfil →</a></p>
         <p>— Equipo Perfil Primero</p>`
      );

      await db.collection("emailReminders").doc(reminderId).set({
        type: "worker_welcome",
        workerId: doc.id,
        status: "sent",
        sentAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp()
      });
    }
  }
);

// ── submitEmployerReview — postulante reseña a la empresa como empleador ──────
export const submitEmployerReview = onCall(
  { region: "us-central1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    checkRateLimit(uid, "employerReview", 3, 3_600_000);

    const { invitationId, score, comment } = request.data as {
      invitationId: string;
      score: number;
      comment: string;
    };

    if (!invitationId || !score) throw new HttpsError("invalid-argument", "Faltan datos.");
    if (score < 1 || score > 5) throw new HttpsError("invalid-argument", "Puntaje inválido (1–5).");

    const invSnap = await db.collection("invitations").doc(invitationId).get();
    if (!invSnap.exists) throw new HttpsError("not-found", "Invitación no encontrada.");
    const inv = invSnap.data()!;
    if (inv.workerId !== uid) throw new HttpsError("permission-denied", "Solo el postulante puede reseñar.");
    if (!["in_process", "offer_sent", "hired", "closed"].includes(inv.status)) {
      throw new HttpsError("failed-precondition", "La invitación debe estar en proceso para reseñar.");
    }

    const reviewRef = db.collection("employerReviews").doc();
    await reviewRef.set({
      reviewId: reviewRef.id,
      invitationId,
      companyId: inv.companyId,
      workerId: uid,
      score: Number(score),
      comment: String(comment ?? "").slice(0, 800),
      createdAt: FieldValue.serverTimestamp()
    });

    return { reviewId: reviewRef.id };
  }
);

// ── expireInvitations — cierra invitaciones vencidas ─────────────────────────
export const expireInvitations = onSchedule(
  { schedule: "every day 03:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const now = Timestamp.now();
    const snap = await db.collection("invitations")
      .where("status", "==", "sent")
      .where("expiresAt", "<=", now)
      .limit(200)
      .get();

    if (snap.empty) return;

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let batch = db.batch();
    let count = 0;
    for (const doc of snap.docs) {
      batch.update(doc.ref, { status: "expired", updatedAt: FieldValue.serverTimestamp() });
      count++;
      if (count % 400 === 0) { batches.push(batch); batch = db.batch(); }
    }
    if (count % 400 !== 0) batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));

    await writeAudit("system", "admin", "invitations_expired_batch", "invitation", "bulk", { count: String(snap.size) });
  }
);

// ── expireContactUnlocks — retira acceso a datos de contacto vencidos ─────────
export const expireContactUnlocks = onSchedule(
  { schedule: "every day 03:30", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const now = Timestamp.now();
    const snap = await db.collection("contactUnlocks")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .limit(200)
      .get();

    if (snap.empty) return;

    const batches: FirebaseFirestore.WriteBatch[] = [];
    let batch = db.batch();
    let count = 0;
    for (const doc of snap.docs) {
      batch.update(doc.ref, { status: "expired", updatedAt: FieldValue.serverTimestamp() });
      count++;
      if (count % 400 === 0) { batches.push(batch); batch = db.batch(); }
    }
    if (count % 400 !== 0) batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));
  }
);

// ── getExpertPanelAnalysis — 4 expertos analizan Perfil Primero con Gemini ────
//
// Expertos:
//  1. Dr. Sebastián Fuentes — abogado laboral chileno
//  2. Valentina Torres — ingeniera en administración / consultora de negocios
//  3. Dr. Rodrigo Castillo — psicólogo organizacional
//  4. Marco Brennan — crítico ácido de plataformas tecnológicas
//
export const getExpertPanelAnalysis = onCall(
  { region: "us-central1", timeoutSeconds: 120 },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
    checkRateLimit(uid, "expertPanel", 3, 3_600_000);

    const topic = String((request.data as { topic?: string }).topic ?? "plataforma_general").slice(0, 200);

    const topicTexts: Record<string, string> = {
      plataforma_general: "la plataforma laboral Perfil Primero en su conjunto: modelo invertido, privacidad del postulante, verificación de empresas, precios, propuesta de valor",
      seguridad: "la seguridad y privacidad de datos en Perfil Primero: protección del perfil anónimo, cómo se manejan los datos personales, qué pasa si una empresa intenta bypassear el sistema",
      precios: "el modelo de precios de Perfil Primero: $999 CLP/mes para postulantes, $999 CLP por contacto desbloqueado para empresas, el modelo de éxito vs suscripción",
      matching: "el sistema de matching e IA en Perfil Primero: análisis de CV con Gemini, búsqueda semántica, score de calce, badges de perfil",
      ux: "la experiencia de usuario de Perfil Primero: flujo de onboarding, panel del postulante, panel de empresa, diseño móvil"
    };
    const topicText = topicTexts[topic] ?? topicTexts.plataforma_general;

    const ai = getGeminiAI();

    const personas = [
      {
        id: "abogado",
        nombre: "Dr. Sebastián Fuentes Araya",
        rol: "Abogado Laboral · 18 años en derecho del trabajo chileno · Universidad de Chile",
        emoji: "⚖️",
        instruccion: `Eres el Dr. Sebastián Fuentes Araya, abogado laboral chileno especialista en Código del Trabajo, Ley 19.628 de Protección de Datos Personales, y derecho digital. Tienes 18 años de experiencia litigando en tribunales laborales. Tu estilo es preciso, citas artículos de leyes específicas, hablas en chileno formal pero directo. Analizas desde el riesgo legal para la empresa operadora y para los usuarios. Señalas qué está bien, qué es riesgoso y qué podría generar demandas o sanciones del Consejo para la Transparencia. NO inventas leyes — si algo no está regulado claramente, dilo. Sé específico y honesto.`
      },
      {
        id: "ing_admin",
        nombre: "Valentina Torres Reyes",
        rol: "Ingeniera en Administración · MBA · Ex directora de operaciones en startup B2B SaaS",
        emoji: "📊",
        instruccion: `Eres Valentina Torres Reyes, ingeniera en administración con MBA de la UAI. Fuiste directora de operaciones en dos startups B2B SaaS chilenas que alcanzaron la rentabilidad. Analizas desde KPIs, unit economics, CAC, LTV, churn, eficiencia operacional y escalabilidad del modelo de negocios. Tu estilo es estructurado, usas números y porcentajes estimados cuando tienes base para hacerlo, haces preguntas incómodas sobre la sustentabilidad económica. Eres optimista pero exigente. Cuando algo está bien, lo reconoces. Cuando algo es un riesgo económico real, lo dices sin rodeos.`
      },
      {
        id: "psicologo",
        nombre: "Dr. Rodrigo Castillo Lagos",
        rol: "Psicólogo Organizacional · Doctor en Psicología del Trabajo · Consultor de bienestar laboral",
        emoji: "🧠",
        instruccion: `Eres el Dr. Rodrigo Castillo Lagos, psicólogo organizacional con doctorado en psicología del trabajo en la PUC. Llevas 15 años estudiando el impacto de la tecnología en el bienestar de los trabajadores y la salud organizacional. Analizas desde la psicología del usuario: ¿cómo se siente el postulante que busca trabajo?, ¿qué emociones genera la plataforma?, ¿hay elementos de ansiedad o de empoderamiento?, ¿cómo afecta la dinámica de poder entre empresa y trabajador?, ¿la UX promueve o destruye la autoestima del candidato?. Tu estilo es empático, técnico pero accesible, y ocasionalmente provocador cuando ves algo que daña psicológicamente a los usuarios.`
      },
      {
        id: "critico",
        nombre: "Marco A. Brennan",
        rol: "Ex-CTO · Columnista de tecnología · Autor de 'El Cementerio de Startups Latinoamericanas'",
        emoji: "🔥",
        instruccion: `Eres Marco A. Brennan, ex-CTO de tres startups y columnista de tecnología conocido por reseñas brutalmente honestas de productos digitales. Escribes para un medio de tecnología de negocios. Tu estilo es ácido, directo, sin pelos en la lengua — pero siempre fundamentado en criterios técnicos y de negocio reales. Comparas con referentes mundiales (LinkedIn, Glassdoor, Toptal, AngelList, Seek). Cuando algo es mediocre, lo dices. Cuando algo es genuinamente innovador, también lo reconoces — pero no le regales aplausos fáciles. Tu objetivo: dar un veredicto honesto que ayude a mejorar el producto, no a quedar bien con nadie. Termina siempre con un "Veredicto" de 1-2 oraciones.`
      }
    ];

    const results = await Promise.all(
      personas.map(async (persona) => {
        const prompt = `${persona.instruccion}

Analiza ${topicText}.

Contexto de la plataforma que debes tener en cuenta:
- Perfil Primero es una plataforma laboral invertida chilena: el postulante publica su perfil ANÓNIMO primero y las empresas VERIFICADAS lo contactan con cargo, sueldo y condiciones claras antes de que el postulante revele su identidad.
- El postulante paga $999 CLP/mes por visibilidad activa.
- La empresa paga $999 CLP por desbloquear el contacto después de que el postulante acepta la invitación.
- Hay IA (Google Gemini) para analizar CVs y búsqueda semántica.
- Hay roles: trabajador, empresa, OMIL (municipalidades), admin.
- La plataforma está en Firebase (Firestore, Cloud Functions, Hosting). Es una SPA Next.js con exportación estática.
- Existe sistema de invitaciones con estado (sent → accepted → in_process → offer_sent → hired/closed).
- El chat se bloquea si se detectan datos de contacto para forzar el pago de cierre.

Da tu análisis honesto en español chileno, entre 120 y 180 palabras. Sé específico, no genérico.`;

        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { temperature: 0.8, maxOutputTokens: 400 }
          });
          return {
            id: persona.id,
            nombre: persona.nombre,
            rol: persona.rol,
            emoji: persona.emoji,
            opinion: response.text?.trim() ?? "Análisis no disponible.",
            error: false
          };
        } catch {
          return {
            id: persona.id,
            nombre: persona.nombre,
            rol: persona.rol,
            emoji: persona.emoji,
            opinion: "No se pudo generar el análisis en este momento. Intenta nuevamente.",
            error: true
          };
        }
      })
    );

    await writeAudit(uid, "worker", "expert_panel_requested", "system", "expertPanel", { topic });
    return { experts: results, topic, generatedAt: new Date().toISOString() };
  }
);

// ── Push notifications: guardar suscripción ──────────────────────────────────
export const savePushSubscription = onCall<{
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const { subscription } = request.data;
  if (!subscription?.endpoint) throw new HttpsError("invalid-argument", "Suscripción inválida.");
  await db.collection("users").doc(uid).set(
    { pushSubscription: subscription, pushEnabledAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  return { ok: true };
});

// ── Push notifications: enviar notificación a un usuario ────────────────────
export const sendPushToUser = onCall<{ targetUid: string; title: string; body: string; url?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  // Solo admin puede enviar a otros usuarios
  const callerDoc = await db.collection("users").doc(uid).get();
  if (callerDoc.data()?.role !== "admin" && uid !== request.data.targetUid) {
    throw new HttpsError("permission-denied", "No autorizado.");
  }
  const targetDoc = await db.collection("users").doc(request.data.targetUid).get();
  const sub = targetDoc.data()?.pushSubscription as { endpoint: string; keys: { p256dh: string; auth: string } } | undefined;
  if (!sub?.endpoint) return { sent: false, reason: "sin_suscripcion" };

  const vapidPublic = process.env.VAPID_PUBLIC_KEY ?? "";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY ?? "";
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:admin@perfil-primero.web.app";
  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  try {
    await webpush.sendNotification(sub, JSON.stringify({
      title: request.data.title,
      body: request.data.body,
      url: request.data.url ?? "/postulante",
      tag: `pp-${Date.now()}`
    }));
    return { sent: true };
  } catch (err) {
    // Si el endpoint está vencido, lo eliminamos
    if ((err as { statusCode?: number }).statusCode === 410) {
      await db.collection("users").doc(request.data.targetUid).update({ pushSubscription: FieldValue.delete() });
    }
    return { sent: false, reason: "error_envio" };
  }
});

// ── Push: enviar a todos los workers con suscripción (admin) ─────────────────
export const broadcastPushToWorkers = onCall<{ title: string; body: string; url?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const callerDoc = await db.collection("users").doc(uid).get();
  if (callerDoc.data()?.role !== "admin") throw new HttpsError("permission-denied", "Solo admins.");

  const vapidPublic = process.env.VAPID_PUBLIC_KEY ?? "";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY ?? "";
  webpush.setVapidDetails(process.env.VAPID_EMAIL ?? "mailto:admin@perfil-primero.web.app", vapidPublic, vapidPrivate);

  const snap = await db.collection("users").where("pushSubscription", "!=", null).limit(500).get();
  const payload = JSON.stringify({ title: request.data.title, body: request.data.body, url: request.data.url ?? "/" });
  let sent = 0;
  await Promise.all(snap.docs.map(async (doc) => {
    const sub = doc.data().pushSubscription as { endpoint: string; keys: { p256dh: string; auth: string } };
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 410) {
        await doc.ref.update({ pushSubscription: FieldValue.delete() });
      }
    }
  }));
  return { sent, total: snap.size };
});

// ── Reactivar perfil worker (pago ya confirmado externamente) ────────────────
export const reactivateWorkerProfile = onCall<{ workerId?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const callerDoc = await db.collection("users").doc(uid).get();
  const role = callerDoc.data()?.role;
  // Admin puede reactivar cualquier perfil; worker solo el propio
  const targetId = role === "admin" && request.data.workerId ? request.data.workerId : uid;
  if (targetId !== uid && role !== "admin") throw new HttpsError("permission-denied", "No autorizado.");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await db.collection("workerPublicProfiles").doc(targetId).update({
    subscriptionStatus: "active",
    visibilityStatus: "visible",
    profileExpiresAt: expiresAt,
    reactivatedAt: FieldValue.serverTimestamp()
  });
  await writeAudit(uid, role ?? "worker", "profile_reactivated", "worker", targetId, { expiresAt: expiresAt.toISOString() });
  return { ok: true, expiresAt: expiresAt.toISOString() };
});

// ── Multi-usuario empresa: agregar miembro del equipo ───────────────────────
export const addCompanyTeamMember = onCall<{ email: string; role: "viewer" | "recruiter" | "admin" }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const callerDoc = await db.collection("users").doc(uid).get();
  if (callerDoc.data()?.role !== "company") throw new HttpsError("permission-denied", "Solo empresas.");

  const companySnap = await db.collection("companyProfiles").doc(uid).get();
  if (!companySnap.exists) throw new HttpsError("not-found", "Perfil de empresa no encontrado.");

  const { email, role } = request.data;
  if (!email || !["viewer", "recruiter", "admin"].includes(role)) {
    throw new HttpsError("invalid-argument", "Email y rol requeridos.");
  }

  let targetUid: string | null = null;
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    targetUid = userRecord.uid;
  } catch {
    throw new HttpsError("not-found", `No existe usuario con email ${email}.`);
  }

  const teamMembers: Array<{ uid: string; email: string; role: string; addedAt: FirebaseFirestore.Timestamp }> =
    companySnap.data()?.teamMembers ?? [];

  if (teamMembers.some((m) => m.uid === targetUid)) {
    throw new HttpsError("already-exists", "Este usuario ya es miembro del equipo.");
  }
  if (teamMembers.length >= 10) {
    throw new HttpsError("resource-exhausted", "Máximo 10 miembros por empresa.");
  }

  teamMembers.push({ uid: targetUid!, email, role, addedAt: Timestamp.now() });
  await db.collection("companyProfiles").doc(uid).update({ teamMembers });
  await writeAudit(uid, "company", "team_member_added", "company", uid, { targetUid, email, role });
  return { ok: true, memberCount: teamMembers.length };
});

// ── Multi-usuario empresa: eliminar miembro ──────────────────────────────────
export const removeCompanyTeamMember = onCall<{ memberUid: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const companySnap = await db.collection("companyProfiles").doc(uid).get();
  if (!companySnap.exists) throw new HttpsError("not-found", "Perfil de empresa no encontrado.");

  const teamMembers: Array<{ uid: string }> = companySnap.data()?.teamMembers ?? [];
  const next = teamMembers.filter((m) => m.uid !== request.data.memberUid);
  await db.collection("companyProfiles").doc(uid).update({ teamMembers: next });
  await writeAudit(uid, "company", "team_member_removed", "company", uid, { removedUid: request.data.memberUid });
  return { ok: true };
});

// ── Utilidad: proyección de campos Firestore (reduce tráfico) ─────────────────
function selectFields<T extends Record<string, unknown>>(doc: T, fields: (keyof T)[]): Partial<T> {
  return fields.reduce((acc, f) => { acc[f] = doc[f]; return acc; }, {} as Partial<T>);
}
// Exportar para uso en tests
export { selectFields };

// ── submitNps — encuesta NPS post-proceso ─────────────────────────────────────
export const submitNps = onCall<{ score: number; comment?: string; context?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const { score, comment, context } = request.data;
  if (typeof score !== "number" || score < 0 || score > 10) {
    throw new HttpsError("invalid-argument", "El score NPS debe ser un número entre 0 y 10.");
  }
  const category = score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor";
  await db.collection("npsSurveys").add({
    uid,
    score,
    category,
    comment: sanitize(comment ?? "", 500),
    context: sanitize(context ?? "", 100),
    createdAt: FieldValue.serverTimestamp(),
  });
  log("INFO", "nps_submitted", { uid, score, category });
  return { ok: true, category };
});

// ── getPublicWorkerStats — estadísticas públicas para landing ─────────────────
export const getPublicWorkerStats = onCall(async () => {
  const [workersSnap, companiesSnap, invSnap] = await Promise.all([
    db.collection("workerPublicProfiles").where("visibilityStatus", "==", "visible").count().get(),
    db.collection("companyProfiles").where("verificationStatus", "==", "verified").count().get(),
    db.collection("invitations").where("status", "==", "hired").count().get(),
  ]);
  return {
    activeWorkers:      workersSnap.data().count,
    verifiedCompanies:  companiesSnap.data().count,
    successfulHires:    invSnap.data().count,
  };
});

// ── recordUtmConversion — guardar atribución UTM al registro ─────────────────
export const recordUtmConversion = onCall<{
  source?: string; medium?: string; campaign?: string; event: string;
}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  await db.collection("utmConversions").add({
    uid,
    source:   sanitize(request.data.source ?? "", 100),
    medium:   sanitize(request.data.medium ?? "", 100),
    campaign: sanitize(request.data.campaign ?? "", 100),
    event:    sanitize(request.data.event, 100),
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
});

// ── expireOldNpsData — limpieza mensual de NPS > 1 año ───────────────────────
export const expireOldNpsData = onSchedule("every 720 hours", async () => {
  const cutoff = Timestamp.fromDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  const snap = await db.collection("npsSurveys").where("createdAt", "<", cutoff).limit(200).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  log("INFO", "nps_old_data_expired", { count: snap.size });
});
