declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type ConversionEvent =
  | "profile_started"
  | "profile_completed"
  | "checkout_initiated"
  | "checkout_completed"
  | "first_invitation_received"
  | "invitation_accepted"
  | "company_registered"
  | "company_verified"
  | "search_performed"
  | "semantic_search_performed"
  | "worker_selected"
  | "invitation_sent";

export function trackEvent(event: ConversionEvent, params?: Record<string, string | number>) {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, params ?? {});
    }
  } catch {
    // analytics never breaks the app
  }
}
