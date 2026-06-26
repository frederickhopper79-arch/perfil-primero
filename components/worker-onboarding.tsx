"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useId } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, EyeOff, FileText, Lock, PenLine, UploadCloud, Check } from "lucide-react";
import { AuthCard } from "./auth-card";
import { AiProfileAdvisor } from "./ai-profile-advisor";
import { MercadoPagoIcon } from "./brand-icons";
import { AssessmentTests } from "./assessment-tests";
import { InterviewRulesCard } from "./company-workspace";
import { chileRegions, jobAreas, seniorityLevels } from "@/lib/domain/catalogs";
import { calculateProfileCompleteness, getCompletenessHints } from "@/lib/domain/matching-engine";
import { ensureUserRecord, getUserRole, logout } from "@/lib/firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  acceptInterviewRules,
  acceptInvitation,
  sendConversationMessage,
  submitPlatformReview,
  subscribeToMessages,
  subscribeToWorkerInvitations
} from "@/lib/firebase/companies";
import {
  analyzeCvWithAi,
  createWorkerSubscriptionCheckout,
  getWorkerProfile,
  listWorkerPayments,
  reactivateWorkerProfile,
  savePushSubscription,
  saveWorkerProfile,
  uploadWorkerCv
} from "@/lib/firebase/workers";
import { getReferralCode } from "@/lib/firebase/auth";
import { trackEvent } from "@/lib/firebase/analytics";
import type { ConversationMessage, Invitation } from "@/lib/domain/types";
import { fileToBase64 } from "@/lib/utils/file";
import { Confetti } from "@/components/ui/confetti";
import { useHaptic } from "@/lib/hooks/useHaptic";
import { reorder } from "@/lib/utils/drag-drop";
import { ProfileCompletionCard } from "@/components/profile-completion-card";
import { ReferralPanel } from "@/components/referral-panel";
import { NotificationPreferencesPanel } from "@/components/notification-preferences-panel";

const steps = ["Cuenta", "CV + IA", "Perfil público", "Carta", "Tests", "Activación"];

function formatClp(raw: string): string {
  const num = Number(raw.replace(/\D/g, ""));
  return num ? num.toLocaleString("es-CL") : "";
}

async function copyText(text: string): Promise<void> {
  try { await navigator.clipboard.writeText(text); } catch { /* silent */ }
}

const SKILLS_BY_AREA: Record<string, string[]> = {
  "Tecnología": ["Python","JavaScript","React","TypeScript","SQL","Docker","Node.js","Git","Linux","Excel avanzado","SAP","Power BI","Soporte técnico","Redes","Ciberseguridad"],
  "Ventas": ["CRM","Prospección","Negociación","Cierre de ventas","Atención al cliente","Marketing digital","E-commerce","KPI comerciales","Presentaciones","Postventa"],
  "Administración": ["Contabilidad","Excel avanzado","SAP","Facturación electrónica","Gestión documental","Atención al público","Secretariado","Recursos humanos","Gestión de contratos"],
  "Salud": ["Primeros auxilios","Atención al paciente","Farmacología","Registro médico","Bioseguridad","Rehabilitación","Toma de muestras","Enfermería básica","Reanimación CPR"],
  "Educación": ["Planificación curricular","Evaluación pedagógica","Gestión de aula","Tutoría","Plataformas e-learning","Atención a la diversidad","Inglés pedagógico"],
  "Construcción": ["Albañilería","Enfierradura","Hormigón","Lectura de planos","Soldadura","Topografía","Seguridad en obra","Instalaciones eléctricas","Gasfitería"],
  "Logística": ["Gestión de inventario","WMS","Montacargas","Picking","Despacho","Importaciones","Supply chain","Ruteo","Carga y descarga"],
  "Gastronomía": ["Cocina chilena","Pastelería","Barismo","Servicio al cliente","Control de costos","HACCP","Mise en place","Vinos y licores"],
  "Finanzas": ["Análisis financiero","Excel avanzado","SAP FI","Contabilidad","Tesorería","Presupuestos","Power BI","Control de gestión","Auditoría"],
  "Marketing": ["Marketing digital","SEO","SEM","Redes sociales","Google Analytics","Canva","Copywriting","Email marketing","Pauta publicitaria","UX/UI"],
  "Oficios y Otros": ["Conducción B","Trabajo en altura","Electricidad básica","Gasfitería","Jardinería","Limpieza industrial","Operario bodega","Pintura"],
};

const QUICK_REPLIES = [
  "¡Muchas gracias por contactarme! Me interesa conocer más sobre la oportunidad.",
  "Quedo disponible para coordinar una entrevista en los próximos días. ¿Qué horarios tienen disponibles?",
  "Agradezco el interés. Antes de avanzar, me gustaría conocer más detalles sobre el cargo y las condiciones.",
  "He revisado la invitación y me parece un desafío muy interesante. Estoy disponible para conversar.",
  "Necesito un poco más de información sobre el sueldo líquido y los beneficios antes de tomar una decisión.",
];

export function WorkerOnboarding() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [accessStatus, setAccessStatus] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeInvitationId, setActiveInvitationId] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [payments, setPayments] = useState<Array<{ paymentId: string; status: string; amount: number; currency: "CLP" | "USD"; paymentType: string; providerPaymentId?: string }>>([]);
  const [profileState, setProfileState] = useState({ visibilityStatus: "hidden", subscriptionStatus: "inactive", profileExpiresAt: null as Date | null, analytics: null as { weekImpressions?: number } | null, badges: null as string[] | null });
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvStep, setCvStep] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [companyReview, setCompanyReview] = useState({ score: "5", comment: "" });
  const [activeView, setActiveView] = useState<"profile" | "cover" | "tests" | "interview" | "billing" | "herramientas" | "notificaciones">("profile");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCover, setCopiedCover] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [invitationFilter, setInvitationFilter] = useState<"all" | "pending" | "accepted">("all");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [archivedInvitations, setArchivedInvitations] = useState<Set<string>>(new Set());
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; read: boolean }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPublicLink, setShowPublicLink] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const [pushStatus, setPushStatus] = useState<"idle" | "subscribed" | "denied" | "loading">("idle");
  const [reactivating, setReactivating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { vibrate } = useHaptic();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevInvitationIdsRef = useRef<Set<string>>(new Set());
  const [languages, setLanguages] = useState<Array<{ lang: string; level: string }>>([{ lang: "", level: "básico" }]);
  const [education, setEducation] = useState<Array<{ level: string; institution: string; year: string }>>([]);
  const [showAnonPreview, setShowAnonPreview] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [msgPage, setMsgPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [scores, setScores] = useState({ english: 0, spanish: 0, personality: 0 });
  const [savedScores, setSavedScores] = useState({ english: 0, spanish: 0, personality: 0 });
  const [attemptCounts, setAttemptCounts] = useState({ english: 0, spanish: 0, personality: 0 });
  const [verifiedInviteCount, setVerifiedInviteCount] = useState(0);
  const [form, setForm] = useState({
    headline: "",
    region: "Región Metropolitana",
    city: "",
    area: "",
    seniority: "",
    yearsExperience: "",
    workMode: "hybrid",
    availability: "listening",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    summary: "",
    cvAnalysisSummary: "",
    formattedCv: "",
    coverLetter: "",
    legalName: "",
    rut: "",
    phone: "",
    portfolio: ""
  });

  const profileCode = useMemo(() => {
    if (!uid) return "PP-NUEVO";
    return `PP-${uid.slice(0, 8).toUpperCase()}`;
  }, [uid]);

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      setStatus("Pago recibido por Mercado Pago. La activación se confirma cuando llegue el webhook aprobado.");
    }
    if (checkout === "pending") {
      setStatus("Mercado Pago dejó el pago pendiente. Revisaremos la confirmación automáticamente.");
    }
    if (checkout === "failure") {
      setStatus("Mercado Pago no pudo completar el pago. Puedes intentar nuevamente.");
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid("");
        setEmail("");
        return;
      }

      let role = await getUserRole(user.uid);
      if (!role) {
        await ensureUserRecord(user.uid, user.email ?? "", "worker");
        role = "worker";
      }
      if (role && role !== "worker") {
        await logout();
        setUid("");
        setEmail("");
        setAccessStatus("Esta cuenta no es de postulante. Ingresa con una cuenta postulante o crea una nueva.");
        return;
      }

      setUid(user.uid);
      setEmail(user.email ?? "");
      setAccessStatus("");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-save debounced 60s cuando hay cambios en el formulario
  useEffect(() => {
    if (!uid) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveCurrentProfile();
        setLastSavedAt(new Date());
      } catch { /* silent — manual save still works */ }
    }, 60000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeInvitationId) return;
    const unsub = subscribeToMessages(activeInvitationId, setMessages);
    return () => unsub();
  }, [activeInvitationId]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribeInvitations = subscribeToWorkerInvitations(uid, (newInvitations) => {
      setInvitations((prev) => {
        const prevIds = prevInvitationIdsRef.current;
        const added = newInvitations.filter((i) => !prevIds.has(i.invitationId) && i.status === "sent");
        if (added.length > 0 && prevIds.size > 0) {
          setNotifications((n) => [
            ...added.map((inv) => ({ id: inv.invitationId, text: `Nueva invitación: ${inv.opportunityTitle}`, read: false })),
            ...n,
          ]);
        }
        prevInvitationIdsRef.current = new Set(newInvitations.map((i) => i.invitationId));
        return newInvitations;
      });
    });
    listWorkerPayments(uid).then(setPayments).catch(() => setStatus("No se pudieron cargar los pagos."));
    getReferralCode(uid).then(setReferralCode).catch(() => {});
    getWorkerProfile(uid)
      .then(({ publicProfile, privateProfile }) => {
        if (publicProfile) {
          setProfileState({
            visibilityStatus: publicProfile.visibilityStatus,
            subscriptionStatus: publicProfile.subscriptionStatus,
            profileExpiresAt: publicProfile.profileExpiresAt instanceof Date
              ? publicProfile.profileExpiresAt
              : publicProfile.profileExpiresAt
                ? new Date((publicProfile.profileExpiresAt as unknown as { seconds: number }).seconds * 1000)
                : null,
            analytics: publicProfile.analytics ?? null,
            badges: publicProfile.badges ?? null
          });
          const loadedScores = publicProfile.assessmentScores ?? { english: 0, spanish: 0, personality: 0 };
          setScores(loadedScores);
          setSavedScores(loadedScores);
          setAttemptCounts(publicProfile.testAttemptCounts ?? { english: 0, spanish: 0, personality: 0 });
          setCvUrl(publicProfile.cvFileUrl ?? "");
          setForm((current) => ({
            ...current,
            headline: publicProfile.headline ?? current.headline,
            region: publicProfile.region ?? current.region,
            city: publicProfile.city ?? current.city,
            area: publicProfile.sectors?.[0] ?? current.area,
            seniority: reverseMapSeniority(publicProfile.experienceLevel),
            yearsExperience: String(publicProfile.yearsOfExperience ?? current.yearsExperience),
            workMode: publicProfile.workModes?.[0] ?? current.workMode,
            availability: publicProfile.availability ?? current.availability,
            salaryMin: String(publicProfile.expectedSalaryMin ?? current.salaryMin),
            salaryMax: String(publicProfile.expectedSalaryMax ?? current.salaryMax),
            skills: publicProfile.skills?.join(", ") ?? current.skills,
            summary: publicProfile.summary ?? current.summary,
            cvAnalysisSummary: publicProfile.cvAnalysisSummary ?? current.cvAnalysisSummary,
            formattedCv: publicProfile.formattedCv ?? current.formattedCv,
            coverLetter: publicProfile.coverLetter ?? current.coverLetter
          }));
        }

        if (privateProfile) {
          setVerifiedInviteCount((privateProfile as { verifiedInviteCount?: number }).verifiedInviteCount ?? 0);
          setForm((current) => ({
            ...current,
            legalName: privateProfile.legalName ?? current.legalName,
            rut: privateProfile.rut ?? current.rut,
            phone: privateProfile.phone ?? current.phone,
            portfolio: privateProfile.portfolioLinks?.[0] ?? current.portfolio,
            formattedCv: privateProfile.formattedCv ?? current.formattedCv,
            cvAnalysisSummary: privateProfile.cvAnalysisSummary ?? current.cvAnalysisSummary,
            coverLetter: privateProfile.coverLetter ?? current.coverLetter
          }));
        }
      })
      .catch(() => setStatus("No se pudo cargar el perfil guardado."));

    return () => unsubscribeInvitations();
  }, [uid]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleRegiónChange(regionName: string) {
    const nextRegión = chileRegions.find((region) => region.name === regionName) ?? chileRegions[0];
    setForm((current) => ({
      ...current,
      region: nextRegión.name,
      city: nextRegión.communes.includes(current.city) ? current.city : nextRegión.communes[0]
    }));
  }

  async function handleScoresChange(nextScores: typeof scores) {
    setScores(nextScores);
    if (!uid) return;

    try {
      await saveCurrentProfile(form, cvUrl, nextScores);
      setStatus("Resultados de test guardados en tu perfil.");
    } catch {
      setStatus("Resultados calculados. Guarda el perfil para persistirlos.");
    }
  }

  const selectedRegión = chileRegions.find((region) => region.name === form.region) ?? chileRegions[0];
  const activeInvitation = invitations.find((invitation) => invitation.invitationId === activeInvitationId) ?? null;
  const interviewReady = Boolean(activeInvitation?.interviewRulesAccepted?.company && activeInvitation?.interviewRulesAccepted?.worker);

  async function handleCvAnalysis() {
    if (!uid) {
      setStatus("Primero crea o inicia sesión.");
      return;
    }

    if (!cvFile) {
      setStatus("Sube tu CV en PDF o documento antes de analizarlo.");
      return;
    }

    if (cvFile.size > 5 * 1024 * 1024) {
      setStatus("El CV pesa demasiado. Sube un archivo de maximo 5 MB.");
      return;
    }

    if (!["application/pdf", "text/plain"].includes(cvFile.type) && !cvFile.name.match(/\.(doc|docx)$/i)) {
      setStatus("Formato no permitido. Usa PDF, DOC, DOCX o TXT.");
      return;
    }

    setCvAnalyzing(true);
    setCvStep("Subiendo archivo...");
    setStatus("");

    try {
      const uploadedUrl = await uploadWorkerCv(uid, cvFile);
      setCvStep("Extrayendo texto del documento...");
      const base64 = await fileToBase64(cvFile);
      setCvStep("Analizando con Google IA...");
      const analysis = await analyzeCvWithAi({
        fileName: cvFile.name,
        mimeType: cvFile.type || "application/pdf",
        base64
      });
      const nextForm = {
        ...form,
        headline: analysis.headline || form.headline,
        summary: analysis.summary || form.summary,
        cvAnalysisSummary: analysis.cvAnalysisSummary || form.cvAnalysisSummary,
        formattedCv: analysis.formattedCv || analysis.summary || form.formattedCv,
        skills: analysis.skills.length ? analysis.skills.join(", ") : form.skills,
        area: jobAreas.includes(analysis.sectors[0]) ? analysis.sectors[0] : form.area,
        yearsExperience: String(analysis.yearsOfExperience || form.yearsExperience),
        salaryMin: String(analysis.suggestedSalaryMin || form.salaryMin),
        salaryMax: String(analysis.suggestedSalaryMax || form.salaryMax)
      };
      setCvUrl(uploadedUrl);
      setForm(nextForm);
      await saveCurrentProfile(nextForm, uploadedUrl);
      if (analysis.aiStatus === "quota_exceeded") {
        setStatus("CV subido y perfil base creado. El análisis automático está temporalmente en mantenimiento — completa los campos manualmente. Tu perfil ya está guardado.");
        return;
      }
      setStatus(`CV analizado y perfil actualizado. ${analysis.cvAnalysisSummary || "Se generó un CV con formato Perfil Primero."}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const friendly = msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("resource-exhausted")
        ? "El análisis automático está temporalmente en mantenimiento. Tu CV quedó guardado — completa los campos manualmente."
        : msg.toLowerCase().includes("unauthenticated")
          ? "Tu sesión expiró. Recarga la página e inicia sesión nuevamente."
          : "No se pudo analizar el CV. Verifica que sea PDF o DOC válido e inténtalo de nuevo.";
      setStatus(friendly);
    } finally {
      setCvAnalyzing(false);
      setCvStep("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uid) {
      setStatus("Primero crea o inicia sesión.");
      return;
    }

    setStatus("Guardando perfil...");

    try {
      const salaryMin = Number(form.salaryMin);
      const salaryMax = Number(form.salaryMax);
      const yearsExperience = Number(form.yearsExperience);
      if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax) {
        setStatus("Revisa la renta: debe ser numérica y la renta mínima no puede superar la máxima.");
        return;
      }
      if (salaryMin < 400_000 || salaryMax > 15_000_000) {
        setStatus("El rango de renta debe estar entre $400.000 y $15.000.000 CLP.");
        return;
      }
      if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 60) {
        setStatus("Revisa los años de experiencia: debe ser un número entre 0 y 60.");
        return;
      }

      await saveCurrentProfile(form, cvUrl);
      setLastSavedAt(new Date());
      vibrate("success");
      trackEvent("profile_completed", { role: "worker" });
      setStatus(profileState.subscriptionStatus === "active"
        ? "Perfil actualizado y sigue visible para empresas verificadas."
        : "Perfil guardado como borrador privado. Activa Mercado Pago para hacerlo visible por 30 días.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    }
  }

  async function handleCheckout() {
    if (!uid) {
      setStatus("Primero inicia sesión.");
      return;
    }

    setStatus("Creando checkout...");

    try {
      trackEvent("checkout_initiated", { role: "worker" });
      const checkout = await createWorkerSubscriptionCheckout(couponCode);
      window.location.href = checkout.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el checkout.");
    }
  }

  async function handleLogout() {
    await logout();
    setUid("");
    setEmail("");
    setStatus("Sesión cerrada.");
  }

  async function saveCurrentProfile(nextForm = form, nextCvUrl = cvUrl, nextScores = scores) {
    await saveWorkerProfile({
      publicProfile: {
        workerId: uid,
        profileCode,
        displayName: nextForm.headline,
        headline: nextForm.headline,
        summary: nextForm.summary,
        skills: nextForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        sectors: [nextForm.area],
        experienceLevel: mapSeniority(nextForm.seniority),
        yearsOfExperience: Number(nextForm.yearsExperience),
        region: nextForm.region,
        city: nextForm.city,
        workModes: [nextForm.workMode as "remote" | "hybrid" | "onsite"],
        expectedSalaryMin: Number(nextForm.salaryMin),
        expectedSalaryMax: Number(nextForm.salaryMax),
        currency: "CLP",
        availability: nextForm.availability as "actively_looking" | "listening" | "unavailable",
        visibilityStatus: profileState.visibilityStatus as "visible" | "paused" | "hidden" | "expired" | "suspended",
        subscriptionStatus: profileState.subscriptionStatus as "inactive" | "active" | "expired" | "cancelled",
        assessmentScores: nextScores,
        cvFileUrl: nextCvUrl,
        cvAnalysisSummary: nextForm.cvAnalysisSummary || nextForm.summary,
        formattedCv: nextForm.formattedCv,
        coverLetter: nextForm.coverLetter
      },
      privateProfile: {
        workerId: uid,
        legalName: nextForm.legalName,
        preferredName: nextForm.legalName.split(" ")[0] ?? "",
        rut: nextForm.rut || undefined,
        email,
        phone: nextForm.phone,
        portfolioLinks: nextForm.portfolio ? [nextForm.portfolio] : [],
        formattedCv: nextForm.formattedCv,
        cvAnalysisSummary: nextForm.cvAnalysisSummary,
        coverLetter: nextForm.coverLetter
      }
    }, savedScores);
    setSavedScores(nextScores);
  }

  function generateCoverLetter() {
    const name = form.legalName || "Postulante";
    const skills = form.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .slice(0, 5)
      .join(", ");
    const salary = Number(form.salaryMin)
      ? `Mi expectativa de renta se encuentra desde $${Number(form.salaryMin).toLocaleString("es-CL")}`
      : "Estoy disponible para conversar condiciones de renta";

    const nextCoverLetter = [
      `Estimado equipo de reclutamiento:`,
      "",
      `Mi nombre es ${name} y me interesa presentar mi perfil para oportunidades relacionadas con ${form.headline}. Cuento con experiencia y habilidades en ${skills || form.area}, con foco en aportar resultados concretos desde el primer mes.`,
      "",
      `${form.summary}`,
      "",
      `${salary}, considerando modalidad ${form.city}, ${form.region}. Quedo disponible para una entrevista y para ampliar antecedentes dentro de Perfil Primero.`,
      "",
      "Saludos cordiales,"
    ].join("\n");

    update("coverLetter", nextCoverLetter);
    setStatus("Carta de presentación generada. Revisala, ajustala y guarda el perfil.");
  }

  async function handleSaveCoverLetter() {
    try {
      await saveCurrentProfile();
      setStatus("Carta de presentación guardada en tu perfil.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar la carta.");
    }
  }


  async function handleAcceptInvitation(invitationId: string) {
    setStatus("Aceptando invitación...");

    try {
      await acceptInvitation(invitationId);
      trackEvent("invitation_accepted", { invitation_id: invitationId, role: "worker" });
      setInvitations((current) =>
        current.map((invitation) =>
          invitation.invitationId === invitationId
            ? { ...invitation, status: "accepted" }
            : invitation
        )
      );
      setStatus("Invitación aceptada. La empresa ya puede pagar el desbloqueo.");
      setActiveView("interview");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo aceptar la invitación.");
    }
  }

  async function handleWorkerMessage() {
    if (!activeInvitationId) {
      setStatus("Selecciona una invitación para responder.");
      return;
    }
    if (!messageBody.trim()) return;

    try {
      const result = await sendConversationMessage(activeInvitationId, messageBody);
      setMessageBody("");
      setStatus(result.paymentRequired
        ? "El chat quedó bloqueado: la empresa está realizando el pago para cerrar trato contigo."
        : "Mensaje enviado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
    }
  }

  async function handleCopyCode() {
    await copyText(profileCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function handleCopyCover() {
    await copyText(form.coverLetter);
    setCopiedCover(true);
    setTimeout(() => setCopiedCover(false), 2000);
  }

  async function handleCopyReferral() {
    if (!referralCode) return;
    await copyText(`https://perfil-primero.web.app/r?ref=${referralCode}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  }

  async function handlePauseVisibility() {
    try {
      await saveWorkerProfile({
        publicProfile: {
          workerId: uid,
          profileCode,
          displayName: form.headline,
          headline: form.headline,
          summary: form.summary,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          sectors: [form.area],
          experienceLevel: mapSeniority(form.seniority),
          yearsOfExperience: Number(form.yearsExperience),
          region: form.region,
          city: form.city,
          workModes: [form.workMode as "remote" | "hybrid" | "onsite"],
          expectedSalaryMin: Number(form.salaryMin),
          expectedSalaryMax: Number(form.salaryMax),
          currency: "CLP",
          availability: form.availability as "actively_looking" | "listening" | "unavailable",
          visibilityStatus: "paused",
          subscriptionStatus: profileState.subscriptionStatus as "inactive" | "active" | "expired" | "cancelled",
          assessmentScores: scores,
          cvFileUrl: cvUrl,
          cvAnalysisSummary: form.cvAnalysisSummary,
          formattedCv: form.formattedCv,
          coverLetter: form.coverLetter
        },
        privateProfile: {
          workerId: uid,
          legalName: form.legalName,
          preferredName: form.legalName.split(" ")[0] ?? "",
          rut: form.rut || undefined,
          email,
          phone: form.phone,
          portfolioLinks: form.portfolio ? [form.portfolio] : [],
          formattedCv: form.formattedCv,
          cvAnalysisSummary: form.cvAnalysisSummary,
          coverLetter: form.coverLetter
        }
      }, savedScores);
      setProfileState((prev) => ({ ...prev, visibilityStatus: "paused" }));
      setStatus("Perfil pausado. Las empresas no verán tu perfil hasta que lo reactives.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo pausar el perfil.");
    }
  }

  async function handleAcceptInterviewRules() {
    if (!activeInvitationId) {
      setStatus("Selecciona una invitación antes de aceptar la entrevista.");
      return;
    }

    try {
      await acceptInterviewRules(activeInvitationId);
      setStatus("Reglas de entrevista aceptadas por el postulante.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudieron aceptar las reglas.");
    }
  }

  async function handleReviewCompany() {
    if (!activeInvitationId) {
      setStatus("Selecciona una invitación antes de evaluar a la empresa.");
      return;
    }

    try {
      await submitPlatformReview({
        invitationId: activeInvitationId,
        targetRole: "company",
        score: Number(companyReview.score),
        comment: companyReview.comment
      });
      setStatus("Evaluación de empresa registrada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo evaluar la empresa.");
    }
  }

  if (!uid) {
    return (
      <section className="accessSplit">
        <div className="accessPitch">
          <span className="smallLabel">Panel privado del postulante</span>
          <h2>Entra para crear tu perfil, subir tu CV y activar tu visibilidad.</h2>
          <p>
            Antes de iniciar sesión no mostramos formularios internos, invitaciones,
            tests ni entrevistas. Tu información laboral vive dentro de tu cuenta.
          </p>
          <div className="portalStatGrid">
            <div><strong>CV + IA</strong><span>perfil autollenado</span></div>
            <div><strong>Anonimato</strong><span>datos privados bloqueados</span></div>
            <div><strong>Gratis</strong><span>durante el lanzamiento</span></div>
          </div>
        </div>
        <AuthCard
          role="worker"
          onReady={(nextUid, nextEmail) => {
            setUid(nextUid);
            setEmail(nextEmail);
          }}
        />
        {accessStatus ? <p className="statusText">{accessStatus}</p> : null}
      </section>
    );
  }

  const completedTests = Object.values(scores).filter(Boolean).length;
  const pendingInvitations = invitations.filter((inv) => inv.status === "sent").length;
  const filteredInvitations = invitationFilter === "pending"
    ? invitations.filter((inv) => inv.status === "sent")
    : invitationFilter === "accepted"
      ? invitations.filter((inv) => ["accepted", "in_process", "offer_sent"].includes(inv.status))
      : invitations;
  const sortedInvitations = [...filteredInvitations].sort((a, b) => {
    const ta = (a as { createdAt?: { seconds?: number } }).createdAt?.seconds ?? 0;
    const tb = (b as { createdAt?: { seconds?: number } }).createdAt?.seconds ?? 0;
    return tb - ta;
  });

  const activeInvitations = sortedInvitations.filter((inv) => !archivedInvitations.has(inv.invitationId));
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const skillsSuggestions = SKILLS_BY_AREA[form.area] ?? [];
  const addedSkillsSet = new Set(form.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
  const filteredSkillSuggestions = skillsSuggestions.filter((s) => !addedSkillsSet.has(s.toLowerCase()));
  const publicProfileLink = uid ? `https://perfil-primero.web.app/p/${profileCode}` : "";

  const completenessProfile = {
    skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    summary: form.summary,
    workModes: [form.workMode as "remote" | "hybrid" | "onsite"],
    expectedSalaryMin: Number(form.salaryMin) || 0,
    expectedSalaryMax: Number(form.salaryMax) || 0,
    assessmentScores: (scores.english || scores.spanish || scores.personality) ? scores : undefined,
    cvAnalysisSummary: form.cvAnalysisSummary
  };
  const profileCompletion = calculateProfileCompleteness(completenessProfile);
  const completenessHints = getCompletenessHints(completenessProfile);

  useEffect(() => {
    if (profileCompletion === 100 && uid) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 3500);
      return () => clearTimeout(t);
    }
  }, [profileCompletion, uid]);

  const missingTests = [
    scores.english ? "" : "inglés",
    scores.spanish ? "" : "español",
    scores.personality ? "" : "personalidad"
  ].filter(Boolean).join(", ") || "ninguno";

  const stepsDone = [
    Boolean(uid),
    Boolean(cvUrl || form.formattedCv),
    Boolean(form.headline && form.summary && form.skills && form.region),
    Boolean(form.coverLetter),
    completedTests >= 1,
    profileState.subscriptionStatus === "active"
  ];

  const allStepsDone = stepsDone.every(Boolean);
  const showBanner = uid && !allStepsDone && !bannerDismissed;

  const STEP_LABELS = ["Crear cuenta", "Subir CV", "Completar perfil", "Carta de presentación", "Test de evaluación", "Activar perfil"];
  const pendingStepLabels = STEP_LABELS.filter((_, i) => !stepsDone[i]);

  return (
    <>
    <Confetti active={showConfetti} />
    {showBanner && (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "sticky", top: 0, zIndex: 900,
          background: "var(--brand, #0094d4)", color: "#fff",
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px", fontSize: 13, flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 700, flexShrink: 0 }}>
          {profileCompletion}% completado —
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          Pendiente: {pendingStepLabels.join(" · ")}
        </span>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <a href="/bienvenida" style={{ color: "#fff", fontWeight: 700, fontSize: 12, textDecoration: "underline" }}>
            Ver checklist
          </a>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Cerrar banner"
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>
      </div>
    )}
    <section className="flowLayout">
      <aside className="steps">
        {steps.map((step, index) => (
          <div className={`step${stepsDone[index] ? " done" : ""}`} key={step}>
            <span>
              {stepsDone[index] ? <Check size={13} strokeWidth={3} /> : index + 1}
            </span>
            <p>{step}</p>
          </div>
        ))}

        <section className="sidePanel activationLeft">
          <div className="sidePanelHeader">
            <MercadoPagoIcon />
            <strong>Activación</strong>
          </div>
          <div className="previewBox">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="profileCode">{profileCode}</span>
              <button
                className="button ghost"
                type="button"
                onClick={handleCopyCode}
                style={{ fontSize: 11, padding: "1px 6px" }}
                title="Copiar código de perfil"
              >
                {copiedCode ? "✓" : "Copiar"}
              </button>
            </div>
            <h3>{form.headline || "Sin título aún"}</h3>
            <p>{form.skills ? form.skills.split(",").slice(0, 3).join(", ") : "Sin habilidades aún"}</p>
          </div>
          <strong className="activationPrice">{profileState.subscriptionStatus === "active" ? "✓ Activo" : "Gratis · lanzamiento"}</strong>
          {lastSavedAt && (
            <p className="helperText" style={{ fontSize: 11, color: "var(--muted)" }}>
              Guardado a las {lastSavedAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {profileState.subscriptionStatus === "active" && profileState.profileExpiresAt ? (() => {
            const daysLeft = Math.ceil((profileState.profileExpiresAt.getTime() - Date.now()) / 86400000);
            const cls = daysLeft <= 3 ? "expirySoon" : daysLeft <= 7 ? "expiryWarn" : "expiryOk";
            const daysLabel = daysLeft <= 0 ? "vence hoy" : `Vence en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`;
            return <p className={`expiryBadge ${cls}`}>{daysLabel}</p>;
          })() : null}
          <p className="helperText">Perfil visible 30 días para empresas verificadas.</p>
          {profileState.subscriptionStatus === "active" && profileState.profileExpiresAt && (() => {
            const daysLeft = Math.ceil((profileState.profileExpiresAt.getTime() - Date.now()) / 86400000);
            if (daysLeft > 10) return null;
            return (
              <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#92400e", marginBottom: 6 }}>
                ⚠️ Tu perfil vence en {daysLeft} día{daysLeft === 1 ? "" : "s"}. Renueva ahora para no perder visibilidad.
              </div>
            );
          })()}
          {profileState.subscriptionStatus !== "active" ? (
            <button className="button primary full" type="button" onClick={handleCheckout}>
              <MercadoPagoIcon />
              Activar visibilidad
            </button>
          ) : profileState.visibilityStatus === "paused" ? (
            <button className="button secondary full" type="button" onClick={() => {
              saveCurrentProfile(form, cvUrl).then(() => {
                setProfileState((prev) => ({ ...prev, visibilityStatus: "visible" }));
                setStatus("Perfil reactivado. Las empresas pueden verte nuevamente.");
              }).catch(() => setStatus("No se pudo reactivar el perfil."));
            }}>
              Reactivar visibilidad
            </button>
          ) : (
            <button className="button ghost full" type="button" onClick={handlePauseVisibility}>
              Pausar visibilidad temporalmente
            </button>
          )}
          <label className="couponLabel">
            Cupón
            <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Código de descuento" />
          </label>
        </section>

        {/* Completitud del perfil */}
        <section className="sidePanel completenessPanel">
          <div className="sidePanelHeader">
            <strong>Completitud del perfil</strong>
            <span className="completenessScore">{profileCompletion}%</span>
          </div>
          <div className="completenessBar">
            <div
              className="completenessBarFill"
              style={{ width: `${profileCompletion}%` }}
              aria-valuenow={profileCompletion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Completitud del perfil"
              role="progressbar"
            />
          </div>
          {completenessHints.length > 0 && (
            <ul className="completenessHints">
              {completenessHints.slice(0, 3).map((hint) => (
                <li key={hint.label}>
                  <span className="hintDot" />
                  {hint.label} <span className="hintPoints">+{hint.points}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Badge: invitado por empresa verificada */}
        {verifiedInviteCount > 0 && (
          <section className="sidePanel verifiedInviteBadge">
            <div className="verifiedInviteIcon">✓</div>
            <div>
              <strong>Empresa verificada interesada</strong>
              <p>
                {verifiedInviteCount === 1
                  ? "Una empresa verificada te invitó y aceptaste. Tu perfil está generando interés real."
                  : `${verifiedInviteCount} empresas verificadas te han invitado. Tu perfil destaca en búsquedas activas.`}
              </p>
            </div>
          </section>
        )}

        {/* Badges automáticos */}
        {profileState.subscriptionStatus === "active" && profileState.badges && profileState.badges.length > 0 && (
          <section className="sidePanel badgesPanel">
            <div className="sidePanelHeader">
              <strong>Tus logros</strong>
            </div>
            <div className="badgePills">
              {profileState.badges.map((badge) => (
                <span className="badgePill" key={badge}>{badge.replace(/_/g, " ")}</span>
              ))}
            </div>
          </section>
        )}

        {/* Estadísticas de visibilidad */}
        {profileState.subscriptionStatus === "active" && (
          <section className="sidePanel visibilityStats">
            <div className="sidePanelHeader">
              <strong>Tu visibilidad esta semana</strong>
            </div>
            <div className="statGrid">
              <div className="statItem">
                <span className="statNumber">
                  {profileState.analytics?.weekImpressions ?? "—"}
                </span>
                <span className="statLabel">
                  Búsquedas esta semana
                  {(profileState.analytics?.weekImpressions ?? 0) >= 3 && (
                    <span className="statHint good"> · por sobre el promedio</span>
                  )}
                  {(profileState.analytics?.weekImpressions ?? 0) === 0 && profileState.analytics !== null && (
                    <span className="statHint"> · activa tu perfil para aparecer</span>
                  )}
                </span>
              </div>
              <div className="statItem">
                <span className="statNumber">{completedTests}/3</span>
                <span className="statLabel">Tests completados</span>
              </div>
            </div>
            <p className="helperText">Las empresas ven tu perfil en búsquedas activas. Cada aparición es una oportunidad.</p>
          </section>
        )}
      </aside>

      <div className="stack">
        <section className="workspaceSessionBar">
          <div>
            <span className="smallLabel">Sesión postulante</span>
            <strong>{email || profileCode}</strong>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="button ghost"
                aria-label={unreadNotifications > 0 ? `${unreadNotifications} notificaciones nuevas` : "Notificaciones"}
                onClick={() => {
                  setShowNotifications((p) => !p);
                  setNotifications((n) => n.map((x) => ({ ...x, read: true })));
                }}
                style={{ padding: "4px 8px", fontSize: 16 }}
              >
                🔔
                {unreadNotifications > 0 && (
                  <span style={{ position: "absolute", top: 0, right: 0, background: "#dc2626", color: "#fff", borderRadius: 10, fontSize: 9, padding: "1px 5px", fontWeight: 700, lineHeight: 1.4 }}>
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div style={{ position: "absolute", top: "110%", right: 0, background: "var(--surface, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 10, padding: 12, zIndex: 30, minWidth: 270, boxShadow: "0 4px 16px rgba(0,0,0,.12)" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 8px", color: "var(--muted)" }}>Notificaciones</p>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Sin notificaciones recientes.</p>
                  ) : notifications.slice(0, 8).map((n) => (
                    <div key={n.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--border, #e5e7eb)", fontSize: 13 }}>
                      {n.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="button secondary" type="button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </section>

        <div className="workspaceTabs" role="tablist" aria-label="Panel postulante">
          {[
            ["profile", "Perfil", 0],
            ["cover", "Carta", 0],
            ["tests", "Tests opcionales", 0],
            ["interview", `Entrevistas`, pendingInvitations],
            ["billing", "Pagos", 0],
            ["herramientas", "Herramientas", 0],
            ["notificaciones", "Notificaciones", 0],
          ].map(([key, label, badge]) => (
            <button
              className={activeView === key ? "active" : ""}
              key={String(key)}
              type="button"
              onClick={() => {
                setLoadingTab(true);
                setActiveView(key as typeof activeView);
                setTimeout(() => setLoadingTab(false), 250);
              }}
            >
              {String(label)}
              {Number(badge) > 0 && (
                <span style={{ marginLeft: 5, background: "#dc2626", color: "#fff", borderRadius: 10, fontSize: 10, padding: "1px 6px", fontWeight: 700 }}>
                  {String(badge)}
                </span>
              )}
            </button>
          ))}
        </div>


        {/* Modal de vista previa anónima */}
        {showAnonPreview && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowAnonPreview(false)}>
            <div style={{ background: "var(--surface, #fff)", borderRadius: 16, padding: 24, maxWidth: 540, width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,.25)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Vista previa — como lo ve una empresa</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={() => {
                    const win = window.open("", "_blank");
                    if (!win) return;
                    win.document.write(`<!DOCTYPE html><html><head><title>Perfil ${profileCode}</title><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#111}.code{background:#f3f4f6;padding:3px 8px;border-radius:4px;font-size:12px;font-family:monospace}.chips span{display:inline-block;background:#e0e7ff;color:#3730a3;padding:2px 10px;border-radius:20px;font-size:12px;margin:3px}.lock{background:#f3f4f6;padding:10px 14px;border-radius:8px;font-size:12px;color:#666;margin-top:16px}@media print{button{display:none}}</style></head><body>
                    <span class="code">${profileCode}</span>
                    <h2 style="margin:8px 0 4px">${form.headline || "Sin título"}</h2>
                    <p style="color:#666;font-size:13px">${form.region}${form.city ? ` · ${form.city}` : ""}</p>
                    ${form.salaryMin && form.salaryMax ? `<p><strong>$${Number(form.salaryMin).toLocaleString("es-CL")} – $${Number(form.salaryMax).toLocaleString("es-CL")} CLP</strong></p>` : ""}
                    <p style="font-size:14px;line-height:1.7">${form.summary || ""}</p>
                    <div class="chips">${form.skills.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => `<span>${s}</span>`).join("")}</div>
                    <div class="lock">🔒 Datos de contacto bloqueados — requieren desbloqueo pagado.</div>
                    <script>window.print();<\/script></body></html>`);
                    win.document.close();
                  }}>🖨 Imprimir / PDF</button>
                  <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={() => setShowAnonPreview(false)}>✕ Cerrar</button>
                </div>
              </div>
              <span className="profileCode">{profileCode}</span>
              <h2 style={{ margin: "8px 0 4px", fontSize: 18 }}>{form.headline || "Sin título"}</h2>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 12px" }}>{form.region}{form.city ? ` · ${form.city}` : ""} · {form.workMode === "remote" ? "Remoto" : form.workMode === "hybrid" ? "Híbrido" : "Presencial"}</p>
              {form.salaryMin && form.salaryMax && (
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>
                  ${Number(form.salaryMin).toLocaleString("es-CL")} – ${Number(form.salaryMax).toLocaleString("es-CL")} CLP
                </p>
              )}
              <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{form.summary || "Sin resumen aún."}</p>
              <div className="chips">
                {form.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <span key={s}>{s}</span>)}
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--muted-bg, #f3f4f6)", borderRadius: 8, fontSize: 12, color: "var(--muted)" }}>
                🔒 Nombre, teléfono y email están bloqueados. La empresa debe pagar el desbloqueo para verlos.
              </div>
            </div>
          </div>
        )}

        {/* Skeleton loader al cambiar de pestaña */}
        {loadingTab ? (
          <div className="formSurface" aria-busy="true" aria-label="Cargando contenido">
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ height: 40, background: "var(--line, #e5e7eb)", borderRadius: 8, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite", opacity: 0.6 - i * 0.1 }} />
            ))}
          </div>
        ) : null}

        {activeView === "profile" && !loadingTab ? (
        <form className="formSurface" onSubmit={handleSubmit}>
          <div className="formHeader">
            <FileText size={24} aria-hidden="true" />
            <div>
              <h2>Perfil público</h2>
              <p>Esta información aparece en las búsquedas de empresas.</p>
            </div>
            <button
              type="button"
              className="button ghost"
              style={{ fontSize: 12, marginLeft: "auto" }}
              onClick={() => setShowAnonPreview(true)}
              aria-label="Ver perfil como lo ve una empresa"
            >
              👁 Vista previa
            </button>
            <div className="completenessInline">
              <div className="completenessBarMini">
                <div className="completenessBarFill" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span>{profileCompletion}%</span>
            </div>
          </div>
          <div className="formGrid">
            <label>
              Título laboral
              <input value={form.headline} onChange={(event) => update("headline", event.target.value)} required />
            </label>
            <label>
              Región
              <select value={form.region} onChange={(event) => handleRegiónChange(event.target.value)} required>
                {chileRegions.map((region) => (
                  <option key={region.name} value={region.name}>{region.name}</option>
                ))}
              </select>
            </label>
            <label>
              Comuna
              <select value={form.city} onChange={(event) => update("city", event.target.value)} required>
                {selectedRegión.communes.map((commune) => (
                  <option key={commune} value={commune}>{commune}</option>
                ))}
              </select>
            </label>
            <label>
              Area
              <select value={form.area} onChange={(event) => update("area", event.target.value)} required>
                {jobAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label>
              Nivel de experiencia
              <select value={form.seniority} onChange={(event) => update("seniority", event.target.value)} required>
                {seniorityLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            <label>
              Años de experiencia
              <input value={form.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} inputMode="numeric" required />
            </label>
            <label>
              Modalidad
              <select value={form.workMode} onChange={(event) => update("workMode", event.target.value)} required>
                <option value="hybrid">Híbrido</option>
                <option value="remote">Remoto</option>
                <option value="onsite">Presencial</option>
              </select>
            </label>
            <label>
              Disponibilidad
              <select value={form.availability} onChange={(event) => update("availability", event.target.value)} required>
                <option value="actively_looking">Buscando activamente</option>
                <option value="listening">Escucho ofertas</option>
                <option value="unavailable">No disponible temporalmente</option>
              </select>
            </label>
            <label>
              Renta mínima CLP
              <input
                value={form.salaryMin}
                onChange={(event) => update("salaryMin", event.target.value)}
                onBlur={(event) => { const f = formatClp(event.target.value); if (f) update("salaryMin", f.replace(/\./g, "")); }}
                placeholder="Ej: 800000"
                inputMode="numeric"
                required
              />
              <span className="fieldHint">Entre $400.000 y $15.000.000</span>
            </label>
            <label>
              Renta máxima CLP
              <input
                value={form.salaryMax}
                onChange={(event) => update("salaryMax", event.target.value)}
                onBlur={(event) => { const f = formatClp(event.target.value); if (f) update("salaryMax", f.replace(/\./g, "")); }}
                placeholder="Ej: 1200000"
                inputMode="numeric"
                required
              />
              {form.salaryMin && form.salaryMax && Number(form.salaryMin) > 0 && Number(form.salaryMax) > 0 && (
                <span className="fieldHint">
                  Rango: ${Number(form.salaryMin).toLocaleString("es-CL")} – ${Number(form.salaryMax).toLocaleString("es-CL")}
                </span>
              )}
            </label>
            <label className="wide">
              Habilidades (separadas por coma)
              <input
                value={form.skills}
                onChange={(event) => update("skills", event.target.value)}
                placeholder="Ej: Excel avanzado, Python, Atención al cliente, Inglés B2"
                required
              />
              {form.skills && (
                <span className="fieldHint">
                  {form.skills.split(",").filter((s) => s.trim()).length} habilidades ingresadas
                  {form.skills.split(",").filter((s) => s.trim()).length < 3 && " · agrega al menos 3 para mejor visibilidad"}
                </span>
              )}
              {filteredSkillSuggestions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>Sugerencias:</span>
                  {filteredSkillSuggestions.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="button ghost"
                      style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100 }}
                      onClick={() => {
                        const current = form.skills.trim();
                        update("skills", current ? `${current}, ${s}` : s);
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </label>
            <label className="wide">
              Resumen profesional
              <textarea
                value={form.summary}
                onChange={(event) => update("summary", event.target.value)}
                required
                maxLength={600}
                placeholder="Describe tu experiencia, logros principales y qué valor puedes aportar."
              />
              <span className="fieldHint" style={{ textAlign: "right" }}>{form.summary.length}/600 caracteres</span>
            </label>
            <label className="wide">
              CV formateado por IA
              <textarea value={form.formattedCv} onChange={(event) => update("formattedCv", event.target.value)} placeholder="Aquí aparecerá el CV estructurado después del análisis de IA." />
            </label>
          </div>

          {/* Idiomas */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>Idiomas</strong>
              <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={() => setLanguages((l) => [...l, { lang: "", level: "básico" }])}>+ Agregar idioma</button>
            </div>
            {languages.map((lg, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="Ej: Inglés, Francés…"
                  value={lg.lang}
                  onChange={(e) => setLanguages((prev) => prev.map((x, j) => j === i ? { ...x, lang: e.target.value } : x))}
                  style={{ fontSize: 13 }}
                />
                <select
                  value={lg.level}
                  onChange={(e) => setLanguages((prev) => prev.map((x, j) => j === i ? { ...x, level: e.target.value } : x))}
                  style={{ fontSize: 13 }}
                >
                  <option value="básico">Básico (A1-A2)</option>
                  <option value="intermedio">Intermedio (B1-B2)</option>
                  <option value="avanzado">Avanzado (C1-C2)</option>
                  <option value="nativo">Nativo</option>
                </select>
                <button type="button" className="button ghost" style={{ fontSize: 12 }} aria-label="Eliminar idioma" onClick={() => setLanguages((prev) => prev.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>

          {/* Educación */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>Educación</strong>
              <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={() => setEducation((e) => [...e, { level: "universitaria", institution: "", year: "" }])}>+ Agregar</button>
            </div>
            {education.map((ed, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const from = Number(e.dataTransfer.getData("text/plain")); setEducation((prev) => reorder(prev, from, i)); }}
                style={{ display: "grid", gridTemplateColumns: "16px 1fr 1.5fr 80px auto", gap: 8, marginBottom: 8, cursor: "grab" }}
              >
                <span aria-hidden="true" style={{ fontSize: 14, color: "var(--muted)", alignSelf: "center" }}>⠿</span>
                <select value={ed.level} onChange={(e) => setEducation((prev) => prev.map((x, j) => j === i ? { ...x, level: e.target.value } : x))} style={{ fontSize: 13 }}>
                  <option value="basica">Básica</option>
                  <option value="media">Media</option>
                  <option value="tecnica">Técnica</option>
                  <option value="universitaria">Universitaria</option>
                  <option value="postgrado">Posgrado</option>
                </select>
                <input placeholder="Institución" value={ed.institution} onChange={(e) => setEducation((prev) => prev.map((x, j) => j === i ? { ...x, institution: e.target.value } : x))} style={{ fontSize: 13 }} />
                <input placeholder="Año" value={ed.year} onChange={(e) => setEducation((prev) => prev.map((x, j) => j === i ? { ...x, year: e.target.value } : x))} inputMode="numeric" style={{ fontSize: 13 }} />
                <button type="button" className="button ghost" style={{ fontSize: 12 }} aria-label="Eliminar educación" onClick={() => setEducation((prev) => prev.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            {education.length === 0 && <p style={{ fontSize: 12, color: "var(--muted)" }}>Agrega tu formación académica para aumentar el score del perfil.</p>}
          </div>

          <div className="privateSectionHeader">
            <Lock size={16} aria-hidden="true" />
            <strong>Datos privados</strong>
            <span>Solo visibles para ti y para empresas que paguen el desbloqueo de contacto.</span>
          </div>
          <div className="formGrid privateFields">
            <label>
              Nombre completo (privado)
              <input
                value={form.legalName}
                onChange={(event) => update("legalName", event.target.value)}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                placeholder="Ej: María González Pérez"
              />
            </label>
            <label>
              RUT (privado)
              <input
                value={form.rut ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  update("rut", raw);
                }}
                placeholder="12.345.678-9"
                inputMode="numeric"
              />
              {form.rut && (() => {
                const cleaned = (form.rut as string).replace(/[.\-\s]/g, "").toUpperCase();
                const valid = /^\d{7,8}[0-9K]$/.test(cleaned) && (() => {
                  const body = cleaned.slice(0, -1);
                  const dv = cleaned.slice(-1);
                  let sum = 0, factor = 2;
                  for (let i = body.length - 1; i >= 0; i--) { sum += parseInt(body[i]) * factor; factor = factor === 7 ? 2 : factor + 1; }
                  const rem = 11 - (sum % 11);
                  return dv === (rem === 11 ? "0" : rem === 10 ? "K" : String(rem));
                })();
                return <span className="fieldHint" style={{ color: valid ? "#16a34a" : "#dc2626" }}>{valid ? "✓ RUT válido" : "RUT inválido — revisa el dígito verificador"}</span>;
              })()}
            </label>
            <label>
              Teléfono (privado)
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="+56 9 XXXX XXXX"
                inputMode="tel"
                type="tel"
                autoComplete="tel"
                enterKeyHint="next"
              />
              <span className="fieldHint">Solo visible tras desbloqueo de contacto pagado</span>
            </label>
            <label className="wide">
              Portafolio o LinkedIn (URL)
              <input
                value={form.portfolio}
                onChange={(event) => update("portfolio", event.target.value)}
                type="url"
                placeholder="https://linkedin.com/in/tu-perfil"
              />
              {form.portfolio && (
                <a href={form.portfolio} target="_blank" rel="noopener noreferrer" className="fieldHint" style={{ color: "var(--accent)" }}>
                  Verificar enlace →
                </a>
              )}
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="submit">
              Guardar perfil
              <CheckCircle2 size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
        ) : null}


        {activeView === "cover" && !loadingTab ? (
          <section className="formSurface coverLetterSurface">
            <div className="formHeader">
              <PenLine size={24} aria-hidden="true" />
              <div>
                <h2>Carta de presentación</h2>
                <p>Crea una carta breve, profesional y editable usando los datos de tu perfil.</p>
              </div>
            </div>
            <div className="coverLetterLayout">
              <article className="coverLetterPreview">
                <span className="smallLabel">Perfil base</span>
                <h3>{form.headline}</h3>
                <p>{form.summary}</p>
                <div className="chips">
                  {form.skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 6).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </article>
              <label className="wide">
                Carta editable
                <textarea
                  className="coverLetterText"
                  value={form.coverLetter}
                  onChange={(event) => update("coverLetter", event.target.value)}
                  placeholder="Genera una carta o escribe aquí tu presentación profesional."
                />
              </label>
            </div>
            <div className="actions">
              <button className="button primary" type="button" onClick={generateCoverLetter}>
                <PenLine size={18} aria-hidden="true" />
                Crear carta
              </button>
              <button className="button secondary" type="button" onClick={handleSaveCoverLetter}>
                Guardar carta en mi perfil
              </button>
              {form.coverLetter && (
                <button className="button ghost" type="button" onClick={handleCopyCover}>
                  {copiedCover ? "✓ Copiada" : "Copiar texto"}
                </button>
              )}
            </div>
            {form.coverLetter && (
              <p className="fieldHint" style={{ textAlign: "right" }}>{form.coverLetter.length} caracteres · ~{Math.ceil(form.coverLetter.length / 5)} palabras</p>
            )}
            {status ? <p className="statusText">{status}</p> : null}
          </section>
        ) : null}

        {activeView === "tests" && !loadingTab ? (
        <section className="formSurface">
          <div className="assessmentIntro">
            <h2>Tests opcionales</h2>
            <p>
              No son obligatorios para crear perfil. Si los completas, sus resultados quedarán junto a tu perfil,
              CV y datos privados para que una empresa verificada tenga más señales antes de entrevistarte.
            </p>
          </div>
        <AssessmentTests scores={scores} attemptCounts={attemptCounts} onChange={handleScoresChange} />
        </section>
        ) : null}

        {activeView === "interview" && !loadingTab ? (
        <section className="formSurface">
          <div className="formHeader">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <h2>Invitaciones recibidas</h2>
              <p>Acepta solo oportunidades con sueldo y condiciones claras.</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {(["all", "pending", "accepted"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`button ${invitationFilter === f ? "primary" : "secondary"}`}
                style={{ fontSize: 12, padding: "4px 12px" }}
                onClick={() => setInvitationFilter(f)}
              >
                {f === "all" ? `Todas (${invitations.length})` : f === "pending" ? `Nuevas (${pendingInvitations})` : "En proceso"}
              </button>
            ))}
          </div>
          <div className="results">
            {activeInvitations.length ? (
              activeInvitations.map((invitation) => (
                <article className="resultCard" key={invitation.invitationId}>
                  <div>
                    <div className="resultCardTop">
                      <span className="profileCode">{invitation.status}</span>
                      {invitation.companyVerified && (
                        <span className="companyTrustBadge">
                          ✓ Empresa verificada
                          {(invitation.companyHiredCount ?? 0) > 0 && (
                            <span className="trustHiredCount">
                              · {invitation.companyHiredCount} {invitation.companyHiredCount === 1 ? "contratación" : "contrataciones"} exitosas
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <h2>{invitation.opportunityTitle}</h2>
                    {invitation.decisionDeadline && (() => {
                      const deadline = new Date(invitation.decisionDeadline as string);
                      const days = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
                      const urgency = days <= 2 ? "urgent" : days <= 5 ? "soon" : "normal";
                      return days > 0 ? (
                        <span className={`urgencyBadge ${urgency}`}>
                          ⏱ Decisión antes del {deadline.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" })}
                          {days <= 5 && ` · ${days} día${days === 1 ? "" : "s"}`}
                        </span>
                      ) : null;
                    })()}
                    <p>
                      ${invitation.salaryMin.toLocaleString("es-CL")} – ${invitation.salaryMax.toLocaleString("es-CL")} · {invitation.workMode}
                    </p>
                  </div>
                  <button
                    className="button secondary"
                    disabled={invitation.status === "accepted"}
                    type="button"
                    onClick={() => handleAcceptInvitation(invitation.invitationId)}
                  >
                    Aceptar
                  </button>
                  <button className="button secondary" type="button" onClick={() => { setActiveInvitationId(invitation.invitationId); setActiveView("interview"); }}>
                    Abrir entrevista
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    aria-label="Archivar invitación"
                    style={{ fontSize: 11, color: "var(--muted)" }}
                    onClick={() => setArchivedInvitations((prev) => { const next = new Set(prev); next.add(invitation.invitationId); return next; })}
                  >
                    Archivar
                  </button>
                </article>
              ))
            ) : (
              <div className="emptyState" style={{ textAlign: "center" }}>
                <p>{archivedInvitations.size > 0 ? `${archivedInvitations.size} invitación(es) archivada(s). ` : ""}{invitationFilter !== "all" ? "Sin invitaciones en este filtro." : "Cuando una empresa te invite, aparecerá aquí."}</p>
                {(invitationFilter !== "all" || archivedInvitations.size > 0) && (
                  <button className="button ghost" type="button" onClick={() => { setInvitationFilter("all"); setArchivedInvitations(new Set()); }} style={{ marginTop: 6, fontSize: 12 }}>
                    Mostrar todas
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
        ) : null}

        {activeView === "interview" && !loadingTab ? (
        <section className="formSurface">
          <div className="formHeader">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <h2>Mensajes del proceso</h2>
              <p>Responde sin entregar tus datos privados antes de decidir.</p>
            </div>
          </div>
          {activeInvitation ? (
            <InterviewRulesCard
              accepted={Boolean(activeInvitation.interviewRulesAccepted?.worker)}
              otherAccepted={Boolean(activeInvitation.interviewRulesAccepted?.company)}
              role="worker"
              onAccept={handleAcceptInterviewRules}
            />
          ) : null}
          <div className="messageList">
            {messages.length ? (
              <>
                {messages.length > msgPage * 20 && (
                  <button type="button" className="button ghost" style={{ display: "block", margin: "0 auto 8px", fontSize: 12 }} onClick={() => setMsgPage((p) => p + 1)}>
                    ↑ Cargar mensajes anteriores ({messages.length - msgPage * 20} más)
                  </button>
                )}
                {messages.slice(Math.max(0, messages.length - msgPage * 20)).map((message) => (
                  <div className={`messageBubble ${message.senderRole}`} key={message.messageId}>
                    <strong>{message.senderRole === "company" ? "Empresa" : message.senderRole === "worker" ? "Tú" : "Sistema"}</strong>
                    <p>{message.body}</p>
                  </div>
                ))}
              </>
            ) : <p className="emptyState">Selecciona una invitación para ver la conversación.</p>}
            <div ref={messagesEndRef} />
          </div>
          {!interviewReady && activeInvitation ? (
            <p className="paymentLockNotice">La entrevista se habilita cuando empresa y postulante aceptan las reglas.</p>
          ) : null}
          <div className="messageComposer">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="button ghost"
                style={{ fontSize: 11, marginBottom: 4 }}
                onClick={() => setShowQuickReplies((p) => !p)}
              >
                Respuestas rápidas ▾
              </button>
              {showQuickReplies && (
                <div style={{ position: "absolute", bottom: "100%", left: 0, background: "var(--surface, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, padding: 8, zIndex: 20, minWidth: 300, boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}>
                  {QUICK_REPLIES.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      className="button ghost"
                      style={{ display: "block", width: "100%", textAlign: "left", fontSize: 12, padding: "6px 8px", borderRadius: 6 }}
                      onClick={() => { setMessageBody(r); setShowQuickReplies(false); }}
                    >
                      {r.slice(0, 65)}…
                    </button>
                  ))}
                </div>
              )}
            </div>
            <textarea
              aria-label="Escribe tu respuesta"
              placeholder="Escribe tu mensaje aquí... (Ctrl+Enter para enviar)"
              value={messageBody}
              onChange={(event) => setMessageBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && interviewReady && messageBody.trim()) {
                  event.preventDefault();
                  handleWorkerMessage();
                }
              }}
            />
            <button className="button primary" disabled={!interviewReady || !messageBody.trim()} type="button" onClick={handleWorkerMessage}>Responder</button>
          </div>
          {activeInvitation ? (
            <div className="formGrid">
              <label>
                Seriedad de la empresa
                <select value={companyReview.score} onChange={(event) => setCompanyReview((current) => ({ ...current, score: event.target.value }))}>
                  <option value="5">5 - Muy seria</option>
                  <option value="4">4 - Seria</option>
                  <option value="3">3 - Correcta</option>
                  <option value="2">2 - Poco clara</option>
                  <option value="1">1 - No recomendable</option>
                </select>
              </label>
              <label className="wide">
                Opinión del proceso
                <textarea value={companyReview.comment} onChange={(event) => setCompanyReview((current) => ({ ...current, comment: event.target.value }))} />
              </label>
              <button className="button secondary" type="button" onClick={handleReviewCompany}>Evaluar empresa</button>
            </div>
          ) : null}
        </section>
        ) : null}

        {activeView === "billing" && !loadingTab ? (
          <>
          <section className="comparisonTable">
            <div className="formHeader">
              <CheckCircle2 size={22} aria-hidden="true" />
              <div>
                <h2>Estado de pagos</h2>
                <p>Tu visibilidad se activa 30 días después de confirmar el pago.</p>
              </div>
            </div>
            {payments.length > 0 && (
              <div className="dashboardGrid" style={{ marginBottom: 12 }}>
                <article>
                  <span className="smallLabel">Total pagado</span>
                  <strong>${payments.filter((p) => p.status === "paid").reduce((acc, p) => acc + p.amount, 0).toLocaleString("es-CL")}</strong>
                  <p>CLP confirmado</p>
                </article>
                <article>
                  <span className="smallLabel">Pagos realizados</span>
                  <strong>{payments.filter((p) => p.status === "paid").length}</strong>
                  <p>de {payments.length} totales</p>
                </article>
              </div>
            )}
            <div className="paymentList">
              {payments.length ? payments.map((payment) => {
                const raw = payment as unknown as { createdAt?: { seconds: number } | string };
                const dateStr = raw.createdAt
                  ? (typeof raw.createdAt === "string"
                      ? new Date(raw.createdAt).toLocaleDateString("es-CL")
                      : new Date((raw.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("es-CL"))
                  : null;
                return (
                <article key={payment.paymentId}>
                  <strong>${payment.amount.toLocaleString("es-CL")} {payment.currency}</strong>
                  <span>{payment.paymentType === "worker_subscription" ? "Suscripción 30 días" : payment.paymentType}</span>
                  <span className={payment.status === "paid" ? "statusBadgePaid" : ""}>{payment.status === "paid" ? "✓ Pagado" : payment.status}</span>
                  {dateStr && <span style={{ fontSize: 11, color: "var(--muted)" }}>{dateStr}</span>}
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>{(payment.providerPaymentId || payment.paymentId).slice(0, 14)}…</span>
                </article>
                );
              }) : (
                <p className="emptyState">Sin pagos registrados aún. Una vez confirmado, tu perfil será visible por 30 días.</p>
              )}
            </div>
          </section>

          {/* Reactivar perfil */}
          {profileState.subscriptionStatus !== "active" && (
            <section className="formSurface" style={{ marginTop: 12 }}>
              <div className="formHeader">
                <CheckCircle2 size={22} aria-hidden="true" />
                <div>
                  <h2>Reactivar perfil</h2>
                  <p>Tu perfil no está activo. Reactivar lo hace visible durante 30 días adicionales.</p>
                </div>
              </div>
              <button
                type="button"
                className="button primary"
                disabled={reactivating}
                onClick={async () => {
                  setReactivating(true);
                  try {
                    const r = await reactivateWorkerProfile();
                    setStatus(`Perfil reactivado. Visible hasta ${new Date(r.expiresAt).toLocaleDateString("es-CL")}.`);
                    setProfileState((prev) => ({ ...prev, subscriptionStatus: "active", visibilityStatus: "visible" }));
                  } catch (e: unknown) {
                    setStatus((e as Error).message || "Error al reactivar.");
                  } finally {
                    setReactivating(false);
                  }
                }}
              >
                {reactivating ? "Reactivando…" : "Reactivar perfil (admin o pago previo)"}
              </button>
              <p className="helperText" style={{ marginTop: 6 }}>La reactivación la puede hacer un administrador o se activa automáticamente tras un pago confirmado.</p>
            </section>
          )}

          {/* Notificaciones push */}
          <section className="formSurface" style={{ marginTop: 12 }}>
            <div className="formHeader">
              <CheckCircle2 size={22} aria-hidden="true" />
              <div>
                <h2>Notificaciones push</h2>
                <p>Recibe alertas cuando una empresa te invite o haya novedades en tu proceso.</p>
              </div>
            </div>
            {pushStatus === "subscribed" ? (
              <p style={{ color: "var(--success, green)", fontWeight: 600 }}>✓ Notificaciones activadas en este dispositivo.</p>
            ) : pushStatus === "denied" ? (
              <p style={{ color: "var(--error, red)" }}>Permiso denegado. Habilita las notificaciones en la configuración de tu navegador.</p>
            ) : (
              <button
                type="button"
                className="button secondary"
                disabled={pushStatus === "loading"}
                onClick={async () => {
                  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
                    setStatus("Tu navegador no soporta notificaciones push.");
                    return;
                  }
                  setPushStatus("loading");
                  try {
                    const reg = await navigator.serviceWorker.ready;
                    const sub = await reg.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: "BEBVXn8vVLU2osppPkVqWZH1XrCxCAbJQf0VlKQzKNVzBIh_jRd4b5U9pJK8yJOUyQbabIeEMdY7r2PQJsZ8BIE"
                    });
                    await savePushSubscription(sub.toJSON());
                    setPushStatus("subscribed");
                  } catch {
                    setPushStatus("denied");
                  }
                }}
              >
                {pushStatus === "loading" ? "Activando…" : "Activar notificaciones"}
              </button>
            )}
          </section>

          {publicProfileLink && (
            <section className="formSurface" style={{ marginTop: 12 }}>
              <div className="formHeader">
                <EyeOff size={22} aria-hidden="true" />
                <div>
                  <h2>Enlace público de perfil</h2>
                  <p>Comparte tu perfil anónimo para que empresas puedan encontrarte directamente.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <code style={{ fontSize: 12, background: "var(--muted-bg, #f3f4f6)", padding: "6px 10px", borderRadius: 6, flex: 1, wordBreak: "break-all" }}>
                  {publicProfileLink}
                </code>
                <button
                  className="button secondary"
                  type="button"
                  onClick={async () => { await copyText(publicProfileLink); setCopiedPublicLink(true); setTimeout(() => setCopiedPublicLink(false), 2000); }}
                >
                  {copiedPublicLink ? "✓ Copiado" : "Copiar enlace"}
                </button>
              </div>
              <p className="helperText" style={{ marginTop: 6 }}>El enlace no revela tu nombre ni datos privados. Solo muestra tu resumen profesional y habilidades.</p>
              <div style={{ marginTop: 12, display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                {/* QR sin librería — API pública */}
                <div style={{ textAlign: "center" }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(publicProfileLink)}&size=120x120&margin=4`}
                    alt={`Código QR de perfil ${profileCode}`}
                    width={120}
                    height={120}
                    style={{ borderRadius: 8, border: "1px solid var(--border, #e5e7eb)" }}
                  />
                  <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Escanear para abrir perfil</p>
                </div>
                <div>
                  <p style={{ fontSize: 13, margin: "0 0 8px" }}>Puedes imprimir o compartir este QR para que empresas encuentren tu perfil directamente.</p>
                  <button
                    type="button"
                    className="button ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      const win = window.open("", "_blank");
                      if (!win) return;
                      win.document.write(`<html><body style="text-align:center;font-family:sans-serif;padding:40px"><h2>Perfil Primero — ${profileCode}</h2><img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(publicProfileLink)}&size=250x250&margin=8" width="250" height="250"/><p style="margin-top:16px;font-size:14px">${publicProfileLink}</p><script>window.print();<\/script></body></html>`);
                      win.document.close();
                    }}
                  >
                    🖨 Imprimir QR
                  </button>
                </div>
              </div>
            </section>
          )}

          {referralCode ? (
            <section className="formSurface referralSection">
              <div className="formHeader">
                <CheckCircle2 size={22} aria-hidden="true" />
                <div>
                  <h2>Tu código de referido</h2>
                  <p>Comparte tu enlace y ayuda a otras personas a encontrar trabajo con sueldo claro.</p>
                </div>
              </div>
              <div className="referralCodeBlock">
                <span className="referralCodeLabel">Tu código personal</span>
                <strong className="referralCodeValue">{referralCode}</strong>
                <a
                  className="referralLink"
                  href={`https://perfil-primero.web.app/r?ref=${referralCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  perfil-primero.web.app/r?ref={referralCode}
                </a>
                <button className="button secondary" type="button" onClick={handleCopyReferral} style={{ marginTop: 6 }}>
                  {copiedRef ? "✓ Enlace copiado" : "Copiar enlace de referido"}
                </button>
                <p className="helperText">Cuando alguien se registra con tu enlace, aparece vinculado a tu cuenta. Próximamente se habilitarán beneficios por referido.</p>
              </div>
            </section>
          ) : null}
          </>
        ) : null}

        {activeView === "herramientas" && !loadingTab ? (
          <section className="stack">
            <div className="formHeader">
              <PenLine size={22} aria-hidden="true" />
              <div>
                <h2>Herramientas de perfil</h2>
                <p>Completitud de tu perfil, programa de referidos y benchmark salarial.</p>
              </div>
            </div>
            <ProfileCompletionCard />
            <div style={{ marginTop: 12 }}>
              <ReferralPanel />
            </div>
          </section>
        ) : null}

        {activeView === "notificaciones" && !loadingTab ? (
          <section className="stack">
            <div className="formHeader">
              <CheckCircle2 size={22} aria-hidden="true" />
              <div>
                <h2>Preferencias de notificaciones</h2>
                <p>Elige qué alertas quieres recibir por email y push.</p>
              </div>
            </div>
            <NotificationPreferencesPanel />
          </section>
        ) : null}
      </div>

      <aside className="summaryCard">
        {/* Subida y análisis de CV */}
        <section className="sidePanel">
          <div className="sidePanelHeader">
            <UploadCloud size={16} aria-hidden="true" />
            <strong>CV con IA</strong>
          </div>
          <div className="uploadZone">
            <input
              accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain"
              type="file"
              onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
            />
          </div>
          {cvFile ? <p className="helperText">📄 {cvFile.name}</p> : null}
          <button className="button secondary full" type="button" onClick={handleCvAnalysis} disabled={cvAnalyzing}>
            <UploadCloud size={15} aria-hidden="true" />
            {cvAnalyzing ? cvStep || "Procesando..." : "Analizar con IA"}
          </button>
          {cvAnalyzing && (
            <div className="cvAnalyzingBar" role="status" aria-live="polite">
              <span className="cvAnalyzingDot" />
              <span>{cvStep}</span>
            </div>
          )}
          {cvUrl && !cvAnalyzing ? <p className="helperText">CV cargado ✓</p> : null}
        </section>

        {/* Mejora de perfil con IA */}
        <AiProfileAdvisor
          headline={form.headline}
          summary={form.summary}
          skills={form.skills}
          onApply={(nextSummary) => {
            update("summary", nextSummary);
            setStatus("Mejora aplicada. Guarda el perfil para conservarla.");
          }}
        />

        {status ? <p className="statusText">{status}</p> : null}
      </aside>
    </section>
    </>
  );
}


function mapSeniority(level: string): "junior" | "mid" | "senior" | "lead" {
  if (level.includes("Senior") || level.includes("Jefe")) return "senior";
  if (level.includes("Gerencia")) return "lead";
  if (level.includes("Junior") || level.includes("Trainee") || level.includes("Sin Experiencia")) return "junior";
  return "mid";
}

function reverseMapSeniority(level?: string): string {
  if (!level) return "";
  if (level === "junior") return "Junior / Trainee";
  if (level === "senior") return "Senior";
  if (level === "lead") return "Gerencia / Lead";
  return "Semi-Senior";
}

