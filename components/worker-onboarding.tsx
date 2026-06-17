"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { CheckCircle2, EyeOff, FileText, Lock, PenLine, UploadCloud } from "lucide-react";
import { AuthCard } from "./auth-card";
import { AiProfileAdvisor } from "./ai-profile-advisor";
import { MercadoPagoIcon } from "./brand-icons";
import { AssessmentTests } from "./assessment-tests";
import { InterviewRulesCard } from "./company-workspace";
import { chileRegions, jobAreas, seniorityLevels } from "@/lib/domain/catalogs";
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

const steps = ["Cuenta", "CV + IA", "Perfil publico", "Tests", "Activacion"];

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
  const [form, setForm] = useState({
    headline: "Especialista en marketing digital",
    region: "Region Metropolitana",
    city: "Santiago",
    area: "Marketing y Publicidad",
    seniority: "Semi Sr",
    yearsExperience: "5",
    workMode: "hybrid",
    availability: "listening",
    salaryMin: "1200000",
    salaryMax: "1800000",
    skills: "Google Ads, GA4, Meta Ads",
    summary: "5 anos de experiencia en crecimiento digital para ecommerce y servicios.",
    cvAnalysisSummary: "",
    formattedCv: "",
    coverLetter: "",
    legalName: "",
    phone: "",
    portfolio: ""
  });

  const profileCode = useMemo(() => {
    if (!uid) return "P1-NUEVO";
    return `P1-${uid.slice(0, 4).toUpperCase()}`;
  }, [uid]);

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      setStatus("Pago recibido por Mercado Pago. La activacion se confirma cuando llegue el webhook aprobado.");
    }
    if (checkout === "pending") {
      setStatus("Mercado Pago dejo el pago pendiente. Revisaremos la confirmacion automaticamente.");
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
          setScores(publicProfile.assessmentScores ?? { english: 0, spanish: 0, personality: 0 });
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

  function handleRegionChange(regionName: string) {
    const nextRegion = chileRegions.find((region) => region.name === regionName) ?? chileRegions[0];
    setForm((current) => ({
      ...current,
      region: nextRegion.name,
      city: nextRegion.communes.includes(current.city) ? current.city : nextRegion.communes[0]
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

  const selectedRegion = chileRegions.find((region) => region.name === form.region) ?? chileRegions[0];
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
        setStatus("Revisa los anos de experiencia: debe ser un numero entre 0 y 60.");
        return;
      }

      await saveCurrentProfile(form, cvUrl);
      setStatus(profileState.subscriptionStatus === "active"
        ? "Perfil actualizado y sigue visible para empresas verificadas."
        : "Perfil guardado como borrador privado. Activa Mercado Pago para hacerlo visible por 30 dias.");
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
    setStatus("Sesion cerrada.");
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
    });
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
    setStatus("Carta de presentacion generada. Revisala, ajustala y guarda el perfil.");
  }

  async function handleSaveCoverLetter() {
    try {
      await saveCurrentProfile();
      setStatus("Carta de presentacion guardada en tu perfil.");
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
      setStatus("Selecciona una invitacion para responder.");
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
      setStatus("Selecciona una invitacion antes de aceptar la entrevista.");
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
      setStatus("Selecciona una invitacion antes de evaluar a la empresa.");
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
            tests ni entrevistas. Tu informacion laboral vive dentro de tu cuenta.
          </p>
          <div className="portalStatGrid">
            <div><strong>CV + IA</strong><span>perfil autollenado</span></div>
            <div><strong>Anonimato</strong><span>datos privados bloqueados</span></div>
            <div><strong>$999</strong><span>precio de prueba</span></div>
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
  const profileCompletion = Math.round(([
    form.headline,
    form.summary,
    form.skills,
    form.region,
    form.city,
    cvUrl || form.formattedCv,
    profileState.subscriptionStatus === "active"
  ].filter(Boolean).length / 7) * 100);
  const missingTests = [
    scores.english ? "" : "ingles",
    scores.spanish ? "" : "espanol",
    scores.personality ? "" : "personalidad"
  ].filter(Boolean).join(", ") || "ninguno";

  return (
    <section className="flowLayout">
      <aside className="steps">
        {steps.map((step, index) => (
          <div className="step" key={step}>
            <span>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </aside>

      <div className="stack">
        <section className="workspaceSessionBar">
          <div>
            <span className="smallLabel">Sesion postulante</span>
            <strong>{email || profileCode}</strong>
          </div>
          <button className="button secondary" type="button" onClick={handleLogout}>Cerrar sesion</button>
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

        <section className="commandHero workerCommandHero">
          <div className="commandHeroContent">
            <span className="smallLabel">Centro de visibilidad</span>
            <h2>Tu perfil trabaja por ti sin exponer tus datos privados.</h2>
            <p>
              Completa CV, carta y pruebas opcionales. Cuando actives tu visibilidad,
              las empresas verificadas veran una ficha clara, anonima y lista para invitarte.
            </p>
          </div>
          <div className="commandKpiGrid">
            <article className="commandKpi commandPrimary">
              <span>Preparacion</span>
              <strong>{profileCompletion}%</strong>
              <small>{profileCompletion >= 80 ? "Perfil competitivo" : "Faltan datos clave"}</small>
            </article>
            <article className="commandKpi">
              <span>Visibilidad</span>
              <strong>{profileState.subscriptionStatus === "active" ? "Activa" : "Privada"}</strong>
              <small>{profileState.visibilityStatus === "visible" ? "Apareces en busquedas" : "No apareces hasta pagar"}</small>
            </article>
            <article className="commandKpi">
              <span>Diferenciadores</span>
              <strong>{completedTests}/3</strong>
              <small>Tests completados</small>
            </article>
          </div>
        </section>

        {activeView === "profile" ? (
        <section className="dashboardGrid">
          <article>
            <span className="smallLabel">Datos manuales</span>
            <strong>{form.legalName || "Pendiente"}</strong>
            <p>{form.phone || "Telefono privado no informado"}</p>
          </article>
          <article>
            <span className="smallLabel">Estado de publicacion</span>
            <strong>{profileState.subscriptionStatus === "active" ? "Activo" : "No visible"}</strong>
            <p>{profileState.visibilityStatus === "visible" ? "Visible para empresas verificadas." : "Oculto hasta confirmar pago mensual."}</p>
          </article>
          <article>
            <span className="smallLabel">Perfil creado por IA</span>
            <strong>{cvUrl ? "CV analizado" : "Sin CV analizado"}</strong>
            <p>{form.cvAnalysisSummary || form.summary}</p>
          </article>
          <article>
            <span className="smallLabel">Tests opcionales</span>
            <strong>{completedTests}/3</strong>
            <p>Faltan: {missingTests}</p>
          </article>
        </section>
        ) : null}

        {activeView === "profile" ? (
        <form className="formSurface" onSubmit={handleSubmit}>
          <div className="formHeader">
            <UploadCloud size={24} aria-hidden="true" />
            <div>
              <h2>Curriculum inteligente</h2>
              <p>Sube tu CV y la IA extrae la informacion para crear tu perfil.</p>
            </div>
          </div>
          <div className="uploadZone">
            <input
              accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain"
              type="file"
              onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
            />
            <button className="button secondary" type="button" onClick={handleCvAnalysis}>
              <UploadCloud size={18} aria-hidden="true" />
              Analizar CV con Google IA
            </button>
          </div>
          {cvFile ? <p className="helperText">Archivo seleccionado: {cvFile.name}</p> : null}

          <div className="formHeader">
            <FileText size={24} aria-hidden="true" />
            <div>
              <h2>Perfil publico</h2>
              <p>Esta informacion aparece en las busquedas de empresas.</p>
            </div>
          </div>
          <div className="formGrid">
            <label>
              Titulo laboral
              <input value={form.headline} onChange={(event) => update("headline", event.target.value)} required />
            </label>
            <label>
              Region
              <select value={form.region} onChange={(event) => handleRegionChange(event.target.value)} required>
                {chileRegions.map((region) => (
                  <option key={region.name} value={region.name}>{region.name}</option>
                ))}
              </select>
            </label>
            <label>
              Comuna
              <select value={form.city} onChange={(event) => update("city", event.target.value)} required>
                {selectedRegion.communes.map((commune) => (
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
              Nivel laboral
              <select value={form.seniority} onChange={(event) => update("seniority", event.target.value)} required>
                {seniorityLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
            <label>
              Anos de experiencia
              <input value={form.yearsExperience} onChange={(event) => update("yearsExperience", event.target.value)} inputMode="numeric" required />
            </label>
            <label>
              Modalidad preferida
              <select value={form.workMode} onChange={(event) => update("workMode", event.target.value)} required>
                <option value="hybrid">Hibrido</option>
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
              Renta minima
              <input value={form.salaryMin} onChange={(event) => update("salaryMin", event.target.value)} required />
            </label>
            <label>
              Renta maxima
              <input value={form.salaryMax} onChange={(event) => update("salaryMax", event.target.value)} required />
            </label>
            <label className="wide">
              Habilidades
              <input value={form.skills} onChange={(event) => update("skills", event.target.value)} required />
            </label>
            <label className="wide">
              Resumen
              <textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} required />
            </label>
            <label className="wide">
              CV Perfil Primero generado por IA
              <textarea value={form.formattedCv} onChange={(event) => update("formattedCv", event.target.value)} placeholder="Aqui aparecera el curriculum con formato propio despues del analisis IA." />
            </label>
          </div>

          <div className="privateSectionHeader">
            <Lock size={16} aria-hidden="true" />
            <strong>Datos privados</strong>
            <span>Solo visibles para ti y para empresas que paguen el desbloqueo de contacto.</span>
          </div>
          <div className="formGrid privateFields">
            <label>
              Nombre legal
              <input value={form.legalName} onChange={(event) => update("legalName", event.target.value)} />
            </label>
            <label>
              Telefono
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
            <button className="button secondary" type="button" onClick={handleCheckout}>
              <MercadoPagoIcon />
              Activar por $999
            </button>
          </div>
          <label>
            Cupon de descuento
            <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="BIENVENIDA50" />
          </label>
          {status ? <p className="statusText">{status}</p> : null}
        </form>
        ) : null}

        {activeView === "cover" ? (
          <section className="formSurface coverLetterSurface">
            <div className="formHeader">
              <PenLine size={24} aria-hidden="true" />
              <div>
                <h2>Carta de presentacion</h2>
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
                  placeholder="Genera una carta o escribe aqui tu presentacion profesional."
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
            <h2>Tests opcionales para diferenciarte</h2>
            <p>
              No son obligatorios para crear perfil. Si los completas, sus resultados quedaran junto a tu perfil,
              CV y datos privados para que una empresa verificada tenga mas senales antes de entrevistarte.
            </p>
          </div>
        <AssessmentTests scores={scores} onChange={handleScoresChange} />
        </section>
        ) : null}

        {activeView === "profile" ? (
        <AiProfileAdvisor
          headline={form.headline}
          summary={form.summary}
          skills={form.skills}
          onApply={(nextSummary) => {
            update("summary", nextSummary);
            setStatus("Mejora aplicada al resumen. Guarda el perfil para persistir el cambio.");
          }}
        />
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
                    <span className="profileCode">{invitation.status}</span>
                    <h2>{invitation.opportunityTitle}</h2>
                    <p>
                      ${invitation.salaryMin.toLocaleString("es-CL")} - ${invitation.salaryMax.toLocaleString("es-CL")} - {invitation.workMode}
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
              <p className="emptyState">Cuando una empresa te invite, aparecera aqui.</p>
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
                <strong>{message.senderRole === "company" ? "Empresa" : message.senderRole === "worker" ? "Tu" : "Sistema"}</strong>
                <p>{message.body}</p>
              </div>
            )) : <p className="emptyState">Selecciona una invitacion para ver la conversacion.</p>}
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
                Opinion del proceso
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
              <p>Tu visibilidad se activa por 30 dias despues de Mercado Pago.</p>
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
                <p className="emptyState">Cuando Mercado Pago confirme tu activacion, tu perfil quedara visible para empresas verificadas.</p>
              )}
            </div>
          </section>
        ) : null}
      </div>

      <aside className="summaryCard">
        <span className="paymentBrand">
          <MercadoPagoIcon />
          Mercado Pago
        </span>
        <h2>Activacion</h2>
        <p>Perfil visible por 30 dias.</p>
        <strong>{profileState.subscriptionStatus === "active" ? "Activo" : "$999"}</strong>
        <div className="previewBox">
          <span className="profileCode">{profileCode}</span>
          <h3>{form.headline}</h3>
          <p>{form.skills}</p>
        </div>
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
