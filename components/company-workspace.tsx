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

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { BadgeDollarSign, BriefcaseBusiness, Check, CheckCircle2, Filter, Loader2, MessageSquare, Search, Send } from "lucide-react";
import { AuthCard } from "./auth-card";
import { MercadoPagoIcon } from "./brand-icons";
import { CompanyInvoicesPanel } from "./company-invoices-panel";
import { chileRegions, invitationTemplates, jobAreas } from "@/lib/domain/catalogs";
import { ensureUserRecord, getUserRole, logout } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  createCompanyUnlockCheckout,
  createInvitation,
  acceptInterviewRules,
  getCandidateMatchAdvice,
  getCompanyProfile,
  getUnlockedWorkerContact,
  listCompanyJobOffers,
  listCompanyPayments,
  saveCompanyProfile,
  saveJobOffer,
  scheduleInterview,
  sendConversationMessage,
  submitPlatformReview,
  subscribeToCompanyInvitations,
  subscribeToMessages,
  updateInvitationStatus,
  uploadCompanyLogo
} from "@/lib/firebase/companies";
import { listVisibleWorkers } from "@/lib/firebase/workers";
import { calculateMatchScore } from "@/lib/domain/matching-engine";
import type { CompanyProfile, ConversationMessage, Invitation, JobOffer, WorkerPublicProfile } from "@/lib/domain/types";

const pipelineStatuses = [
  { key: "sent", label: "Invitado" },
  { key: "accepted", label: "Aceptado" },
  { key: "in_process", label: "Entrevista" },
  { key: "offer_sent", label: "Oferta" },
  { key: "hired", label: "Contratado" }
];

export function CompanyWorkspace() {
  const [uid, setUid] = useState("");
  const [workers, setWorkers] = useState<WorkerPublicProfile[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<WorkerPublicProfile | null>(null);
  const [compareWorkers, setCompareWorkers] = useState<WorkerPublicProfile[]>(() => {
    try {
      const saved = sessionStorage.getItem("pp_compareWorkers");
      return saved ? (JSON.parse(saved) as WorkerPublicProfile[]) : [];
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
  const [activeView, setActiveView] = useState<"dashboard" | "jobs" | "talent" | "interview" | "billing">("dashboard");
  const [filters, setFilters] = useState({
    query: "",
    region: "",
    area: "",
    salaryMax: ""
  });
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
    size: "1-10"
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
    message: ""
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
  const [wizardStep, setWizardStep] = useState<0 | 1 | 2 | 3>(0);
  const [rutValid, setRutValid] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    listVisibleWorkers({
      region: f.region || undefined,
      sector: f.area || undefined,
      salaryMax: f.salaryMax ? Number(f.salaryMax) : undefined
    })
      .then(setWorkers)
      .catch(() => setStatus("No se pudieron cargar los perfiles."))
      .finally(() => setLoadingWorkers(false));
  }

  useEffect(() => {
    if (!uid) return;

    getCompanyProfile(uid)
      .then((profile) => {
        setCompanyProfile(profile);
        if (!profile || !profile.legalName || !profile.taxId) {
          setWizardStep(1);
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
      size: companyProfile.size ?? "1-10"
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
  const FREEMIUM_LIMIT = 3;

  const scoredWorkers = useMemo(() => {
    const base = filters.query
      ? workers.filter((worker) => {
          const haystack = `${worker.headline} ${worker.summary ?? ""} ${worker.skills.join(" ")} ${worker.sectors.join(" ")}`.toLowerCase();
          return haystack.includes(filters.query.toLowerCase());
        })
      : workers;
    return base.map((w) => ({ worker: w, matchScore: calculateMatchScore(w, filters) }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [workers, filters]);

  const filteredWorkers = scoredWorkers.map((item) => item.worker);
  const visibleScoredWorkers = isVerified ? scoredWorkers : scoredWorkers.slice(0, FREEMIUM_LIMIT);
  const lockedCount = isVerified ? 0 : Math.max(0, scoredWorkers.length - FREEMIUM_LIMIT);
  const interviewReady = Boolean(activeInvitation?.interviewRulesAccepted?.company && activeInvitation?.interviewRulesAccepted?.worker);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  async function handleCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uid) {
      setStatus("Primero crea o inicia sesion como empresa.");
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
      setStatus("Empresa enviada a revision. Un admin debe verificarla para habilitar invitaciones reales.");
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
        message: invite.message
      });
      setLastInvitationId(result.invitationId);
      setActiveInvitationId(result.invitationId);
      setActiveView("interview");
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

    setStatus("Guardando publicacion...");

    try {
      const salaryMin = Number(jobOffer.salaryMin);
      const salaryMax = Number(jobOffer.salaryMax);
      const vacanciesTotal = Number(jobOffer.vacanciesTotal);

      if (!jobOffer.title.trim() || !jobOffer.description.trim() || !jobOffer.requirements.trim()) {
        setStatus("Completa cargo, descripcion y requisitos antes de guardar la publicacion.");
        return;
      }

      if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax) {
        setStatus("Revisa el sueldo: debe ser numérico y el mínimo no puede superar el máximo.");
        return;
      }

      if (!Number.isInteger(vacanciesTotal) || vacanciesTotal < 1 || vacanciesTotal > 100) {
        setStatus("Revisa las vacantes: debe ser un numero entero entre 1 y 100.");
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
      setStatus("Publicacion guardada. Puedes usarla como base para invitar postulantes.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la publicacion.");
    }
  }

  async function handleUnlock() {
    const payableInvitationId = activeInvitation?.invitationId ?? lastInvitationId;

    if (!payableInvitationId) {
      setStatus("Primero crea una invitacion, cierra el trato con el postulante y luego registra el pago.");
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
      try { sessionStorage.setItem("pp_compareWorkers", JSON.stringify(next)); } catch {}
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeInvitation) return;
    const unsub = subscribeToMessages(activeInvitation.invitationId, setMessages);
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
      setStatus("Primero selecciona un candidato con invitacion.");
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
            Antes de iniciar sesion solo mostramos la propuesta comercial.
          </p>
          <div className="portalStatGrid">
            <div><strong>Verificación</strong><span>control interno</span></div>
            <div><strong>IA</strong><span>matching asistido</span></div>
            <div><strong>$999</strong><span>desbloqueo de contacto</span></div>
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
          <strong className="activationPrice">$999</strong>
          <p className="helperText">La empresa paga solo cuando cierra el trato con un postulante.</p>
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
            ["billing", "Pagos"]
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
              RUT / ID fiscal
              <input value={company.taxId} onChange={(event) => updateCompany("taxId", event.target.value)} />
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
          </div>
          <div className="actions">
            <button className="button primary" type="submit">Guardar empresa</button>
          </div>
          {status ? <p className="statusText">{status}</p> : null}
        </form>
        ) : null}

        {activeView === "dashboard" ? (
          <section className="dashboardGrid">
            <article>
              <span className="smallLabel">Perfiles activos</span>
              <strong>{workers.length}</strong>
              <p>perfiles activos con pago confirmado.</p>
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
              )) : <p className="emptyState">Aún no tienes publicaciones creadas.</p>}
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
            <label>
              Palabra clave
              <input value={filters.query} onChange={(event) => updateFilter("query", event.target.value)} placeholder="Ventas, Excel, logística" />
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
              <input value={filters.salaryMax} onChange={(event) => updateFilter("salaryMax", event.target.value)} placeholder="1.200.000" />
            </label>
          </div>
          <button className="button primary" type="button" onClick={() => fetchWorkers()}>
            <Search size={16} aria-hidden="true" /> Buscar
          </button>
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
                  <button className="button secondary" type="button" onClick={() => setSelectedWorker(worker)}>
                    Seleccionar <Send size={18} aria-hidden="true" />
                  </button>
                  <button className="button secondary" type="button" onClick={() => toggleCompare(worker)}>
                    {compareWorkers.some((item) => item.workerId === worker.workerId) ? "Quitar" : "Comparar"}
                  </button>
                  <button className="button secondary" type="button" onClick={() => handleMatchAdvice(worker)}>
                    Analizar con IA
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
            <p className="emptyState">
              Aún no hay postulantes activos con pago confirmado. Este panel no inventa candidatos:
              primero deben existir perfiles reales visibles.
            </p>
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
            <div className="comparisonGrid">
              {compareWorkers.map((worker) => (
                <article key={worker.workerId}>
                  <span className="profileCode">{worker.profileCode}</span>
                  <h3>{worker.headline}</h3>
                  <p>{worker.region} - {worker.city}</p>
                  <strong>${worker.expectedSalaryMin.toLocaleString("es-CL")} - ${worker.expectedSalaryMax.toLocaleString("es-CL")}</strong>
                  <div className="scorePills">
                    {(worker.assessmentScores?.english ?? 0) > 0 && (worker.assessmentScores?.spanish ?? 0) > 0 && (worker.assessmentScores?.personality ?? 0) > 0 && (
                      <span className="scorePill validated">Perfil validado ✓</span>
                    )}
                    {(worker.assessmentScores?.english ?? 0) > 0 && <span className="scorePill lang">Inglés {toEnglishLevel(worker.assessmentScores!.english)}</span>}
                    {(worker.assessmentScores?.spanish ?? 0) > 0 && <span className="scorePill lang">Español {toSpanishLevel(worker.assessmentScores!.spanish)}</span>}
                    {(worker.assessmentScores?.personality ?? 0) > 0 && <span className="scorePill conduct">Perfil {toPersonalityLabel(worker.assessmentScores!.personality)}</span>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
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
            <div className="results compactResults">
              {invitations.length ? invitations.map((invitation) => (
                <article className="resultCard" key={invitation.invitationId}>
                  <div>
                    <span className="profileCode">{invitation.status}</span>
                    <h2>{invitation.opportunityTitle}</h2>
                    <p>{invitation.location} - ${invitation.salaryMin.toLocaleString("es-CL")} a ${invitation.salaryMax.toLocaleString("es-CL")}</p>
                  </div>
                  <button className="button secondary" type="button" onClick={() => selectInvitation(invitation)}>
                    Abrir proceso
                  </button>
                </article>
              )) : <p className="emptyState">Aún no hay invitaciones creadas.</p>}
            </div>
          </section>
        ) : null}

        {activeView === "interview" && selectedWorker ? (
          <section className="candidateDetail">
            <div className="formHeader">
              <Filter size={22} aria-hidden="true" />
            <div>
              <h2>Detalle del candidato</h2>
                <p>{selectedWorker.profileCode} - {selectedWorker.headline}</p>
              </div>
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
            {calendarUrl ? <a className="button secondary" href={calendarUrl} target="_blank" rel="noreferrer">Abrir Google Calendar</a> : null}
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
              <h2>Invitacion laboral</h2>
              <p>{selectedWorker ? `Perfil seleccionado: ${selectedWorker.profileCode}` : "Selecciona un perfil anónimo antes de crear una invitación."}</p>
            </div>
          </div>
          <div className="formGrid">
            <label className="wide">
              Plantilla de invitacion
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
              Ubicacion
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
          </div>
          <div className="actions">
            <button className="button primary" disabled={companyProfile?.verificationStatus !== "verified"} type="submit">
              Enviar invitacion
            </button>
            <button className="button secondary" type="button" onClick={handleUnlock}>
              <MercadoPagoIcon />
              Pagar $999
            </button>
          </div>
          <label>
            Cupon de descuento
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
              </div>
            )) : <p className="emptyState">Abre o crea una invitación para iniciar conversación.</p>}
            <div ref={messagesEndRef} />
          </div>
          {!interviewReady ? (
            <p className="paymentLockNotice">La entrevista se habilita cuando empresa y postulante aceptan las reglas.</p>
          ) : null}
          <div className="messageComposer">
            <textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} />
            <button className="button primary" disabled={!interviewReady} type="button" onClick={handleMessage}>Enviar mensaje</button>
          </div>
        </section>
        ) : null}

        {activeView === "billing" ? (
          <>
          <section className="comparisonTable">
            <div className="formHeader">
              <BadgeDollarSign size={22} aria-hidden="true" />
              <div>
                <h2>Comprobantes y pagos</h2>
                <p>Estados de cobro generados por cierre o intercambio de contacto.</p>
              </div>
            </div>
            <div className="paymentList">
              {payments.length ? payments.map((payment) => (
                <article key={payment.paymentId}>
                  <strong>${payment.amount.toLocaleString("es-CL")}</strong>
                  <span>{payment.paymentType}</span>
                  <span>{payment.status}</span>
                </article>
              )) : <p className="emptyState">Aun no hay pagos registrados.</p>}
            </div>
          </section>
          <CompanyInvoicesPanel />
          </>
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
  if (status === "pending") return "Revision pendiente";
  if (status === "rejected") return "Revision rechazada";
  if (status === "suspended") return "Empresa suspendida";
  return "Verificación requerida";
}

function verificationText(status?: string) {
  if (status === "verified") return "Puedes enviar invitaciones con sueldo y condiciones claras.";
  if (status === "pending") return "El equipo interno revisara identidad, RUT y presencia web.";
  if (status === "rejected") return "Corrige los datos o agrega información verificable.";
  if (status === "suspended") return "El acceso a contactos esta bloqueado por seguridad.";
  return "Guarda la empresa para iniciar la revision interna.";
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
        <li>La entrevista ocurre dentro de Perfil Primero y queda monitoreada por IA y reglas automaticas.</li>
        <li>No se permite entregar correo, telefono, WhatsApp, LinkedIn ni datos externos antes del cierre.</li>
        <li>Si aparece intento de intercambio de contacto, el chat se bloquea y se activa el pago de cierre a la empresa.</li>
        <li>El postulante vera que la empresa esta realizando el pago para cerrar trato.</li>
        <li>Una vez confirmado el pago, se desbloquea el contacto privado y la conversacion puede continuar.</li>
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

