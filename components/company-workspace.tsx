"use client";

// ── RUT chileno: valida dígito verificador ─────────────────────────────────
function validateRut(raw: string): boolean {
  const cleaned = raw.replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  let sum = 0, factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rem = 11 - (sum % 11);
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  return dv === expected;
}

// ── Match score color ──────────────────────────────────────────────────────
function matchColor(score: number): string {
  if (score >= 80) return "#057642";
  if (score >= 60) return "#0a66c2";
  if (score >= 40) return "#f5a623";
  return "#647488";
}

function toEnglishLevel(score: number): string {
  if (score >= 91) return "C2";
  if (score >= 76) return "C1";
  if (score >= 61) return "B2";
  if (score >= 41) return "B1";
  if (score >= 21) return "A2";
  return "A1";
}

function toSpanishLevel(score: number): string {
  if (score >= 85) return "Experto";
  if (score >= 65) return "Avanzado";
  if (score >= 40) return "Intermedio";
  return "Básico";
}

function toPersonalityLabel(score: number): string {
  if (score >= 80) return "Proactivo";
  if (score >= 60) return "Colaborativo";
  if (score >= 40) return "Metódico";
  return "Independiente";
}

import { FormEvent, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useDeferredSearch } from "@/lib/hooks/useDeferredSearch";
import { onAuthStateChanged } from "firebase/auth";
import { BarChart3 as BarChart3Icon, BadgeDollarSign, Bell, BriefcaseBusiness, Check, CheckCircle2, CreditCard, Filter, Loader2, MessageSquare, Search, Send } from "lucide-react";
import { AuthCard } from "./auth-card";
import { MercadoPagoIcon } from "./brand-icons";
import { CompanyInvoicesPanel } from "./company-invoices-panel";
import { SalaryBenchmarkWidget } from "./salary-benchmark-widget";
import { chileRegions, FREEMIUM_WORKER_LIMIT, invitationTemplates, jobAreas } from "@/lib/domain/catalogs";
import { ensureUserRecord, getUserRole, logout } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  createCompanyMonthlyCheckout,
  createCompanyUnlimitedCheckout,
  createCompanyUnlockCheckout,
  createInvitation,
  acceptInterviewRules,
  getCandidateMatchAdvice,
  getCompanyProfile,
  getUnlockedWorkerContact,
  listCompanyJobOffers,
  listCompanyPayments,
  markMessagesRead,
  recordProfileImpression,
  recordSearchAnalytics,
  saveCompanyAlertPreferences,
  saveCompanyProfile,
  saveJobOffer,
  scheduleInterview,
  semanticWorkerSearch,
  sendConversationMessage,
  submitEmployerReview,
  submitPlatformReview,
  subscribeToCompanyInvitations,
  subscribeToMessages,
  updateInvitationStatus,
  uploadCompanyLogo,
  addCompanyTeamMember,
  removeCompanyTeamMember
} from "@/lib/firebase/companies";
import { listVisibleWorkers, syncFavoritesToFirestore } from "@/lib/firebase/workers";
import { calculateMatchScore } from "@/lib/domain/matching-engine";
import { trackEvent } from "@/lib/firebase/analytics";
import type { CompanyProfile, ConversationMessage, Invitation, JobOffer, WorkerPublicProfile } from "@/lib/domain/types";

const pipelineStatuses = [
  { key: "sent", label: "Invitado" },
  { key: "accepted", label: "Aceptado" },
  { key: "in_process", label: "Entrevista" },
  { key: "offer_sent", label: "Oferta" },
  { key: "hired", label: "Contratado" }
];

function TeamMembersPanel({ uid }: { uid: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "recruiter" | "admin">("viewer");
  const [members, setMembers] = useState<Array<{ uid: string; email: string; role: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!uid) return;
    import("@/lib/firebase/client").then(({ db }) => {
      import("firebase/firestore").then(({ doc, getDoc }) => {
        getDoc(doc(db, "companyProfiles", uid)).then((snap) => {
          if (snap.exists()) setMembers((snap.data().teamMembers as Array<{ uid: string; email: string; role: string }>) ?? []);
        });
      });
    });
  }, [uid]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const r = await addCompanyTeamMember(email.trim(), role);
      setMsg(`Miembro agregado. Total: ${r.memberCount}`);
      setEmail("");
    } catch (err: unknown) {
      setMsg((err as Error).message || "Error al agregar miembro.");
    } finally { setLoading(false); }
  };

  const handleRemove = async (memberUid: string) => {
    try {
      await removeCompanyTeamMember(memberUid);
      setMembers((prev) => prev.filter((m) => m.uid !== memberUid));
    } catch (err: unknown) {
      setMsg((err as Error).message || "Error al eliminar miembro.");
    }
  };

  return (
    <section className="formSurface" style={{ marginTop: 12 }}>
      <div className="formHeader">
        <CheckCircle2 size={22} aria-hidden="true" />
        <div>
          <h2>Equipo de reclutamiento</h2>
          <p>Agrega personas de tu empresa para que accedan al panel como reclutadores o administradores.</p>
        </div>
      </div>
      <form className="formGrid" onSubmit={handleAdd} style={{ marginBottom: 12 }}>
        <label>
          Email del colaborador
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@empresa.cl" required autoComplete="email" inputMode="email" enterKeyHint="next" />
        </label>
        <label>
          Rol
          <select value={role} onChange={(e) => setRole(e.target.value as "viewer" | "recruiter" | "admin")}>
            <option value="viewer">Visualizador</option>
            <option value="recruiter">Reclutador</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="actions">
          <button type="submit" className="button secondary" disabled={loading}>{loading ? "Agregando…" : "Agregar miembro"}</button>
        </div>
      </form>
      {msg && <p className="statusText">{msg}</p>}
      {members.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m) => (
            <li key={m.uid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border, #e5e7eb)" }}>
              <span style={{ fontSize: 13 }}>{m.email} <span style={{ color: "var(--muted)", fontSize: 11 }}>({m.role})</span></span>
              <button type="button" className="button ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => handleRemove(m.uid)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      {members.length === 0 && <p className="emptyState">Sin miembros del equipo aún.</p>}
    </section>
  );
}

export function CompanyWorkspace() {
  const [uid, setUid] = useState("");
  const [workers, setWorkers] = useState<WorkerPublicProfile[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<WorkerPublicProfile | null>(null);
  const COMPARE_CACHE_KEY = "pp_compareWorkers_v2";
  const [compareWorkers, setCompareWorkers] = useState<WorkerPublicProfile[]>(() => {
    try {
      const saved = sessionStorage.getItem(COMPARE_CACHE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as WorkerPublicProfile[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [matchAdvice, setMatchAdvice] = useState<{ score: number; verdict: string; reasons: string[]; risks: string[] } | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [lastWorkerDoc, setLastWorkerDoc] = useState<import("firebase/firestore").QueryDocumentSnapshot | null>(null);
  const [hasMoreWorkers, setHasMoreWorkers] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "jobs" | "talent" | "interview" | "kanban" | "billing" | "metrics" | "benchmark">("dashboard");
  const [filters, setFilters] = useState({
    query: "",
    region: "",
    area: "",
    salaryMax: "",
    semanticQuery: ""
  });
  const { deferred: deferredQuery, isPending: searchPending, set: setDeferredQuery } = useDeferredSearch(filters.query);
  const [payments, setPayments] = useState<Array<{ paymentId: string; status: string; amount: number; paymentType: string }>>([]);
  const [unlockedContact, setUnlockedContact] = useState<{
    legalName: string;
    preferredName: string;
    email: string;
    phone: string;
    portfolioLinks: string[];
  } | null>(null);
  const [status, setStatus] = useState("");
  const [accessStatus, setAccessStatus] = useState("");
  const [company, setCompany] = useState({
    companyName: "",
    legalName: "",
    taxId: "",
    website: "",
    logoUrl: "",
    region: "Región Metropolitana",
    city: "Santiago",
    industry: "",
    size: "1-10",
    culture: "",
    benefits: "",
    remotePolicy: ""
  });
  const [invite, setInvite] = useState({
    jobOfferId: "",
    templateId: "manual",
    opportunityTitle: "",
    opportunitySummary: "",
    salaryMin: "",
    salaryMax: "",
    workMode: "hybrid",
    contractType: "full_time" as "full_time" | "part_time" | "contractor" | "temporary",
    location: "",
    message: "",
    decisionDeadline: ""
  });
  const [jobOffer, setJobOffer] = useState({
    title: "",
    area: "",
    region: "Región Metropolitana",
    city: "",
    workMode: "hybrid",
    contractType: "full_time",
    salaryMin: "",
    salaryMax: "",
    vacanciesTotal: "1",
    description: "",
    requirements: "",
    visibilityStatus: "visible"
  });
  const [interviewStartsAt, setInterviewStartsAt] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [review, setReview] = useState({ score: "5", comment: "", attendedInPerson: true });
  const [lastInvitationId, setLastInvitationId] = useState("");
  const [activeInvitationId, setActiveInvitationId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [loadingSemanticSearch, setLoadingSemanticSearch] = useState(false);
  const [wizardStep, setWizardStep] = useState<0 | 1 | 2 | 3>(0);
  const [invitationStatusFilter, setInvitationStatusFilter] = useState("all");
  const [favoriteWorkers, setFavoriteWorkers] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("pp_favorites_v1") ?? "[]") as string[]; } catch { return []; }
  });
  const [copiedCalendar, setCopiedCalendar] = useState(false);
  const [copiedInvId, setCopiedInvId] = useState(false);
  const [workerModeFilter, setWorkerModeFilter] = useState("");
  const [workerAvailFilter, setWorkerAvailFilter] = useState("");
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [workerNotes, setWorkerNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("pp_worker_notes_v1") ?? "{}") as Record<string, string>; } catch { return {}; }
  });
  const [workerStars, setWorkerStars] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("pp_worker_stars_v1") ?? "{}") as Record<string, number>; } catch { return {}; }
  });
  const [workerLabels, setWorkerLabels] = useState<Record<string, "hot" | "warm" | "cold">>(() => {
    try { return JSON.parse(localStorage.getItem("pp_worker_labels_v1") ?? "{}") as Record<string, "hot" | "warm" | "cold">; } catch { return {}; }
  });
  const [senioryFilter, setSenioryFilter] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [rutValid, setRutValid] = useState<boolean | null>(null);
  const [monthlyPlan, setMonthlyPlan] = useState<{ active: boolean; contactCreditsTotal: number; contactCreditsUsed: number; renewsAt?: { seconds: number } } | null>(null);
  const [unlimitedPlan, setUnlimitedPlan] = useState<{ active: boolean; renewsAt?: { seconds: number } } | null>(null);
  const [alertPrefs, setAlertPrefs] = useState({ enabled: false, areas: [] as string[], regions: [] as string[], salaryMax: 0, workModes: [] as string[] });
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [invitationComments, setInvitationComments] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("pp_inv_comments_v1") ?? "{}") as Record<string, string>; } catch { return {}; }
  });
  const [budgetAlert, setBudgetAlert] = useState<number>(() => {
    try { return Number(localStorage.getItem("pp_budget_alert_v1") ?? "0"); } catch { return 0; }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function saveInvitationComment(invId: string, comment: string) {
    setInvitationComments((prev) => {
      const next = { ...prev, [invId]: comment };
      try { localStorage.setItem("pp_inv_comments_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function saveBudgetAlert(amount: number) {
    setBudgetAlert(amount);
    try { localStorage.setItem("pp_budget_alert_v1", String(amount)); } catch {}
  }

  function saveWorkerNote(workerId: string, note: string) {
    setWorkerNotes((prev) => {
      const next = { ...prev, [workerId]: note };
      try { localStorage.setItem("pp_worker_notes_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function saveWorkerStar(workerId: string, stars: number) {
    setWorkerStars((prev) => {
      const next = { ...prev, [workerId]: stars };
      try { localStorage.setItem("pp_worker_stars_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function saveWorkerLabel(workerId: string, label: "hot" | "warm" | "cold" | "") {
    setWorkerLabels((prev) => {
      const next = { ...prev };
      if (!label) { delete next[workerId]; } else { next[workerId] = label; }
      try { localStorage.setItem("pp_worker_labels_v1", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function exportPaymentsCsv() {
    const rows = [["ID","Tipo","Monto CLP","Estado"]].concat(
      payments.map((p) => [p.paymentId, p.paymentType, String(p.amount), p.status])
    );
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `pagos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      setStatus("Pago recibido por Mercado Pago. El contacto se desbloquea cuando llegue el webhook aprobado.");
    }
    if (checkout === "pending") {
      setStatus("Mercado Pago dejó el pago pendiente. La consola actualizará el estado cuando se confirme.");
    }
    if (checkout === "failure") {
      setStatus("Mercado Pago no pudo completar el pago. Puedes intentar nuevamente.");
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid("");
        setCompanyProfile(null);
        return;
      }

      const currentRole = await getUserRole(user.uid);
      const resolvedRole = currentRole ?? "company";

      if (!currentRole) {
        await ensureUserRecord(user.uid, user.email ?? "", "company");
      }

      if (resolvedRole !== "company") {
        await logout();
        setUid("");
        setCompanyProfile(null);
        setAccessStatus("Esta cuenta no es de empresa. Ingresa con una cuenta empresa o crea una nueva.");
        return;
      }

      setUid(user.uid);
      setAccessStatus("");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!uid) return;
    fetchWorkers();
  }, [uid]);

  function fetchWorkers(overrideFilters?: typeof filters) {
    const f = overrideFilters ?? filters;
    setLoadingWorkers(true);
    setLastWorkerDoc(null);
    setHasMoreWorkers(false);
    recordSearchAnalytics({
      region: f.region || undefined,
      area: f.area || undefined,
      salaryMax: f.salaryMax ? Number(f.salaryMax) : undefined,
      query: f.query || undefined
    });
    listVisibleWorkers({
      region: f.region || undefined,
      sector: f.area || undefined,
      salaryMax: f.salaryMax ? Number(f.salaryMax) : undefined
    })
      .then(({ workers: results, hasMore, lastDoc }) => {
        setWorkers(results);
        setLastWorkerDoc(lastDoc);
        setHasMoreWorkers(hasMore);
        setRefreshedAt(new Date());
        trackEvent("search_performed", { results: results.length });
      })
      .catch(() => setStatus("No se pudieron cargar los perfiles."))
      .finally(() => setLoadingWorkers(false));
  }

  function loadMoreWorkers() {
    if (!lastWorkerDoc || loadingMore) return;
    setLoadingMore(true);
    listVisibleWorkers({
      region: filters.region || undefined,
      sector: filters.area || undefined,
      salaryMax: filters.salaryMax ? Number(filters.salaryMax) : undefined,
      cursor: lastWorkerDoc
    })
      .then(({ workers: more, hasMore, lastDoc }) => {
        setWorkers((prev) => [...prev, ...more]);
        setLastWorkerDoc(lastDoc);
        setHasMoreWorkers(hasMore);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  function toggleFavorite(workerId: string) {
    setFavoriteWorkers((prev) => {
      const next = prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId];
      try { localStorage.setItem("pp_favorites_v1", JSON.stringify(next)); } catch {}
      if (uid) syncFavoritesToFirestore(uid, next).catch(() => {});
      return next;
    });
  }

  async function copyCalendarUrl() {
    try { await navigator.clipboard.writeText(calendarUrl); setCopiedCalendar(true); setTimeout(() => setCopiedCalendar(false), 2000); } catch {}
  }

  async function copyInvId() {
    if (!activeInvitation) return;
    try { await navigator.clipboard.writeText(activeInvitation.invitationId); setCopiedInvId(true); setTimeout(() => setCopiedInvId(false), 2000); } catch {}
  }

  async function handleSemanticSearch() {
    if (!filters.semanticQuery.trim()) return;
    setLoadingSemanticSearch(true);
    try {
      const result = await semanticWorkerSearch(filters.semanticQuery);
      const extracted = result.filters;
      const merged = {
        ...filters,
        region: extracted.region ?? filters.region,
        area: extracted.area ?? filters.area,
        salaryMax: extracted.salaryMax ?? filters.salaryMax,
        query: extracted.query ?? filters.query
      };
      setFilters(merged);
      trackEvent("semantic_search_performed");
      fetchWorkers(merged);
    } catch {
      setStatus("No se pudo procesar la búsqueda con IA.");
    } finally {
      setLoadingSemanticSearch(false);
    }
  }

  useEffect(() => {
    if (!uid) return;

    getCompanyProfile(uid)
      .then((profile) => {
        setCompanyProfile(profile);
        if (!profile || !profile.legalName || !profile.taxId) {
          setWizardStep(1);
        }
        if (profile?.monthlyPlan) {
          setMonthlyPlan(profile.monthlyPlan as { active: boolean; contactCreditsTotal: number; contactCreditsUsed: number; renewsAt?: { seconds: number } });
        }
        if (profile?.unlimitedPlan) {
          setUnlimitedPlan(profile.unlimitedPlan as { active: boolean; renewsAt?: { seconds: number } });
        }
        if (profile?.alertPreferences) {
          setAlertPrefs({
            enabled: profile.alertPreferences.enabled ?? false,
            areas: profile.alertPreferences.areas ?? [],
            regions: profile.alertPreferences.regions ?? [],
            salaryMax: profile.alertPreferences.salaryMax ?? 0,
            workModes: profile.alertPreferences.workModes ?? []
          });
        }
      })
      .catch(() => setStatus("No se pudo cargar el perfil de empresa."));

    listCompanyPayments(uid)
      .then(setPayments)
      .catch(() => setStatus("No se pudieron cargar los pagos."));

    listCompanyJobOffers(uid)
      .then(setJobOffers)
      .catch(() => setStatus("No se pudieron cargar las publicaciones."));

    const unsubscribeInvitations = subscribeToCompanyInvitations(uid, setInvitations);
    return () => unsubscribeInvitations();
  }, [uid]);

  useEffect(() => {
    if (!companyProfile) return;
    setCompany({
      companyName: companyProfile.companyName ?? "",
      legalName: companyProfile.legalName ?? "",
      taxId: companyProfile.taxId ?? "",
      website: companyProfile.website ?? "",
      logoUrl: companyProfile.logoUrl ?? "",
      region: companyProfile.region ?? "Región Metropolitana",
      city: companyProfile.city ?? "Santiago",
      industry: companyProfile.industry ?? "",
      size: companyProfile.size ?? "1-10",
      culture: companyProfile.culture ?? "",
      benefits: companyProfile.benefits ?? "",
      remotePolicy: companyProfile.remotePolicy ?? ""
    });
  }, [companyProfile]);

  function updateCompany(key: keyof typeof company, value: string) {
    if (key === "region") {
      const nextRegión = chileRegions.find((region) => region.name === value);
      setCompany((current) => ({
        ...current,
        region: value,
        city: nextRegión?.communes.includes(current.city) ? current.city : nextRegión?.communes[0] ?? current.city
      }));
      return;
    }

    setCompany((current) => ({ ...current, [key]: value }));
  }

  function updateInvite(key: keyof typeof invite, value: string) {
    setInvite((current) => ({ ...current, [key]: value }));
  }

  function updateJobOffer(key: keyof typeof jobOffer, value: string) {
    if (key === "region") {
      const nextRegión = chileRegions.find((region) => region.name === value);
      setJobOffer((current) => ({
        ...current,
        region: value,
        city: nextRegión?.communes.includes(current.city) ? current.city : nextRegión?.communes[0] ?? current.city
      }));
      return;
    }

    setJobOffer((current) => ({ ...current, [key]: value }));
  }

  function applyTemplate(templateId: string) {
    if (templateId === "manual") {
      setInvite((current) => ({ ...current, templateId }));
      return;
    }
    const template = invitationTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setInvite((current) => ({
      ...current,
      templateId,
      opportunityTitle: template.title,
      opportunitySummary: template.summary,
      message: template.message
    }));
  }

  const selectedCompanyRegión = chileRegions.find((region) => region.name === company.region) ?? chileRegions[0];
  const activeInvitation = activeInvitationId
    ? invitations.find((invitation) => invitation.invitationId === activeInvitationId) ?? null
    : selectedWorker
      ? invitations.find((invitation) => invitation.workerId === selectedWorker.workerId) ?? null
      : null;
  const isVerified = companyProfile?.verificationStatus === "verified";
  const scoredWorkers = useMemo(() => {
    let base = deferredQuery
      ? workers.filter((worker) => {
          const haystack = `${worker.headline} ${worker.summary ?? ""} ${worker.skills.join(" ")} ${worker.sectors.join(" ")}`.toLowerCase();
          return haystack.includes(deferredQuery.toLowerCase());
        })
      : workers;
    if (workerModeFilter) {
      base = base.filter((w) => w.workModes.includes(workerModeFilter as "remote" | "hybrid" | "onsite"));
    }
    if (workerAvailFilter) {
      base = base.filter((w) => w.availability === workerAvailFilter);
    }
    if (senioryFilter) {
      base = base.filter((w) => w.experienceLevel === senioryFilter);
    }
    return base.map((w) => ({ worker: w, matchScore: calculateMatchScore(w, filters) }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [workers, deferredQuery, filters, workerModeFilter, workerAvailFilter, senioryFilter]);

  const visibleScoredWorkers = isVerified ? scoredWorkers : scoredWorkers.slice(0, FREEMIUM_WORKER_LIMIT);
  const lockedCount = isVerified ? 0 : Math.max(0, scoredWorkers.length - FREEMIUM_WORKER_LIMIT);
  const interviewReady = Boolean(activeInvitation?.interviewRulesAccepted?.company && activeInvitation?.interviewRulesAccepted?.worker);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uid) {
      setStatus("Primero crea o inicia sesión como empresa.");
      return;
    }

    setStatus("Guardando empresa...");

    try {
      if (!company.companyName.trim() || !company.legalName.trim() || !company.taxId.trim()) {
        setStatus("Completa nombre, razón social y RUT antes de enviar a revisión.");
        return;
      }

      const logoUrl = logoFile ? await uploadCompanyLogo(uid, logoFile) : company.logoUrl;
      await saveCompanyProfile({ ...company, logoUrl, companyId: uid });
      const profile = await getCompanyProfile(uid);
      setCompanyProfile(profile);
      setStatus("Empresa enviada a revisión. Un admin debe verificarla para habilitar invitaciones reales.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la empresa.");
    }
  }

  async function handleInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedWorker) {
      setStatus("Selecciona un perfil anónimo antes de crear una invitación.");
      return;
    }

    if (companyProfile?.verificationStatus !== "verified") {
      setStatus("Tu empresa debe estar verificada antes de contactar postulantes reales.");
      return;
    }

    const invSalaryMin = Number(invite.salaryMin);
    const invSalaryMax = Number(invite.salaryMax);
    if (!invite.opportunityTitle.trim()) {
      setStatus("Completa el título de la oportunidad antes de enviar la invitación.");
      return;
    }
    if (!invSalaryMin || !invSalaryMax || invSalaryMin > invSalaryMax) {
      setStatus("Revisa el rango de sueldo: debe ser numérico y el mínimo no puede superar el máximo.");
      return;
    }
    setStatus("Enviando invitación...");

    try {
      const result = await createInvitation({
        companyId: uid,
        workerId: selectedWorker.workerId,
        jobOfferId: invite.jobOfferId || undefined,
        opportunityTitle: invite.opportunityTitle,
        opportunitySummary: invite.opportunitySummary,
        salaryMin: Number(invite.salaryMin),
        salaryMax: Number(invite.salaryMax),
        currency: "CLP",
        workMode: invite.workMode as "remote" | "hybrid" | "onsite",
        location: invite.location,
        contractType: invite.contractType,
        message: invite.message,
        decisionDeadline: invite.decisionDeadline || undefined
      });
      setLastInvitationId(result.invitationId);
      setActiveInvitationId(result.invitationId);
      setActiveView("interview");
      trackEvent("invitation_sent", { invitation_id: result.invitationId, salary_min: invite.salaryMin, salary_max: invite.salaryMax });
      setStatus(`Invitación creada: ${result.invitationId}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear la invitación.");
    }
  }

  async function handleJobOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uid) {
      setStatus("Primero inicia sesión como empresa.");
      return;
    }

    setStatus("Guardando publicación...");

    try {
      const salaryMin = Number(jobOffer.salaryMin);
      const salaryMax = Number(jobOffer.salaryMax);
      const vacanciesTotal = Number(jobOffer.vacanciesTotal);

      if (!jobOffer.title.trim() || !jobOffer.description.trim() || !jobOffer.requirements.trim()) {
        setStatus("Completa cargo, descripción y requisitos antes de guardar la publicación.");
        return;
      }

      if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax) {
        setStatus("Revisa el sueldo: debe ser numérico y el mínimo no puede superar el máximo.");
        return;
      }

      if (!Number.isInteger(vacanciesTotal) || vacanciesTotal < 1 || vacanciesTotal > 100) {
        setStatus("Revisa las vacantes: debe ser un número entero entre 1 y 100.");
        return;
      }

      await saveJobOffer({
        companyId: uid,
        title: jobOffer.title,
        area: jobOffer.area,
        region: jobOffer.region,
        city: jobOffer.city,
        workMode: jobOffer.workMode as JobOffer["workMode"],
        contractType: jobOffer.contractType as JobOffer["contractType"],
        salaryMin,
        salaryMax,
        currency: "CLP",
        vacanciesTotal,
        vacanciesAvailable: vacanciesTotal,
        description: jobOffer.description,
        requirements: jobOffer.requirements,
        visibilityStatus: jobOffer.visibilityStatus as JobOffer["visibilityStatus"]
      });
      const nextOffers = await listCompanyJobOffers(uid);
      setJobOffers(nextOffers);
      setStatus("Publicación guardada. Puedes usarla como base para invitar postulantes.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la publicación.");
    }
  }

  async function handleUnlock() {
    const payableInvitationId = activeInvitation?.invitationId ?? lastInvitationId;

    if (!payableInvitationId) {
      setStatus("Primero crea una invitación, cierra el trato con el postulante y luego registra el pago.");
      return;
    }

    try {
      const checkout = await createCompanyUnlockCheckout(payableInvitationId, couponCode);
      window.location.href = checkout.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el checkout.");
    }
  }

  async function handleLoadUnlockedContact() {
    if (!activeInvitation) {
      setStatus("Selecciona un candidato con invitación pagada para ver contacto.");
      return;
    }

    try {
      const contact = await getUnlockedWorkerContact(activeInvitation.invitationId);
      setUnlockedContact(contact);
      setStatus("Contacto privado desbloqueado.");
    } catch (error) {
      setUnlockedContact(null);
      setStatus(error instanceof Error ? error.message : "No se pudo cargar el contacto privado.");
    }
  }

  async function handleMatchAdvice(worker: WorkerPublicProfile) {
    if (companyProfile?.verificationStatus !== "verified") {
      setStatus("La IA de selección se habilita cuando la empresa está verificada.");
      return;
    }

    setStatus("Analizando compatibilidad con Google IA...");

    try {
      const advice = await getCandidateMatchAdvice({
        opportunityTitle: invite.opportunityTitle || "Vacante sin título",
        opportunitySummary: invite.opportunitySummary || invite.message,
        requiredSkills: invite.opportunitySummary || invite.opportunityTitle || invite.message,
        worker
      });
      setSelectedWorker(worker);
      setMatchAdvice(advice);
      setStatus("Análisis de candidato listo.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo analizar el candidato.");
    }
  }

  function toggleCompare(worker: WorkerPublicProfile) {
    setCompareWorkers((current) => {
      const next = current.some((item) => item.workerId === worker.workerId)
        ? current.filter((item) => item.workerId !== worker.workerId)
        : [...current, worker].slice(0, 3);
      try { sessionStorage.setItem(COMPARE_CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  async function handleStatus(statusKey: string) {
    if (!activeInvitation) {
      setStatus("Primero crea o selecciona una invitación para ese candidato.");
      return;
    }

    try {
      await updateInvitationStatus(activeInvitation.invitationId, statusKey);
      setStatus(`Proceso actualizado a ${statusKey}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo actualizar el proceso.");
    }
  }

  // Ctrl+K atajo de teclado para enfocar búsqueda
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setActiveView("talent");
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeInvitation) return;
    const unsub = subscribeToMessages(activeInvitation.invitationId, setMessages);
    markMessagesRead(activeInvitation.invitationId).catch(() => {});
    return () => unsub();
  }, [activeInvitation?.invitationId]);

  function selectInvitation(invitation: Invitation) {
    setActiveInvitationId(invitation.invitationId);
    const worker = workers.find((item) => item.workerId === invitation.workerId) ?? null;
    if (worker) setSelectedWorker(worker);
    setActiveView("interview");
  }

  async function handleAcceptInterviewRules() {
    if (!activeInvitation) {
      setStatus("Primero selecciona un candidato con invitación.");
      return;
    }

    try {
      await acceptInterviewRules(activeInvitation.invitationId);
      setStatus("Reglas de entrevista aceptadas por la empresa.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudieron aceptar las reglas.");
    }
  }

  async function handleMessage() {
    if (!activeInvitation) {
      setStatus("Primero crea una invitación para abrir mensajería.");
      return;
    }

    try {
      const result = await sendConversationMessage(activeInvitation.invitationId, messageBody);
      setMessageBody("");
      if (result.paymentRequired) {
        setStatus(result.reason ?? "La entrevista quedo bloqueada hasta confirmar pago.");
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }
        return;
      }
      setStatus("Mensaje enviado dentro de la entrevista.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
    }
  }

  async function handleScheduleInterview() {
    if (!activeInvitation) {
      setStatus("Selecciona una invitación antes de programar entrevista.");
      return;
    }

    try {
      const result = await scheduleInterview({
        invitationId: activeInvitation.invitationId,
        startsAt: interviewStartsAt,
        durationMinutes: 45
      });
      setCalendarUrl(result.calendarUrl);
      setStatus("Entrevista programada. Comparte el enlace de Google Calendar con ambas partes.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo programar la entrevista.");
    }
  }

  async function handleReviewWorker() {
    if (!activeInvitation) {
      setStatus("Selecciona una invitación cerrada para evaluar al postulante.");
      return;
    }

    try {
      await submitPlatformReview({
        invitationId: activeInvitation.invitationId,
        targetRole: "worker",
        score: Number(review.score),
        comment: review.comment,
        attendedInPerson: review.attendedInPerson
      });
      setStatus("Evaluación del postulante registrada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la evaluación.");
    }
  }

  if (!uid) {
    return (
      <section className="accessSplit">
        <div className="accessPitch">
          <span className="smallLabel">Panel privado de empresa</span>
          <h2>Entra para verificar tu empresa, publicar vacantes y contactar postulantes reales.</h2>
          <p>
            La búsqueda, comparación, entrevistas, pagos y trazabilidad viven dentro de la cuenta.
            Antes de iniciar sesión solo mostramos la propuesta comercial.
          </p>
          <div className="portalStatGrid">
            <div><strong>Verificación</strong><span>control interno</span></div>
            <div><strong>IA</strong><span>matching asistido</span></div>
            <div><strong>$9.990</strong><span>desbloqueo de contacto</span></div>
          </div>
        </div>
        <AuthCard role="company" onReady={(nextUid) => setUid(nextUid)} />
        {accessStatus ? <p className="statusText">{accessStatus}</p> : null}
      </section>
    );
  }

  const visibleOffers = jobOffers.filter((offer) => offer.visibilityStatus === "visible").length;
  const paidClosures = payments.filter((payment) => payment.status === "paid").length;
  const openProcesses = invitations.filter((invitation) => !["closed", "expired", "rejected"].includes(invitation.status)).length;
  const verifiedCompany = companyProfile?.verificationStatus === "verified";

  // ── Wizard de onboarding ────────────────────────────────────────────────────
  if (wizardStep > 0) {
    return (
      <section className="wizardShell">
        <div className="wizardCard">
          <div className="wizardProgress">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`wizardDot${wizardStep >= step ? " active" : ""}`} />
            ))}
          </div>

          {wizardStep === 1 && (
            <>
              <h2>Bienvenida a Perfil Primero</h2>
              <p className="wizardSubtitle">Completa los datos básicos de tu empresa para empezar a buscar talento.</p>
              <div className="formGrid">
                <label className="wide">
                  Nombre comercial
                  <input value={company.companyName} onChange={(e) => updateCompany("companyName", e.target.value)} placeholder="Ej: Empresa Chile Ltda." />
                </label>
                <label className="wide">
                  Razón social
                  <input value={company.legalName} onChange={(e) => updateCompany("legalName", e.target.value)} placeholder="Nombre legal inscrito en SII" />
                </label>
                <label className="wide">
                  RUT empresa
                  <input
                    value={company.taxId}
                    onChange={(e) => {
                      updateCompany("taxId", e.target.value);
                      setRutValid(e.target.value.length >= 8 ? validateRut(e.target.value) : null);
                    }}
                    placeholder="76.123.456-7"
                    className={rutValid === false ? "inputError" : rutValid === true ? "inputOk" : ""}
                  />
                  {rutValid === false && <span className="fieldError">RUT inválido — revisa el dígito verificador</span>}
                  {rutValid === true && <span className="fieldOk">✓ RUT válido</span>}
                </label>
                <label>
                  Sitio web
                  <input value={company.website} onChange={(e) => updateCompany("website", e.target.value)} placeholder="https://tuempresa.cl" />
                </label>
                <label>
                  Industria
                  <input value={company.industry} onChange={(e) => updateCompany("industry", e.target.value)} placeholder="Tecnología, Salud, Retail…" />
                </label>
              </div>
              <button
                className="button primary"
                type="button"
                disabled={!company.companyName || !company.legalName || rutValid !== true}
                onClick={() => setWizardStep(2)}
              >
                Siguiente →
              </button>
            </>
          )}

          {wizardStep === 2 && (
            <>
              <h2>Logo de empresa</h2>
              <p className="wizardSubtitle">Opcional pero recomendado. Las empresas con logo generan más confianza en los postulantes.</p>
              {company.logoUrl && <img src={company.logoUrl} alt="Logo actual" className="wizardLogoPreview" />}
              <label className="wide">
                Subir logo (PNG, JPG · máx. 2 MB)
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLogoFile(file);
                  }}
                />
              </label>
              <div className="wizardActions">
                <button className="button secondary" type="button" onClick={() => setWizardStep(1)}>← Atrás</button>
                <button
                  className="button primary"
                  type="button"
                  onClick={async () => {
                    setStatus("Guardando empresa...");
                    try {
                      const logoUrl = logoFile ? await uploadCompanyLogo(uid, logoFile) : company.logoUrl;
                      await saveCompanyProfile({ ...company, logoUrl, companyId: uid });
                      const profile = await getCompanyProfile(uid);
                      setCompanyProfile(profile);
                      setStatus("");
                      setWizardStep(3);
                    } catch {
                      setStatus("Error al guardar. Intenta nuevamente.");
                    }
                  }}
                >
                  Guardar y continuar →
                </button>
              </div>
              {status && <p className="statusText">{status}</p>}
            </>
          )}

          {wizardStep === 3 && (
            <>
              <h2>¡Empresa registrada!</h2>
              <p className="wizardSubtitle">
                Tu empresa fue enviada a revisión. Un administrador la verificará en las próximas horas.
                Mientras tanto, puedes explorar los perfiles disponibles.
              </p>
              <div className="wizardChecks">
                <p>✓ Datos registrados</p>
                <p>✓ Pendiente de verificación</p>
                <p>· Hasta 3 perfiles disponibles en modo exploración</p>
              </div>
              <button className="button primary" type="button" onClick={() => { setWizardStep(0); setActiveView("talent"); }}>
                Explorar perfiles →
              </button>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flowLayout">
      <aside className="steps">
        <section className="workspaceSessionBar">
          <div>
            <span className="smallLabel">Sesión empresa</span>
            <strong>{company.companyName || uid}</strong>
          </div>
          <button
            className="button secondary"
            type="button"
            onClick={async () => {
              await logout();
              setUid("");
              setCompanyProfile(null);
              setStatus("Sesión cerrada.");
            }}
          >
            Cerrar sesión
          </button>
        </section>

        <nav className="companyChecklist" aria-label="Pasos empresa">
          {[
            ["Cuenta", Boolean(uid)],
            ["Datos empresa", Boolean(company.companyName && company.taxId)],
            ["Verificación", companyProfile?.verificationStatus === "verified"],
            ["Primera búsqueda", workers.length > 0],
            ["Invitación enviada", invitations.length > 0],
            ["Cierre pagado", paidClosures > 0],
          ].map(([label, done], i) => (
            <div className={`step${done ? " done" : ""}`} key={String(label)}>
              <span>{done ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
              <p>{String(label)}</p>
            </div>
          ))}
        </nav>

        <section className="sidePanel">
          <div className="sidePanelHeader">
            <MercadoPagoIcon />
            <strong>Pago por éxito</strong>
          </div>
          <strong className="activationPrice">$9.990 CLP</strong>
          <p className="helperText">La empresa paga solo cuando desbloquea el contacto de un postulante.</p>
          <div className="miniRule">
            <BadgeDollarSign size={15} aria-hidden="true" />
            <span>Sin cobro por mirar perfiles ni invitar.</span>
          </div>
        </section>
      </aside>

      <div className="stack">
        <section className="decisionBar">
          <div>
            <span className="smallLabel">Mesa de decisión</span>
            <h2>Compara, decide y controla el proceso sin salir de Perfil Primero.</h2>
          </div>
          <div className="paymentStatusBox">
            <MercadoPagoIcon />
            <span>{payments.some((payment) => payment.status === "paid") ? "Pago confirmado" : "Sin pagos confirmados"}</span>
          </div>
        </section>

        <div className="workspaceTabs" role="tablist" aria-label="Panel empresa">
          {[
            ["dashboard", "Resumen"],
            ["jobs", "Publicaciones"],
            ["talent", "Buscar talento"],
            ["interview", "Entrevista"],
            ["kanban", "Pipeline"],
            ["billing", "Pagos"],
            ["metrics", "Métricas"],
            ["benchmark", "Benchmark salarial"],
          ].map(([key, label]) => (
            <button
              className={activeView === key ? "active" : ""}
              key={key}
              type="button"
              onClick={() => setActiveView(key as typeof activeView)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeView === "dashboard" ? (
        <form className="formSurface" onSubmit={handleCompany}>
          <div className="formHeader">
            <Filter size={22} aria-hidden="true" />
            <div>
              <h2>Datos de empresa</h2>
              <p>Completa y envía a revisión para operar.</p>
            </div>
          </div>
          <div className="formGrid">
            <label>
              Nombre
              <input value={company.companyName} onChange={(event) => updateCompany("companyName", event.target.value)} />
            </label>
            <label>
              Razón social
              <input value={company.legalName} onChange={(event) => updateCompany("legalName", event.target.value)} />
            </label>
            <label>
              RUT empresa
              <input
                value={company.taxId}
                onChange={(event) => {
                  updateCompany("taxId", event.target.value);
                  setRutValid(event.target.value.length >= 8 ? validateRut(event.target.value) : null);
                }}
                className={rutValid === false ? "inputError" : rutValid === true ? "inputOk" : ""}
                placeholder="12.345.678-9"
              />
              {rutValid === false && <span className="fieldError">RUT inválido — revisa el dígito verificador</span>}
              {rutValid === true && <span className="fieldOk">✓ RUT válido</span>}
            </label>
            <label>
              Sitio web
              <input value={company.website} onChange={(event) => updateCompany("website", event.target.value)} />
            </label>
            <label>
              Región
              <select value={company.region} onChange={(event) => updateCompany("region", event.target.value)}>
                {chileRegions.map((region) => (
                  <option key={region.name} value={region.name}>{region.name}</option>
                ))}
              </select>
            </label>
            <label>
              Comuna
              <select value={company.city} onChange={(event) => updateCompany("city", event.target.value)}>
                {selectedCompanyRegión.communes.map((commune) => (
                  <option key={commune} value={commune}>{commune}</option>
                ))}
              </select>
            </label>
            <label>
              Industria
              <select value={company.industry} onChange={(event) => updateCompany("industry", event.target.value)}>
                <option value="">Seleccionar rubro</option>
                {jobAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label>
              Logo empresa
              <input accept="image/png,image/jpeg,image/webp,image/svg+xml" type="file" onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && file.size > 2 * 1024 * 1024) {
                  setStatus("El logo no puede superar 2 MB. Usa una imagen más liviana.");
                  event.target.value = "";
                  return;
                }
                setLogoFile(file);
              }} />
            </label>
            <label className="wide">
              Cultura y valores
              <textarea
                value={company.culture}
                onChange={(event) => updateCompany("culture", event.target.value)}
                placeholder="Ej: Startup con mentalidad ágil, trabajo colaborativo, foco en resultados."
                rows={2}
              />
            </label>
            <label className="wide">
              Beneficios
              <textarea
                value={company.benefits}
                onChange={(event) => updateCompany("benefits", event.target.value)}
                placeholder="Ej: Seguro complementario, horario flexible, bono anual."
                rows={2}
              />
            </label>
            <label>
              Política de trabajo remoto
              <select
                value={company.remotePolicy}
                onChange={(event) => updateCompany("remotePolicy", event.target.value)}
              >
                <option value="">No especificada</option>
                <option value="full_remote">100% Remoto</option>
                <option value="hybrid_flexible">Híbrido flexible</option>
                <option value="hybrid_fixed">Híbrido fijo (días en oficina)</option>
                <option value="onsite">Presencial</option>
              </select>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="submit">Guardar empresa</button>
          </div>
          {status ? <p className="statusText">{status}</p> : null}
        </form>
        ) : null}

        {activeView === "dashboard" && companyProfile && companyProfile.verificationStatus !== "verified" ? (
          <section className="formSurface onboardingChecklist">
            <div className="formHeader">
              <CheckCircle2 size={22} aria-hidden="true" />
              <div>
                <h2>Checklist de activación</h2>
                <p>Completa estos pasos para operar en la plataforma.</p>
              </div>
            </div>
            <ul className="checklistItems">
              <li className={company.companyName && company.legalName && company.taxId ? "checkDone" : "checkPending"}>
                <Check size={16} /> Datos básicos de empresa (nombre, razón social, RUT)
              </li>
              <li className={company.industry ? "checkDone" : "checkPending"}>
                <Check size={16} /> Rubro o industria seleccionado
              </li>
              <li className={company.website ? "checkDone" : "checkPending"}>
                <Check size={16} /> Sitio web ingresado
              </li>
              <li className="checkPending">
                <Check size={16} /> Verificación aprobada por el equipo Perfil Primero
              </li>
            </ul>
          </section>
        ) : null}

        {activeView === "dashboard" ? (
          <section className="dashboardGrid">
            <article>
              <span className="smallLabel">Perfiles activos</span>
              <strong>{workers.length}</strong>
              <p>perfiles activos con pago confirmado.</p>
            </article>
            <article>
              <span className="smallLabel">Tasa de aceptación</span>
              <strong>{invitations.length > 0 ? `${Math.round((invitations.filter((i) => ["accepted","in_process","offer_sent","hired"].includes(i.status)).length / invitations.length) * 100)}%` : "—"}</strong>
              <p>invitaciones aceptadas por postulantes.</p>
            </article>
            <article>
              <span className="smallLabel">Contratados</span>
              <strong>{invitations.filter((i) => i.status === "hired").length}</strong>
              <p>postulantes contratados a través de la plataforma.</p>
            </article>
            <article>
              <span className="smallLabel">Procesos</span>
              <strong>{invitations.length}</strong>
              <p>invitaciones creadas por tu empresa.</p>
            </article>
            <article>
              <span className="smallLabel">Cierre</span>
              <strong>{paidClosures}</strong>
              <p>pagos confirmados por Mercado Pago.</p>
            </article>
            <article>
              <span className="smallLabel">Empresa</span>
              <strong>{company.companyName || "Sin nombre"}</strong>
              <p>{company.region} - {company.city} - {verificationLabel(companyProfile?.verificationStatus)}</p>
            </article>
            <article>
              <span className="smallLabel">Publicaciones</span>
              <strong>{jobOffers.length}</strong>
              <p>{visibleOffers} visibles con vacantes abiertas.</p>
            </article>
          </section>
        ) : null}

        {activeView === "dashboard" && uid ? (
          <TeamMembersPanel uid={uid} />
        ) : null}

        {activeView === "jobs" ? (
          <section className="formSurface">
            <div className="formHeader">
              <BriefcaseBusiness size={22} aria-hidden="true" />
              <div>
                <h2>Publicaciones</h2>
                <p>Define cargo, sueldo y condiciones. Luego úsala como base para invitaciones.</p>
              </div>
            </div>
            <form className="formGrid" onSubmit={handleJobOffer}>
              <label>
                Cargo
                <input value={jobOffer.title} onChange={(event) => updateJobOffer("title", event.target.value)} required />
              </label>
              <label>
                Área
                <select value={jobOffer.area} onChange={(event) => updateJobOffer("area", event.target.value)}>
                  {jobAreas.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
              </label>
              <label>
                Región
                <select value={jobOffer.region} onChange={(event) => updateJobOffer("region", event.target.value)}>
                  {chileRegions.map((region) => <option key={region.name} value={region.name}>{region.name}</option>)}
                </select>
              </label>
              <label>
                Comuna
                <select value={jobOffer.city} onChange={(event) => updateJobOffer("city", event.target.value)}>
                  {(chileRegions.find((region) => region.name === jobOffer.region) ?? chileRegions[0]).communes.map((commune) => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </label>
              <label>
                N° vacantes
                <input min="1" max="100" type="number" value={jobOffer.vacanciesTotal} onChange={(event) => updateJobOffer("vacanciesTotal", event.target.value)} />
              </label>
              <label>
                Modalidad de trabajo
                <select value={jobOffer.workMode} onChange={(event) => updateJobOffer("workMode", event.target.value)}>
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="onsite">Presencial</option>
                </select>
              </label>
              <label>
                Sueldo mínimo CLP
                <input min="1" type="number" value={jobOffer.salaryMin} onChange={(event) => updateJobOffer("salaryMin", event.target.value)} />
              </label>
              <label>
                Sueldo máximo CLP
                <input min="1" type="number" value={jobOffer.salaryMax} onChange={(event) => updateJobOffer("salaryMax", event.target.value)} />
              </label>
              <label className="wide">
                Descripción del cargo
                <textarea value={jobOffer.description} onChange={(event) => updateJobOffer("description", event.target.value)} />
              </label>
              <label className="wide">
                Requisitos del cargo
                <textarea value={jobOffer.requirements} onChange={(event) => updateJobOffer("requirements", event.target.value)} />
              </label>
              <button className="button primary" type="submit">Guardar publicación</button>
            </form>
            <div className="results">
              {jobOffers.length ? jobOffers.map((offer) => (
                <article className="resultCard" key={offer.jobOfferId}>
                  <div>
                    <span className="profileCode">{offer.visibilityStatus}</span>
                    <h2>{offer.title}</h2>
                    <p>{offer.area} - {offer.region} - {offer.vacanciesAvailable}/{offer.vacanciesTotal} vacantes</p>
                  </div>
                  <button className="button secondary" type="button" onClick={() => setInvite((current) => ({
                    ...current,
                    jobOfferId: offer.jobOfferId,
                    opportunityTitle: offer.title,
                    opportunitySummary: offer.description,
                    salaryMin: String(offer.salaryMin),
                    salaryMax: String(offer.salaryMax),
                    location: `${offer.city}, ${offer.region}`,
                    message: offer.requirements
                  }))}>
                    Usar en invitación
                  </button>
                </article>
              )) : <p className="emptyState">Aún no tienes publicaciones creadas aún.</p>}
            </div>
          </section>
        ) : null}

        {activeView === "talent" ? (
        <>
        <section className="filterPanel">
          <div className="formHeader">
            <Search size={22} aria-hidden="true" />
            <div>
              <h2>Filtros empresariales</h2>
              <p>Filtra perfiles por región, área y renta antes de comparar.</p>
            </div>
          </div>
          <div className="formGrid">
            <label className="wide">
              Búsqueda con IA
              <input value={filters.semanticQuery ?? ""} onChange={(event) => updateFilter("semanticQuery", event.target.value)} placeholder="Ej: quiero un contador con Excel avanzado en Santiago, renta hasta $1.400.000" />
            </label>
            <label>
              Palabra clave
              <input ref={searchInputRef} value={filters.query} onChange={(event) => { updateFilter("query", event.target.value); setDeferredQuery(event.target.value); }} placeholder="Ventas, Excel, logística (Ctrl+K)" style={searchPending ? { opacity: 0.7 } : undefined} />
            </label>
            <label>
              Región
              <select value={filters.region} onChange={(event) => updateFilter("region", event.target.value)}>
                <option value="">Todas</option>
                {chileRegions.map((region) => <option key={region.name} value={region.name}>{region.name}</option>)}
              </select>
            </label>
            <label>
              Área
              <select value={filters.area} onChange={(event) => updateFilter("area", event.target.value)}>
                <option value="">Todas</option>
                {jobAreas.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
            <label>
              Renta máxima disponible
              <input value={filters.salaryMax} onChange={(event) => updateFilter("salaryMax", event.target.value)} placeholder="1.200.000" inputMode="numeric" />
            </label>
            <label>
              Modalidad
              <select value={workerModeFilter} onChange={(e) => setWorkerModeFilter(e.target.value)}>
                <option value="">Cualquiera</option>
                <option value="remote">Remoto</option>
                <option value="hybrid">Híbrido</option>
                <option value="onsite">Presencial</option>
              </select>
            </label>
            <label>
              Disponibilidad
              <select value={workerAvailFilter} onChange={(e) => setWorkerAvailFilter(e.target.value)}>
                <option value="">Cualquiera</option>
                <option value="actively_looking">Buscando activamente</option>
                <option value="listening">Escucha ofertas</option>
              </select>
            </label>
            <label>
              Seniority
              <select value={senioryFilter} onChange={(e) => setSenioryFilter(e.target.value)}>
                <option value="">Cualquiera</option>
                <option value="junior">Junior / Trainee</option>
                <option value="mid">Semi-Senior</option>
                <option value="senior">Senior</option>
                <option value="lead">Gerencia / Lead</option>
              </select>
            </label>
          </div>
          {refreshedAt && (
            <p className="helperText" style={{ fontSize: 11 }}>
              Última búsqueda: {refreshedAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} · {scoredWorkers.length} perfil{scoredWorkers.length !== 1 ? "es" : ""} encontrado{scoredWorkers.length !== 1 ? "s" : ""}
            </p>
          )}
          <div className="searchActions">
            <button className="button secondary" type="button" onClick={handleSemanticSearch} disabled={loadingSemanticSearch}>
              {loadingSemanticSearch ? <><Loader2 size={14} className="spinIcon" aria-hidden="true" /> Analizando...</> : "Buscar con IA"}
            </button>
            <button className="button primary" type="button" onClick={() => fetchWorkers()}>
              <Search size={16} aria-hidden="true" /> Buscar
            </button>
            <button className="button secondary" type="button" onClick={() => {
              setFilters({ query: "", region: "", area: "", salaryMax: "", semanticQuery: "" }); setDeferredQuery("");
              setWorkerModeFilter("");
              setWorkerAvailFilter("");
              setSenioryFilter("");
            }}>
              Limpiar filtros
            </button>
            {favoriteWorkers.length > 0 && (
              <button className="button ghost" type="button" onClick={() => {
                const favWorkers = workers.filter((w) => favoriteWorkers.includes(w.workerId));
                setCompareWorkers(favWorkers.slice(0, 3));
              }} style={{ fontSize: 12 }}>
                ★ Mis favoritos ({favoriteWorkers.length})
              </button>
            )}
          </div>
        </section>

        <div className="results">
          {loadingWorkers ? (
            <p className="emptyState"><Loader2 size={18} className="spinIcon" aria-hidden="true" /> Cargando perfiles...</p>
          ) : scoredWorkers.length ? (
            <>
              {visibleScoredWorkers.map(({ worker, matchScore }) => (
                <article className="resultCard" key={worker.workerId}>
                  <div>
                    <div className="resultCardTop">
                      <span className="profileCode">{worker.profileCode}</span>
                      <span className="matchScoreBadge" style={{ color: matchColor(matchScore) }} title="Compatibilidad estimada">
                        {matchScore}% calce
                      </span>
                    </div>
                    <h2>{worker.headline}</h2>
                    <p>
                      ${worker.expectedSalaryMin.toLocaleString("es-CL")} – ${worker.expectedSalaryMax.toLocaleString("es-CL")} · {worker.workModes.join(", ")}
                    </p>
                    {worker.badges && worker.badges.length > 0 && (
                      <div className="scorePills">
                        {worker.badges.map((badge) => (
                          <span className="scorePill validated" key={badge}>{badge.replace(/_/g, " ")}</span>
                        ))}
                      </div>
                    )}
                    {((worker.assessmentScores?.english ?? 0) > 0 || (worker.assessmentScores?.spanish ?? 0) > 0 || (worker.assessmentScores?.personality ?? 0) > 0) && (
                      <div className="scorePills">
                        {(worker.assessmentScores?.english ?? 0) > 0 && (worker.assessmentScores?.spanish ?? 0) > 0 && (worker.assessmentScores?.personality ?? 0) > 0 && (
                          <span className="scorePill validated">Perfil validado ✓</span>
                        )}
                        {(worker.assessmentScores?.english ?? 0) > 0 && <span className="scorePill lang">Inglés {toEnglishLevel(worker.assessmentScores!.english)}</span>}
                        {(worker.assessmentScores?.spanish ?? 0) > 0 && <span className="scorePill lang">Español {toSpanishLevel(worker.assessmentScores!.spanish)}</span>}
                        {(worker.assessmentScores?.personality ?? 0) > 0 && <span className="scorePill conduct">Perfil {toPersonalityLabel(worker.assessmentScores!.personality)}</span>}
                      </div>
                    )}
                  </div>
                  <button className="button secondary" type="button" onClick={() => {
                    setSelectedWorker(worker);
                    recordProfileImpression(worker.workerId).catch(() => {});
                    trackEvent("worker_selected", { matchScore: matchScore });
                  }}>
                    Seleccionar <Send size={18} aria-hidden="true" />
                  </button>
                  <button className="button secondary" type="button" onClick={() => toggleCompare(worker)}>
                    {compareWorkers.some((item) => item.workerId === worker.workerId) ? "✓ En comparación" : "Comparar"}
                  </button>
                  <button className="button secondary" type="button" onClick={() => handleMatchAdvice(worker)}>
                    Analizar con IA
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => toggleFavorite(worker.workerId)}
                    title={favoriteWorkers.includes(worker.workerId) ? "Quitar de favoritos" : "Guardar en favoritos"}
                    style={{ fontSize: 16 }}
                  >
                    {favoriteWorkers.includes(worker.workerId) ? "★" : "☆"}
                  </button>
                </article>
              ))}
              {lockedCount > 0 && (
                <div className="freemiumGate">
                  <div className="freemiumGateInner">
                    <span className="freemiumLock">🔒</span>
                    <strong>{lockedCount} perfiles adicionales bloqueados</strong>
                    <p>Completa la verificación de empresa para acceder a todos los perfiles activos.</p>
                    <button className="button primary" type="button" onClick={() => setActiveView("dashboard")}>
                      Completar verificación
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="talentEmptyState">
              <p className="talentEmptyTitle">Aún no hay postulantes activos en este filtro.</p>
              <p className="talentEmptyDesc">Los perfiles aparecen cuando los postulantes activan su visibilidad. Mientras tanto, puedes ver cómo lucen:</p>
              <div className="demoProfileGrid">
                {[
                  { code: "PP-8F29A1B2", title: "Especialista en marketing digital", skills: ["Google Ads", "GA4", "Meta Ads"], salary: "$1.200.000 – $1.800.000", mode: "Remoto o híbrido" },
                  { code: "PP-41C73D9E", title: "Supervisor de operaciones", skills: ["Logística", "KPI", "Turnos"], salary: "$1.000.000 – $1.400.000", mode: "Presencial" },
                  { code: "PP-73B1F20C", title: "Asistente administrativo", skills: ["Excel", "Facturación", "ERP"], salary: "$750.000 – $950.000", mode: "Híbrido" }
                ].map((p) => (
                  <article className="demoProfileCard" key={p.code}>
                    <div className="resultCardTop">
                      <span className="profileCode">{p.code}</span>
                      <span className="demoTag">Ejemplo</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.salary} · {p.mode}</p>
                    <div className="scorePills">
                      {p.skills.map((s) => <span className="scorePill" key={s}>{s}</span>)}
                    </div>
                  </article>
                ))}
              </div>
              <p className="talentEmptyHint">¿Conoces una empresa que necesite talento? <a href="mailto:contacto@perfil-primero.cl">Cuéntanos</a> y la incorporamos.</p>
            </div>
          )}
        </div>

        {compareWorkers.length ? (
          <section className="comparisonTable">
            <div className="formHeader">
              <CheckCircle2 size={22} aria-hidden="true" />
              <div>
                <h2>Comparación de postulantes</h2>
                <p>Máximo tres perfiles para decidir sin ruido.</p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--surface-alt, #f9fafb)" }}>
                    <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid var(--border, #e5e7eb)", width: 140 }}>Atributo</th>
                    {compareWorkers.map((w) => (
                      <th key={w.workerId} style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid var(--border, #e5e7eb)" }}>
                        <span className="profileCode" style={{ display: "block", marginBottom: 2 }}>{w.profileCode}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{w.experienceLevel}</span>
                        <button type="button" className="button ghost" style={{ fontSize: 10, marginTop: 4 }} onClick={() => toggleCompare(w)}>✕ Quitar</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Titular", fn: (w: WorkerPublicProfile) => w.headline },
                    { label: "Región", fn: (w: WorkerPublicProfile) => `${w.region} – ${w.city}` },
                    { label: "Sueldo pretendido", fn: (w: WorkerPublicProfile) => `$${w.expectedSalaryMin.toLocaleString("es-CL")} – $${w.expectedSalaryMax.toLocaleString("es-CL")}` },
                    { label: "Disponibilidad", fn: (w: WorkerPublicProfile) => w.availability === "actively_looking" ? "Buscando activamente" : w.availability === "listening" ? "Abierto a propuestas" : "No disponible" },
                    { label: "Inglés", fn: (w: WorkerPublicProfile) => (w.assessmentScores?.english ?? 0) > 0 ? toEnglishLevel(w.assessmentScores!.english) : "—" },
                    { label: "Español", fn: (w: WorkerPublicProfile) => (w.assessmentScores?.spanish ?? 0) > 0 ? toSpanishLevel(w.assessmentScores!.spanish) : "—" },
                    { label: "Perfil conducta", fn: (w: WorkerPublicProfile) => (w.assessmentScores?.personality ?? 0) > 0 ? toPersonalityLabel(w.assessmentScores!.personality) : "—" },
                    { label: "Modo de trabajo", fn: (w: WorkerPublicProfile) => (w.workModes ?? []).includes("remote") ? "Remoto" : (w.workModes ?? []).includes("hybrid") ? "Híbrido" : "Presencial" },
                  ].map((row) => (
                    <tr key={row.label} style={{ borderBottom: "1px solid var(--border, #e5e7eb)" }}>
                      <td style={{ padding: "7px 12px", fontWeight: 600, color: "var(--muted)" }}>{row.label}</td>
                      {compareWorkers.map((w) => (
                        <td key={w.workerId} style={{ padding: "7px 12px", textAlign: "center" }}>{row.fn(w)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {hasMoreWorkers && !loadingWorkers && (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <button className="button secondary" type="button" onClick={loadMoreWorkers} disabled={loadingMore}>
              {loadingMore ? <><Loader2 size={14} className="spinIcon" aria-hidden="true" /> Cargando...</> : "Cargar más perfiles"}
            </button>
          </div>
        )}
        </>
        ) : null}

        {activeView === "interview" ? (
          <section className="comparisonTable">
            <div className="formHeader">
              <MessageSquare size={22} aria-hidden="true" />
              <div>
                <h2>Procesos activos</h2>
                <p>Selecciona una invitación para ver entrevista, pagos, timeline y mensajería.</p>
              </div>
            </div>
            {invitations.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {["all", "sent", "accepted", "in_process", "offer_sent", "hired", "closed"].map((st) => {
                  const count = st === "all" ? invitations.length : invitations.filter((i) => i.status === st).length;
                  if (count === 0 && st !== "all") return null;
                  return (
                    <button
                      key={st}
                      type="button"
                      className={`button ${invitationStatusFilter === st ? "primary" : "secondary"}`}
                      style={{ fontSize: 12, padding: "3px 10px" }}
                      onClick={() => setInvitationStatusFilter(st)}
                    >
                      {st === "all" ? "Todas" : st} ({count})
                    </button>
                  );
                })}
              </div>
            )}
            <div className="results compactResults">
              {(() => {
                const filtered = invitationStatusFilter === "all" ? invitations : invitations.filter((i) => i.status === invitationStatusFilter);
                const slaLight = (inv: Invitation): { color: string; label: string } => {
                  const SLA_DAYS: Record<string, number> = { sent: 3, accepted: 5, in_process: 14, offer_sent: 3 };
                  const slaMax = SLA_DAYS[inv.status] ?? 30;
                  const updatedAt = (inv as unknown as { updatedAt?: { seconds: number } }).updatedAt?.seconds;
                  if (!updatedAt) return { color: "#9ca3af", label: "Sin fecha" };
                  const elapsed = (Date.now() / 1000 - updatedAt) / 86400;
                  if (elapsed < slaMax * 0.6) return { color: "#16a34a", label: "En plazo" };
                  if (elapsed < slaMax) return { color: "#f59e0b", label: "Por vencer" };
                  return { color: "#dc2626", label: "Vencido" };
                };
                return filtered.length ? filtered.map((invitation) => {
                  const sla = slaLight(invitation);
                  return (
                  <article className="resultCard" key={invitation.invitationId}>
                    <div>
                      <div className="resultCardTop">
                        <span className="profileCode">{invitation.status}</span>
                        <span title={`SLA: ${sla.label}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: sla.color, fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: sla.color, display: "inline-block" }} />
                          {sla.label}
                        </span>
                        {invitation.decisionDeadline && (() => {
                          const days = Math.ceil((new Date(invitation.decisionDeadline as string).getTime() - Date.now()) / 86400000);
                          return days > 0 && days <= 3 ? <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>⏱ {days}d</span> : null;
                        })()}
                      </div>
                      <h2>{invitation.opportunityTitle}</h2>
                      <p>{invitation.location} - ${invitation.salaryMin.toLocaleString("es-CL")} a ${invitation.salaryMax.toLocaleString("es-CL")}</p>
                    </div>
                    <button className="button secondary" type="button" onClick={() => selectInvitation(invitation)}>
                      Abrir proceso
                    </button>
                  </article>
                  );
                }) : <p className="emptyState">Sin invitaciones en este estado.</p>;
              })()}
            </div>
          </section>
        ) : null}

        {activeView === "interview" && selectedWorker ? (
          <section className="candidateDetail">
            <div className="formHeader">
              <Filter size={22} aria-hidden="true" />
            <div>
              <h2>Detalle del candidato</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ margin: 0 }}>{selectedWorker.profileCode} - {selectedWorker.headline}</p>
                  {activeInvitation && (
                    <button className="button ghost" type="button" onClick={copyInvId} style={{ fontSize: 11, padding: "2px 8px" }}>
                      {copiedInvId ? "✓ ID copiado" : `ID: ${activeInvitation.invitationId.slice(0, 8)}…`}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Etiqueta interna de calificación */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Etiqueta interna:</span>
              {(["hot", "warm", "cold"] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  className={workerLabels[selectedWorker.workerId] === lbl ? "button primary" : "button ghost"}
                  style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: workerLabels[selectedWorker.workerId] === lbl ? (lbl === "hot" ? "#dc2626" : lbl === "warm" ? "#f59e0b" : "#64748b") : undefined, borderColor: "transparent" }}
                  onClick={() => saveWorkerLabel(selectedWorker.workerId, workerLabels[selectedWorker.workerId] === lbl ? "" : lbl)}
                >
                  {lbl === "hot" ? "🔥 Prioritario" : lbl === "warm" ? "⭐ Interesante" : "❄️ Frío"}
                </button>
              ))}
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>Mi puntuación:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: (workerStars[selectedWorker.workerId] ?? 0) >= star ? "#f59e0b" : "#d1d5db", padding: "0 1px" }}
                  aria-label={`${star} estrellas`}
                  onClick={() => saveWorkerStar(selectedWorker.workerId, star)}
                >★</button>
              ))}
            </div>
            <p>{selectedWorker.summary}</p>
            {selectedWorker.formattedCv ? (
              <div className="aiResponse">
                <strong>CV Perfil Primero</strong>
                <p>{selectedWorker.formattedCv}</p>
              </div>
            ) : null}
            <div className="chips">
              {selectedWorker.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
            <div className="pipeline">
              {pipelineStatuses.map((item) => (
                <button
                  className={activeInvitation?.status === item.key ? "pipelineStep active" : "pipelineStep"}
                  key={item.key}
                  type="button"
                  onClick={() => handleStatus(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {activeInvitation && !["hired", "closed"].includes(activeInvitation.status) && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="button primary"
                  style={{ background: "#16a34a", borderColor: "#16a34a" }}
                  onClick={() => { if (confirm("¿Confirmar contratación? Esto marcará el proceso como cerrado exitosamente.")) handleStatus("hired"); }}
                >
                  ✓ Marcar como contratado
                </button>
                <button
                  type="button"
                  className="button ghost"
                  style={{ color: "#dc2626" }}
                  onClick={() => { if (confirm("¿Cerrar este proceso? No podrás reactivarlo desde aquí.")) handleStatus("closed"); }}
                >
                  Cerrar proceso
                </button>
              </div>
            )}
            {activeInvitation?.status === "hired" && (
              <div style={{ padding: "8px 14px", background: "#dcfce7", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#16a34a", marginTop: 8 }}>
                ✓ Proceso cerrado exitosamente — candidato contratado
              </div>
            )}
            <InterviewRulesCard
              accepted={Boolean(activeInvitation?.interviewRulesAccepted?.company)}
              otherAccepted={Boolean(activeInvitation?.interviewRulesAccepted?.worker)}
              role="company"
              onAccept={handleAcceptInterviewRules}
            />
            <div className="formGrid">
              <label>
                Fecha y hora de entrevista
                <input type="datetime-local" value={interviewStartsAt} onChange={(event) => setInterviewStartsAt(event.target.value)} />
              </label>
              <button className="button secondary" type="button" onClick={handleScheduleInterview}>
                Programar para Google Calendar
              </button>
            </div>
            {calendarUrl ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a className="button secondary" href={calendarUrl} target="_blank" rel="noreferrer">Abrir Google Calendar</a>
                <button className="button ghost" type="button" onClick={copyCalendarUrl}>
                  {copiedCalendar ? "✓ Copiado" : "Copiar enlace"}
                </button>
              </div>
            ) : null}
            {/* Notas internas del equipo de RRHH */}
            <label style={{ display: "block", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Notas internas (solo visibles para tu equipo)</span>
              <textarea
                value={workerNotes[selectedWorker.workerId] ?? ""}
                onChange={(e) => saveWorkerNote(selectedWorker.workerId, e.target.value)}
                placeholder="Ej: Candidato fuerte en Excel, evaluar para el área de finanzas. Disponible desde enero."
                rows={3}
                style={{ width: "100%", fontSize: 13 }}
              />
            </label>
            {/* Comentarios del proceso (por invitación, distinto de notas del candidato) */}
            {activeInvitation && (
              <label style={{ display: "block", marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Comentarios del proceso (por esta invitación)</span>
                <textarea
                  value={invitationComments[activeInvitation.invitationId] ?? ""}
                  onChange={(e) => saveInvitationComment(activeInvitation.invitationId, e.target.value)}
                  placeholder="Ej: Primera entrevista el lunes — candidato solicitó inicio en marzo. Revisar condiciones de contrato."
                  rows={3}
                  style={{ width: "100%", fontSize: 13 }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>Guardado localmente. Vinculado al ID de esta invitación.</span>
              </label>
            )}
            <div className="formGrid">
              <label>
                Evaluación del postulante
                <select value={review.score} onChange={(event) => setReview((current) => ({ ...current, score: event.target.value }))}>
                  <option value="5">5 - Excelente</option>
                  <option value="4">4 - Bueno</option>
                  <option value="3">3 - Aceptable</option>
                  <option value="2">2 - Débil</option>
                  <option value="1">1 - No recomendable</option>
                </select>
              </label>
              <label>
                Se presentó a entrevista presencial
                <select
                  value={review.attendedInPerson ? "yes" : "no"}
                  onChange={(event) => setReview((current) => ({ ...current, attendedInPerson: event.target.value === "yes" }))}
                >
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="wide">
                Comentario interno
                <textarea value={review.comment} onChange={(event) => setReview((current) => ({ ...current, comment: event.target.value }))} />
              </label>
              <button className="button secondary" type="button" onClick={handleReviewWorker}>Evaluar postulante</button>
            </div>
            <div className="contactUnlockPanel">
              <button className="button secondary" type="button" onClick={handleLoadUnlockedContact}>
                Ver contacto pagado
              </button>
              {unlockedContact ? (
                <div>
                  <strong>{unlockedContact.legalName || unlockedContact.preferredName || "Postulante"}</strong>
                  <span>{unlockedContact.email || "Correo no informado"}</span>
                  <span>{unlockedContact.phone || "Teléfono no informado"}</span>
                  {unlockedContact.portfolioLinks.map((link) => (
                    <a href={link} key={link} target="_blank" rel="noreferrer">{link}</a>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : activeView === "interview" ? (
          <p className="emptyState">Selecciona un candidato en Buscar talento para abrir entrevista.</p>
        ) : null}

        {activeView === "talent" && matchAdvice ? (
          <section className="aiResponse matchAdvice">
            <strong>Compatibilidad IA: {matchAdvice.score}%</strong>
            <small>
              La IA ayuda a decidir, pero depende de una vacante bien escrita y no reemplaza criterio humano.
            </small>
            <p>{matchAdvice.verdict}</p>
            <div className="twoColumns">
              <div>
                <h3>Razones</h3>
                {matchAdvice.reasons.map((reason) => <span key={reason}>{reason}</span>)}
              </div>
              <div>
                <h3>Riesgos</h3>
                {matchAdvice.risks.map((risk) => <span key={risk}>{risk}</span>)}
              </div>
            </div>
          </section>
        ) : null}

        {activeView === "talent" ? (
        <form className="formSurface" onSubmit={handleInvitation}>
          <div className="formHeader">
            <Send size={22} aria-hidden="true" />
            <div>
              <h2>Invitación laboral</h2>
              <p>{selectedWorker ? `Perfil seleccionado: ${selectedWorker.profileCode}` : "Selecciona un perfil anónimo antes de crear una invitación."}</p>
            </div>
          </div>
          <div className="formGrid">
            <label className="wide">
              Plantilla de invitación
              <select value={invite.templateId} onChange={(event) => applyTemplate(event.target.value)}>
                <option value="manual">Manual / escribir desde cero</option>
                {invitationTemplates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </label>
            <label>
              Cargo
              <input value={invite.opportunityTitle} onChange={(event) => updateInvite("opportunityTitle", event.target.value)} />
            </label>
            <label>
              Ubicación
              <input value={invite.location} onChange={(event) => updateInvite("location", event.target.value)} />
            </label>
            <label>
              Sueldo mínimo CLP
              <input value={invite.salaryMin} onChange={(event) => updateInvite("salaryMin", event.target.value)} />
            </label>
            <label>
              Sueldo máximo CLP
              <input value={invite.salaryMax} onChange={(event) => updateInvite("salaryMax", event.target.value)} />
            </label>
            <label>
              Modalidad de trabajo
              <select value={invite.workMode} onChange={(event) => updateInvite("workMode", event.target.value)}>
                <option value="hybrid">Híbrido</option>
                <option value="remote">Remoto</option>
                <option value="onsite">Presencial</option>
              </select>
            </label>
            <label>
              Tipo de contrato
              <select value={invite.contractType} onChange={(event) => updateInvite("contractType", event.target.value)}>
                <option value="full_time">Tiempo completo</option>
                <option value="part_time">Part-time</option>
                <option value="contractor">Contratista / Freelance</option>
                <option value="temporary">Temporal</option>
              </select>
            </label>
            <label className="wide">
              Resumen
              <input value={invite.opportunitySummary} onChange={(event) => updateInvite("opportunitySummary", event.target.value)} />
            </label>
            <label className="wide">
              Mensaje
              <textarea value={invite.message} onChange={(event) => updateInvite("message", event.target.value)} />
            </label>
            <label>
              Fecha límite de decisión
              <input type="date" value={invite.decisionDeadline} onChange={(event) => updateInvite("decisionDeadline", event.target.value)} min={new Date().toISOString().split("T")[0]} />
            </label>
          </div>
          <div className="actions">
            <button className="button primary" disabled={companyProfile?.verificationStatus !== "verified"} type="submit">
              Enviar invitación
            </button>
            <button className="button secondary" type="button" onClick={handleUnlock}>
              <MercadoPagoIcon />
              Pagar $9.990 CLP
            </button>
          </div>
          <label>
            Cupón de descuento
            <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="BIENVENIDA50" />
          </label>
        </form>
        ) : null}

        {activeView === "interview" ? (
        <section className="formSurface">
          <div className="formHeader">
            <MessageSquare size={22} aria-hidden="true" />
            <div>
              <h2>Mensajería interna</h2>
              <p>Conserva la conversación y la trazabilidad dentro de la plataforma.</p>
            </div>
          </div>
          <div className="messageList">
            {messages.length ? messages.map((message) => (
              <div className={`messageBubble ${message.senderRole}`} key={message.messageId}>
                <strong>{message.senderRole === "company" ? "Empresa" : message.senderRole === "worker" ? "Postulante" : "Sistema"}</strong>
                <p>{message.body}</p>
                {message.senderRole === "company" && uid && message.senderId === uid && (
                  <span className="messageReadStatus" title={message.readAt ? "Visto" : "Enviado"}>
                    {message.readAt ? "✓✓" : "✓"}
                  </span>
                )}
              </div>
            )) : <p className="emptyState">Abre o crea una invitación para iniciar conversación.</p>}
            <div ref={messagesEndRef} />
          </div>
          {!interviewReady ? (
            <p className="paymentLockNotice">La entrevista se habilita cuando empresa y postulante aceptan las reglas.</p>
          ) : null}
          <div className="messageComposer">
            <textarea
              aria-label="Escribe tu mensaje"
              placeholder="Escribe tu mensaje aquí... (Ctrl+Enter para enviar)"
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && interviewReady && messageBody.trim()) {
                  event.preventDefault();
                  handleMessage();
                }
              }}
            />
            <button className="button primary" disabled={!interviewReady || !messageBody.trim()} type="button" onClick={handleMessage}>Enviar mensaje</button>
          </div>
        </section>
        ) : null}

        {activeView === "kanban" ? (
          <section className="formSurface" style={{ overflowX: "auto" }}>
            <div className="formHeader">
              <BriefcaseBusiness size={22} aria-hidden="true" />
              <div>
                <h2>Pipeline de contratación</h2>
                <p>Vista por etapas de todos tus procesos activos. Usa los botones para mover candidatos.</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${pipelineStatuses.length}, minmax(180px, 1fr))`, gap: 12, minWidth: 900 }}>
              {pipelineStatuses.map((stage) => {
                const stageInvs = invitations.filter((i) => i.status === stage.key);
                return (
                  <div key={stage.key} style={{ background: "var(--surface-alt, #f9fafb)", borderRadius: 10, padding: 12, minHeight: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <strong style={{ fontSize: 13 }}>{stage.label}</strong>
                      <span style={{ fontSize: 11, background: "var(--border, #e5e7eb)", borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>{stageInvs.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {stageInvs.map((inv) => {
                        const stageIdx = pipelineStatuses.findIndex((s) => s.key === stage.key);
                        const nextStage = pipelineStatuses[stageIdx + 1];
                        const prevStage = pipelineStatuses[stageIdx - 1];
                        return (
                          <div key={inv.invitationId} style={{ background: "var(--surface, #fff)", borderRadius: 8, padding: "8px 10px", border: "1px solid var(--border, #e5e7eb)", fontSize: 12 }}>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{inv.opportunityTitle}</div>
                            <div style={{ color: "var(--muted)", marginBottom: 6 }}>${inv.salaryMin.toLocaleString("es-CL")} · {inv.location || "—"}</div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {prevStage && (
                                <button type="button" className="button ghost" style={{ fontSize: 10, padding: "2px 6px" }}
                                  onClick={() => updateInvitationStatus(inv.invitationId, prevStage.key).catch(() => {})}>
                                  ← {prevStage.label}
                                </button>
                              )}
                              {nextStage && (
                                <button type="button" className="button secondary" style={{ fontSize: 10, padding: "2px 6px" }}
                                  onClick={() => updateInvitationStatus(inv.invitationId, nextStage.key).catch(() => {})}>
                                  {nextStage.label} →
                                </button>
                              )}
                              <button type="button" className="button ghost" style={{ fontSize: 10, padding: "2px 6px", color: "#dc2626" }}
                                onClick={() => updateInvitationStatus(inv.invitationId, "closed").catch(() => {})}>
                                Cerrar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {stageInvs.length === 0 && <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 20 }}>Sin candidatos</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeView === "billing" ? (
          <>
          {/* ── Alerta de presupuesto ── */}
          {(() => {
            const totalSpent = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
            const overBudget = budgetAlert > 0 && totalSpent >= budgetAlert;
            return (
              <section className="formSurface" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flex: 1, minWidth: 220 }}>
                    <span style={{ whiteSpace: "nowrap" }}>Alerta presupuesto (CLP):</span>
                    <input
                      type="number"
                      value={budgetAlert || ""}
                      onChange={(e) => saveBudgetAlert(Number(e.target.value))}
                      placeholder="Ej: 50000"
                      inputMode="numeric"
                      style={{ width: 130, fontSize: 13 }}
                    />
                  </label>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Gastado: <strong style={{ color: overBudget ? "#dc2626" : "inherit" }}>${totalSpent.toLocaleString("es-CL")}</strong></span>
                  {budgetAlert > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: overBudget ? "#fee2e2" : "#dcfce7", color: overBudget ? "#dc2626" : "#16a34a" }}>
                      {overBudget ? "⚠ Presupuesto superado" : `${Math.round((totalSpent / budgetAlert) * 100)}% utilizado`}
                    </span>
                  )}
                </div>
              </section>
            );
          })()}

          {/* ── Planes empresa ── */}
          <section className="formSurface">
            <div className="formHeader">
              <CreditCard size={22} aria-hidden="true" />
              <div>
                <h2>Planes empresa</h2>
                <p>Elige el plan que mejor se adapte a tu ritmo de contratación</p>
              </div>
            </div>

            {/* Plan Mensual */}
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <strong style={{ fontSize: 15 }}>Plan Mensual</strong>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)" }}>5 contactos · $9.990 CLP/mes</p>
                </div>
                {monthlyPlan?.active && monthlyPlan.renewsAt && monthlyPlan.renewsAt.seconds * 1000 > Date.now() && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)", background: "rgba(0,150,80,0.1)", padding: "2px 8px", borderRadius: 20 }}>ACTIVO</span>
                )}
              </div>
              {monthlyPlan?.active && monthlyPlan.renewsAt && monthlyPlan.renewsAt.seconds * 1000 > Date.now() ? (
                <div className="monthlyPlanStats">
                  <article>
                    <span className="smallLabel">Contactos disponibles</span>
                    <strong>{monthlyPlan.contactCreditsTotal - monthlyPlan.contactCreditsUsed} / {monthlyPlan.contactCreditsTotal}</strong>
                  </article>
                  <article>
                    <span className="smallLabel">Vence</span>
                    <strong>{new Date(monthlyPlan.renewsAt.seconds * 1000).toLocaleDateString("es-CL")}</strong>
                  </article>
                </div>
              ) : (
                <button
                  className="button secondary"
                  type="button"
                  style={{ marginTop: 4 }}
                  onClick={async () => {
                    setStatus("Abriendo Mercado Pago...");
                    try {
                      const { url } = await createCompanyMonthlyCheckout();
                      window.location.href = url;
                    } catch (error) {
                      setStatus(error instanceof Error ? error.message : "No se pudo iniciar el pago.");
                    }
                  }}
                >
                  Contratar plan mensual — $9.990 CLP
                </button>
              )}
            </div>

            {/* Plan Ilimitado */}
            <div style={{ border: "1.5px solid #0094d4", borderRadius: 10, padding: "1rem 1.25rem", background: "rgba(0,148,212,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <strong style={{ fontSize: 15 }}>Plan Ilimitado ✦</strong>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--muted)" }}>Contactos ilimitados · $29.990 CLP/mes</p>
                </div>
                {unlimitedPlan?.active && unlimitedPlan.renewsAt && unlimitedPlan.renewsAt.seconds * 1000 > Date.now() ? (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#0094d4", background: "rgba(0,148,212,0.12)", padding: "2px 8px", borderRadius: 20 }}>ACTIVO</span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#e28c00", background: "rgba(226,140,0,0.1)", padding: "2px 8px", borderRadius: 20 }}>RECOMENDADO</span>
                )}
              </div>
              {unlimitedPlan?.active && unlimitedPlan.renewsAt && unlimitedPlan.renewsAt.seconds * 1000 > Date.now() ? (
                <div className="monthlyPlanStats">
                  <article>
                    <span className="smallLabel">Contactos</span>
                    <strong>Ilimitados</strong>
                  </article>
                  <article>
                    <span className="smallLabel">Vence</span>
                    <strong>{new Date(unlimitedPlan.renewsAt.seconds * 1000).toLocaleDateString("es-CL")}</strong>
                  </article>
                </div>
              ) : (
                <>
                  <ul className="pricingFeatures" style={{ marginBottom: 12, fontSize: 13 }}>
                    <li><CheckCircle2 size={14} aria-hidden="true" /> Desbloquea contactos sin límite durante 30 días</li>
                    <li><CheckCircle2 size={14} aria-hidden="true" /> Sin pago extra por cada candidato aceptado</li>
                    <li><CheckCircle2 size={14} aria-hidden="true" /> Ideal si contratas 4+ personas al mes</li>
                  </ul>
                  <button
                    className="button primary"
                    type="button"
                    onClick={async () => {
                      setStatus("Abriendo Mercado Pago...");
                      try {
                        const { url } = await createCompanyUnlimitedCheckout();
                        window.location.href = url;
                      } catch (error) {
                        setStatus(error instanceof Error ? error.message : "No se pudo iniciar el pago.");
                      }
                    }}
                  >
                    Contratar plan ilimitado — $29.990 CLP
                  </button>
                  <p className="helperText" style={{ marginTop: 6 }}>Equivale a 3 contactos individuales. Desde el 4.° en adelante es gratis.</p>
                </>
              )}
            </div>
          </section>

          {/* ── Alertas de candidatos ── */}
          <section className="formSurface">
            <div className="formHeader">
              <Bell size={22} aria-hidden="true" />
              <div>
                <h2>Alertas de candidatos</h2>
                <p>Recibe un email diario cuando aparezcan perfiles que coincidan con tus criterios.</p>
              </div>
            </div>
            <div className="formGrid">
              <label className="wide" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={alertPrefs.enabled}
                  onChange={(e) => setAlertPrefs((p) => ({ ...p, enabled: e.target.checked }))}
                  style={{ width: 16, height: 16, flexShrink: 0 }}
                />
                Activar alertas diarias por email
              </label>
              <label>
                Áreas de interés (separadas por coma)
                <input
                  value={alertPrefs.areas.join(", ")}
                  onChange={(e) => setAlertPrefs((p) => ({ ...p, areas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  placeholder="Tecnología, Ventas, Administración"
                />
              </label>
              <label>
                Renta máxima esperada (CLP)
                <input
                  value={alertPrefs.salaryMax || ""}
                  onChange={(e) => setAlertPrefs((p) => ({ ...p, salaryMax: Number(e.target.value) || 0 }))}
                  inputMode="numeric"
                  placeholder="2000000"
                />
              </label>
              <label>
                Modalidad
                <select
                  value={alertPrefs.workModes[0] ?? ""}
                  onChange={(e) => setAlertPrefs((p) => ({ ...p, workModes: e.target.value ? [e.target.value] : [] }))}
                >
                  <option value="">Cualquiera</option>
                  <option value="onsite">Presencial</option>
                  <option value="hybrid">Híbrida</option>
                  <option value="remote">Remota</option>
                </select>
              </label>
            </div>
            <div className="actions">
              <button
                className="button primary"
                type="button"
                disabled={savingAlerts}
                onClick={async () => {
                  setSavingAlerts(true);
                  try {
                    await saveCompanyAlertPreferences(alertPrefs);
                    setStatus("Preferencias de alerta guardadas.");
                  } catch (error) {
                    setStatus(error instanceof Error ? error.message : "No se pudo guardar.");
                  } finally {
                    setSavingAlerts(false);
                  }
                }}
              >
                {savingAlerts ? "Guardando..." : "Guardar preferencias"}
              </button>
            </div>
          </section>

          {/* ── Comprobantes ── */}
          <section className="comparisonTable">
            <div className="formHeader">
              <BadgeDollarSign size={22} aria-hidden="true" />
              <div>
                <h2>Comprobantes y pagos</h2>
                <p>Estados de cobro generados por cierre o intercambio de contacto.</p>
              </div>
            </div>
            {payments.length > 0 && (
              <div className="dashboardGrid" style={{ marginBottom: 12 }}>
                <article>
                  <span className="smallLabel">Total invertido</span>
                  <strong>${payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount, 0).toLocaleString("es-CL")}</strong>
                  <p>CLP en contactos y planes</p>
                </article>
                <article>
                  <span className="smallLabel">Pagos confirmados</span>
                  <strong>{payments.filter((p) => p.status === "paid").length}</strong>
                  <p>de {payments.length} transacciones</p>
                </article>
                <article>
                  <span className="smallLabel">Costo por contratado</span>
                  <strong>
                    {invitations.filter((i) => i.status === "hired").length > 0
                      ? `$${Math.round(payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount, 0) / invitations.filter((i) => i.status === "hired").length).toLocaleString("es-CL")}`
                      : "—"}
                  </strong>
                  <p>promedio por contratación</p>
                </article>
              </div>
            )}
            {payments.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <button className="button ghost" type="button" onClick={exportPaymentsCsv} style={{ fontSize: 12 }}>
                  ⬇ Exportar CSV
                </button>
              </div>
            )}
            <div className="paymentList">
              {payments.length ? payments.map((payment) => (
                <article key={payment.paymentId}>
                  <strong>${payment.amount.toLocaleString("es-CL")}</strong>
                  <span>{payment.paymentType}</span>
                  <span className={payment.status === "paid" ? "statusBadgePaid" : ""}>{payment.status === "paid" ? "✓ Pagado" : payment.status}</span>
                </article>
              )) : <p className="emptyState">Aún no hay pagos registrados.</p>}
            </div>
          </section>
          <CompanyInvoicesPanel />
          </>
        ) : null}

        {activeView === "metrics" ? (() => {
          const sent = invitations.length;
          const accepted = invitations.filter((i) => ["accepted","in_process","offer_sent","hired"].includes(i.status)).length;
          const hired = invitations.filter((i) => i.status === "hired").length;
          const rejected = invitations.filter((i) => i.status === "rejected" || i.status === "closed").length;
          const acceptRate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
          const hireRate = sent > 0 ? Math.round((hired / sent) * 100) : 0;
          const totalSpent = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
          const costPerHire = hired > 0 ? Math.round(totalSpent / hired) : 0;
          const avgResponseMs = invitations
            .filter((i) => (i as unknown as Record<string,unknown>).firstResponseAt && (i as unknown as Record<string,unknown>).createdAt)
            .map((i) => {
              const d = i as unknown as Record<string,{seconds:number}>;
              const res = d.firstResponseAt?.seconds;
              const cre = d.createdAt?.seconds;
              return res && cre ? (res - cre) / 3600 : 0;
            });
          const avgResponseH = avgResponseMs.length > 0 ? Math.round(avgResponseMs.reduce((a,b) => a+b, 0) / avgResponseMs.length) : null;

          return (
            <section className="stack">
              <div className="formHeader" style={{ marginBottom: 0 }}>
                <BarChart3Icon size={22} aria-hidden="true" />
                <div>
                  <h2>Métricas de reclutamiento</h2>
                  <p>Resumen de tu actividad como empresa en Perfil Primero.</p>
                </div>
              </div>
              <div className="dashboardGrid">
                <article>
                  <span className="smallLabel">Invitaciones enviadas</span>
                  <strong>{sent}</strong>
                  <p>Total acumulado</p>
                </article>
                <article>
                  <span className="smallLabel">Tasa de aceptación</span>
                  <strong>{acceptRate}%</strong>
                  <p>{accepted} de {sent} invitaciones aceptadas</p>
                </article>
                <article>
                  <span className="smallLabel">Tasa de contratación</span>
                  <strong>{hireRate}%</strong>
                  <p>{hired} contratado{hired !== 1 ? "s" : ""}</p>
                </article>
                <article>
                  <span className="smallLabel">Rechazos / cierres</span>
                  <strong>{rejected}</strong>
                  <p>Sin avanzar en el proceso</p>
                </article>
                <article>
                  <span className="smallLabel">Gasto total</span>
                  <strong>${totalSpent.toLocaleString("es-CL")}</strong>
                  <p>CLP pagados en la plataforma</p>
                </article>
                <article>
                  <span className="smallLabel">Costo por contratado</span>
                  <strong>{costPerHire > 0 ? `$${costPerHire.toLocaleString("es-CL")}` : "—"}</strong>
                  <p>Promedio por contratación</p>
                </article>
                <article>
                  <span className="smallLabel">Tiempo promedio de respuesta</span>
                  <strong>{avgResponseH !== null ? `${avgResponseH}h` : "—"}</strong>
                  <p>Desde invitación hasta primera respuesta</p>
                </article>
                <article>
                  <span className="smallLabel">Procesos activos</span>
                  <strong>{invitations.filter((i) => !["closed","expired","rejected","hired"].includes(i.status)).length}</strong>
                  <p>Candidatos en curso</p>
                </article>
              </div>

              {sent > 0 && (
                <section className="formSurface" style={{ marginTop: 0 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 12 }}>Distribución por estado</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Enviada", key: "sent", color: "var(--accent)" },
                      { label: "Aceptada", key: "accepted", color: "#3aaee0" },
                      { label: "Entrevista", key: "in_process", color: "#7c3aed" },
                      { label: "Oferta enviada", key: "offer_sent", color: "#f59e0b" },
                      { label: "Contratado", key: "hired", color: "#16a34a" },
                      { label: "Rechazado", key: "rejected", color: "#dc2626" },
                    ].map(({ label, key, color }) => {
                      const count = invitations.filter((i) => i.status === key).length;
                      const pct = Math.round((count / sent) * 100);
                      return (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ width: 110, fontSize: 12, color: "var(--muted)" }}>{label}</span>
                          <div style={{ flex: 1, background: "var(--line)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: 12, width: 40, textAlign: "right" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </section>
          );
        })() : null}

        {activeView === "benchmark" ? (
          <section className="stack">
            <div className="formHeader">
              <BadgeDollarSign size={22} aria-hidden="true" />
              <div>
                <h2>Benchmark salarial</h2>
                <p>Compara el rango de mercado para el cargo que buscas cubrir.</p>
              </div>
            </div>
            <SalaryBenchmarkWidget />
          </section>
        ) : null}
      </div>

      <aside className="summaryCard">
        <section className="sidePanel">
          <span className="smallLabel">Centro de contratación</span>
          <h3 style={{ margin: "6px 0 4px", fontSize: "14px", lineHeight: 1.4 }}>
            Busca, compara y avanza con postulantes verificados.
          </h3>
          <p className="helperText">El contacto se libera solo al cerrar el trato.</p>
        </section>

        <section className="sidePanel">
          <p className="sidePanelHeader" style={{ marginBottom: 10 }}><strong>Estado actual</strong></p>
          <article className="commandKpi commandPrimary" style={{ marginBottom: 8 }}>
            <span>Verificación</span>
            <strong>{verifiedCompany ? "Aprobada" : "Pendiente"}</strong>
            <small>{verifiedCompany ? "Puedes operar" : "Completa datos"}</small>
          </article>
          <article className="commandKpi" style={{ marginBottom: 8 }}>
            <span>Procesos activos</span>
            <strong>{openProcesses}</strong>
            <small>Invitaciones en seguimiento</small>
          </article>
          <article className="commandKpi">
            <span>Cierres pagados</span>
            <strong>{paidClosures}</strong>
            <small>Contactos liberados</small>
          </article>
        </section>

        <section className={`verificationBanner ${companyProfile?.verificationStatus ?? "draft"}`} style={{ margin: "0 0 0" }}>
          <strong>{verificationLabel(companyProfile?.verificationStatus)}</strong>
          <span>{verificationText(companyProfile?.verificationStatus)}</span>
        </section>
      </aside>
    </section>
  );
}

function verificationLabel(status?: string) {
  if (status === "verified") return "Empresa verificada";
  if (status === "pending") return "Revisión pendiente";
  if (status === "rejected") return "Revisión rechazada";
  if (status === "suspended") return "Empresa suspendida";
  return "Verificación requerida";
}

function verificationText(status?: string) {
  if (status === "verified") return "Puedes enviar invitaciones con sueldo y condiciones claras.";
  if (status === "pending") return "El equipo interno revisara identidad, RUT y presencia web.";
  if (status === "rejected") return "Corrige los datos o agrega información verificable.";
  if (status === "suspended") return "El acceso a contactos está bloqueado por seguridad.";
  return "Guarda la empresa para iniciar la revisión interna.";
}

export function InterviewRulesCard({
  accepted,
  otherAccepted,
  role,
  onAccept
}: {
  accepted: boolean;
  otherAccepted: boolean;
  role: "company" | "worker";
  onAccept: () => void;
}) {
  return (
    <section className="interviewRules">
      <div>
        <span className="smallLabel">Reglas de entrevista web</span>
        <h3>Antes de conversar, ambos aceptan estas condiciones.</h3>
      </div>
      <ul>
        <li>La entrevista ocurre dentro de Perfil Primero y queda monitoreada por IA y reglas automáticas.</li>
        <li>No se permite entregar correo, teléfono, WhatsApp, LinkedIn ni datos externos antes del cierre.</li>
        <li>Si aparece intento de intercambio de contacto, el chat se bloquea y se activa el pago de cierre a la empresa.</li>
        <li>El postulante vera que la empresa esta realizando el pago para cerrar trato.</li>
        <li>Una vez confirmado el pago, se desbloquea el contacto privado y la conversación puede continuar.</li>
      </ul>
      <div className="rulesStatus">
        <span className={accepted ? "ok" : ""}>{role === "company" ? "Empresa" : "Postulante"}: {accepted ? "aceptado" : "pendiente"}</span>
        <span className={otherAccepted ? "ok" : ""}>{role === "company" ? "Postulante" : "Empresa"}: {otherAccepted ? "aceptado" : "pendiente"}</span>
      </div>
      <button className="button secondary" disabled={accepted} type="button" onClick={onAccept}>
        {accepted ? "Reglas aceptadas" : "Acepto reglas de entrevista"}
      </button>
    </section>
  );
}

