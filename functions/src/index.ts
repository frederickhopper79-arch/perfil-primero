import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, Query, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import Stripe from "stripe";
import { GoogleGenAI, Type } from "@google/genai";
import MercadoPagoConfig, { Payment, Preference } from "mercadopago";

initializeApp();

const db = getFirestore();
const appUrl = process.env.APP_URL ?? "https://perfil-primero.web.app";
const launchPriceClp = 999;

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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
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
    throw new HttpsError("invalid-argument", "Estado de empresa invalido.");
  }

  const companyRef = db.collection("companyProfiles").doc(companyId);
  const company = await companyRef.get();

  if (!company.exists) {
    throw new HttpsError("not-found", "La empresa no existe.");
  }

  await companyRef.set(
    {
      verificationStatus: status,
      verificationNotes: notes ?? "",
      verifiedAt: status === "verified" ? FieldValue.serverTimestamp() : null,
      rejectedAt: status === "rejected" ? FieldValue.serverTimestamp() : null,
      suspendedAt: status === "suspended" ? FieldValue.serverTimestamp() : null,
      reviewedBy: adminId,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

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
}>(async (request) => {
  const adminId = await assertAdmin(request.auth?.uid);
  const { email, password, role, status } = request.data;

  if (!email || !password || password.length < 6 || !["worker", "company", "admin", "omil"].includes(role)) {
    throw new HttpsError("invalid-argument", "Email, contrasena y rol son obligatorios.");
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

  await db.collection("users").doc(userId).set(
    {
      email,
      role,
      status: status ?? "active",
      managedByAdmin: true,
      billingExempt: role === "omil",
      canCreateUnlimitedPostulants: role === "omil",
      createdBy: adminId,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await writeAudit(adminId, "admin", "managed_user_created", "user", userId, {
    email,
    role
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

  const data = request.data;
  const legalName = String(data.legalName ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const headline = String(data.headline ?? "").trim();
  const area = String(data.area ?? "").trim();
  const region = String(data.region ?? "").trim();
  const city = String(data.city ?? "").trim();

  if (!legalName || !email || !headline || !area || !region || !city) {
    throw new HttpsError("invalid-argument", "Nombre, email, cargo, area, region y comuna son obligatorios.");
  }

  const workerRef = db.collection("workerPublicProfiles").doc();
  const profileExpiresAt = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 30);
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

  await db.collection("emailReminders").doc(`omil-${workerRef.id}`).set({
    reminderId: `omil-${workerRef.id}`,
    workerId: workerRef.id,
    omilId,
    targetEmail: email,
    status: "queued",
    channel: "gmail",
    template: "omil_profile_expiry_subscription_offer",
    subject: "Tu perfil gratuito OMIL vence pronto",
    sendAt: profileExpiresAt,
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

    const privateRefs = snap.docs.map((doc) => db.collection("workerPrivateProfiles").doc(doc.id));
    const privateSnaps = privateRefs.length ? await db.getAll(...privateRefs) : [];
    const privateProfiles = new Map(privateSnaps.map((doc) => [doc.id, doc.data()]));
    const batch = db.batch();

    snap.docs.forEach((doc) => {
      batch.set(
        doc.ref,
        {
          visibilityStatus: "expired",
          subscriptionStatus: "expired",
          expiredAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );

      const reminderRef = db.collection("emailReminders").doc(`omil-expired-${doc.id}`);
      const privateProfile = privateProfiles.get(doc.id);
      batch.set(
        reminderRef,
        {
          reminderId: reminderRef.id,
          workerId: doc.id,
          omilId: doc.data().createdByOmilId ?? null,
          targetEmail: privateProfile?.email ?? null,
          status: "pending_email_provider",
          channel: "gmail",
          template: "omil_profile_expired_subscription_offer",
          subject: "Tu perfil gratuito OMIL vencio",
          body: "Tu perfil gratuito cargado por OMIL cumplio 30 dias. Para seguir visible en Perfil Primero, inicia sesion y activa tu suscripcion.",
          createdAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    });

    await batch.commit();

    await writeAudit("system", "admin", "omil_profiles_expired", "worker", "bulk", {
      count: String(snap.size)
    });
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const snap = await db
    .collection("payments")
    .where("relatedCompanyId", "==", companyId)
    .where("status", "==", "paid")
    .limit(80)
    .get();

  const documents = await Promise.all(
    snap.docs.map(async (paymentDoc) => {
      const payment = paymentDoc.data();
      const accounting = await db.collection("accountingEntries").doc(payment.paymentId).get();
      const entry = accounting.data() ?? {};
      return {
        paymentId: payment.paymentId,
        providerPaymentId: payment.providerPaymentId ?? "",
        amount: payment.amount ?? 0,
        currency: payment.currency ?? "CLP",
        paymentType: payment.paymentType ?? "",
        status: payment.status ?? "",
        folioSii: entry.folioSii ?? "",
        pdfUrl: entry.pdfUrl ?? "",
        xmlUrl: entry.xmlUrl ?? "",
        siiStatus: entry.siiStatus ?? "pending_provider",
        createdAt: payment.createdAt?.toDate?.().toISOString?.() ?? ""
      };
    })
  );

  return { documents };
});

export const createInvitation = onCall<CreateInvitationInput>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const company = await db.collection("companyProfiles").doc(companyId).get();

  if (!company.exists || company.data()?.verificationStatus !== "verified") {
    throw new HttpsError("permission-denied", "La empresa debe estar verificada.");
  }

  const data = request.data;

  if (!data.workerId || !data.opportunityTitle || !data.message) {
    throw new HttpsError("invalid-argument", "Faltan datos obligatorios.");
  }

  if (!data.salaryMin || !data.salaryMax || data.salaryMax < data.salaryMin) {
    throw new HttpsError("invalid-argument", "La invitacion requiere un rango salarial valido.");
  }

  const worker = await db.collection("workerPublicProfiles").doc(data.workerId).get();

  if (!worker.exists || worker.data()?.visibilityStatus !== "visible") {
    throw new HttpsError("failed-precondition", "El perfil no esta visible.");
  }

  const invitationRef = db.collection("invitations").doc();
  const now = FieldValue.serverTimestamp();
  const expiresAt = Timestamp.fromMillis(Date.now() + 1000 * 60 * 60 * 24 * 10);

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
    updatedAt: now
  });

  await writeAudit(companyId, "company", "invitation_sent", "worker", data.workerId, {
    invitationId: invitationRef.id
  });

  return { invitationId: invitationRef.id };
});

export const acceptInvitation = onCall<{ invitationId: string }>(async (request) => {
  const workerId = request.auth?.uid;

  if (!workerId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();

  if (!invitation.exists || invitation.data()?.workerId !== workerId) {
    throw new HttpsError("permission-denied", "No puedes aceptar esta invitacion.");
  }

  const invitationData = invitation.data() ?? {};

  await db.runTransaction(async (transaction) => {
    transaction.update(invitationRef, {
      status: "accepted",
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

  await writeAudit(workerId, "worker", "invitation_accepted", "invitation", invitationRef.id, {
    invitationId: invitationRef.id
  });

  return { status: "accepted" };
});

export const scheduleInterview = onCall<ScheduleInterviewInput>(async (request) => {
  const actorId = request.auth?.uid;

  if (!actorId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const { invitationId, startsAt, durationMinutes = 45 } = request.data;
  const start = new Date(startsAt);
  const minStart = new Date(Date.now() + 1000 * 60 * 60 * 24);

  if (!invitationId || Number.isNaN(start.getTime())) {
    throw new HttpsError("invalid-argument", "Debes seleccionar una fecha valida.");
  }

  if (start < minStart) {
    throw new HttpsError("failed-precondition", "La entrevista debe programarse al menos con un dia de anticipacion.");
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const { invitationId, targetRole, score, comment, attendedInPerson } = request.data;

  if (!invitationId || !["company", "worker"].includes(targetRole) || score < 1 || score > 5) {
    throw new HttpsError("invalid-argument", "Evaluacion invalida.");
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  if (!invitationFlowStatuses.includes(request.data.status as typeof invitationFlowStatuses[number])) {
    throw new HttpsError("invalid-argument", "Estado de proceso invalido.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();

  if (!invitation.exists || invitation.data()?.companyId !== companyId) {
    throw new HttpsError("permission-denied", "No puedes actualizar esta invitacion.");
  }

  await invitationRef.update({
    status: request.data.status,
    updatedAt: FieldValue.serverTimestamp()
  });

  await writeAudit(companyId, "company", "invitation_status_updated", "invitation", invitationRef.id, {
    status: request.data.status
  });

  return { status: request.data.status };
});

export const sendConversationMessage = onCall<{ invitationId: string; body: string }>(async (request) => {
  const senderId = request.auth?.uid;

  if (!senderId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

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

export const unlockWorkerContact = onCall<{ invitationId: string; paymentId: string }>(
  async (request) => {
    const companyId = request.auth?.uid;

    if (!companyId) {
      throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
    }

    const invitationRef = db.collection("invitations").doc(request.data.invitationId);
    const invitation = await invitationRef.get();
    const invitationData = invitation.data();

    if (!invitation.exists || invitationData?.companyId !== companyId) {
      throw new HttpsError("permission-denied", "No puedes desbloquear este contacto.");
    }

    if (invitationData.status !== "accepted") {
      throw new HttpsError("failed-precondition", "La invitacion debe estar aceptada.");
    }

    const payment = await db.collection("payments").doc(request.data.paymentId).get();

    if (!payment.exists || payment.data()?.status !== "paid") {
      throw new HttpsError("failed-precondition", "El pago no esta confirmado.");
    }

    const unlockRef = db.collection("contactUnlocks").doc();
    const now = FieldValue.serverTimestamp();

    await unlockRef.set({
      unlockId: unlockRef.id,
      companyId,
      workerId: invitationData.workerId,
      invitationId: invitationRef.id,
      paymentId: request.data.paymentId,
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
      paymentId: request.data.paymentId
    });

    return { unlockId: unlockRef.id };
  }
);

export const getUnlockedWorkerContact = onCall<{ invitationId: string }>(async (request) => {
  const companyId = request.auth?.uid;

  if (!companyId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
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
    throw new HttpsError("failed-precondition", "El contacto aun no esta desbloqueado por pago confirmado.");
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const invitationRef = db.collection("invitations").doc(request.data.invitationId);
  const invitation = await invitationRef.get();
  const invitationData = invitation.data();

  if (!invitation.exists || invitationData?.companyId !== companyId) {
    throw new HttpsError("permission-denied", "No puedes pagar esta invitacion.");
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
  const type = String(request.query.type ?? request.query.topic ?? request.body?.type ?? "");
  const paymentIdFromProvider = String(request.query["data.id"] ?? request.body?.data?.id ?? "");

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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const { headline, summary, skills } = request.data;

  if (!headline || !summary || !skills) {
    throw new HttpsError("invalid-argument", "Completa titulo, resumen y habilidades.");
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
        "1. Resume tu experiencia en una frase concreta con cargo, rubro y anos de experiencia.",
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
}>(async (request) => {
  const workerId = request.auth?.uid;

  if (!workerId) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
  }

  const { fileName, mimeType, base64 } = request.data;

  if (!fileName || !mimeType || !base64) {
    throw new HttpsError("invalid-argument", "Falta el archivo del CV.");
  }

  const prompt = [
    "Eres un analista laboral chileno. Extrae informacion de un curriculum.",
    "No inventes datos. Si un dato no existe, usa una inferencia prudente o valor neutro.",
    "Devuelve SOLO JSON valido con estas claves exactas:",
    "headline, summary, skills, sectors, yearsOfExperience, suggestedSalaryMin, suggestedSalaryMax, cvAnalysisSummary, formattedCv.",
    "skills y sectors deben ser arrays de strings. Salarios en CLP como numeros.",
    "formattedCv debe ser un curriculum profesional breve con secciones: Perfil, Experiencia, Habilidades, Educacion/Certificaciones si existen.",
    "El resumen no debe incluir nombre, telefono, correo ni datos privados.",
    `Nombre archivo: ${fileName}`
  ].join("\n");

  let parsed: Record<string, unknown>;
  let aiStatus: "completed" | "quota_exceeded" = "completed";

  try {
    parsed = await generateJsonWithGemini(prompt, cvAnalysisSchema(), {
      mimeType,
      base64
    });
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
    throw new HttpsError("unauthenticated", "Debes iniciar sesion.");
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
    throw new HttpsError("failed-precondition", "Cupon invalido o inactivo.");
  }

  const expiresAt = data.expiresAt?.toDate?.() as Date | undefined;

  if (expiresAt && expiresAt.getTime() < Date.now()) {
    throw new HttpsError("failed-precondition", "El cupon esta vencido.");
  }

  if (Number(data.maxUses ?? 0) > 0 && Number(data.usedCount ?? 0) >= Number(data.maxUses)) {
    throw new HttpsError("failed-precondition", "El cupon ya alcanzo su limite de uso.");
  }

  const previousUse = await db
    .collection("couponUsages")
    .where("couponCode", "==", couponCode)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (!previousUse.empty) {
    throw new HttpsError("failed-precondition", "Este usuario ya uso este cupon.");
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
  const [workersSnap, offersSnap, auditSnap, aiLogsSnap] = await Promise.all([
    db.collection("workerPublicProfiles").where("visibilityStatus", "==", "visible").limit(800).get(),
    db.collection("jobOffers").where("visibilityStatus", "==", "visible").limit(800).get(),
    db.collection("auditEvents").orderBy("createdAt", "desc").limit(800).get(),
    db.collection("aiUsageLogs").orderBy("createdAt", "desc").limit(800).get()
  ]);

  const workers = workersSnap.docs.map((doc) => doc.data());
  const offers = offersSnap.docs.map((doc) => doc.data());
  const audits = auditSnap.docs.map((doc) => doc.data());
  const aiLogs = aiLogsSnap.docs.map((doc) => doc.data());
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
    avgAiLatencyMs
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
  const payment = await paymentRef.get();
  const paymentData = payment.data();

  if (!payment.exists || paymentData?.status === "paid") {
    return;
  }

  await paymentRef.update({
    status: "paid",
    providerPaymentId,
    updatedAt: FieldValue.serverTimestamp()
  });

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
  const mpCommission = Number((gross * 0.0399).toFixed(2));
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
  const paymentId = metadata.paymentId;

  if (!paymentId) {
    return;
  }

  const paymentRef = db.collection("payments").doc(paymentId);

  await paymentRef.update({
    status: "paid",
    providerPaymentId: session.id,
    updatedAt: FieldValue.serverTimestamp()
  });

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
    summary: "CV subido correctamente. La extraccion automatica con Google IA quedo pendiente por cuota disponible; completa o ajusta este resumen antes de publicar.",
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

  if (status === 400 || lower.includes("invalid")) {
    return new HttpsError("invalid-argument", "Google IA rechazo el archivo. Sube un PDF o TXT legible y vuelve a intentar.");
  }

  if (status === 401 || status === 403 || lower.includes("permission") || lower.includes("api key")) {
    return new HttpsError("permission-denied", "Google IA no pudo validar la clave o permisos configurados.");
  }

  return new HttpsError("internal", "Google IA no pudo responder en este momento. Intenta nuevamente mas tarde.");
}

async function generateJsonWithGemini(
  prompt: string,
  responseSchema: JsonSchema,
  file?: { mimeType: string; base64: string }
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const startedAt = Date.now();

  if (!apiKey) {
    throw new HttpsError("failed-precondition", "Falta GEMINI_API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
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
    throw new HttpsError("internal", "Gemini no devolvio JSON.");
  }

  try {
    return JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new HttpsError("internal", "La IA no devolvio un JSON valido.");
  }
}
