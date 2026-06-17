import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
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
  const offerRef = doc(db, "jobOffers", draft.jobOfferId || crypto.randomUUID());
  await setDoc(
    offerRef,
    {
      ...draft,
      jobOfferId: offerRef.id,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
  return offerRef.id;
}

export async function listCompanyJobOffers(companyId: string) {
  const q = query(collection(db, "jobOffers"), where("companyId", "==", companyId), limit(80));
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

export async function listCompanyPayments(companyId: string) {
  const q = query(collection(db, "payments"), where("userId", "==", companyId), limit(80));
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as { paymentId: string; status: string; amount: number; paymentType: string });
}

export async function uploadCompanyLogo(companyId: string, file: File) {
  const fileRef = ref(storage, `companies/${companyId}/logo/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream"
  });
  return getDownloadURL(fileRef);
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

export async function listWorkerInvitations(workerId: string) {
  const q = query(collection(db, "invitations"), where("workerId", "==", workerId), limit(80));
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as Invitation);
}
