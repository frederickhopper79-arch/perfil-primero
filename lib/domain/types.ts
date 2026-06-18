export type UserRole = "worker" | "company" | "admin" | "omil";

export type CompanyVerificationStatus = "draft" | "pending" | "verified" | "rejected" | "suspended";

export type WorkerAvailability = "actively_looking" | "listening" | "unavailable";

export type WorkerVisibilityStatus =
  | "visible"
  | "paused"
  | "hidden"
  | "expired"
  | "suspended";

export type InvitationStatus =
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "more_info_requested"
  | "unlocked"
  | "in_process"
  | "offer_sent"
  | "hired"
  | "closed"
  | "expired";

export interface WorkerPublicProfile {
  workerId: string;
  profileCode: string;
  displayName: string;
  headline: string;
  summary: string;
  skills: string[];
  sectors: string[];
  assessmentScores?: {
    english: number;
    spanish: number;
    personality: number;
  };
  testAttemptCounts?: {
    english: number;
    spanish: number;
    personality: number;
  };
  analytics?: {
    totalImpressions: number;
    weekImpressions: number;
    weekResetsAt?: Date;
  };
  cvAnalysisSummary?: string;
  formattedCv?: string;
  coverLetter?: string;
  cvFileUrl?: string;
  experienceLevel: "junior" | "mid" | "senior" | "lead";
  yearsOfExperience: number;
  region: string;
  city?: string;
  workModes: Array<"remote" | "hybrid" | "onsite">;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  currency: "USD" | "CLP";
  availability: WorkerAvailability;
  visibilityStatus: WorkerVisibilityStatus;
  subscriptionStatus: "inactive" | "active" | "expired" | "cancelled";
  profileSource?: "direct" | "omil";
  createdByOmilId?: string;
  profileExpiresAt: Date;
}

export interface WorkerPrivateProfile {
  workerId: string;
  legalName: string;
  preferredName: string;
  email: string;
  phone: string;
  portfolioLinks: string[];
  formattedCv?: string;
  cvAnalysisSummary?: string;
  coverLetter?: string;
  verifiedInviteCount?: number;
}

export interface Invitation {
  invitationId: string;
  companyId: string;
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
  status: InvitationStatus;
  expiresAt: Date;
  interviewRulesAccepted?: {
    company?: boolean;
    worker?: boolean;
  };
  chatLockedForPayment?: boolean;
  paymentRequiredAt?: Date;
  companyHiredCount?: number;
  companyVerified?: boolean;
  decisionDeadline?: Date | string;
}

export interface JobOffer {
  jobOfferId: string;
  companyId: string;
  title: string;
  area: string;
  region: string;
  city: string;
  workMode: "remote" | "hybrid" | "onsite";
  contractType: "full_time" | "part_time" | "contractor" | "temporary";
  salaryMin: number;
  salaryMax: number;
  currency: "USD" | "CLP";
  vacanciesTotal: number;
  vacanciesAvailable: number;
  description: string;
  requirements: string;
  visibilityStatus: "visible" | "paused" | "closed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlatformReview {
  reviewId: string;
  invitationId: string;
  companyId: string;
  workerId: string;
  targetRole: "company" | "worker";
  score: number;
  comment: string;
  attendedInPerson?: boolean;
  createdAt?: Date;
}

export interface ConversationMessage {
  messageId: string;
  invitationId: string;
  companyId: string;
  workerId: string;
  senderId: string;
  senderRole: "worker" | "company" | "system";
  body: string;
  paymentRequired?: boolean;
  createdAt?: Date;
}

export interface CompanyProfile {
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
  verificationStatus: CompanyVerificationStatus;
  verificationNotes?: string;
  billingStatus: "inactive" | "active" | "past_due";
  reputationScore: number;
  responseRate: number;
  averageResponseTimeHours: number | null;
  hiredCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
