"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params?: EventParams) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, params ?? {});
    }
  } catch {
    // silently ignore in environments without gtag
  }
}

export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent("page_view", { page_path: pagePath, page_title: pageTitle });
}

// ── Trabajador ────────────────────────────────────────────────────────────────
export const WorkerEvents = {
  profileStarted: () => trackEvent("worker_profile_started"),
  profileCompleted: (score: number) => trackEvent("worker_profile_completed", { score }),
  profilePublished: () => trackEvent("worker_profile_published"),
  profilePaused: () => trackEvent("worker_profile_paused"),
  cvUploaded: () => trackEvent("worker_cv_uploaded"),
  cvAnalyzed: () => trackEvent("worker_cv_analyzed"),
  invitationViewed: (invitationId: string) => trackEvent("worker_invitation_viewed", { invitation_id: invitationId }),
  invitationAccepted: (invitationId: string) => trackEvent("worker_invitation_accepted", { invitation_id: invitationId }),
  invitationRejected: (invitationId: string) => trackEvent("worker_invitation_rejected", { invitation_id: invitationId }),
  messageSent: (invitationId: string) => trackEvent("worker_message_sent", { invitation_id: invitationId }),
  paymentInitiated: (amount: number) => trackEvent("worker_payment_initiated", { value: amount, currency: "CLP" }),
  paymentCompleted: (amount: number) => trackEvent("worker_payment_completed", { value: amount, currency: "CLP" }),
  referralCodeApplied: () => trackEvent("worker_referral_code_applied"),
  referralShared: (channel: string) => trackEvent("worker_referral_shared", { channel }),
  profileExpirySeen: (daysLeft: number) => trackEvent("worker_profile_expiry_seen", { days_left: daysLeft }),
  profileReactivated: () => trackEvent("worker_profile_reactivated"),
  aiAdviceRequested: () => trackEvent("worker_ai_advice_requested"),
  qrCodeViewed: () => trackEvent("worker_qr_code_viewed"),
  profileShareClicked: (channel: string) => trackEvent("worker_profile_share_clicked", { channel }),
};

// ── Empresa ───────────────────────────────────────────────────────────────────
export const CompanyEvents = {
  registered: () => trackEvent("company_registered"),
  verificationSubmitted: () => trackEvent("company_verification_submitted"),
  verified: () => trackEvent("company_verified"),
  searchPerformed: (query: string, resultCount: number) => trackEvent("company_search_performed", { query_length: query.length, result_count: resultCount }),
  profileViewed: (workerId: string) => trackEvent("company_profile_viewed", { worker_id: workerId }),
  invitationSent: (invitationId: string) => trackEvent("company_invitation_sent", { invitation_id: invitationId }),
  contactUnlocked: (invitationId: string) => trackEvent("company_contact_unlocked", { invitation_id: invitationId }),
  paymentInitiated: (amount: number, productType: string) => trackEvent("company_payment_initiated", { value: amount, currency: "CLP", product_type: productType }),
  paymentCompleted: (amount: number, productType: string) => trackEvent("company_payment_completed", { value: amount, currency: "CLP", product_type: productType }),
  interviewScheduled: (invitationId: string) => trackEvent("company_interview_scheduled", { invitation_id: invitationId }),
  reviewSubmitted: (score: number) => trackEvent("company_review_submitted", { score }),
  metricsViewed: () => trackEvent("company_metrics_viewed"),
  messageSent: (invitationId: string) => trackEvent("company_message_sent", { invitation_id: invitationId }),
  alertPreferencesSaved: () => trackEvent("company_alert_preferences_saved"),
  jobOfferCreated: () => trackEvent("company_job_offer_created"),
  teamMemberAdded: () => trackEvent("company_team_member_added"),
};

// ── Navegación ────────────────────────────────────────────────────────────────
export const NavigationEvents = {
  ctaClicked: (ctaName: string, location: string) => trackEvent("cta_clicked", { cta_name: ctaName, location }),
  navLinkClicked: (linkHref: string) => trackEvent("nav_link_clicked", { link_href: linkHref }),
  blogArticleRead: (articleSlug: string) => trackEvent("blog_article_read", { article_slug: articleSlug }),
  pricingPageViewed: () => trackEvent("pricing_page_viewed"),
  howItWorksPageViewed: () => trackEvent("how_it_works_page_viewed"),
  changelogViewed: () => trackEvent("changelog_viewed"),
  statsPageViewed: () => trackEvent("stats_page_viewed"),
  referralPageViewed: () => trackEvent("referral_page_viewed"),
};

// ── Sistema ───────────────────────────────────────────────────────────────────
export const SystemEvents = {
  pwaInstalled: () => trackEvent("pwa_installed"),
  pushPermissionGranted: () => trackEvent("push_permission_granted"),
  pushPermissionDenied: () => trackEvent("push_permission_denied"),
  offlinePageSeen: () => trackEvent("offline_page_seen"),
  errorBoundaryCaught: (section: string) => trackEvent("error_boundary_caught", { section }),
  loginSuccess: (method: string) => trackEvent("login_success", { method }),
  loginFailed: (reason: string) => trackEvent("login_failed", { reason }),
  logout: () => trackEvent("logout"),
  signupStarted: (userType: string) => trackEvent("signup_started", { user_type: userType }),
  signupCompleted: (userType: string) => trackEvent("signup_completed", { user_type: userType }),
};
