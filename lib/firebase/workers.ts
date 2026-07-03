import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, functions } from "./client";
import { storage } from "./client";
import { demoPostulants } from "@/lib/domain/demo-data";
import type { WorkerPublicProfile } from "@/lib/domain/types";

export type WorkerProfileDraft = {
  publicProfile: Omit<WorkerPublicProfile, "profileExpiresAt"> & {
    profileExpiresAt?: Date;
  };
  privateProfile: {
    workerId: string;
    legalName: string;
    preferredName: string;
    rut?: string;
    email: string;
    phone: string;
    portfolioLinks: string[];
    cvFileUrl?: string;
    formattedCv?: string;
    cvAnalysisSummary?: string;
    coverLetter?: string;
  };
};

export async function saveWorkerProfile(
  draft: WorkerProfileDraft,
  previousScores?: { english: number; spanish: number; personality: number }
) {
  // Validate salary range
  const salaryMin = Number(draft.publicProfile.expectedSalaryMin) || 0;
  const salaryMax = Number(draft.publicProfile.expectedSalaryMax) || 0;
  if (salaryMin > 0 && salaryMax > 0 && salaryMin > salaryMax) {
    throw new Error("La renta mínima no puede ser mayor que la renta máxima.");
  }
  if (salaryMin > 0 && salaryMin < 350_000) {
    throw new Error("La renta mínima no puede ser inferior al sueldo mínimo legal.");
  }

  const publicRef = doc(db, "workerPublicProfiles", draft.publicProfile.workerId);

  // Preserve existing expiry if still active, otherwise reset to 30 days
  const existing = await getDoc(publicRef).catch(() => null);
  const existingExpiry = existing?.exists()
    ? (existing.data().profileExpiresAt as { toDate?: () => Date } | Date | undefined)
    : null;
  const existingExpiryDate = existingExpiry instanceof Date
    ? existingExpiry
    : typeof (existingExpiry as { toDate?: () => Date })?.toDate === "function"
      ? (existingExpiry as { toDate: () => Date }).toDate()
      : null;
  const expiresAt = existingExpiryDate && existingExpiryDate > new Date()
    ? existingExpiryDate
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const publicData = {
    ...draft.publicProfile,
    expectedSalaryMin: salaryMin,
    expectedSalaryMax: salaryMax,
    // formattedCv trimmed to avoid approaching Firestore 1MB doc limit
    formattedCv: (draft.publicProfile.formattedCv ?? "").slice(0, 12_000),
    // Anonimato: la URL del CV original vive solo en el perfil privado.
    // deleteField() limpia el campo legacy en perfiles guardados antes de la migración.
    cvFileUrl: deleteField(),
    profileExpiresAt: expiresAt,
    updatedAt: serverTimestamp()
  };

  await setDoc(publicRef, publicData, { merge: true });

  // Increment attempt counts for tests that were retaken (score changed or first attempt)
  const scores = draft.publicProfile.assessmentScores;
  if (scores && previousScores) {
    const increments: Record<string, ReturnType<typeof increment>> = {};
    (["english", "spanish", "personality"] as const).forEach((key) => {
      if (scores[key] > 0 && scores[key] !== previousScores[key]) {
        increments[`testAttemptCounts.${key}`] = increment(1);
      }
    });
    if (Object.keys(increments).length) {
      await updateDoc(publicRef, increments);
    }
  }

  await setDoc(
    doc(db, "workerPrivateProfiles", draft.privateProfile.workerId),
    {
      ...draft.privateProfile,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function getWorkerProfile(workerId: string) {
  const [publicSnap, privateSnap] = await Promise.all([
    getDoc(doc(db, "workerPublicProfiles", workerId)),
    getDoc(doc(db, "workerPrivateProfiles", workerId))
  ]);

  return {
    publicProfile: publicSnap.exists() ? (publicSnap.data() as WorkerPublicProfile) : null,
    privateProfile: privateSnap.exists() ? (privateSnap.data() as WorkerProfileDraft["privateProfile"]) : null
  };
}

export async function listWorkerPayments(workerId: string) {
  const q = query(collection(db, "payments"), where("userId", "==", workerId), limit(80));
  const snap = await getDocs(q);
  return snap.docs.map((item) => item.data() as {
    paymentId: string;
    status: string;
    amount: number;
    currency: "CLP" | "USD";
    paymentType: string;
    providerPaymentId?: string;
    createdAt?: Date;
  });
}

export async function listVisibleWorkers(options?: {
  pageSize?: number;
  region?: string;
  sector?: string;
  salaryMax?: number;
  cursor?: import("firebase/firestore").QueryDocumentSnapshot | null;
}): Promise<{ workers: WorkerPublicProfile[]; hasMore: boolean; lastDoc: import("firebase/firestore").QueryDocumentSnapshot | null }> {
  const pageSize = Math.max(1, Math.min(50, Number(options?.pageSize ?? 50)));

  const constraints: import("firebase/firestore").QueryConstraint[] = [
    where("visibilityStatus", "==", "visible"),
    where("subscriptionStatus", "==", "active"),
    ...(options?.region ? [where("region", "==", options.region)] : []),
    ...(options?.sector ? [where("sectors", "array-contains", options.sector)] : []),
    orderBy("expectedSalaryMax", "asc"),
    ...(options?.cursor ? [startAfter(options.cursor)] : []),
    limit(pageSize + 1)
  ];

  const q = query(collection(db, "workerPublicProfiles"), ...constraints);
  const snap = await getDocs(q);
  const hasMore = snap.docs.length > pageSize;
  const docs = hasMore ? snap.docs.slice(0, pageSize) : snap.docs;
  let workers = docs.map((item) => item.data() as WorkerPublicProfile);

  if (options?.salaryMax) {
    workers = workers.filter((w) => w.expectedSalaryMin <= options.salaryMax!);
  }

  if (docs.length) {
    const CHUNK = 400;
    for (let i = 0; i < docs.length; i += CHUNK) {
      const batch = writeBatch(db);
      docs.slice(i, i + CHUNK).forEach((d) => {
        batch.update(d.ref, {
          "analytics.totalImpressions": increment(1),
          "analytics.weekImpressions": increment(1)
        });
      });
      batch.commit().catch(() => {});
    }
  }

  const result = workers.length ? workers : (options?.cursor ? [] : demoPostulants);
  return {
    workers: result,
    hasMore: workers.length ? hasMore : false,
    lastDoc: docs.length > 0 ? docs[docs.length - 1] : null
  };
}

export async function createWorkerSubscriptionCheckout(couponCode?: string) {
  const callable = httpsCallable(functions, "createWorkerSubscriptionCheckout");
  const result = await callable({ couponCode: couponCode ?? "" });
  return result.data as { url: string };
}

const ALLOWED_CV_MIME_TYPES = ["application/pdf", "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadWorkerCv(workerId: string, file: File) {
  // Validate by both MIME type and extension to prevent renamed files
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExts = ["pdf", "txt", "doc", "docx"];
  if (!ALLOWED_CV_MIME_TYPES.includes(file.type) || !allowedExts.includes(ext)) {
    throw new Error("Tipo de archivo no permitido. Sube un PDF, TXT o DOCX.");
  }
  if (file.size > MAX_CV_BYTES) {
    throw new Error("El archivo supera el límite de 5 MB.");
  }
  if (file.size === 0) {
    throw new Error("El archivo está vacío.");
  }
  const fileRef = ref(storage, `workers/${workerId}/cv/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file, {
    contentType: file.type
  });
  return getDownloadURL(fileRef);
}

export async function analyzeCvWithAi(input: {
  fileName: string;
  mimeType: string;
  base64: string;
  preExtractedText?: string;
}) {
  const callable = httpsCallable(functions, "analyzeCvWithAi");
  const result = await callable(input);
  return result.data as {
    headline: string;
    summary: string;
    skills: string[];
    sectors: string[];
    yearsOfExperience: number;
    suggestedSalaryMin: number;
    suggestedSalaryMax: number;
    cvAnalysisSummary: string;
    formattedCv: string;
    extractedName?: string;
    extractedPhone?: string;
    extractedLinkedIn?: string;
    extractedRegion?: string;
    extractedComuna?: string;
    aiStatus?: "completed" | "quota_exceeded";
  };
}

export async function syncFavoritesToFirestore(companyId: string, favoriteWorkerIds: string[]) {
  await setDoc(doc(db, "users", companyId), { favoriteWorkers: favoriteWorkerIds }, { merge: true });
}

export async function listOmilWorkers(omilId: string, pageSize = 50) {
  const q = query(
    collection(db, "workerPublicProfiles"),
    where("createdByOmilId", "==", omilId),
    orderBy("profileExpiresAt", "desc"),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WorkerPublicProfile);
}

export async function savePushSubscription(subscription: PushSubscriptionJSON) {
  const callable = httpsCallable(functions, "savePushSubscription");
  await callable({ subscription });
}

export async function reactivateWorkerProfile(workerId?: string) {
  const callable = httpsCallable(functions, "reactivateWorkerProfile");
  const result = await callable({ workerId });
  return result.data as { ok: boolean; expiresAt: string };
}

export async function getProfileAiAdvice(profile: {
  headline: string;
  summary: string;
  skills: string;
}) {
  const callable = httpsCallable(functions, "getProfileAiAdvice");
  const result = await callable(profile);
  return result.data as { advice: string };
}
