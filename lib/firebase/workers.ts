import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
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
    email: string;
    phone: string;
    portfolioLinks: string[];
    formattedCv?: string;
    cvAnalysisSummary?: string;
    coverLetter?: string;
  };
};

export async function saveWorkerProfile(
  draft: WorkerProfileDraft,
  previousScores?: { english: number; spanish: number; personality: number }
) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const publicRef = doc(db, "workerPublicProfiles", draft.publicProfile.workerId);

  await setDoc(
    publicRef,
    {
      ...draft.publicProfile,
      profileExpiresAt: expiresAt,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

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
}) {
  const pageSize = Math.max(1, Math.min(50, Number(options?.pageSize ?? 50)));

  const constraints = [
    where("visibilityStatus", "==", "visible"),
    where("subscriptionStatus", "==", "active"),
    ...(options?.region ? [where("region", "==", options.region)] : []),
    ...(options?.sector ? [where("sectors", "array-contains", options.sector)] : []),
    orderBy("expectedSalaryMax", "asc"),
    limit(pageSize)
  ];

  const q = query(collection(db, "workerPublicProfiles"), ...constraints);
  const snap = await getDocs(q);
  let workers = snap.docs.map((item) => item.data() as WorkerPublicProfile);

  if (options?.salaryMax) {
    workers = workers.filter((w) => w.expectedSalaryMin <= options.salaryMax!);
  }

  const realWorkers = snap.docs.map((d) => d.id);
  if (realWorkers.length) {
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(d.ref, {
        "analytics.totalImpressions": increment(1),
        "analytics.weekImpressions": increment(1)
      });
    });
    batch.commit().catch(() => {});
  }

  return workers.length ? workers : demoPostulants;
}

export async function createWorkerSubscriptionCheckout(couponCode?: string) {
  const callable = httpsCallable(functions, "createWorkerSubscriptionCheckout");
  const result = await callable({ couponCode: couponCode ?? "" });
  return result.data as { url: string };
}

export async function uploadWorkerCv(workerId: string, file: File) {
  const fileRef = ref(storage, `workers/${workerId}/cv/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream"
  });
  return getDownloadURL(fileRef);
}

export async function analyzeCvWithAi(input: {
  fileName: string;
  mimeType: string;
  base64: string;
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
    aiStatus?: "completed" | "quota_exceeded";
  };
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
