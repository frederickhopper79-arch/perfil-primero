// Capa de analytics unificada — envía eventos a Firebase Analytics / gtag
// Todas las funciones son no-bloqueantes y nunca lanzan errores

type EventParams = Record<string, string | number | boolean | null | undefined>;

function gtag(command: string, ...args: unknown[]) {
  if (typeof window === "undefined") return;
  if (!("gtag" in window)) return;
  (window as Window & { gtag: Function }).gtag(command, ...args);
}

/** Trackea un evento de conversión */
export function trackEvent(name: string, params: EventParams = {}) {
  try {
    gtag("event", name, params);
    // También enviar a consola en desarrollo para debugging
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Analytics] ${name}`, params);
    }
  } catch { /* nunca propagar */ }
}

// ── Eventos de negocio Perfil Primero ────────────────────────────────────────

export const Analytics = {
  /** Worker completa registro */
  workerRegistered: (method: "email" | "google") =>
    trackEvent("worker_registered", { method }),

  /** Worker completa perfil al 100% */
  workerProfileCompleted: (daysToComplete: number) =>
    trackEvent("worker_profile_completed", { days_to_complete: daysToComplete }),

  /** Worker activa visibilidad (pago) */
  workerActivated: (paymentMethod: "mercadopago" | "stripe") =>
    trackEvent("worker_activated", { payment_method: paymentMethod }),

  /** Empresa completa registro */
  companyRegistered: (sector: string) =>
    trackEvent("company_registered", { sector }),

  /** Empresa envía invitación */
  invitationSent: (matchScore: number, sector: string) =>
    trackEvent("invitation_sent", { match_score: matchScore, sector }),

  /** Worker acepta invitación */
  invitationAccepted: () => trackEvent("invitation_accepted"),

  /** Worker rechaza invitación */
  invitationRejected: (reason?: string) =>
    trackEvent("invitation_rejected", { reason }),

  /** Empresa desbloquea contacto (pago) */
  contactUnlocked: (paymentMethod: "mercadopago" | "stripe") =>
    trackEvent("contact_unlocked", { payment_method: paymentMethod }),

  /** Contratación exitosa reportada */
  hiringConfirmed: () => trackEvent("hiring_confirmed"),

  /** Worker sube CV */
  cvUploaded: (hasFile: boolean) =>
    trackEvent("cv_uploaded", { has_file: hasFile }),

  /** Worker completa test de evaluación */
  assessmentCompleted: (type: "english" | "spanish" | "personality", score: number) =>
    trackEvent("assessment_completed", { test_type: type, score }),

  /** Usuario hace clic en "Cómo funciona" */
  howItWorksViewed: () => trackEvent("how_it_works_viewed"),

  /** Página de precios vista */
  pricingViewed: () => trackEvent("pricing_viewed"),

  /** PWA instalada */
  pwaInstalled: () => trackEvent("pwa_installed"),

  /** Tour guiado completado */
  tourCompleted: (role: "worker" | "company") =>
    trackEvent("tour_completed", { role }),

  /** Error de pago */
  paymentFailed: (provider: string, errorCode?: string) =>
    trackEvent("payment_failed", { provider, error_code: errorCode }),

  /** Búsqueda de candidatos */
  candidateSearch: (query: string, resultsCount: number) =>
    trackEvent("candidate_search", { has_query: query.length > 0, results_count: resultsCount }),

  /** Perfil de candidato visto */
  candidateViewed: (matchScore: number) =>
    trackEvent("candidate_viewed", { match_score: matchScore }),

  /** CV analizado por IA */
  cvAnalyzed: (success: boolean) =>
    trackEvent("cv_analyzed", { success }),

  /** Carta de presentación generada por IA */
  coverLetterGenerated: () => trackEvent("cover_letter_generated"),

  /** OMIL crea perfil gestionado */
  omilProfileCreated: (municipalityName: string) =>
    trackEvent("omil_profile_created", { municipality: municipalityName }),

  /** Compartir perfil */
  profileShared: (method: string) =>
    trackEvent("profile_shared", { share_method: method }),

  /** Error de aplicación */
  appError: (component: string, message: string) =>
    trackEvent("app_error", { component, message: message.slice(0, 100) }),

  /** Tiempo en página (llamar al unmount) */
  pageTime: (page: string, seconds: number) =>
    trackEvent("page_time", { page, seconds }),
};
