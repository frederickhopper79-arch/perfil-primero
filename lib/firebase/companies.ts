import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, functions } from "./client";
import { storage } from "./client";
import { demoJobOffers } from "@/lib/domain/demo-data";
import type { CompanyProfile, ConversationMessage, Invitation, JobOffer, PlatformReview } from "@/lib/domain/types";

export type CompanyProfileDraft = {
  companyId: string;
  companyName: string;
  legalName: string;
  taxId: string;
  website: string;
  logoUrl?: string;
  region?: string;
  city?: string;
  industry: string;
  size: string;
  culture?: string;
  benefits?: string;
  remotePolicy?: string;
};

export type InvitationDraft = Omit<Invitation, "invitationId" | "status" | "expiresAt">;

export type JobOfferDraft = Omit<JobOffer, "jobOfferId" | "createdAt" | "updatedAt"> & {
  jobOfferId?: string;
};

export async function saveCompanyProfile(draft: CompanyProfileDraft) {
  const companyRef = doc(db, "companyProfiles", draft.companyId);
  const existing = await getDoc(companyRef);
  const existingData = existing.exists() ? (existing.data() as Partial<CompanyProfile>) : null;
  const currentStatus = existingData?.verificationStatus;
  const nextStatus = currentStatus === "verified" ? "verified" : "pending";

  await setDoc(
    companyRef,
    {
      ...draft,
      verificationStatus: nextStatus,
      billingStatus: existingData?.billingStatus ?? "inactive",
      reputationScore: existingData?.reputationScore ?? 100,
      responseRate: existingData?.responseRate ?? 0,
      averageResponseTimeHours: existingData?.averageResponseTimeHours ?? null,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getCompanyProfile(companyId: string) {
  const snap = await getDoc(doc(db, "companyProfiles", companyId));
  return snap.exists() ? (snap.data() as CompanyProfile) : null;
}

export async function createInvitation(draft: InvitationDraft) {
  const callable = httpsCallable(functions, "createInvitation");
  const result = await callable(draft);
  return result.data as { invitationId: string };
}

export async function saveJobOffer(draft: JobOfferDraft) {
  const offerRef = doc(db, "jobOffers", draft.jobOfferId || doc(collection(db, "jobOffers")).id);
  const existing = await getDoc(offerRef);
  await setDoc(
    offerRef,
    {
      ...draft,
      jobOfferId: offerRef.id,
      updatedAt: serverTimestamp(),
      // Preserve original createdAt on updates; only set on new docs
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  return offerRef.id;
}

export async function listCompanyJobOffers(companyId: string, pageSize = 50) {
  const safePageSize = Math.max(1, Math.min(100, pageSize));
  const q = query(
    collection(db, "jobOffers"),
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
    limit(safePageSize)
  );
  const snap = await getDocs(q);
  const offers = snap.docs.map((item) => item.data() as JobOffer);
  return offers.length ? offers : demoJobOffers.filter((offer) => offer.companyId === companyId);
}

export async function acceptInvitation(invitationId: string) {
  const callable = httpsCallable(functions, "acceptInvitation");
  const result = await callable({ invitationId });
  return result.data as { status: string };
}

export async function acceptInterviewRules(invitationId: string) {
  const callable = httpsCallable(functions, "acceptInterviewRules");
  const result = await callable({ invitationId });
  return result.data as { accepted: boolean; role: "company" | "worker" };
}

export async function createCompanyMonthlyCheckout() {
  const callable = httpsCallable(functions, "createCompanyMonthlyCheckout");
  const result = await callable();
  return result.data as { url: string };
}

export async function createCompanyUnlimitedCheckout() {
  const callable = httpsCallable(functions, "createCompanyUnlimitedCheckout");
  const result = await callable();
  return result.data as { url: string };
}

export async function saveCompanyAlertPreferences(prefs: {
  enabled: boolean;
  areas: string[];
  regions: string[];
  salaryMax: number;
  workModes: string[];
}) {
  const callable = httpsCallable(functions, "saveCompanyAlertPreferences");
  await callable(prefs);
}

export async function createCompanyUnlockCheckout(invitationId: string, couponCode?: string) {
  const callable = httpsCallable(functions, "createCompanyUnlockCheckout");
  const result = await callable({ invitationId, couponCode: couponCode ?? "" });
  return result.data as { url: string };
}

export async function listCompanyBillingDocuments() {
  const callable = httpsCallable(functions, "listCompanyBillingDocuments");
  const result = await callable();
  return result.data as {
    documents: Array<{
      paymentId: string;
      providerPaymentId: string;
      amount: number;
      currency: "CLP" | "USD";
      paymentType: string;
      status: string;
      folioSii: string;
      pdfUrl: string;
      xmlUrl: string;
      siiStatus: string;
      createdAt: string;
    }>;
  };
}

export async function getUnlockedWorkerContact(invitationId: string) {
  const callable = httpsCallable(functions, "getUnlockedWorkerContact");
  const result = await callable({ invitationId });
  return result.data as {
    legalName: string;
    preferredName: string;
    email: string;
    phone: string;
    portfolioLinks: string[];
  };
}

export async function updateInvitationStatus(invitationId: string, status: string) {
  const callable = httpsCallable(functions, "updateInvitationStatus");
  const result = await callable({ invitationId, status });
  return result.data as { status: string };
}

export async function scheduleInterview(input: {
  invitationId: string;
  startsAt: string;
  durationMinutes: number;
}) {
  const callable = httpsCallable(functions, "scheduleInterview");
  const result = await callable(input);
  return result.data as { interviewId: string; calendarUrl: string };
}

export async function submitPlatformReview(input: {
  invitationId: string;
  targetRole: "company" | "worker";
  score: number;
  comment: string;
  attendedInPerson?: boolean;
}) {
  const callable = httpsCallable(functions, "submitPlatformReview");
  const result = await callable(input);
  return result.data as PlatformReview;
}

export async function sendConversationMessage(invitationId: string, body: string) {
  const callable = httpsCallable(functions, "sendConversationMessage");
  const result = await callable({ invitationId, body });
  return result.data as {
    messageId: string;
    paymentRequired?: boolean;
    checkoutUrl?: string;
    reason?: string;
  };
}

export async function listCompanyInvitations(companyId: string) {
  const q = query(collection(db, "invitations"), where("companyId", "==", companyId), limit(80));
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as Invitation);
}

export async function listConversationMessages(invitationId: string) {
  const q = query(
    collection(db, "conversationMessages"),
    where("invitationId", "==", invitationId),
    orderBy("createdAt", "asc"),
    limit(80)
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as ConversationMessage);
}

export function subscribeToMessages(
  invitationId: string,
  onMessages: (messages: ConversationMessage[]) => void
) {
  const q = query(
    collection(db, "conversationMessages"),
    where("invitationId", "==", invitationId),
    orderBy("createdAt", "asc"),
    limit(80)
  );
  return onSnapshot(q, (snap) => {
    onMessages(snap.docs.map((item) => item.data() as ConversationMessage));
  });
}

export function subscribeToWorkerInvitations(
  workerId: string,
  onInvitations: (invitations: Invitation[]) => void
) {
  const q = query(collection(db, "invitations"), where("workerId", "==", workerId), limit(80));
  return onSnapshot(q, (snap) => {
    onInvitations(snap.docs.map((item) => item.data() as Invitation));
  });
}

export function subscribeToCompanyInvitations(
  companyId: string,
  onInvitations: (invitations: Invitation[]) => void
) {
  const q = query(collection(db, "invitations"), where("companyId", "==", companyId), limit(80));
  return onSnapshot(q, (snap) => {
    onInvitations(snap.docs.map((item) => item.data() as Invitation));
  });
}

export async function listCompanyPayments(companyId: string) {
  const q = query(collection(db, "payments"), where("userId", "==", companyId), limit(80));
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as { paymentId: string; status: string; amount: number; paymentType: string });
}

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB

export async function uploadCompanyLogo(companyId: string, file: File) {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    throw new Error("El logo debe ser PNG, JPG, WebP o SVG.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("El logo no puede superar 2 MB.");
  }
  if (file.size === 0) {
    throw new Error("El archivo está vacío.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const fileRef = ref(storage, `companies/${companyId}/logo/${Date.now()}.${ext}`);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}

export async function semanticWorkerSearch(query: string): Promise<{
  filters: { region?: string; area?: string; salaryMax?: string; query?: string };
}> {
  const callable = httpsCallable(functions, "semanticWorkerSearch");
  const result = await callable({ query });
  return result.data as { filters: { region?: string; area?: string; salaryMax?: string; query?: string } };
}

export async function recordProfileImpression(workerId: string) {
  const callable = httpsCallable(functions, "recordProfileImpression");
  await callable({ workerId });
}

export async function submitEmployerReview(input: {
  invitationId: string;
  score: number;
  comment: string;
}) {
  const callable = httpsCallable(functions, "submitEmployerReview");
  const result = await callable(input);
  return result.data as { reviewId: string };
}

export async function recordSearchAnalytics(filters: {
  region?: string;
  area?: string;
  salaryMax?: number;
  query?: string;
}): Promise<void> {
  const callable = httpsCallable(functions, "recordSearchAnalytics");
  await callable(filters).catch(() => {});
}

export async function getCandidateMatchAdvice(input: {
  opportunityTitle: string;
  opportunitySummary: string;
  requiredSkills: string;
  worker: unknown;
}) {
  const callable = httpsCallable(functions, "getCandidateMatchAdvice");
  const result = await callable(input);
  return result.data as { score: number; verdict: string; reasons: string[]; risks: string[] };
}

export async function addCompanyTeamMember(email: string, role: "viewer" | "recruiter" | "admin") {
  const callable = httpsCallable(functions, "addCompanyTeamMember");
  return (await callable({ email, role })).data as { ok: boolean; memberCount: number };
}

export async function removeCompanyTeamMember(memberUid: string) {
  const callable = httpsCallable(functions, "removeCompanyTeamMember");
  return (await callable({ memberUid })).data as { ok: boolean };
}

export async function listWorkerInvitations(workerId: string) {
  const q = query(collection(db, "invitations"), where("workerId", "==", workerId), limit(80));
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as Invitation);
}
