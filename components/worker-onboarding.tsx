"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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
  saveWorkerProfile,
  uploadWorkerCv
} from "@/lib/firebase/workers";
import type { ConversationMessage, Invitation } from "@/lib/domain/types";

const steps = ["Cuenta", "CV + IA", "Perfil público", "Carta", "Tests", "Activación"];

export function WorkerOnboarding() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [accessStatus, setAccessStatus] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeInvitationId, setActiveInvitationId] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [payments, setPayments] = useState<Array<{ paymentId: string; status: string; amount: number; currency: "CLP" | "USD"; paymentType: string; providerPaymentId?: string }>>([]);
  const [profileState, setProfileState] = useState({ visibilityStatus: "hidden", subscriptionStatus: "inactive" });
  const [messageBody, setMessageBody] = useState("");
  const [companyReview, setCompanyReview] = useState({ score: "5", comment: "" });
  const [activeView, setActiveView] = useState<"profile" | "cover" | "tests" | "interview" | "billing">("profile");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
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

  useEffect(() => {
    if (!activeInvitationId) return;
    const unsub = subscribeToMessages(activeInvitationId, setMessages);
    return () => unsub();
  }, [activeInvitationId]);

  useEffect(() => {
    if (!uid) return;
    const unsubscribeInvitations = subscribeToWorkerInvitations(uid, setInvitations);
    listWorkerPayments(uid).then(setPayments).catch(() => setStatus("No se pudieron cargar los pagos."));
    getWorkerProfile(uid)
      .then(({ publicProfile, privateProfile }) => {
        if (publicProfile) {
          setProfileState({
            visibilityStatus: publicProfile.visibilityStatus,
            subscriptionStatus: publicProfile.subscriptionStatus
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
      setStatus("Primero crea o inicia sesion.");
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

    setStatus("Subiendo CV y analizando con Google IA...");

    try {
      const uploadedUrl = await uploadWorkerCv(uid, cvFile);
      const base64 = await fileToBase64(cvFile);
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
        setStatus("CV subido y perfil base creado. La IA de Google no tiene cuota disponible ahora; dejamos un CV Perfil Primero editable y el analisis queda registrado como pendiente.");
        return;
      }

      setStatus(`CV analizado y perfil actualizado. ${analysis.cvAnalysisSummary || "Se genero un CV con formato Perfil Primero."}`);
    } catch (error) {
      setStatus(error instanceof Error ? sanitizeUserError(error.message) : "No se pudo analizar el CV.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uid) {
      setStatus("Primero crea o inicia sesion.");
      return;
    }

    setStatus("Guardando perfil...");

    try {
      const salaryMin = Number(form.salaryMin);
      const salaryMax = Number(form.salaryMax);
      const yearsExperience = Number(form.yearsExperience);
      if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin <= 0 || salaryMax <= 0 || salaryMin > salaryMax) {
        setStatus("Revisa la renta: debe ser numerica y la renta minima no puede superar la maxima.");
        return;
      }
      if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 60) {
        setStatus("Revisa los años de experiencia: debe ser un número entre 0 y 60.");
        return;
      }

      await saveCurrentProfile(form, cvUrl);
      setStatus(profileState.subscriptionStatus === "active"
        ? "Perfil actualizado y sigue visible para empresas verificadas."
        : "Perfil guardado como borrador privado. Activa Mercado Pago para hacerlo visible por 30 días.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar el perfil.");
    }
  }

  async function handleCheckout() {
    if (!uid) {
      setStatus("Primero inicia sesion.");
      return;
    }

    setStatus("Creando checkout...");

    try {
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

  function sanitizeUserError(message: string) {
    if (message.includes("{") || message.toLowerCase().includes("resource_exhausted") || message.toLowerCase().includes("quota")) {
      return "La IA de Google no tiene cuota disponible en este momento. Tu CV puede quedar subido y el perfil se puede completar manualmente mientras se ajusta la cuota.";
    }

    return message;
  }

  async function handleAcceptInvitation(invitationId: string) {
    setStatus("Aceptando invitacion...");

    try {
      await acceptInvitation(invitationId);
      setInvitations((current) =>
        current.map((invitation) =>
          invitation.invitationId === invitationId
            ? { ...invitation, status: "accepted" }
            : invitation
        )
      );
      setStatus("Invitacion aceptada. La empresa ya puede pagar el desbloqueo.");
      setActiveView("interview");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo aceptar la invitacion.");
    }
  }

  async function handleWorkerMessage() {
    if (!activeInvitationId) {
      setStatus("Selecciona una invitación para responder.");
      return;
    }

    try {
      const result = await sendConversationMessage(activeInvitationId, messageBody);
      setMessageBody("");
      setStatus(result.paymentRequired
        ? "El chat quedo bloqueado: la empresa esta realizando el pago para cerrar trato contigo."
        : "Mensaje enviado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
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
      setStatus("Evaluacion de empresa registrada.");
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
            Antes de iniciar sesion no mostramos formularios internos, invitaciones,
            tests ni entrevistas. Tu información laboral vive dentro de tu cuenta.
          </p>
          <div className="portalStatGrid">
            <div><strong>CV + IA</strong><span>perfil autollenado</span></div>
            <div><strong>Anonimato</strong><span>datos privados bloqueados</span></div>
            <div><strong>$999</strong><span>activación 30 días</span></div>
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

  return (
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
            <span className="profileCode">{profileCode}</span>
            <h3>{form.headline || "Sin título aún"}</h3>
            <p>{form.skills ? form.skills.split(",").slice(0, 3).join(", ") : "Sin habilidades aún"}</p>
          </div>
          <strong className="activationPrice">{profileState.subscriptionStatus === "active" ? "✓ Activo" : "$999 CLP"}</strong>
          <p className="helperText">Perfil visible 30 días para empresas verificadas.</p>
          {profileState.subscriptionStatus !== "active" ? (
            <button className="button primary full" type="button" onClick={handleCheckout}>
              <MercadoPagoIcon />
              Activar visibilidad
            </button>
          ) : null}
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

        {/* Estadísticas de visibilidad */}
        {profileState.subscriptionStatus === "active" && (
          <section className="sidePanel visibilityStats">
            <div className="sidePanelHeader">
              <strong>Tu visibilidad esta semana</strong>
            </div>
            <div className="statGrid">
              <div className="statItem">
                <span className="statNumber">
                  {/* We read this from Firestore analytics field loaded in getWorkerProfile */}
                  —
                </span>
                <span className="statLabel">Búsquedas donde apareciste</span>
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
          <button className="button secondary" type="button" onClick={handleLogout}>Cerrar sesión</button>
        </section>

        <div className="workspaceTabs" role="tablist" aria-label="Panel postulante">
          {[
            ["profile", "Perfil"],
            ["cover", "Carta"],
            ["tests", "Tests opcionales"],
            ["interview", "Entrevistas"],
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


        {activeView === "profile" ? (
        <form className="formSurface" onSubmit={handleSubmit}>
          <div className="formHeader">
            <FileText size={24} aria-hidden="true" />
            <div>
              <h2>Perfil público</h2>
              <p>Esta información aparece en las búsquedas de empresas.</p>
            </div>
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
              Seniority
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
              Renta mínima
              <input value={form.salaryMin} onChange={(event) => update("salaryMin", event.target.value)} required />
            </label>
            <label>
              Renta máxima
              <input value={form.salaryMax} onChange={(event) => update("salaryMax", event.target.value)} required />
            </label>
            <label className="wide">
              Habilidades (separadas por coma)
              <input value={form.skills} onChange={(event) => update("skills", event.target.value)} required />
            </label>
            <label className="wide">
              Resumen profesional
              <textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} required />
            </label>
            <label className="wide">
              CV formateado por IA
              <textarea value={form.formattedCv} onChange={(event) => update("formattedCv", event.target.value)} placeholder="Aquí aparecerá el CV estructurado después del análisis de IA." />
            </label>
          </div>

          <div className="privateSectionHeader">
            <Lock size={16} aria-hidden="true" />
            <strong>Datos privados</strong>
            <span>Solo visibles para ti y para empresas que paguen el desbloqueo de contacto.</span>
          </div>
          <div className="formGrid privateFields">
            <label>
              Nombre completo (privado)
              <input value={form.legalName} onChange={(event) => update("legalName", event.target.value)} />
            </label>
            <label>
              Teléfono (privado)
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </label>
            <label className="wide">
              Portafolio o LinkedIn
              <input value={form.portfolio} onChange={(event) => update("portfolio", event.target.value)} />
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


        {activeView === "cover" ? (
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
            </div>
            {status ? <p className="statusText">{status}</p> : null}
          </section>
        ) : null}

        {activeView === "tests" ? (
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

        {activeView === "interview" ? (
        <section className="formSurface">
          <div className="formHeader">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <h2>Invitaciones recibidas</h2>
              <p>Acepta solo oportunidades con sueldo y condiciones claras.</p>
            </div>
          </div>
          <div className="results">
            {invitations.length ? (
              invitations.map((invitation) => (
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
                </article>
              ))
            ) : (
              <p className="emptyState">Cuando una empresa te invite, aparecerá aquí.</p>
            )}
          </div>
        </section>
        ) : null}

        {activeView === "interview" ? (
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
            {messages.length ? messages.map((message) => (
              <div className={`messageBubble ${message.senderRole}`} key={message.messageId}>
                <strong>{message.senderRole === "company" ? "Empresa" : message.senderRole === "worker" ? "Tú" : "Sistema"}</strong>
                <p>{message.body}</p>
              </div>
            )) : <p className="emptyState">Selecciona una invitación para ver la conversación.</p>}
            <div ref={messagesEndRef} />
          </div>
          {!interviewReady && activeInvitation ? (
            <p className="paymentLockNotice">La entrevista se habilita cuando empresa y postulante aceptan las reglas.</p>
          ) : null}
          <div className="messageComposer">
            <textarea value={messageBody} onChange={(event) => setMessageBody(event.target.value)} />
            <button className="button primary" disabled={!interviewReady} type="button" onClick={handleWorkerMessage}>Responder</button>
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

        {activeView === "billing" ? (
          <section className="comparisonTable">
            <div className="formHeader">
              <CheckCircle2 size={22} aria-hidden="true" />
              <div>
                <h2>Estado de pagos</h2>
              <p>Tu visibilidad se activa 30 días después de confirmar el pago.</p>
              </div>
            </div>
            <div className="paymentList">
              {payments.length ? payments.map((payment) => (
                <article key={payment.paymentId}>
                  <strong>${payment.amount.toLocaleString("es-CL")}</strong>
                  <span>{payment.paymentType}</span>
                  <span>{payment.status}</span>
                  <span>{payment.providerPaymentId || payment.paymentId}</span>
                </article>
              )) : (
                <p className="emptyState">Sin pagos registrados aún. Una vez confirmado, tu perfil será visible.</p>
              )}
            </div>
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
          <button className="button secondary full" type="button" onClick={handleCvAnalysis}>
            <UploadCloud size={15} aria-hidden="true" />
            Analizar con IA
          </button>
          {cvUrl ? <p className="helperText">CV cargado ✓</p> : null}
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
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

function mapSeniority(level: string): "junior" | "mid" | "senior" | "lead" {
  if (level.includes("Senior") || level.includes("Jefe")) return "senior";
  if (level.includes("Gerencia")) return "lead";
  if (level.includes("Junior") || level.includes("Trainee") || level.includes("Sin Experiencia")) return "junior";
  return "mid";
}

