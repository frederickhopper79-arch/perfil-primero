export const SLA_DAYS = {
  sent: 3,
  accepted: 5,
  in_process: 14,
  offer_sent: 3,
} as const;

export const FREEMIUM_WORKER_LIMIT = 5;
export const MAX_TEAM_MEMBERS = 10;
export const MAX_CV_BYTES = 5 * 1024 * 1024;
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const WORKER_SUBSCRIPTION_DAYS = 30;
export const WORKER_MIN_SALARY = 350_000;
export const PROFILE_CODE_LENGTH = 6;
export const MAX_SKILLS = 20;
export const MAX_PORTFOLIO_LINKS = 5;
export const MAX_OMIL_PROFILES = 500;
export const MESSAGE_PAGE_SIZE = 20;
export const WORKER_SEARCH_PAGE_SIZE = 50;
export const ADMIN_ITEMS_PAGE_SIZE = 100;

export const INVITATION_STATUSES = [
  "sent",
  "viewed",
  "accepted",
  "in_process",
  "offer_sent",
  "hired",
  "closed",
] as const;

export const WORK_MODES = ["remote", "hybrid", "onsite"] as const;

export const AVAILABILITY_LABELS: Record<string, string> = {
  actively_looking: "Buscando activamente",
  listening: "Abierto a propuestas",
  unavailable: "No disponible",
};

export const INVITATION_STATUS_LABELS: Record<string, string> = {
  sent: "Invitación enviada",
  viewed: "Vista por el postulante",
  accepted: "Aceptada",
  in_process: "En proceso",
  offer_sent: "Oferta enviada",
  hired: "Contratado",
  closed: "Proceso cerrado",
};

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  junior: "Junior (0-2 años)",
  mid: "Semi-senior (2-5 años)",
  senior: "Senior (5-10 años)",
  lead: "Lead / Especialista (10+ años)",
  executive: "Directivo / Gerencial",
};

export const VAPID_PUBLIC_KEY =
  "BEBVXn8vVLU2osppPkVqWZH1XrCxCAbJQf0VlKQzKNVzBIh_jRd4b5U9pJK8yJOUyQbabIeEMdY7r2PQJsZ8BIE";

export const APP_URL = "https://perfil-primero.web.app";
export const COMPANY_EMAIL = "contacto@perfil-primero.web.app";
export const COMPANY_NAME = "Perfil Primero SpA";
export const COMPANY_RUT = "78.449.783-6";
export const COMPANY_CITY = "Puerto Montt, Los Lagos, Chile";
