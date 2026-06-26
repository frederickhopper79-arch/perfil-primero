import { httpsCallable } from "firebase/functions";
import { functions } from "./client";

export async function getReferralStats() {
  const fn = httpsCallable(functions, "getReferralStats");
  const result = await fn({});
  return result.data as {
    referralCode: string | null;
    referralCount: number;
    earnedDays: number;
    referrals: Array<{ refereeEmail: string; activatedAt: string | null; earnedDays: number }>;
  };
}

export async function applyReferralCode(referralCode: string) {
  const fn = httpsCallable(functions, "applyReferralCode");
  const result = await fn({ referralCode });
  return result.data as { ok: boolean; referrerUid: string };
}

export async function getSalaryBenchmark(opts: {
  sector: string;
  region?: string;
  experienceLevel?: string;
}) {
  const fn = httpsCallable(functions, "getSalaryBenchmark");
  const result = await fn(opts);
  return result.data as {
    count: number;
    medianMin: number | null;
    medianMax: number | null;
    p25Min: number | null;
    p75Max: number | null;
    sector: string;
    region: string;
    experienceLevel: string;
  };
}

export async function getProfileCompletionScore() {
  const fn = httpsCallable(functions, "getProfileCompletionScore");
  const result = await fn({});
  return result.data as {
    score: number;
    checks: Array<{ field: string; label: string; done: boolean; weight: number }>;
    missing: string[];
    isPublishable: boolean;
  };
}

export async function getNotificationPreferences() {
  const fn = httpsCallable(functions, "getNotificationPreferences");
  const result = await fn({});
  return result.data as {
    prefs: {
      email: { newInvitations: boolean; messages: boolean; profileExpiry: boolean; weeklyDigest: boolean; marketing: boolean };
      push: { newInvitations: boolean; messages: boolean };
    };
  };
}

export async function updateNotificationPreferences(prefs: {
  email?: Partial<{ newInvitations: boolean; messages: boolean; profileExpiry: boolean; weeklyDigest: boolean; marketing: boolean }>;
  push?: Partial<{ newInvitations: boolean; messages: boolean }>;
}) {
  const fn = httpsCallable(functions, "updateNotificationPreferences");
  const result = await fn(prefs);
  return result.data as { ok: boolean };
}

export async function createContactTicket(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  userType?: "worker" | "company" | "omil" | "other";
}) {
  const fn = httpsCallable(functions, "createContactTicket");
  const result = await fn(data);
  return result.data as { ok: boolean };
}

export async function getWorkerTimeline() {
  const fn = httpsCallable(functions, "getWorkerTimeline");
  const result = await fn({});
  return result.data as {
    events: Array<{ type: string; date: string | null; label: string; meta?: Record<string, unknown> }>;
  };
}

export async function getCompanyTimeline() {
  const fn = httpsCallable(functions, "getCompanyTimeline");
  const result = await fn({});
  return result.data as {
    events: Array<{ type: string; date: string | null; label: string; meta?: Record<string, unknown> }>;
  };
}

export async function getAggregatedMetrics() {
  const fn = httpsCallable(functions, "getAggregatedMetrics");
  const result = await fn({});
  return result.data as {
    totalWorkers: number;
    verifiedCompanies: number;
    approvedPayments: number;
    totalInvitations: number;
    totalHired: number;
    conversionRate: number;
    generatedAt: string;
  };
}
