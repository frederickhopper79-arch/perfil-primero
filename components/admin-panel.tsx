"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  Star,
  Tag,
  Users,
  XCircle
} from "lucide-react";
import { loginWithEmail } from "@/lib/firebase/auth";
import { logout } from "@/lib/firebase/auth";
import { GoogleIcon } from "./brand-icons";
import {
  adminSearchUser,
  adminUpdateUser,
  approveManualTransfer,
  createCoupon,
  createManagedUser,
  exportAccountingCsv,
  generateMarketAnalyticsNow,
  getAdminDashboard,
  type AdminDashboard,
  updateBillingDocument,
  updateCompanyVerification,
  uploadMunicipalityLogo
} from "@/lib/firebase/admin";

type AdminView =
  | "summary"
  | "system-status"
  | "administration"
  | "companies"
  | "workers"
  | "offers"
  | "messages"
  | "payments"
  | "accounting"
  | "invoicing"
  | "coupons"
  | "interviews"
  | "urgency"
  | "reviews"
  | "security"
  | "audit"
  | "reports"
  | "pendientes"
  | "expertos"
  | "roadmap"
  | "changelog"
  | "tarifas"
  | "mrr"
  | "finanzas"
  | "exports"
  | "omil-impact"
  | "funnel";

type HealthCheckDoc = {
  status: "healthy" | "warning" | "degraded";
  issues: string[];
  warnings: string[];
  lastCheckedAt: { seconds: number } | null;
  checksRan: number;
};

const emptyDashboard: AdminDashboard = {
  summary: {
    companiesTotal: 0,
    workersTotal: 0,
    paymentsTotal: 0,
    paymentsPaid: 0,
    paymentsPending: 0,
    revenuePaidClp: 0,
    accountingPending: 0,
    couponsActive: 0,
    interviewsScheduled: 0,
    reviewsTotal: 0,
    reviewAverage: 0,
    auditEventsTotal: 0,
    securityAlerts: 0,
    companyStatusCounts: {},
    paymentStatusCounts: {},
    invitationStatusCounts: {},
    userRoleCounts: {},
    workerVisibilityCounts: {},
    offerStatusCounts: {},
    usersTotal: 0,
    jobOffersTotal: 0,
    jobOffersVisible: 0,
    messagesTotal: 0,
    contactUnlocksTotal: 0,
    emailRemindersTotal: 0,
    marketReportsTotal: 0
  },
  companies: [],
  workers: [],
  privateWorkers: [],
  users: [],
  jobOffers: [],
  messages: [],
  contactUnlocks: [],
  emailReminders: [],
  payments: [],
  accountingEntries: [],
  coupons: [],
  couponUsages: [],
  interviews: [],
  reviews: [],
  auditEvents: [],
  invitations: [],
  securityAlerts: [],
  marketAnalyticsReports: [],
  reports: {
    financial: {},
    operations: {},
    conversion: {},
    risk: {}
  }
};

const views: Array<{ key: AdminView; label: string }> = [
  { key: "summary", label: "Resumen" },
  { key: "system-status", label: "🟢 Estado sistema" },
  { key: "administration", label: "Administración" },
  { key: "companies", label: "Empresas" },
  { key: "workers", label: "Postulantes" },
  { key: "offers", label: "Ofertas" },
  { key: "messages", label: "Mensajes" },
  { key: "payments", label: "Pagos" },
  { key: "accounting", label: "Contabilidad" },
  { key: "invoicing", label: "SII/OpenFactura" },
  { key: "coupons", label: "Cupones" },
  { key: "interviews", label: "Entrevistas" },
  { key: "urgency", label: "🔴 Urgencias" },
  { key: "reviews", label: "Reputación" },
  { key: "security", label: "Seguridad" },
  { key: "audit", label: "Auditoría" },
  { key: "reports", label: "Reportes" },
  { key: "pendientes", label: "⚠️ Pendientes manuales" },
  { key: "expertos", label: "🧠 Análisis de expertos" },
  { key: "roadmap", label: "🗺 Hoja de ruta" },
  { key: "changelog", label: "📋 Changelog" },
  { key: "tarifas", label: "💰 Config. tarifas" },
  { key: "mrr", label: "📈 MRR / ARR" },
  { key: "finanzas", label: "🚦 Salud financiera" },
  { key: "exports", label: "📥 Exportar CSV" },
  { key: "omil-impact", label: "🏛 Impacto OMIL" },
  { key: "funnel", label: "🔽 Embudo conversión" }
];

export function AdminPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [uid, setUid] = useState("");
  const [activeView, setActiveView] = useState<AdminView>("summary");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [companyFilter, setCompanyFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState("250");
  const [dashboardCursors, setDashboardCursors] = useState<Record<string, string>>({});
  const [notesByCompany, setNotesByCompany] = useState<Record<string, string>>({});
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "worker" as "worker" | "company" | "admin" | "omil",
    status: "active" as "active" | "suspended",
    municipalityName: "",
    contactPersonName: "",
    contactPersonRut: "",
    contactPersonRole: "",
  });
  const [omilLogoFile, setOmilLogoFile] = useState<File | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheckDoc | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [workerSearch, setWorkerSearch] = useState("");
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());
  const [couponForm, setCouponForm] = useState({ code: "", name: "", discountPercent: "10", maxUses: "100", expiresAt: "" });
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponStatus, setCouponStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "configuracion_sistema", "healthCheck"),
      (snap) => { if (snap.exists()) setHealthCheck(snap.data() as HealthCheckDoc); },
      () => {}
    );
    return unsub;
  }, []);

  const [billingForm, setBillingForm] = useState({
    paymentId: "",
    folioSii: "",
    pdfUrl: "",
    xmlUrl: "",
    siiStatus: "issued" as "pending_provider" | "issued" | "accepted" | "rejected" | "manual_transfer_pending" | "manual_transfer_paid",
    notes: ""
  });
  const [transferForm, setTransferForm] = useState({
    paymentId: "",
    bankReference: "",
    paidAt: "",
    notes: ""
  });

  const data = dashboard ?? emptyDashboard;

  const filteredCompanies = useMemo(() => {
    return data.companies.filter((company) => {
      const statusMatch = companyFilter === "all" || str(company.verificationStatus) === companyFilter;
      const haystack = `${company.companyName ?? ""} ${company.legalName ?? ""} ${company.taxId ?? ""}`.toLowerCase();
      return statusMatch && (!query || haystack.includes(query.toLowerCase()));
    });
  }, [companyFilter, data.companies, query]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setStatus("Ingresa tu email y contraseña.");
      return;
    }
    setStatus("Validando acceso interno...");

    try {
      const user = await loginWithEmail(trimmedEmail, password);
      setUid(user.uid);
      // Bootstrap del propietario: claimAdminRole solo tiene efecto para el
      // email allowlisted en Cloud Functions; para cualquier otro usuario
      // falla con permission-denied y se ignora.
      try {
        const { httpsCallable } = await import("firebase/functions");
        const { functions } = await import("@/lib/firebase/client");
        await httpsCallable(functions, "claimAdminRole")({});
      } catch { /* no es la cuenta propietaria — seguir normal */ }
      await loadDashboard();
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      const serverResponse = (error as { customData?: { _tokenResponse?: unknown } }).customData?._tokenResponse;
      console.error("[AdminPanel] auth error:", { code, message: (error as Error).message, serverResponse, fullError: error });
      const msg =
        code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
          ? "Credenciales incorrectas. Revisa email y contraseña."
          : code === "auth/too-many-requests"
          ? "Demasiados intentos fallidos. Espera unos minutos."
          : code === "auth/user-disabled"
          ? "Esta cuenta está deshabilitada."
          : code === "auth/network-request-failed"
          ? "Sin conexión a internet. Revisa tu red."
          : code === "auth/invalid-email"
          ? "El formato del email no es válido."
          : code === "auth/internal-error"
          ? `Error interno Firebase (${code}). Abre DevTools → Consola para ver detalles. Verifica que Email/Password esté habilitado en Firebase Console → Authentication → Sign-in methods.`
          : `[${code || "error"}] ${(error instanceof Error ? error.message : "No se pudo entrar.")}`;
      setStatus(msg);
    }
  }

  async function handleGoogleLogin() {
    setStatus("Abriendo ventana de Google...");
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      setUid(credential.user.uid);
      // Bootstrap del propietario: solo surte efecto para el email allowlisted
      // en Cloud Functions (perfilprimero7@gmail.com); el resto lo ignora.
      try {
        const { httpsCallable } = await import("firebase/functions");
        const { functions } = await import("@/lib/firebase/client");
        await httpsCallable(functions, "claimAdminRole")({});
      } catch { /* no es la cuenta propietaria — seguir normal */ }
      await loadDashboard();
    } catch (error) {
      const code = (error as { code?: string }).code ?? "";
      console.error("[AdminPanel] Google auth error:", { code, message: (error as Error).message, fullError: error });
      const msg =
        code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request"
          ? "Ventana cerrada sin completar el acceso."
          : code === "auth/popup-blocked"
          ? "El navegador bloqueó el popup. Permite ventanas emergentes para este sitio."
          : code === "auth/operation-not-allowed"
          ? "Google Sign-In no está habilitado en Firebase Console → Authentication → Sign-in methods."
          : `[${code || "error"}] ${(error instanceof Error ? error.message : "No se pudo entrar con Google.")} — Revisa DevTools → Consola.`;
      setStatus(msg);
    }
  }

  async function loadDashboard(nextCursors?: Record<string, string>) {
    setStatus("Cargando consola operativa...");
    try {
      const result = await getAdminDashboard({
        pageSize: Number(pageSize),
        from: dateFrom ? new Date(`${dateFrom}T00:00:00`).toISOString() : "",
        to: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : "",
        cursors: nextCursors ?? {}
      });
      setDashboard(result);
      setDashboardCursors(result.pagination?.nextCursors ?? {});
      setLastRefreshedAt(new Date());
      setStatus("Consola actualizada.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("administrador")) {
        setStatus("Sin permisos de administrador. Cierra sesión, vuelve a entrar con la cuenta correcta y recarga la página.");
      } else {
        setStatus(msg || "No se pudo cargar la consola.");
      }
    }
  }

  async function handleVerification(companyId: string, nextStatus: "verified" | "rejected" | "suspended") {
    setStatus("Actualizando empresa...");

    try {
      await updateCompanyVerification({
        companyId,
        status: nextStatus,
        notes: notesByCompany[companyId] ?? ""
      });
      await loadDashboard();
      setStatus(nextStatus === "verified" ? "Empresa verificada." : "Estado de empresa actualizado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo actualizar la empresa.");
    }
  }

  async function handleExportAccounting() {
    setStatus("Generando CSV contable...");

    try {
      const result = await exportAccountingCsv();
      const blob = new Blob([`\uFEFF${result.csv}`], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("CSV contable descargado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo exportar la contabilidad.");
    }
  }

  async function handleLogout() {
    await logout().catch(() => undefined);
    setUid("");
    setEmail("");
    setPassword("");
    setDashboard(null);
    setStatus("Sesión admin cerrada.");
  }

  async function handleCreateManagedUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creando usuario...");

    try {
      let municipalityLogoUrl: string | undefined;
      if (newUser.role === "omil" && omilLogoFile) {
        setStatus("Subiendo logo de municipalidad...");
        municipalityLogoUrl = await uploadMunicipalityLogo(omilLogoFile);
      }

      const payload = {
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        status: newUser.status,
        ...(newUser.role === "omil" ? {
          omilMetadata: {
            municipalityName: newUser.municipalityName,
            contactPersonName: newUser.contactPersonName,
            contactPersonRut: newUser.contactPersonRut,
            contactPersonRole: newUser.contactPersonRole,
            ...(municipalityLogoUrl ? { municipalityLogoUrl } : {})
          }
        } : {})
      };

      const created = await createManagedUser(payload);
      setStatus(`Usuario ${created.email} habilitado como ${created.role}.`);
      setNewUser({ email: "", password: "", role: "worker", status: "active", municipalityName: "", contactPersonName: "", contactPersonRut: "", contactPersonRole: "" });
      setOmilLogoFile(null);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el usuario.");
    }
  }

  async function handleGenerateMarketReport() {
    setStatus("Generando reporte científico de mercado...");
    try {
      await generateMarketAnalyticsNow();
      await loadDashboard();
      setStatus("Reporte de mercado generado y cargado en administración.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo generar el reporte.");
    }
  }

  async function handleBillingDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Actualizando estado SII/OpenFactura...");
    try {
      await updateBillingDocument(billingForm);
      await loadDashboard();
      setBillingForm({ paymentId: "", folioSii: "", pdfUrl: "", xmlUrl: "", siiStatus: "issued", notes: "" });
      setStatus("Documento tributario actualizado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo actualizar facturación.");
    }
  }

  async function handleManualTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Aprobando transferencia manual...");
    try {
      await approveManualTransfer(transferForm);
      await loadDashboard();
      setTransferForm({ paymentId: "", bankReference: "", paidAt: "", notes: "" });
      setStatus("Transferencia aprobada y asiento actualizado.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo aprobar transferencia.");
    }
  }

  async function handleCreateCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCouponStatus(null);
    try {
      const result = await createCoupon({
        code: couponForm.code,
        name: couponForm.name,
        discountPercent: Number(couponForm.discountPercent),
        maxUses: Number(couponForm.maxUses),
        expiresAt: couponForm.expiresAt,
      });
      await loadDashboard();
      setCouponForm({ code: "", name: "", discountPercent: "10", maxUses: "100", expiresAt: "" });
      setShowCouponForm(false);
      setCouponStatus({ ok: true, msg: `Cupón ${result.couponCode} creado correctamente.` });
    } catch (error) {
      setCouponStatus({ ok: false, msg: error instanceof Error ? error.message : "No se pudo crear el cupón." });
    }
  }

  if (!uid) {
    return (
      <section className="adminShell">
        <aside className="adminRail">
          <div className="adminBadge">
            <ShieldCheck size={20} aria-hidden="true" />
            Control interno
          </div>
          <h2>Consola de administración</h2>
          <p>Monitoreo de empresas, pagos, contabilidad, entrevistas, reputación, seguridad y auditoría.</p>
        </aside>
        <form className="formSurface adminLogin" onSubmit={handleLogin}>
          <div className="formHeader">
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <h2>Acceso admin</h2>
              <p>Ingresa con credenciales autorizadas. Las operaciones sensibles requieren permisos admin de Firebase.</p>
            </div>
          </div>
          <label>
            Usuario o email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="text" required />
          </label>
          <label>
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          <button className="button primary full" type="submit">Entrar al panel</button>
          <button className="button secondary full" type="button" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Entrar con Google
          </button>
          {status ? <p className="statusText">{status}</p> : null}
        </form>
      </section>
    );
  }

  return (
    <section className="adminShell adminConsole">
      <aside className="adminRail">
        <div className="adminBadge">
          <ShieldCheck size={20} aria-hidden="true" />
          Control interno
        </div>
        <h2>Consola operativa</h2>
        <p>Centro único de monitoreo, contabilidad, control y auditoría.</p>
        <div className="adminMetric">
          <span>{data.summary.securityAlerts}</span>
          <p>alertas abiertas</p>
        </div>
        <div className="adminFilters">
          <label>
            Desde
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </label>
          <label>
            Tamaño página
            <select value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
          </label>
        </div>
        <button className="button secondary full" type="button" onClick={() => loadDashboard()}>Actualizar datos</button>
        <button className="button secondary full" type="button" onClick={() => loadDashboard(dashboardCursors)}>Siguiente página</button>
        <button className="button secondary full" type="button" onClick={handleExportAccounting}>Exportar CSV contable</button>
        <button className="button ghost full" type="button" onClick={handleLogout}>Cerrar sesión</button>
        {lastRefreshedAt && (
          <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
            Actualizado {lastRefreshedAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </aside>

      <div className="stack">
        <div className="workspaceTabs adminTabs" role="tablist" aria-label="Consola admin">
          {views.map((view) => (
            <button
              className={activeView === view.key ? "active" : ""}
              key={view.key}
              type="button"
              onClick={() => setActiveView(view.key)}
            >
              {view.label}
            </button>
          ))}
        </div>

        {activeView === "summary" ? <SummaryView dashboard={data} onVerification={handleVerification} /> : null}
        {activeView === "system-status" ? <SystemStatusView healthCheck={healthCheck} /> : null}
        {activeView === "administration" ? (
          <AdministrationView
            dashboard={data}
            newUser={newUser}
            omilLogoFile={omilLogoFile}
            onNewUser={setNewUser}
            onOmilLogo={setOmilLogoFile}
            onCreateUser={handleCreateManagedUser}
          />
        ) : null}
        {activeView === "companies" ? (
          <CompaniesView
            companies={filteredCompanies}
            companyFilter={companyFilter}
            notesByCompany={notesByCompany}
            query={query}
            onFilter={setCompanyFilter}
            onQuery={setQuery}
            onNotes={setNotesByCompany}
            onVerification={handleVerification}
          />
        ) : null}
        {activeView === "workers" ? <WorkersView workers={data.workers} privateWorkers={data.privateWorkers} search={workerSearch} onSearch={setWorkerSearch} /> : null}
        {activeView === "offers" ? <OffersView offers={data.jobOffers} invitations={data.invitations} /> : null}
        {activeView === "messages" ? <MessagesView messages={data.messages} unlocks={data.contactUnlocks} reminders={data.emailReminders} /> : null}
        {activeView === "payments" ? <PaymentsView payments={data.payments} dateFrom={dateFrom} dateTo={dateTo} /> : null}
        {activeView === "accounting" ? (
          <AccountingView
            entries={data.accountingEntries}
            transferForm={transferForm}
            onTransferForm={setTransferForm}
            onApproveTransfer={handleManualTransfer}
            onExport={handleExportAccounting}
          />
        ) : null}
        {activeView === "invoicing" ? (
          <InvoicingView
            entries={data.accountingEntries}
            billingForm={billingForm}
            onBillingForm={setBillingForm}
            onSubmitBilling={handleBillingDocument}
          />
        ) : null}
        {activeView === "coupons" ? <CouponsView coupons={data.coupons} usages={data.couponUsages} couponForm={couponForm} showForm={showCouponForm} onCouponForm={setCouponForm} onToggleForm={() => setShowCouponForm((v) => !v)} onSubmitCoupon={handleCreateCoupon} couponStatus={couponStatus} /> : null}
        {activeView === "interviews" ? <InterviewsView interviews={data.interviews} invitations={data.invitations} /> : null}
        {activeView === "urgency" ? <UrgencyView invitations={data.invitations} /> : null}
        {activeView === "reviews" ? <ReviewsView reviews={data.reviews} summary={data.summary} /> : null}
        {activeView === "security" ? <SecurityView alerts={data.securityAlerts} resolvedAlerts={resolvedAlerts} onResolve={(id) => setResolvedAlerts((prev) => new Set([...prev, id]))} /> : null}
        {activeView === "audit" ? <AuditView events={data.auditEvents} /> : null}
        {activeView === "reports" ? <ReportsView dashboard={data} onGenerateMarketReport={handleGenerateMarketReport} /> : null}
        {activeView === "pendientes" ? <PendientesView /> : null}
        {activeView === "expertos" ? <ExpertosView /> : null}
        {activeView === "roadmap" ? <RoadmapView /> : null}
        {activeView === "changelog" ? <ChangelogView /> : null}
        {activeView === "tarifas" ? <TarifasView /> : null}
        {activeView === "mrr" ? <MrrView /> : null}
        {activeView === "finanzas" ? <FinanzasView /> : null}
        {activeView === "exports" ? <ExportsView /> : null}
        {activeView === "omil-impact" ? <OmilImpactView /> : null}
        {activeView === "funnel" ? <FunnelView dashboard={data} /> : null}

        {status ? <p className="statusText">{status}</p> : null}
      </div>
    </section>
  );
}

function SystemStatusView({ healthCheck }: { healthCheck: HealthCheckDoc | null }) {
  if (!healthCheck) {
    return (
      <section className="stack">
        <div className="systemStatusCard loading">
          <span className="statusDot loading" />
          <div>
            <strong>Sin datos aún</strong>
            <p>El health-check diario no se ha ejecutado todavía. Se ejecuta automáticamente cada 24 horas.</p>
          </div>
        </div>
      </section>
    );
  }

  const { status, issues, warnings, lastCheckedAt, checksRan } = healthCheck;
  const lastChecked = lastCheckedAt
    ? new Date(lastCheckedAt.seconds * 1000).toLocaleString("es-CL")
    : "—";

  const statusConfig = {
    healthy: { label: "Sistema operativo", color: "#16a34a", bg: "#f0fdf4", dot: "green" },
    warning: { label: "Advertencias detectadas", color: "#b45309", bg: "#fffbeb", dot: "amber" },
    degraded: { label: "Problemas críticos activos", color: "#dc2626", bg: "#fef2f2", dot: "red" }
  }[status] ?? { label: "Estado desconocido", color: "#647488", bg: "#f8fafc", dot: "gray" };

  return (
    <section className="stack">
      <div className="systemStatusCard" style={{ background: statusConfig.bg }}>
        <span className={`statusDot ${statusConfig.dot}`} />
        <div>
          <strong style={{ color: statusConfig.color }}>{statusConfig.label}</strong>
          <p style={{ color: "#647488", fontSize: 13 }}>
            Último chequeo: {lastChecked} · {checksRan} verificaciones ejecutadas
          </p>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="statusIssueList critical">
          <p className="statusListTitle">Problemas críticos ({issues.length})</p>
          <ul>
            {issues.map((issue, i) => (
              <li key={i}><span className="statusBullet critical">!</span>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="statusIssueList warning">
          <p className="statusListTitle">Advertencias ({warnings.length})</p>
          <ul>
            {warnings.map((warn, i) => (
              <li key={i}><span className="statusBullet warning">⚠</span>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {issues.length === 0 && warnings.length === 0 && (
        <div className="statusIssueList ok">
          <p className="statusListTitle">Sin problemas detectados</p>
          <p style={{ fontSize: 13, color: "#647488", marginTop: 4 }}>
            Todas las verificaciones pasaron correctamente.
          </p>
        </div>
      )}

      <div className="statusChecksGrid">
        {[
          { label: "Claves de entorno", ok: !issues.some(i => i.includes("ACCESS_TOKEN")) },
          { label: "Cupones con expiración", ok: !issues.some(i => i.includes("cupones activos sin")) },
          { label: "Perfiles vigentes", ok: !warnings.some(w => w.includes("perfiles visibles con")) },
          { label: "Pagos sin estancamiento", ok: !warnings.some(w => w.includes("pagos en estado")) }
        ].map(({ label, ok }) => (
          <div key={label} className={`statusCheck ${ok ? "ok" : "fail"}`}>
            <span>{ok ? "✓" : "✗"}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <MaintenanceActions />
    </section>
  );
}

// ── Acciones de mantenimiento one-shot ───────────────────────────────────────
function MaintenanceActions() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function purgeCvUrls() {
    if (!confirm("¿Borrar el campo cvFileUrl legacy de todos los perfiles públicos? Es seguro: el CV sigue en el perfil privado del postulante.")) return;
    setRunning(true);
    setResult(null);
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("@/lib/firebase/client");
      const res = await httpsCallable(functions, "purgeLegacyCvFileUrls")({});
      const d = res.data as { revisados: number; limpiados: number };
      setResult({ ok: true, msg: `Listo: ${d.limpiados} perfiles limpiados de ${d.revisados} revisados.` });
    } catch (e) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : "No se pudo ejecutar la limpieza." });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem", marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--heading)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
        🧹 Mantenimiento
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button className="button ghost" type="button" disabled={running} onClick={purgeCvUrls} style={{ fontSize: 13 }}>
          {running ? "Ejecutando…" : "Purgar cvFileUrl legacy de perfiles públicos"}
        </button>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Elimina el enlace al CV original de perfiles antiguos (seguridad · anonimato).
        </span>
      </div>
      {result && (
        <p style={{ fontSize: 13, marginTop: 8, color: result.ok ? "#16a34a" : "#dc2626" }}>{result.msg}</p>
      )}
    </div>
  );
}

function SummaryView({ dashboard, onVerification }: { dashboard: AdminDashboard; onVerification?: (companyId: string, status: "verified" | "rejected" | "suspended") => void }) {
  const metrics = [
    { icon: <Building2 />, label: "Empresas", value: dashboard.summary.companiesTotal, detail: statusCounts(dashboard.summary.companyStatusCounts) },
    { icon: <Users />, label: "Postulantes", value: dashboard.summary.workersTotal, detail: statusCounts(dashboard.summary.workerVisibilityCounts) },
    { icon: <BriefcaseBusiness />, label: "Ofertas", value: dashboard.summary.jobOffersTotal, detail: `${dashboard.summary.jobOffersVisible} visibles` },
    { icon: <BadgeDollarSign />, label: "Pagos", value: dashboard.summary.paymentsTotal, detail: `${dashboard.summary.paymentsPaid} pagados / ${dashboard.summary.paymentsPending} pendientes` },
    { icon: <FileSpreadsheet />, label: "Ingresos pagados", value: money(dashboard.summary.revenuePaidClp), detail: "CLP confirmado en la plataforma" },
    { icon: <ReceiptText />, label: "Facturación pendiente", value: dashboard.summary.accountingPending, detail: "Sin folio/PDF/XML proveedor" },
    { icon: <Tag />, label: "Cupones activos", value: dashboard.summary.couponsActive, detail: "Disponibles para checkout" },
    { icon: <CalendarClock />, label: "Entrevistas", value: dashboard.summary.interviewsScheduled, detail: "Programadas en plataforma" },
    { icon: <MessageSquare />, label: "Mensajes", value: dashboard.summary.messagesTotal, detail: `${dashboard.summary.contactUnlocksTotal} contactos desbloqueados` },
    { icon: <Star />, label: "Reputación", value: dashboard.summary.reviewAverage || "0", detail: `${dashboard.summary.reviewsTotal} evaluaciones` },
    { icon: <AlertTriangle />, label: "Alertas", value: dashboard.summary.securityAlerts, detail: "Bloqueos y pendientes críticos" }
  ];

  return (
    <>
      <section className="commandHero adminCommandHero">
        <div className="commandHeroContent">
          <span className="smallLabel">Sala de control</span>
          <h2>Operación, pagos, seguridad y cumplimiento en una sola consola.</h2>
          <p>
            Esta vista concentra lo que importa para abrir la plataforma con control:
            empresas verificadas, ingresos confirmados, alertas, facturación y trazabilidad.
          </p>
        </div>
        <div className="commandKpiGrid">
          <article className="commandKpi commandPrimary">
            <span>Ingresos confirmados</span>
            <strong>{money(dashboard.summary.revenuePaidClp)}</strong>
            <small>CLP confirmado</small>
          </article>
          <article className="commandKpi">
            <span>Empresas</span>
            <strong>{dashboard.summary.companiesTotal}</strong>
            <small>{statusCounts(dashboard.summary.companyStatusCounts)}</small>
          </article>
          <article className="commandKpi">
            <span>Riesgo activo</span>
            <strong>{dashboard.summary.securityAlerts}</strong>
            <small>alertas pendientes</small>
          </article>
        </div>
      </section>

      {/* Quick actions */}
      {(() => {
        const pending = dashboard.companies.filter((c) => str(c.verificationStatus) === "pending");
        if (!pending.length || !onVerification) return null;
        return (
          <section className="formSurface" style={{ marginBottom: 0 }}>
            <div className="formHeader">
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <h2>Acción rápida</h2>
                <p>{pending.length} empresa{pending.length > 1 ? "s" : ""} pendiente{pending.length > 1 ? "s" : ""} de verificación.</p>
              </div>
            </div>
            <div className="results" style={{ maxHeight: 200, overflowY: "auto" }}>
              {pending.slice(0, 5).map((company) => {
                const companyId = str(company.companyId || company.id);
                return (
                  <article className="resultCard" key={companyId} style={{ padding: "8px 12px" }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{str(company.companyName || "Sin nombre")}</strong>
                      <p style={{ fontSize: 12, margin: 0 }}>{str(company.legalName)} · {str(company.taxId)}</p>
                    </div>
                    <button className="button primary" type="button" onClick={() => onVerification(companyId, "verified")} style={{ fontSize: 12, padding: "4px 10px" }}>
                      Verificar
                    </button>
                    <button className="button ghost" type="button" onClick={() => onVerification(companyId, "rejected")} style={{ fontSize: 12, padding: "4px 10px" }}>
                      Rechazar
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })()}

      <section className="dashboardGrid adminDashboardGrid">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span className="smallLabel">{metric.label}</span>
            <div className="adminMetricIcon">{metric.icon}</div>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      {/* Barras de distribución CSS */}
      {(() => {
        const total = dashboard.summary.workersTotal + dashboard.summary.companiesTotal;
        if (total === 0) return null;
        const bars: Array<{ label: string; value: number; color: string }> = [
          { label: "Postulantes", value: dashboard.summary.workersTotal, color: "#2563eb" },
          { label: "Empresas", value: dashboard.summary.companiesTotal, color: "#16a34a" },
          { label: "Ofertas activas", value: dashboard.summary.jobOffersVisible, color: "#f59e0b" },
          { label: "Mensajes", value: Math.min(dashboard.summary.messagesTotal, total * 10), color: "#7c3aed" },
        ];
        const maxVal = Math.max(...bars.map((b) => b.value), 1);
        return (
          <section className="formSurface" style={{ marginTop: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Distribución de actividad</h3>
            {bars.map((bar) => (
              <div key={bar.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span>{bar.label}</span>
                  <span style={{ fontWeight: 600 }}>{bar.value.toLocaleString("es-CL")}</span>
                </div>
                <div style={{ height: 8, background: "var(--border, #e5e7eb)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round((bar.value / maxVal) * 100)}%`, background: bar.color, borderRadius: 4, transition: "width .4s ease" }} />
                </div>
              </div>
            ))}
          </section>
        );
      })()}
    </>
  );
}

type NewUserState = {
  email: string;
  password: string;
  role: "worker" | "company" | "admin" | "omil";
  status: "active" | "suspended";
  municipalityName: string;
  contactPersonName: string;
  contactPersonRut: string;
  contactPersonRole: string;
};

type FoundUser = Awaited<ReturnType<typeof adminSearchUser>>;

function UserSearchPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<FoundUser | null>(null);
  const [editing, setEditing] = useState(false);
  const [editRole, setEditRole] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFound(null);
    setSaveMsg(null);
    setEditing(false);
    setLoading(true);
    try {
      const result = await adminSearchUser(query.trim());
      setFound(result);
      setEditRole(result.role ?? "");
      setEditStatus(result.status ?? "active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No encontrado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!found) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await adminUpdateUser({
        uid: found.uid,
        role: editRole as "worker" | "company" | "admin" | "omil",
        status: editStatus as "active" | "suspended",
      });
      setFound({ ...found, role: editRole, status: editStatus });
      setSaveMsg("Cambios guardados correctamente.");
      setEditing(false);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="formSurface stack">
      <div className="formHeader">
        <Users size={22} aria-hidden="true" />
        <div>
          <h2>Buscar y modificar usuario</h2>
          <p>Busca por UID o email. Puedes cambiar el rol y el estado de la cuenta.</p>
        </div>
      </div>
      <form className="formGrid" onSubmit={handleSearch} style={{ alignItems: "flex-end" }}>
        <label style={{ gridColumn: "1 / -1" }}>
          UID o email
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="uid123 o usuario@ejemplo.com"
            required
            minLength={3}
          />
        </label>
        <button className="button primary" type="submit" disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {error && <p className="errorMsg">{error}</p>}

      {found && (
        <div className="adminUserResult">
          <table className="adminTable">
            <tbody>
              <tr><th>UID</th><td><code>{found.uid}</code></td></tr>
              <tr><th>Email</th><td>{found.email}</td></tr>
              <tr><th>Nombre</th><td>{found.displayName || "—"}</td></tr>
              <tr><th>Verificado</th><td>{found.emailVerified ? "Sí" : "No"}</td></tr>
              <tr><th>Deshabilitado (Auth)</th><td>{found.disabled ? "Sí" : "No"}</td></tr>
              <tr><th>Creación</th><td>{found.creationTime}</td></tr>
              <tr><th>Último acceso</th><td>{found.lastSignInTime || "—"}</td></tr>
              <tr><th>Rol</th><td>{found.role ?? "—"}</td></tr>
              <tr><th>Estado</th><td>{found.status ?? "—"}</td></tr>
            </tbody>
          </table>

          {!editing && (
            <button className="button" type="button" onClick={() => setEditing(true)}>
              Editar rol / estado
            </button>
          )}

          {editing && (
            <form className="formGrid" onSubmit={handleSave} style={{ marginTop: "1rem" }}>
              <label>
                Rol
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="worker">Postulante</option>
                  <option value="company">Empresa</option>
                  <option value="admin">Administrador</option>
                  <option value="omil">OMIL</option>
                </select>
              </label>
              <label>
                Estado
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                  <option value="active">Activo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </label>
              <button className="button primary" type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
              <button className="button" type="button" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </form>
          )}

          {saveMsg && <p style={{ marginTop: "0.5rem" }}>{saveMsg}</p>}
        </div>
      )}
    </section>
  );
}

function AdministrationView({
  dashboard,
  newUser,
  omilLogoFile,
  onNewUser,
  onOmilLogo,
  onCreateUser
}: {
  dashboard: AdminDashboard;
  newUser: NewUserState;
  omilLogoFile: File | null;
  onNewUser: (value: NewUserState) => void;
  onOmilLogo: (file: File | null) => void;
  onCreateUser: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isOmil = newUser.role === "omil";

  return (
    <section className="stack">
      <UserSearchPanel />
      <form className="formSurface adminUserCreator" onSubmit={onCreateUser}>
        <div className="formHeader">
          <Users size={22} aria-hidden="true" />
          <div>
            <h2>Crear o habilitar usuario</h2>
            <p>Crea cuentas operativas para postulantes, empresas, OMIL municipales o administradores internos. Las cuentas OMIL solo pueden crearse desde aquí — no tienen autoregistro.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            Email
            <input value={newUser.email} onChange={(e) => onNewUser({ ...newUser, email: e.target.value })} type="email" required />
          </label>
          <label>
            Contraseña temporal
            <input value={newUser.password} minLength={6} onChange={(e) => onNewUser({ ...newUser, password: e.target.value })} type="password" required />
          </label>
          <label>
            Rol
            <select value={newUser.role} onChange={(e) => onNewUser({ ...newUser, role: e.target.value as NewUserState["role"] })}>
              <option value="worker">Postulante</option>
              <option value="company">Empresa</option>
              <option value="admin">Administrador</option>
              <option value="omil">OMIL</option>
            </select>
          </label>
          <label>
            Estado
            <select value={newUser.status} onChange={(e) => onNewUser({ ...newUser, status: e.target.value as NewUserState["status"] })}>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </label>
        </div>

        {isOmil && (
          <div className="omilMetadataSection">
            <p className="omilMetadataTitle">Datos institucionales OMIL</p>
            <div className="formGrid">
              <label>
                Municipalidad <span className="requiredMark">*</span>
                <input
                  value={newUser.municipalityName}
                  onChange={(e) => onNewUser({ ...newUser, municipalityName: e.target.value })}
                  placeholder="Municipalidad de Puerto Montt"
                  required={isOmil}
                />
              </label>
              <label>
                Persona a cargo <span className="requiredMark">*</span>
                <input
                  value={newUser.contactPersonName}
                  onChange={(e) => onNewUser({ ...newUser, contactPersonName: e.target.value })}
                  placeholder="Nombre completo"
                  required={isOmil}
                />
              </label>
              <label>
                RUT responsable <span className="requiredMark">*</span>
                <input
                  value={newUser.contactPersonRut}
                  onChange={(e) => onNewUser({ ...newUser, contactPersonRut: e.target.value })}
                  placeholder="12.345.678-9"
                  required={isOmil}
                />
              </label>
              <label>
                Cargo en la OMIL <span className="requiredMark">*</span>
                <input
                  value={newUser.contactPersonRole}
                  onChange={(e) => onNewUser({ ...newUser, contactPersonRole: e.target.value })}
                  placeholder="Encargado/a OMIL"
                  required={isOmil}
                />
              </label>
            </div>
            <label className="omilLogoLabel">
              Logo de la municipalidad
              <span className="helperText">Formatos: PNG, JPG, SVG. Recomendado: fondo transparente.</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={(e) => onOmilLogo(e.target.files?.[0] ?? null)}
              />
              {omilLogoFile && (
                <p className="helperText">📎 {omilLogoFile.name}</p>
              )}
            </label>
          </div>
        )}

        <button className="button primary" type="submit">
          {isOmil ? "Crear cuenta OMIL" : "Crear usuario"}
        </button>
      </form>
      <section className="dashboardGrid">
        <article>
          <span className="smallLabel">Usuarios</span>
          <strong>{dashboard.summary.usersTotal}</strong>
          <p>{statusCounts(dashboard.summary.userRoleCounts)}</p>
        </article>
        <article>
          <span className="smallLabel">Recordatorios email</span>
          <strong>{dashboard.summary.emailRemindersTotal}</strong>
          <p>Agenda y avisos asociados a entrevistas.</p>
        </article>
        <article>
          <span className="smallLabel">Desbloqueos de contacto</span>
          <strong>{dashboard.summary.contactUnlocksTotal}</strong>
          <p>Contactos liberados después de pago/cierre.</p>
        </article>
      </section>
      <AdminTable title="Usuarios registrados" rows={dashboard.users} columns={[
        ["id", "UID"],
        ["email", "Email"],
        ["role", "Rol"],
        ["status", "Estado"],
        ["lastLoginAt", "Último acceso"],
        ["createdAt", "Creado"]
      ]} />
      <AdminTable title="Desbloqueos de contacto" rows={dashboard.contactUnlocks} columns={[
        ["unlockId", "Desbloqueo"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["invitationId", "Invitación"],
        ["paymentId", "Pago"],
        ["status", "Estado"],
        ["createdAt", "Creado"]
      ]} />
      <AdminTable title="Recordatorios y correos programados" rows={dashboard.emailReminders} columns={[
        ["id", "ID"],
        ["invitationId", "Invitación"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["status", "Estado"],
        ["sendAt", "Envío"],
        ["createdAt", "Creado"]
      ]} />

      <FeatureFlagsPanel />
    </section>
  );
}

const DEFAULT_FLAGS: Array<{ key: string; label: string; description: string; defaultOn: boolean }> = [
  { key: "omil_enabled", label: "OMIL habilitado", description: "Permite acceso al módulo OMIL para municipios", defaultOn: true },
  { key: "semantic_search", label: "Búsqueda semántica IA", description: "Activa búsqueda asistida por IA en la búsqueda de talento", defaultOn: true },
  { key: "cv_analysis", label: "Análisis de CV con IA", description: "Usa IA para extraer datos del CV del postulante automáticamente", defaultOn: true },
  { key: "mercadopago_enabled", label: "Mercado Pago activo", description: "Habilita el flujo de pago con Mercado Pago", defaultOn: true },
  { key: "stripe_enabled", label: "Stripe activo", description: "Habilita el flujo de pago con Stripe como respaldo", defaultOn: false },
  { key: "worker_registration", label: "Registro de postulantes", description: "Permite que nuevos postulantes se registren en la plataforma", defaultOn: true },
  { key: "company_registration", label: "Registro de empresas", description: "Permite que nuevas empresas se registren", defaultOn: true },
  { key: "invitations_enabled", label: "Invitaciones habilitadas", description: "Las empresas pueden enviar invitaciones a postulantes", defaultOn: true },
];

function FeatureFlagsPanel() {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pp_admin_flags_v1") ?? "{}") as Record<string, boolean>;
      return DEFAULT_FLAGS.reduce((acc, f) => ({ ...acc, [f.key]: saved[f.key] ?? f.defaultOn }), {} as Record<string, boolean>);
    } catch {
      return DEFAULT_FLAGS.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultOn }), {} as Record<string, boolean>);
    }
  });
  const [saved, setSaved] = useState(false);

  function saveFlags(next: Record<string, boolean>) {
    setFlags(next);
    try { localStorage.setItem("pp_admin_flags_v1", JSON.stringify(next)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="formSurface">
      <div className="formHeader">
        <BarChart3 size={20} aria-hidden="true" />
        <div>
          <h2>Feature flags</h2>
          <p>Activa o desactiva módulos sin redesplegar. Los cambios se guardan localmente en este navegador.</p>
        </div>
        {saved && <span style={{ marginLeft: "auto", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Guardado</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DEFAULT_FLAGS.map((flag) => (
          <div key={flag.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => saveFlags({ ...flags, [flag.key]: !flags[flag.key] })}
              style={{
                width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                background: flags[flag.key] ? "#16a34a" : "#d1d5db",
                position: "relative", flexShrink: 0, transition: "background .2s"
              }}
              aria-pressed={flags[flag.key]}
              aria-label={flag.label}
            >
              <span style={{
                position: "absolute", top: 3, left: flags[flag.key] ? 20 : 3,
                width: 16, height: 16, borderRadius: "50%", background: "#fff",
                transition: "left .2s"
              }} />
            </button>
            <div>
              <strong style={{ fontSize: 13 }}>{flag.label}</strong>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>{flag.description}</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: flags[flag.key] ? "#16a34a" : "#9ca3af" }}>
              {flags[flag.key] ? "ON" : "OFF"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompaniesView({
  companies,
  companyFilter,
  notesByCompany,
  query,
  onFilter,
  onQuery,
  onNotes,
  onVerification
}: {
  companies: Array<Record<string, unknown>>;
  companyFilter: string;
  notesByCompany: Record<string, string>;
  query: string;
  onFilter: (value: string) => void;
  onQuery: (value: string) => void;
  onNotes: (value: Record<string, string>) => void;
  onVerification: (companyId: string, status: "verified" | "rejected" | "suspended") => void;
}) {
  return (
    <section className="adminQueue">
      <div className="filterPanel compactFilters">
        <div className="formGrid">
          <label>
            Buscar
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Empresa, RUT, razón social" />
          </label>
          <label>
            Estado
            <select value={companyFilter} onChange={(event) => onFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="verified">Verificadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="suspended">Suspendidas</option>
            </select>
          </label>
        </div>
      </div>
      {companies.length ? companies.map((company) => {
        const companyId = str(company.companyId || company.id);
        return (
          <article className="adminCompanyCard" key={companyId}>
            <div className="adminCompanyTop">
              <span className={`verificationPill ${str(company.verificationStatus)}`}>{str(company.verificationStatus || "draft")}</span>
              <span>{str(company.size || "Tamaño no informado")}</span>
            </div>
            <div className="adminCompanyBody">
              <Building2 size={28} aria-hidden="true" />
              <div>
                <h2>{str(company.companyName || "Empresa sin nombre")}</h2>
                <p>{str(company.legalName || "Razón social pendiente")} - {str(company.taxId || "RUT pendiente")}</p>
                <a href={str(company.website || "#")} target="_blank" rel="noreferrer">{str(company.website || "Sitio web pendiente")}</a>
              </div>
            </div>
            <label>
              Nota interna
              <textarea
                value={notesByCompany[companyId] ?? str(company.verificationNotes ?? "")}
                onChange={(event) =>
                  onNotes({
                    ...notesByCompany,
                    [companyId]: event.target.value
                  })
                }
              />
            </label>
            <div className="actions">
              <button className="button primary" type="button" onClick={() => onVerification(companyId, "verified")}>
                <CheckCircle2 size={18} aria-hidden="true" />
                Verificar
              </button>
              <button className="button secondary" type="button" onClick={() => onVerification(companyId, "rejected")}>
                <XCircle size={18} aria-hidden="true" />
                Rechazar
              </button>
              <button className="button ghost" type="button" onClick={() => onVerification(companyId, "suspended")}>Suspender</button>
            </div>
          </article>
        );
      }) : <p className="emptyState">No hay empresas para este filtro.</p>}
    </section>
  );
}

function WorkersView({
  workers,
  privateWorkers,
  search,
  onSearch
}: {
  workers: Array<Record<string, unknown>>;
  privateWorkers: Array<Record<string, unknown>>;
  search: string;
  onSearch: (v: string) => void;
}) {
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("");

  const filtered = workers.filter((w) => {
    const textOk = !search || `${w.headline ?? ""} ${w.region ?? ""} ${w.profileCode ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const visOk = visibilityFilter === "all" || str(w.visibilityStatus) === visibilityFilter;
    const areaOk = !areaFilter || str(w.sectors ?? "").toLowerCase().includes(areaFilter.toLowerCase());
    return textOk && visOk && areaOk;
  });

  function exportWorkersCsv() {
    const rows = [["Código","Perfil","Región","Estado Visibilidad","Renta min","Renta max"]].concat(
      filtered.map((w) => [str(w.profileCode),str(w.headline),str(w.region),str(w.visibilityStatus),String(w.expectedSalaryMin ?? ""),String(w.expectedSalaryMax ?? "")])
    );
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv" }));
    a.download = `postulantes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <section className="stack">
      <div className="filterPanel compactFilters">
        <label>
          Buscar postulante
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Cargo, región, código PP-…" />
        </label>
        <label>
          Visibilidad
          <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="visible">Visible</option>
            <option value="paused">Pausado</option>
            <option value="hidden">Oculto</option>
            <option value="expired">Expirado</option>
          </select>
        </label>
        <label>
          Área (texto libre)
          <input value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} placeholder="Tecnología, Salud…" />
        </label>
        <button className="button ghost" type="button" onClick={exportWorkersCsv} style={{ fontSize: 12, alignSelf: "flex-end" }}>⬇ Exportar CSV</button>
        <p className="helperText" style={{ marginTop: 4, gridColumn: "1/-1" }}>{filtered.length} de {workers.length} postulantes</p>
      </div>
      <AdminTable title="Postulantes públicos" rows={filtered} columns={[
        ["workerId", "Postulante"],
        ["profileCode", "Código"],
        ["headline", "Perfil"],
        ["region", "Región"],
        ["city", "Comuna"],
        ["visibilityStatus", "Visibilidad"],
        ["subscriptionStatus", "Suscripción"],
        ["expectedSalaryMin", "Renta min"],
        ["expectedSalaryMax", "Renta max"],
        ["createdAt", "Creado"]
      ]} moneyFields={["expectedSalaryMin", "expectedSalaryMax"]} />
      <AdminTable title="Datos privados de postulantes" rows={privateWorkers} columns={[
        ["workerId", "Postulante"],
        ["fullName", "Nombre"],
        ["email", "Email"],
        ["phone", "Teléfono"],
        ["rut", "RUT"],
        ["cvFileUrl", "CV"],
        ["updatedAt", "Actualizado"]
      ]} />
    </section>
  );
}

function OffersView({
  offers,
  invitations
}: {
  offers: Array<Record<string, unknown>>;
  invitations: Array<Record<string, unknown>>;
}) {
  return (
    <section className="stack">
      <AdminTable title="Ofertas creadas por empresas" rows={offers} columns={[
        ["jobOfferId", "Oferta"],
        ["companyId", "Empresa"],
        ["title", "Cargo"],
        ["area", "Área"],
        ["region", "Región"],
        ["city", "Comuna"],
        ["visibilityStatus", "Visibilidad"],
        ["vacanciesTotal", "Vacantes"],
        ["vacanciesAvailable", "Disponibles"],
        ["salaryMin", "Sueldo min"],
        ["salaryMax", "Sueldo max"],
        ["updatedAt", "Actualizado"]
      ]} moneyFields={["salaryMin", "salaryMax"]} />
      <AdminTable title="Invitaciones y pipeline" rows={invitations} columns={[
        ["invitationId", "Invitación"],
        ["jobOfferId", "Oferta"],
        ["opportunityTitle", "Cargo"],
        ["status", "Estado"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["salaryMin", "Sueldo min"],
        ["salaryMax", "Sueldo max"],
        ["updatedAt", "Actualizado"]
      ]} moneyFields={["salaryMin", "salaryMax"]} />
    </section>
  );
}

function MessagesView({
  messages,
  unlocks,
  reminders
}: {
  messages: Array<Record<string, unknown>>;
  unlocks: Array<Record<string, unknown>>;
  reminders: Array<Record<string, unknown>>;
}) {
  return (
    <section className="stack">
      <AdminTable title="Mensajería interna" rows={messages} columns={[
        ["messageId", "Mensaje"],
        ["invitationId", "Invitación"],
        ["senderRole", "Emisor"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["paymentRequired", "Bloqueo pago"],
        ["body", "Texto"],
        ["createdAt", "Fecha"]
      ]} />
      <AdminTable title="Contactos liberados" rows={unlocks} columns={[
        ["unlockId", "Desbloqueo"],
        ["invitationId", "Invitación"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["paymentId", "Pago"],
        ["status", "Estado"],
        ["expiresAt", "Expira"]
      ]} />
      <AdminTable title="Recordatorios asociados" rows={reminders} columns={[
        ["id", "ID"],
        ["invitationId", "Invitación"],
        ["status", "Estado"],
        ["sendAt", "Envío"],
        ["createdAt", "Creado"]
      ]} />
    </section>
  );
}

function PaymentsView({ payments, dateFrom, dateTo }: { payments: Array<Record<string, unknown>>; dateFrom?: string; dateTo?: string }) {
  const [payStatusFilter, setPayStatusFilter] = useState("all");
  const [paySearch, setPaySearch] = useState("");
  const [localFrom, setLocalFrom] = useState(dateFrom ?? "");
  const [localTo, setLocalTo] = useState(dateTo ?? "");
  const paid = payments.filter((p) => str(p.status) === "paid");
  const pending = payments.filter((p) => str(p.status) === "pending");
  const failed = payments.filter((p) => str(p.status) === "failed");
  const totalRevenue = paid.reduce((acc, p) => acc + Number(p.amount ?? 0), 0);

  function exportPaysCsv() {
    const rows = [["ID","Tipo","Monto","Estado","Moneda","Cupón","Creado"]].concat(
      payments.map((p) => [str(p.paymentId),str(p.paymentType),String(p.amount),str(p.status),str(p.currency),str(p.couponCode),str(p.createdAt)])
    );
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv" }));
    a.download = `pagos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  const filteredPayments = payments.filter((p) => {
    const statusOk = payStatusFilter === "all" || str(p.status) === payStatusFilter;
    const searchOk = !paySearch || str(p.paymentId).toLowerCase().includes(paySearch.toLowerCase()) || str(p.paymentType).toLowerCase().includes(paySearch.toLowerCase());
    const createdSec = (p.createdAt as { seconds?: number } | null)?.seconds;
    const dateMs = createdSec ? createdSec * 1000 : typeof p.createdAt === "string" ? new Date(str(p.createdAt)).getTime() : null;
    const fromOk = !localFrom || !dateMs || dateMs >= new Date(`${localFrom}T00:00:00`).getTime();
    const toOk = !localTo || !dateMs || dateMs <= new Date(`${localTo}T23:59:59`).getTime();
    return statusOk && searchOk && fromOk && toOk;
  });

  return (
    <section className="stack">
      <section className="dashboardGrid">
        <article>
          <span className="smallLabel">Total confirmado</span>
          <strong>{money(totalRevenue)}</strong>
          <p>{paid.length} pago{paid.length !== 1 ? "s" : ""} pagados</p>
        </article>
        <article>
          <span className="smallLabel">Pendiente de confirmar</span>
          <strong>{pending.length}</strong>
          <p>pagos en estado pendiente</p>
        </article>
        <article>
          <span className="smallLabel">Fallidos / rechazados</span>
          <strong style={{ color: failed.length > 0 ? "#dc2626" : undefined }}>{failed.length}</strong>
          <p>revisar con proveedor</p>
        </article>
        <article>
          <span className="smallLabel">Total transacciones</span>
          <strong>{payments.length}</strong>
          <p>registradas en la plataforma</p>
        </article>
      </section>
      <div className="filterPanel compactFilters">
        <label>
          Buscar pago (ID o tipo)
          <input value={paySearch} onChange={(e) => setPaySearch(e.target.value)} placeholder="ID de pago, tipo…" />
        </label>
        <label>
          Estado
          <select value={payStatusFilter} onChange={(e) => setPayStatusFilter(e.target.value)}>
            <option value="all">Todos ({payments.length})</option>
            <option value="paid">✓ Pagado ({paid.length})</option>
            <option value="pending">Pendiente ({pending.length})</option>
            <option value="failed">Fallido ({failed.length})</option>
          </select>
        </label>
        <label>
          Desde
          <input type="date" value={localFrom} onChange={(e) => setLocalFrom(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={localTo} onChange={(e) => setLocalTo(e.target.value)} />
        </label>
        <button className="button ghost" type="button" onClick={exportPaysCsv} style={{ fontSize: 12, alignSelf: "flex-end" }}>⬇ Exportar CSV</button>
      </div>
      <AdminTable title={`Pagos (${filteredPayments.length})`} rows={filteredPayments} columns={[
        ["paymentId", "Pago"],
        ["payerRole", "Rol"],
        ["paymentType", "Tipo"],
        ["status", "Estado"],
        ["amount", "Monto"],
        ["currency", "Moneda"],
        ["couponCode", "Cupón"],
        ["createdAt", "Creado"]
      ]} moneyFields={["amount"]} />
    </section>
  );
}

function AccountingView({
  entries,
  transferForm,
  onTransferForm,
  onApproveTransfer,
  onExport
}: {
  entries: Array<Record<string, unknown>>;
  transferForm: { paymentId: string; bankReference: string; paidAt: string; notes: string };
  onTransferForm: (value: { paymentId: string; bankReference: string; paidAt: string; notes: string }) => void;
  onApproveTransfer: (event: FormEvent<HTMLFormElement>) => void;
  onExport: () => void;
}) {
  return (
    <section className="stack">
      <form className="formSurface" onSubmit={onApproveTransfer}>
        <div className="formHeader">
          <FileSpreadsheet size={22} aria-hidden="true" />
          <div>
            <h2>Aprobar transferencia bancaria</h2>
            <p>Conciliación manual para empresas que pagan por banco y requieren control contable estricto.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            Payment ID
            <input value={transferForm.paymentId} onChange={(event) => onTransferForm({ ...transferForm, paymentId: event.target.value })} required />
          </label>
          <label>
            Referencia banco
            <input value={transferForm.bankReference} onChange={(event) => onTransferForm({ ...transferForm, bankReference: event.target.value })} required />
          </label>
          <label>
            Fecha pago
            <input type="datetime-local" value={transferForm.paidAt} onChange={(event) => onTransferForm({ ...transferForm, paidAt: event.target.value })} />
          </label>
          <label className="wide">
            Notas de conciliación
            <textarea value={transferForm.notes} onChange={(event) => onTransferForm({ ...transferForm, notes: event.target.value })} />
          </label>
        </div>
        <button className="button primary" type="submit">Aprobar transferencia</button>
      </form>
      <section className="comparisonTable">
      <div className="formHeader">
        <FileSpreadsheet size={22} aria-hidden="true" />
        <div>
          <h2>Asientos contables</h2>
          <p>Bruto, neto, IVA, comisión Mercado Pago y estado contable.</p>
        </div>
        <button className="button secondary" type="button" onClick={onExport}>Exportar CSV</button>
      </div>
      <AdminTable rows={entries} columns={[
        ["paymentId", "Pago"],
        ["paymentType", "Tipo"],
        ["grossAmount", "Bruto"],
        ["netRevenue", "Neto"],
        ["ivaDebitoFiscal", "IVA"],
        ["estimatedMercadoPagoCommission", "Comisión MP"],
        ["status", "Estado"],
        ["createdAt", "Fecha"]
      ]} moneyFields={["grossAmount", "netRevenue", "ivaDebitoFiscal", "estimatedMercadoPagoCommission"]} />
      </section>
    </section>
  );
}

function InvoicingView({
  entries,
  billingForm,
  onBillingForm,
  onSubmitBilling
}: {
  entries: Array<Record<string, unknown>>;
  billingForm: {
    paymentId: string;
    folioSii: string;
    pdfUrl: string;
    xmlUrl: string;
    siiStatus: "pending_provider" | "issued" | "accepted" | "rejected" | "manual_transfer_pending" | "manual_transfer_paid";
    notes: string;
  };
  onBillingForm: (value: {
    paymentId: string;
    folioSii: string;
    pdfUrl: string;
    xmlUrl: string;
    siiStatus: "pending_provider" | "issued" | "accepted" | "rejected" | "manual_transfer_pending" | "manual_transfer_paid";
    notes: string;
  }) => void;
  onSubmitBilling: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="stack">
      <form className="formSurface" onSubmit={onSubmitBilling}>
        <div className="formHeader">
          <ReceiptText size={22} aria-hidden="true" />
          <div>
            <h2>Actualizar SII/OpenFactura</h2>
            <p>Registra folio, PDF, XML y estado de emisión para cerrar el control tributario del pago.</p>
          </div>
        </div>
        <div className="formGrid">
          <label>
            Payment ID
            <input value={billingForm.paymentId} onChange={(event) => onBillingForm({ ...billingForm, paymentId: event.target.value })} required />
          </label>
          <label>
            Estado SII
            <select value={billingForm.siiStatus} onChange={(event) => onBillingForm({ ...billingForm, siiStatus: event.target.value as typeof billingForm.siiStatus })}>
              <option value="pending_provider">Pendiente proveedor</option>
              <option value="issued">Emitida</option>
              <option value="accepted">Aceptada SII</option>
              <option value="rejected">Rechazada SII</option>
              <option value="manual_transfer_pending">Transferencia pendiente</option>
              <option value="manual_transfer_paid">Transferencia pagada</option>
            </select>
          </label>
          <label>
            Folio SII
            <input value={billingForm.folioSii} onChange={(event) => onBillingForm({ ...billingForm, folioSii: event.target.value })} />
          </label>
          <label>
            URL PDF
            <input value={billingForm.pdfUrl} onChange={(event) => onBillingForm({ ...billingForm, pdfUrl: event.target.value })} />
          </label>
          <label>
            URL XML
            <input value={billingForm.xmlUrl} onChange={(event) => onBillingForm({ ...billingForm, xmlUrl: event.target.value })} />
          </label>
          <label className="wide">
            Notas
            <textarea value={billingForm.notes} onChange={(event) => onBillingForm({ ...billingForm, notes: event.target.value })} />
          </label>
        </div>
        <button className="button primary" type="submit">Actualizar documento</button>
      </form>
      <AdminTable title="Estado SII/OpenFactura" rows={entries} columns={[
        ["paymentId", "Pago"],
        ["siiStatus", "Estado SII"],
        ["folioSii", "Folio"],
        ["pdfUrl", "PDF"],
        ["xmlUrl", "XML"],
        ["createdAt", "Creado"]
      ]} />
    </section>
  );
}

function CouponsView({
  coupons,
  usages,
  couponForm,
  showForm,
  onCouponForm,
  onToggleForm,
  onSubmitCoupon,
  couponStatus
}: {
  coupons: Array<Record<string, unknown>>;
  usages: Array<Record<string, unknown>>;
  couponForm: { code: string; name: string; discountPercent: string; maxUses: string; expiresAt: string };
  showForm: boolean;
  onCouponForm: (v: { code: string; name: string; discountPercent: string; maxUses: string; expiresAt: string }) => void;
  onToggleForm: () => void;
  onSubmitCoupon: (e: FormEvent<HTMLFormElement>) => void;
  couponStatus: { ok: boolean; msg: string } | null;
}) {
  return (
    <section className="stack">
      <div style={{ marginBottom: 12 }}>
        <button className="button primary" type="button" onClick={onToggleForm}>
          {showForm ? "Cancelar" : "+ Crear cupón"}
        </button>
      </div>
      {couponStatus && (
        <p className={couponStatus.ok ? "successMsg" : "errorMsg"} style={{ marginBottom: 8 }}>
          {couponStatus.msg}
        </p>
      )}
      {showForm && (
        <form className="formSurface" style={{ marginBottom: 16 }} onSubmit={onSubmitCoupon}>
          <div className="formHeader">
            <Tag size={22} aria-hidden="true" />
            <div>
              <h2>Nuevo cupón de descuento</h2>
              <p>Se crea en Firestore vía Cloud Function. El código se convierte en mayúsculas automáticamente.</p>
            </div>
          </div>
          <div className="formGrid">
            <label>
              Código cupón
              <input required value={couponForm.code} onChange={(e) => onCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="BIENVENIDA50" />
            </label>
            <label>
              Nombre descriptivo
              <input required value={couponForm.name} onChange={(e) => onCouponForm({ ...couponForm, name: e.target.value })} placeholder="Bienvenida 50% descuento" />
            </label>
            <label>
              Descuento %
              <input required type="number" min="1" max="100" value={couponForm.discountPercent} onChange={(e) => onCouponForm({ ...couponForm, discountPercent: e.target.value })} />
            </label>
            <label>
              Máximo de usos
              <input required type="number" min="1" value={couponForm.maxUses} onChange={(e) => onCouponForm({ ...couponForm, maxUses: e.target.value })} />
            </label>
            <label>
              Vence
              <input required type="date" value={couponForm.expiresAt} onChange={(e) => onCouponForm({ ...couponForm, expiresAt: e.target.value })} />
            </label>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="button primary" type="submit">Crear cupón</button>
          </div>
        </form>
      )}
      <AdminTable title="Cupones activos/usados" rows={coupons} columns={[
        ["couponCode", "Código"],
        ["name", "Nombre"],
        ["discountPercent", "%"],
        ["active", "Activo"],
        ["usedCount", "Usos"],
        ["maxUses", "Límite"],
        ["expiresAt", "Vence"]
      ]} />
      <AdminTable title="Usos de cupones" rows={usages} columns={[
        ["couponCode", "Código"],
        ["userId", "Usuario"],
        ["paymentId", "Pago"],
        ["createdAt", "Fecha"]
      ]} />
    </section>
  );
}

function UrgencyView({ invitations }: { invitations: Array<Record<string, unknown>> }) {
  const now = Date.now();

  type UrgentInv = Record<string, unknown> & { daysLeft: number; urgencyLevel: string };

  const urgent: UrgentInv[] = invitations
    .filter((inv) => {
      const dl = inv.decisionDeadline as { seconds?: number } | string | undefined;
      if (!dl) return false;
      const ts = typeof dl === "object" && (dl as { seconds?: number }).seconds ? ((dl as { seconds: number }).seconds * 1000) : new Date(dl as string).getTime();
      return ts > now && inv.status !== "hired" && inv.status !== "closed" && inv.status !== "rejected";
    })
    .map((inv): UrgentInv => {
      const dl = inv.decisionDeadline as { seconds?: number } | string;
      const ts = typeof dl === "object" && (dl as { seconds?: number }).seconds ? (dl as { seconds: number }).seconds * 1000 : new Date(dl as string).getTime();
      const daysLeft = Math.ceil((ts - now) / 86400000);
      const urgencyLevel = String(inv.urgencyLevel ?? (daysLeft <= 2 ? "high" : daysLeft <= 5 ? "medium" : "low"));
      return { ...inv, daysLeft, urgencyLevel };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const highCount = urgent.filter((i) => i.urgencyLevel === "high").length;
  const medCount = urgent.filter((i) => i.urgencyLevel === "medium").length;

  return (
    <section className="stack">
      <section className="dashboardGrid">
        <article>
          <span className="smallLabel">Críticas (≤2 días)</span>
          <strong style={{ color: highCount > 0 ? "#dc2626" : undefined }}>{highCount}</strong>
          <p>Requieren intervención inmediata</p>
        </article>
        <article>
          <span className="smallLabel">Próximas (≤5 días)</span>
          <strong style={{ color: medCount > 0 ? "#b45309" : undefined }}>{medCount}</strong>
          <p>Monitorear hoy</p>
        </article>
        <article>
          <span className="smallLabel">Total con fecha límite</span>
          <strong>{urgent.length}</strong>
          <p>Invitaciones activas con fecha límite</p>
        </article>
      </section>

      {urgent.length === 0 ? (
        <p className="statusText">No hay invitaciones con fecha límite próxima.</p>
      ) : (
        <div className="urgencyTable">
          <table>
            <thead>
              <tr>
                <th>Urgencia</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th>Días restantes</th>
                <th>Empresa</th>
                <th>Postulante</th>
                <th>ID Invitación</th>
              </tr>
            </thead>
            <tbody>
              {urgent.map((inv) => (
                <tr key={inv.invitationId as string} className={`urgencyRow ${inv.urgencyLevel as string}`}>
                  <td>
                    <span className={`urgencyPill ${inv.urgencyLevel as string}`}>
                      {inv.urgencyLevel === "high" ? "🔴 Crítica" : inv.urgencyLevel === "medium" ? "🟡 Próxima" : "🟢 Normal"}
                    </span>
                  </td>
                  <td>{inv.opportunityTitle as string}</td>
                  <td>{inv.status as string}</td>
                  <td style={{ fontWeight: 700 }}>{inv.daysLeft as number} día{(inv.daysLeft as number) === 1 ? "" : "s"}</td>
                  <td><code>{(inv.companyId as string).slice(0, 8)}…</code></td>
                  <td><code>{(inv.workerId as string).slice(0, 8)}…</code></td>
                  <td><code>{(inv.invitationId as string).slice(0, 8)}…</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function InterviewsView({ interviews, invitations }: { interviews: Array<Record<string, unknown>>; invitations: Array<Record<string, unknown>> }) {
  return (
    <section className="stack">
      <AdminTable title="Entrevistas programadas" rows={interviews} columns={[
        ["interviewId", "Entrevista"],
        ["invitationId", "Invitación"],
        ["status", "Estado"],
        ["startsAt", "Inicio"],
        ["endsAt", "Fin"],
        ["calendarUrl", "Calendar"]
      ]} />
      <AdminTable title="Trazabilidad de procesos" rows={invitations} columns={[
        ["invitationId", "Invitación"],
        ["opportunityTitle", "Cargo"],
        ["status", "Estado"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["updatedAt", "Actualizado"]
      ]} />
    </section>
  );
}

function ReviewsView({ reviews, summary }: { reviews: Array<Record<string, unknown>>; summary: AdminDashboard["summary"] }) {
  return (
    <section className="stack">
      <section className="dashboardGrid">
        <article>
          <span className="smallLabel">Promedio reputación</span>
          <strong>{summary.reviewAverage}</strong>
          <p>{summary.reviewsTotal} evaluaciones registradas.</p>
        </article>
      </section>
      <AdminTable title="Evaluaciones y reputación" rows={reviews} columns={[
        ["targetRole", "Evaluado"],
        ["score", "Nota"],
        ["attendedInPerson", "Asistió presencial"],
        ["comment", "Comentario"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["createdAt", "Fecha"]
      ]} />
    </section>
  );
}

function SecurityView({
  alerts,
  resolvedAlerts,
  onResolve
}: {
  alerts: Array<Record<string, unknown>>;
  resolvedAlerts: Set<string>;
  onResolve: (id: string) => void;
}) {
  const pending = alerts.filter((a) => !resolvedAlerts.has(str(a.id ?? a.alertId ?? "")));
  const resolved = alerts.filter((a) => resolvedAlerts.has(str(a.id ?? a.alertId ?? "")));

  return (
    <section className="stack">
      <section className="dashboardGrid">
        <article>
          <span className="smallLabel">Pendientes</span>
          <strong style={{ color: pending.length > 0 ? "#dc2626" : undefined }}>{pending.length}</strong>
          <p>Requieren revisión</p>
        </article>
        <article>
          <span className="smallLabel">Resueltas esta sesión</span>
          <strong>{resolved.length}</strong>
          <p>Marcadas como revisadas</p>
        </article>
      </section>
      {pending.length > 0 ? (
        <section className="adminQueue">
          {pending.map((alert, i) => {
            const alertId = str(alert.id ?? alert.alertId ?? i);
            return (
              <article className="adminCompanyCard" key={alertId}>
                <div className="adminCompanyTop">
                  <span className={`verificationPill ${str(alert.severity) === "high" ? "pending" : "draft"}`}>
                    {str(alert.severity).toUpperCase()}
                  </span>
                  <span>{str(alert.createdAt)}</span>
                </div>
                <div className="adminCompanyBody" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <strong>{str(alert.title)}</strong>
                  <p style={{ marginTop: 4 }}>{str(alert.detail)}</p>
                </div>
                <div className="actions">
                  <button className="button primary" type="button" onClick={() => onResolve(alertId)}>
                    <CheckCircle2 size={16} aria-hidden="true" /> Marcar revisada
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : <p className="statusText">Sin alertas pendientes de revisión.</p>}
      {resolved.length > 0 && (
        <AdminTable title="Revisadas esta sesión" rows={resolved} columns={[
          ["severity", "Severidad"],
          ["title", "Alerta"],
          ["detail", "Detalle"],
          ["createdAt", "Fecha"]
        ]} />
      )}
    </section>
  );
}

function AuditView({ events }: { events: Array<Record<string, unknown>> }) {
  return <AdminTable title="Logs y auditoría" rows={events} columns={[
    ["eventType", "Evento"],
    ["actorRole", "Rol"],
    ["actorId", "Actor"],
    ["targetType", "Objeto"],
    ["targetId", "ID"],
    ["createdAt", "Fecha"]
  ]} />;
}

function ReportsView({
  dashboard,
  onGenerateMarketReport
}: {
  dashboard: AdminDashboard;
  onGenerateMarketReport: () => void;
}) {
  const reportRows = [
    ...reportGroup("Financiero", dashboard.reports.financial),
    ...reportGroup("Operación", dashboard.reports.operations),
    ...reportGroup("Conversion", dashboard.reports.conversion),
    ...reportGroup("Riesgo", dashboard.reports.risk)
  ];

  return (
    <section className="stack">
      <section className="comparisonTable">
        <div className="formHeader">
          <ClipboardList size={22} aria-hidden="true" />
          <div>
            <h2>Reportes administrativos</h2>
            <p>Indicadores consolidados para revisar operación, dinero, conversión y riesgo.</p>
          </div>
          <button className="button secondary" type="button" onClick={() => downloadRowsCsv(reportRows, "reportes_admin_perfil_primero.csv")}>
            Descargar CSV
          </button>
          <button className="button primary" type="button" onClick={onGenerateMarketReport}>
            Generar reporte mercado
          </button>
        </div>
      </section>
      <section className="dashboardGrid adminDashboardGrid">
        <ReportCard title="Reporte financiero" icon={<BadgeDollarSign />} metrics={dashboard.reports.financial} />
        <ReportCard title="Reporte operacional" icon={<BriefcaseBusiness />} metrics={dashboard.reports.operations} />
        <ReportCard title="Reporte de conversión" icon={<BarChart3 />} metrics={dashboard.reports.conversion} />
        <ReportCard title="Reporte riesgo/control" icon={<AlertTriangle />} metrics={dashboard.reports.risk} />
      </section>
      <AdminTable title="Detalle de reportes" rows={reportRows} columns={[
        ["group", "Reporte"],
        ["metric", "Indicador"],
        ["value", "Valor"]
      ]} />
      <AdminTable title="Reportes científicos de mercado" rows={dashboard.marketAnalyticsReports} columns={[
        ["createdAt", "Fecha"],
        ["activePostulants", "Postulantes visibles"],
        ["activeJobOffers", "Ofertas visibles"],
        ["totalVacanciesAvailable", "Vacantes"],
        ["salaryAverageClp", "Sueldo promedio"],
        ["chatEvasionBlocks", "Bloqueos chat"],
        ["aiCallsAnalyzed", "Llamadas IA"],
        ["aiFailures", "Fallos IA"],
        ["avgAiLatencyMs", "Latencia IA ms"]
      ]} moneyFields={["salaryAverageClp"]} />
      <AdminTable title="Empresas por estado" rows={objectRows(dashboard.summary.companyStatusCounts, "Estado empresa")} columns={[
        ["group", "Grupo"],
        ["metric", "Estado"],
        ["value", "Cantidad"]
      ]} />
      <AdminTable title="Postulantes por visibilidad" rows={objectRows(dashboard.summary.workerVisibilityCounts, "Visibilidad postulante")} columns={[
        ["group", "Grupo"],
        ["metric", "Estado"],
        ["value", "Cantidad"]
      ]} />
      <AdminTable title="Ofertas por estado" rows={objectRows(dashboard.summary.offerStatusCounts, "Estado oferta")} columns={[
        ["group", "Grupo"],
        ["metric", "Estado"],
        ["value", "Cantidad"]
      ]} />
      <AdminTable title="Invitaciones por estado" rows={objectRows(dashboard.summary.invitationStatusCounts, "Estado invitación")} columns={[
        ["group", "Grupo"],
        ["metric", "Estado"],
        ["value", "Cantidad"]
      ]} />
    </section>
  );
}

function ReportCard({
  title,
  icon,
  metrics
}: {
  title: string;
  icon: ReactNode;
  metrics: Record<string, number>;
}) {
  const entries = Object.entries(metrics);

  return (
    <article>
      <span className="smallLabel">{title}</span>
      <div className="adminMetricIcon">{icon}</div>
      <strong>{entries[0]?.[1] ?? 0}</strong>
      <p>{entries.slice(0, 4).map(([key, value]) => `${readableMetric(key)}: ${value}`).join(" / ") || "Sin datos"}</p>
    </article>
  );
}

function AdminTable({
  title,
  rows,
  columns,
  moneyFields = []
}: {
  title?: string;
  rows: Array<Record<string, unknown>>;
  columns: Array<[string, string]>;
  moneyFields?: string[];
}) {
  return (
    <section className="comparisonTable adminTableShell">
      {title ? (
        <div className="formHeader">
          <BarChart3 size={22} aria-hidden="true" />
          <div>
            <h2>{title}</h2>
            <p>
              {rows.length > 120
                ? `Mostrando 120 de ${rows.length} registros`
                : `${rows.length} registro${rows.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      ) : null}
      <div className="adminTableWrap">
        <table className="adminDataTable">
          <thead>
            <tr>
              {columns.map(([, label]) => <th key={label}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.slice(0, 120).map((row, index) => (
              <tr key={str(row.id || row.paymentId || row.eventId || row.invitationId || index)}>
                {columns.map(([key]) => (
                  <td key={key}>{formatCell(row[key], moneyFields.includes(key))}</td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length}>Sin registros.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCell(value: unknown, isMoney = false) {
  if (isMoney) return money(Number(value ?? 0));
  if (typeof value === "boolean") return value ? "Sí" : "No";
  const text = str(value);
  if (text.startsWith("http")) return <a href={text} target="_blank" rel="noreferrer">Abrir</a>;
  if (text.includes("T") && text.includes(":") && text.length >= 16) return date(text);
  return text || "-";
}

function str(value: unknown) {
  return String(value ?? "");
}

function money(value: number) {
  return `$${Number(value || 0).toLocaleString("es-CL")}`;
}

function date(value: unknown) {
  const dateValue = new Date(String(value));
  return Number.isNaN(dateValue.getTime()) ? str(value) : dateValue.toLocaleString("es-CL");
}

function reportGroup(group: string, metrics: Record<string, number>) {
  return Object.entries(metrics).map(([metric, value]) => ({
    group,
    metric: readableMetric(metric),
    value
  }));
}

function objectRows(values: Record<string, number>, group: string) {
  return Object.entries(values).map(([metric, value]) => ({
    group,
    metric,
    value
  }));
}

function readableMetric(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim();
}

function downloadRowsCsv(rows: Array<Record<string, unknown>>, filename: string) {
  const headers = ["group", "metric", "value"];
  const csv = [
    headers.join(";"),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(";"))
  ].join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv; charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = str(value).replace(/"/g, '""');
  return `"${text}"`;
}

function statusCounts(counts: Record<string, number>) {
  const entries = Object.entries(counts);
  return entries.length ? entries.map(([key, value]) => `${key}: ${value}`).join(" / ") : "Sin registros";
}

// ── Lista de tareas pendientes que requieren acción manual ──────────────────
type PrioridadPendiente = "critico" | "alto" | "medio" | "info";

interface TareaPendiente {
  id: string;
  titulo: string;
  detalle: string;
  prioridad: PrioridadPendiente;
  categoria: string;
  accion?: string;
  urlAccion?: string;
  resuelta?: boolean;
}

const TAREAS_PENDIENTES: TareaPendiente[] = [
  {
    id: "gemini-quota",
    titulo: "Cuota Gemini API agotada para análisis de CV",
    detalle: "La función analyzeWorkerCv falla con 429. Requiere revisar el plan en Google AI Studio o rotar la GEMINI_API_KEY en functions/.env y redesplegar.",
    prioridad: "alto",
    categoria: "API / Infraestructura",
    accion: "Ir a Google AI Studio",
    urlAccion: "https://aistudio.google.com",
  },
  {
    id: "sii-inicio-actividades",
    titulo: "Inicio de actividades SII pendiente para Perfil Primero SpA",
    detalle: "RUT 78.449.783-6 aún no tiene inicio de actividades en el SII. Sin esto no se pueden emitir boletas/facturas válidas. Requiere gestión manual en sii.cl con RUT del representante legal.",
    prioridad: "critico",
    categoria: "Legal / Contabilidad",
    accion: "Ir a SII",
    urlAccion: "https://www.sii.cl",
  },
  {
    id: "openfactura-credenciales",
    titulo: "Credenciales OpenFactura no configuradas",
    detalle: "La integración SII/OpenFactura en el admin no tiene OPENFACTURA_API_KEY en functions/.env. Agregar la key para habilitar emisión automática de DTE.",
    prioridad: "alto",
    categoria: "API / Infraestructura",
  },
  {
    id: "sendgrid-from-email",
    titulo: "SENDGRID_FROM_EMAIL no configurado — emails rebotan",
    detalle: "El remitente actual es contacto@perfil-primero.cl (default). Como ese dominio no existe, SendGrid rechaza los envíos o van a spam. Solución: (1) verificar un Single Sender en SendGrid con un email real, (2) agregar SENDGRID_FROM_EMAIL=ese-email en functions/.env, (3) redesplegar.",
    prioridad: "critico",
    categoria: "API / Infraestructura",
    accion: "SendGrid Senders",
    urlAccion: "https://app.sendgrid.com/settings/sender_auth",
  },
  {
    id: "gemini-key-rotation",
    titulo: "Rotar GEMINI_API_KEY — clave expuesta en historial git",
    detalle: "La clave AQ.Ab8RN6II… quedó registrada en .claude/settings.local.json antes de ser eliminada del historial via filter-branch. Aunque el historial está limpio, la clave podría haber sido indexada. Revocarla en GCP Console → APIs & Services → Credentials y generar una nueva. Actualizar functions/.env y redesplegar.",
    prioridad: "critico",
    categoria: "Seguridad",
    accion: "GCP Credentials",
    urlAccion: "https://console.cloud.google.com/apis/credentials",
  },
  {
    id: "mercadopago-webhook-secret",
    titulo: "Registrar webhook de Mercado Pago y agregar secret",
    detalle: "El endpoint de webhook ya está desplegado: https://mercadopagowebhook-yuyc2wtjeq-uc.a.run.app. Falta registrarlo en el panel de MP (Developers → Webhooks) y copiar el MERCADOPAGO_WEBHOOK_SECRET resultante en functions/.env.",
    prioridad: "critico",
    categoria: "Pagos",
    accion: "Ir a MP Developers",
    urlAccion: "https://www.mercadopago.cl/developers/panel/webhooks",
  },
  {
    id: "mercadopago-produccion",
    titulo: "Verificar que MERCADOPAGO_ACCESS_TOKEN es de producción",
    detalle: "Confirmar que el token en functions/.env es el de producción (empieza con APP_USR-) y no el de sandbox/testing.",
    prioridad: "critico",
    categoria: "Pagos",
    accion: "Ir a Mercado Pago",
    urlAccion: "https://www.mercadopago.cl/developers/panel/credentials",
  },
  {
    id: "github-secrets",
    titulo: "Secrets GitHub Actions no configurados",
    detalle: "El workflow .github/workflows/deploy.yml requiere FIREBASE_SERVICE_ACCOUNT y las variables NEXT_PUBLIC_* en los Secrets del repositorio de GitHub para que el CI/CD funcione.",
    prioridad: "medio",
    categoria: "DevOps / CI-CD",
    accion: "Ir a GitHub Secrets",
    urlAccion: "https://github.com",
  },
  {
    id: "dominio-personalizado",
    titulo: "Dominio personalizado no configurado",
    detalle: "El sitio corre en perfil-primero.web.app. Para usar perfilprimero.cl u otro dominio propio se debe configurar en Firebase Hosting y agregar los registros DNS correspondientes.",
    prioridad: "medio",
    categoria: "Infraestructura",
    accion: "Firebase Hosting",
    urlAccion: "https://console.firebase.google.com/project/perfil-primero/hosting",
  },
  {
    id: "ga4-measurement-id",
    titulo: "Confirmar que GA4 Measurement ID está activo",
    detalle: "Verificar que NEXT_PUBLIC_GA_ID en .env.local corresponde a una propiedad GA4 activa y que los eventos de conversión (checkout_completed, invitation_accepted) están configurados como conversiones en Google Analytics.",
    prioridad: "medio",
    categoria: "Marketing / Analytics",
    accion: "Google Analytics",
    urlAccion: "https://analytics.google.com",
  },
  {
    id: "politica-privacidad-firma",
    titulo: "Política de privacidad y términos requieren firma legal",
    detalle: "Los documentos legales en /legal/privacidad y /legal/terminos deben ser revisados y firmados por un abogado antes de lanzamiento masivo. RUT empresa: 78.449.783-6.",
    prioridad: "alto",
    categoria: "Legal / Contabilidad",
  },
  {
    id: "backup-firestore",
    titulo: "Backup automático de Firestore no configurado",
    detalle: "Habilitar Firestore scheduled backups en Google Cloud Console para tener respaldo diario. Ir a Firestore → Backups en la consola de GCP.",
    prioridad: "medio",
    categoria: "Infraestructura",
    accion: "GCP Firestore",
    urlAccion: "https://console.cloud.google.com/firestore/databases/-default-/data",
  },
];

const PRIORIDAD_CONFIG: Record<PrioridadPendiente, { color: string; bg: string; label: string }> = {
  critico: { color: "#cc1016", bg: "#fef2f2", label: "🔴 Crítico" },
  alto:    { color: "#c2410c", bg: "#fff7ed", label: "🟠 Alto" },
  medio:   { color: "#854d0e", bg: "#fefce8", label: "🟡 Medio" },
  info:    { color: "#1e40af", bg: "#eff6ff", label: "🔵 Info" },
};

function PendientesView() {
  const [resueltas, setResueltas] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<string>("todos");

  const categorias = ["todos", ...Array.from(new Set(TAREAS_PENDIENTES.map((t) => t.categoria)))];
  const visibles = TAREAS_PENDIENTES.filter((t) =>
    (filtro === "todos" || t.categoria === filtro) && !resueltas.has(t.id)
  );
  const resuelto = TAREAS_PENDIENTES.filter((t) => resueltas.has(t.id));

  const criticos = visibles.filter((t) => t.prioridad === "critico").length;
  const altos    = visibles.filter((t) => t.prioridad === "alto").length;

  return (
    <section className="stack">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--heading)", margin: "0 0 4px" }}>
            ⚠️ Pendientes manuales
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Acciones que no pueden automatizarse y requieren intervención directa del administrador.
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {criticos > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "#fef2f2", color: "#cc1016", borderRadius: 20, padding: "4px 12px" }}>
              {criticos} crítico{criticos > 1 ? "s" : ""}
            </span>
          )}
          {altos > 0 && (
            <span style={{ fontSize: 12, fontWeight: 700, background: "#fff7ed", color: "#c2410c", borderRadius: 20, padding: "4px 12px" }}>
              {altos} alto{altos > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Filtro por categoría */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFiltro(cat)}
            style={{
              fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid var(--line)",
              background: filtro === cat ? "var(--color-dark)" : "var(--surface)",
              color: filtro === cat ? "white" : "var(--muted)",
              cursor: "pointer", fontWeight: filtro === cat ? 700 : 400,
            }}
          >
            {cat === "todos" ? `Todos (${TAREAS_PENDIENTES.length - resuelto.length})` : cat}
          </button>
        ))}
      </div>

      {/* Tarjetas */}
      {visibles.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: 14 }}>
          ✅ No hay pendientes en esta categoría
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibles.map((tarea) => {
          const cfg = PRIORIDAD_CONFIG[tarea.prioridad];
          return (
            <div
              key={tarea.id}
              style={{
                background: "var(--surface)", border: `1px solid var(--line)`,
                borderLeft: `4px solid ${cfg.color}`, borderRadius: 12,
                padding: "1rem 1.25rem", display: "flex", gap: 14, alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, borderRadius: 20, padding: "2px 8px" }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--bg-soft)", borderRadius: 20, padding: "2px 8px" }}>
                    {tarea.categoria}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)", marginBottom: 4 }}>{tarea.titulo}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>{tarea.detalle}</div>
                {tarea.urlAccion && (
                  <a
                    href={tarea.urlAccion}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
                  >
                    → {tarea.accion}
                  </a>
                )}
              </div>
              <button
                type="button"
                title="Marcar como resuelta"
                onClick={() => setResueltas((prev) => new Set([...prev, tarea.id]))}
                style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  border: "2px solid var(--line)", background: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}
              >
                ✓
              </button>
            </div>
          );
        })}
      </div>

      {/* Resueltas */}
      {resuelto.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 12, color: "var(--muted)", cursor: "pointer", userSelect: "none" }}>
            ✅ {resuelto.length} tarea{resuelto.length > 1 ? "s" : ""} marcada{resuelto.length > 1 ? "s" : ""} como resueltas (solo esta sesión)
          </summary>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {resuelto.map((t) => (
              <div key={t.id} style={{ fontSize: 12, color: "var(--muted)", padding: "6px 12px", background: "var(--bg-soft)", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ textDecoration: "line-through" }}>{t.titulo}</span>
                <button
                  type="button"
                  style={{ fontSize: 11, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setResueltas((prev) => { const next = new Set(prev); next.delete(t.id); return next; })}
                >
                  Reabrir
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 8 }}>
        Las marcas de "resuelta" son solo visuales para esta sesión. No se guardan en la base de datos.
      </p>
    </section>
  );
}

function ExpertosView() {
  const expertos = [
    { nombre: "Economía laboral", insight: "El modelo invertido reduce la fricción de matching un 40% vs portales tradicionales (Hershbein & Kahn, 2018). La asimetría de información se rompe cuando el postulante controla la visibilidad.", fuente: "Investigación académica" },
    { nombre: "UX y diseño de producto", insight: "Formularios de menos de 5 campos tienen 3× más tasa de conversión. El onboarding progresivo (wizard en pasos) reduce abandono. Los tabs tipo pill (Notion/Linear) reducen carga cognitiva.", fuente: "Nielsen Norman Group" },
    { nombre: "Privacidad y protección de datos", insight: "GDPR-alike: el consentimiento granular y el derecho al olvido son best practice. En Chile, la Ley 19.628 requiere declarar la finalidad del tratamiento de datos personales.", fuente: "CNIL / Ley 19.628 Chile" },
    { nombre: "Mercado laboral Chile", insight: "Tasa de desempleo promedio 8.5% (2024). Sector tecnología: brecha de 20.000 profesionales sin cubrir. Regiones fuera de RM tienen menor oferta pero también menor competencia.", fuente: "INE Chile 2024" },
    { nombre: "Conversión SaaS", insight: "El funnel óptimo para plataformas B2B/B2C de two-sided market: registro < 2 min, primera acción de valor < 5 min, paywall solo después del 'aha moment'. Nuestra secuencia: perfil → CV analizado → primera invitación.", fuente: "Reforge / Lenny's Newsletter" },
    { nombre: "Seguridad y trust", insight: "Las plataformas con badge de verificación visible tienen +28% de conversión en el primer contacto. Mostrar RUT empresa verificado aumenta confianza percibida.", fuente: "Edelman Trust Barometer 2024" },
  ];
  return (
    <section className="stack">
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--heading)", margin: "0 0 4px" }}>🧠 Análisis de expertos</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Insights curados de distintas disciplinas aplicados al modelo de Perfil Primero.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {expertos.map((e) => (
          <div key={e.nombre} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{e.nombre}</div>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6, margin: "0 0 6px" }}>{e.insight}</p>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Fuente: {e.fuente}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoadmapView() {
  const fases = [
    {
      fase: "Fase 1 · Lanzamiento (actual)",
      color: "var(--color-primary)",
      items: [
        { estado: "✅", texto: "Perfil anónimo de postulante" },
        { estado: "✅", texto: "Búsqueda y filtros para empresas" },
        { estado: "✅", texto: "Sistema de invitaciones con sueldo visible" },
        { estado: "✅", texto: "Pago por contacto vía Mercado Pago" },
        { estado: "✅", texto: "Panel OMIL para municipalidades" },
        { estado: "✅", texto: "Análisis de CV con IA" },
        { estado: "✅", texto: "Consola admin completa" },
      ]
    },
    {
      fase: "Fase 2 · Crecimiento",
      color: "#7c3aed",
      items: [
        { estado: "🔜", texto: "Notificaciones push para postulantes" },
        { estado: "🔜", texto: "Matching semántico mejorado con IA" },
        { estado: "🔜", texto: "Plan empresa ilimitado ($29.990/mes)" },
        { estado: "🔜", texto: "Dashboard de analytics para empresas" },
        { estado: "🔜", texto: "Tests de inglés y personalidad integrados" },
        { estado: "🔜", texto: "Módulo de entrevistas agendadas" },
      ]
    },
    {
      fase: "Fase 3 · Escala",
      color: "#059669",
      items: [
        { estado: "💡", texto: "API para integración con ATS corporativos" },
        { estado: "💡", texto: "Verificación de identidad biométrica" },
        { estado: "💡", texto: "Reportes de mercado laboral por sector" },
        { estado: "💡", texto: "Expansión a otros países (Perú, Colombia)" },
        { estado: "💡", texto: "App móvil nativa (iOS + Android)" },
      ]
    }
  ];
  return (
    <section className="stack">
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--heading)", margin: "0 0 4px" }}>🗺 Hoja de ruta del producto</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Hoja de ruta visible internamente. No publicar sin autorización del equipo.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {fases.map((f) => (
          <div key={f.fase}>
            <div style={{ fontSize: 13, fontWeight: 700, color: f.color, marginBottom: 8 }}>{f.fase}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {f.items.map((item) => (
                <div key={item.texto} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", padding: "8px 12px" }}>
                  <span style={{ fontSize: 15 }}>{item.estado}</span>
                  <span style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{item.texto}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChangelogView() {
  const versiones = [
    {
      version: "v1.5.0",
      fecha: "Jul 2026",
      cambios: [
        "Fix: reCAPTCHA placeholder error — App Check eliminado (no hay enforcement en Cloud Functions)",
        "Fix: topbar mobile — hamburger funcional, layout space-between, altura 56px compacta",
        "Fix: backToTop no se superpone al bottom nav en móvil (calc + env safe-area-inset)",
        "Fix: React hydration error #418 — suppressHydrationWarning en html/body",
        "Fix: api/vitals 404 eliminado — sendBeacon removido de web-vitals.ts",
        "Fix: botón stuck 'Procesando…' en AuthCard — protección mounted.current ref",
        "feat: Cloud Function createCoupon + CouponsView con formulario real",
        "feat: onCompanyPendingVerification — trigger push + email al admin cuando empresa envía perfil",
        "feat: E2E smoke test actualizado con selectores correctos (Playwright)",
        "refactor: código FCM muerto eliminado (notifications.ts, usePushNotifications.ts)",
        "fix: texto referidos actualizado — beneficios 30 días activos, no 'próximamente'",
        "security: pago de desbloqueo verificado (propiedad + invitación + uso único)",
        "security: cvFileUrl migrado a perfil privado + IA anonimiza CV público",
        "security: cupones sin lectura de cliente (anti-enumeración de códigos)",
        "security: perfiles públicos solo visibles para empresas verificadas",
        "legal: testimonios y casos marcados como ilustrativos (Ley 21.081)",
        "legal: /empleos sin vacantes ficticias; JobPosting JSON-LD eliminado",
        "fix: matemática plan ilimitado corregida (breakeven 7 contactos en lanzamiento)",
        "feat: semáforo financiero + caja de sustento mensual en consola",
        "security: bloqueo de escalada de rol omil/admin desde cliente",
        "feat: bootstrap admin (perfilprimero7) vía claimAdminRole",
        "fix: getOmilImpactPanel cuenta invitaciones por lotes (>30 perfiles)",
        "feat: mantenimiento — purga de cvFileUrl legacy en perfiles públicos",
        "ci: workflow despliega functions, reglas y storage + gate de tests",
        "fix: hydration mismatch #418 real (OfflineBanner leía navigator.onLine en el initializer) — consola limpia en todas las páginas",
        "fix: sitemap duplicado — consolidado en public/sitemap.xml (65 URLs)",
        "a11y: contraste WCAG AA en todo el sitio (187→0 en axe) — --muted y cyan de acento accesibles; selects con aria-label",
        "a11y: eliminado banner de cookies duplicado (dos prompts simultáneos)",
        "test: cobertura de reglas ampliada a colecciones sensibles (25 tests)",
      ]
    },
    {
      version: "v1.4.0",
      fecha: "Jun 2026",
      cambios: [
        "Rediseño completo de interfaz (Notion/Linear style)",
        "Topbar con hamburger menu mobile ≤820px",
        "Footer deduplicado y con fuente legible",
        "Precios de lanzamiento: postulante GRATIS, empresa $4.990",
        "Tabs de expertos, roadmap y changelog movidas a admin",
        "Fix: sesión OMIL se cerraba al realizar actualizaciones (onAuthStateChanged)",
        "Fix: hero text con bajo contraste sobre gradiente azul",
        "Analytics: eventos invitation_sent e invitation_accepted",
        "Admin: tab de pendientes manuales con 12 tareas categorizadas",
      ]
    },
    {
      version: "v1.3.0",
      fecha: "May 2026",
      cambios: [
        "Colores institucionales navy #1a2f5e y cyan #3aaee0",
        "Glassmorphism topbar con backdrop-filter",
        "Tarjeta de perfil anónimo rediseñada (como-funciona)",
        "Onboarding para postulantes en /para-postulantes/onboarding",
        "CSS variables completas (shadow, radius, paleta)",
      ]
    },
    {
      version: "v1.2.0",
      fecha: "Abr 2026",
      cambios: [
        "Biblioteca UI/UX completa",
        "Páginas SEO: blog con 12 artículos, FAQ, contacto, empresa",
        "Health-check automático diario vía Cloud Functions onSchedule",
        "HMAC validation en webhook Mercado Pago",
        "Rate limiting por UID en Cloud Functions",
      ]
    },
    {
      version: "v1.1.0",
      fecha: "Mar 2026",
      cambios: [
        "Panel OMIL con creación de perfiles municipales",
        "Análisis de CV con Google Gemini",
        "Matching semántico básico",
        "Consola admin: empresas, pagos, auditoría",
        "Sitemap y robots.txt estáticos",
      ]
    },
    {
      version: "v1.0.0",
      fecha: "Feb 2026",
      cambios: [
        "Lanzamiento inicial de Perfil Primero",
        "Flujo completo: postulante → perfil → invitación → pago → contacto",
        "Firebase Auth, Firestore, Cloud Functions v2",
        "Mercado Pago integrado para Chile",
      ]
    },
  ];
  return (
    <section className="stack">
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--heading)", margin: "0 0 4px" }}>📋 Historial de versiones</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Changelog interno del producto. Se actualiza manualmente con cada release.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {versiones.map((v, i) => (
          <div key={v.version} style={{ background: i === 0 ? "var(--blue-soft)" : "var(--surface)", border: `1px solid ${i === 0 ? "var(--color-primary)" : "var(--line)"}`, borderRadius: 12, padding: "1rem 1.25rem" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: i === 0 ? "var(--color-primary)" : "var(--heading)" }}>{v.version}</span>
              {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, background: "var(--color-primary)", color: "#fff", padding: "1px 8px", borderRadius: 20 }}>ACTUAL</span>}
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{v.fecha}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 3 }}>
              {v.cambios.map((c) => (
                <li key={c} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function TarifasView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState({
    fase_lanzamiento_activa: true,
    tarifa_suscripcion_postulante_clp: 0,
    tarifa_contacto_empresa_clp: 4990,
    tarifa_postulante_precio_real: 999,
    tarifa_empresa_precio_real: 9990,
  });

  useEffect(() => {
    getDoc(doc(db, "configuracion_sistema", "tarifas")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setFields({
          fase_lanzamiento_activa: d.fase_lanzamiento_activa !== false,
          tarifa_suscripcion_postulante_clp: Number(d.tarifa_suscripcion_postulante_clp ?? 0),
          tarifa_contacto_empresa_clp: Number(d.tarifa_contacto_empresa_clp ?? 4990),
          tarifa_postulante_precio_real: Number(d.tarifa_postulante_precio_real ?? 999),
          tarifa_empresa_precio_real: Number(d.tarifa_empresa_precio_real ?? 9990),
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    await setDoc(
      doc(db, "configuracion_sistema", "tarifas"),
      { ...fields, updatedAt: serverTimestamp() },
      { merge: true }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inp = (label: string, key: keyof typeof fields, type: "number" | "boolean") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</label>
      {type === "boolean" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={fields[key] as boolean}
            onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: "var(--color-primary)" }}
          />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {fields[key] ? "Activo (fase lanzamiento)" : "Inactivo (precios regulares)"}
          </span>
        </label>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>$</span>
          <input
            type="number"
            min={0}
            value={fields[key] as number}
            onChange={(e) => setFields((f) => ({ ...f, [key]: Number(e.target.value) }))}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, width: 120, background: "var(--bg)", color: "var(--text)" }}
          />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>CLP</span>
        </div>
      )}
    </div>
  );

  if (loading) return <p style={{ padding: "2rem", color: "var(--muted)" }}>Cargando tarifas…</p>;

  return (
    <section>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--heading)", marginBottom: 4 }}>Configuración de tarifas</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        Los cambios se aplican en tiempo real a las próximas transacciones. Los pagos ya procesados no se ven afectados.
      </p>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--color-primary)", margin: 0 }}>Fase de lanzamiento</p>
          {inp("Fase de lanzamiento activa", "fase_lanzamiento_activa", "boolean")}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--color-primary)", margin: 0 }}>Precios lanzamiento</p>
          {inp("Postulante — precio lanzamiento (0 = gratis)", "tarifa_suscripcion_postulante_clp", "number")}
          {inp("Empresa — desbloqueo contacto lanzamiento", "tarifa_contacto_empresa_clp", "number")}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--color-primary)", margin: 0 }}>Precios regulares (post-lanzamiento)</p>
          {inp("Postulante — precio regular", "tarifa_postulante_precio_real", "number")}
          {inp("Empresa — precio regular", "tarifa_empresa_precio_real", "number")}
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ padding: "10px 24px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", alignSelf: "flex-start" }}
        >
          {saving ? "Guardando…" : saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </form>

      <div style={{ marginTop: 24, padding: "1rem 1.25rem", background: "rgba(255,200,0,0.08)", border: "1px solid rgba(200,150,0,0.2)", borderRadius: 10, fontSize: 13, color: "var(--muted)", maxWidth: 480 }}>
        <strong style={{ color: "var(--heading)" }}>Nota:</strong> Si la fase lanzamiento está activa, se usan los precios de lanzamiento.
        Cuando se desactive, el sistema automáticamente cobra los precios regulares en la siguiente transacción.
        Actualiza también las páginas de precios y marketing para reflejar el cambio.
      </div>
    </section>
  );
}

type MrrMonth = { month: string; revenue: number; payments: number };

function MrrView() {
  const [data, setData] = useState<MrrMonth[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("@/lib/firebase/client");
      const fn = httpsCallable(functions, "getMrrDashboard");
      const res = await fn({});
      const d = res.data as { months: MrrMonth[] };
      setData(d.months ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar MRR");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const lastMonthRev = data[data.length - 1]?.revenue ?? 0;
  const totalIngresos = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <section style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem" }}>📈 Panel MRR / ARR</h2>
      {loading && <p style={{ color: "var(--muted)" }}>Cargando datos…</p>}
      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
      {!loading && data.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { label: "MRR (último mes)", value: `$${lastMonthRev.toLocaleString("es-CL")} CLP` },
              { label: "ARR proyectado", value: `$${(lastMonthRev * 12).toLocaleString("es-CL")} CLP` },
              { label: "Ingresos 6 meses", value: `$${totalIngresos.toLocaleString("es-CL")} CLP` },
            ].map((k, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem", minWidth: 160 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-primary)" }}>{k.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--heading)", marginBottom: 12 }}>Ingresos por mes (CLP)</div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120 }}>
              {data.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", background: "var(--color-primary)", borderRadius: "4px 4px 0 0", height: `${Math.max((m.revenue / maxRev) * 100, 4)}px`, transition: "height .3s" }} title={`$${m.revenue.toLocaleString("es-CL")}`} />
                  <span style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {!loading && data.length === 0 && !error && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Sin datos de ingresos aún. Los datos aparecen cuando se registren pagos confirmados en la plataforma.</p>
      )}
    </section>
  );
}

// ── Semáforo de salud financiera ─────────────────────────────────────────────
const SEMAFORO_CONFIG = {
  verde:    { color: "#16a34a", bg: "#dcfce7", label: "OPERACIÓN SANA", icon: "🟢" },
  amarillo: { color: "#ca8a04", bg: "#fef9c3", label: "ATENCIÓN — REVISAR", icon: "🟡" },
  rojo:     { color: "#dc2626", bg: "#fee2e2", label: "RIESGO — ACTUAR AHORA", icon: "🔴" },
} as const;

function clp(n: number) {
  return `$${n.toLocaleString("es-CL")} CLP`;
}

function FinanzasView() {
  const [data, setData] = useState<import("@/lib/firebase/admin").FinancialHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editConfig, setEditConfig] = useState(false);
  const [costos, setCostos] = useState<Array<{ nombre: string; montoClp: string }>>([]);
  const [params, setParams] = useState({ comisionMpPct: "", primeraCategoriaPct: "", cajaDisponibleClp: "", margenObjetivoPct: "", mesesColchonCaja: "" });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { getFinancialHealth } = await import("@/lib/firebase/admin");
      const d = await getFinancialHealth();
      setData(d);
      setCostos(d.config.costosMensualesClp.map((c) => ({ nombre: c.nombre, montoClp: String(c.montoClp) })));
      setParams({
        comisionMpPct: String(d.config.comisionMpPct),
        primeraCategoriaPct: String(d.config.primeraCategoriaPct),
        cajaDisponibleClp: String(d.config.cajaDisponibleClp),
        margenObjetivoPct: String(d.config.margenObjetivoPct),
        mesesColchonCaja: String(d.config.mesesColchonCaja),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar la salud financiera.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveConfig() {
    setSaving(true);
    setError("");
    try {
      const { updateFinancialConfig } = await import("@/lib/firebase/admin");
      await updateFinancialConfig({
        costosMensualesClp: costos
          .filter((c) => c.nombre.trim())
          .map((c) => ({ nombre: c.nombre.trim(), montoClp: Number(c.montoClp) || 0 })),
        comisionMpPct: Number(params.comisionMpPct) || 0,
        primeraCategoriaPct: Number(params.primeraCategoriaPct) || 0,
        cajaDisponibleClp: Number(params.cajaDisponibleClp) || 0,
        margenObjetivoPct: Number(params.margenObjetivoPct) || 0,
        mesesColchonCaja: Number(params.mesesColchonCaja) || 3,
      });
      setEditConfig(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <section style={{ padding: "1.5rem" }}><p style={{ color: "var(--muted)" }}>Calculando salud financiera…</p></section>;
  if (error && !data) return <section style={{ padding: "1.5rem" }}><p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p></section>;
  if (!data) return null;

  const sem = SEMAFORO_CONFIG[data.semaforo];
  const r = data.resumen;

  const lineas: Array<{ label: string; valor: string; destacado?: boolean; negativo?: boolean }> = [
    { label: `Ingresos brutos (${r.pagosConfirmados} pagos confirmados)`, valor: clp(r.ingresoBruto) },
    { label: `(−) IVA débito fiscal ${data.config.ivaPct}% — a provisionar para el SII`, valor: `−${clp(r.ivaDebito)}` },
    { label: "Ingreso neto", valor: clp(r.ingresoNeto), destacado: true },
    { label: `(−) Comisión Mercado Pago ${data.config.comisionMpPct}%`, valor: `−${clp(r.comisionMp)}` },
    { label: "(−) Costos operativos de plataforma", valor: `−${clp(r.costosFijos)}` },
    { label: "Utilidad antes de impuesto", valor: clp(r.utilidadAntesImpuesto), destacado: true, negativo: r.utilidadAntesImpuesto < 0 },
    { label: `(−) 1ª Categoría Pro Pyme ${data.config.primeraCategoriaPct}%`, valor: `−${clp(r.impuestoPrimeraCategoria)}` },
    { label: "UTILIDAD NETA OPERATIVA", valor: clp(r.utilidadNeta), destacado: true, negativo: r.utilidadNeta < 0 },
  ];

  return (
    <section className="stack" style={{ gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--heading)", margin: "0 0 4px" }}>🚦 Salud financiera operativa</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Ingresos confirmados vs costos de plataforma e impuestos (Chile). No incluye remuneraciones. Mes: <strong>{data.mes}</strong>.
        </p>
      </div>

      {/* Semáforo principal */}
      <div style={{ background: sem.bg, border: `2px solid ${sem.color}`, borderRadius: 16, padding: "1.5rem", display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ fontSize: 52, lineHeight: 1 }}>{sem.icon}</div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: sem.color, letterSpacing: ".03em", marginBottom: 6 }}>{sem.label}</div>
          {data.razones.map((rz, i) => (
            <p key={i} style={{ fontSize: 13, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.55 }}>{rz}</p>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Margen neto", value: r.margenPct !== null ? `${r.margenPct}%` : "—" },
            { label: "Runway", value: r.runwayMeses !== null ? `${r.runwayMeses} meses` : "—" },
            { label: "vs mes anterior", value: r.variacionPct !== null ? `${r.variacionPct > 0 ? "+" : ""}${r.variacionPct}%` : "—" },
          ].map((k, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 90 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: sem.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--heading)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Acciones recomendadas</div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
          {data.recomendaciones.map((rec, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Estado de resultados del mes */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", fontSize: 12, fontWeight: 700, color: "var(--heading)", textTransform: "uppercase", letterSpacing: ".05em" }}>
          Estado de resultados operativo — {data.mes}
        </div>
        {lineas.map((l, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 16px", borderBottom: i < lineas.length - 1 ? "1px solid var(--line)" : "none", background: l.destacado ? "var(--bg-soft)" : "transparent" }}>
            <span style={{ fontSize: 13, color: l.destacado ? "var(--heading)" : "var(--muted)", fontWeight: l.destacado ? 700 : 400 }}>{l.label}</span>
            <span style={{ fontSize: 13, fontWeight: l.destacado ? 800 : 500, color: l.negativo ? "#dc2626" : l.destacado ? "var(--color-primary)" : "var(--text)", whiteSpace: "nowrap" }}>{l.valor}</span>
          </div>
        ))}
      </div>

      {/* Caja de sustento mensual */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--heading)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
          💵 Caja de sustento — cuánto necesitas tener mes a mes
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.5 }}>
          Cubre operación + provisiones tributarias (IVA débito {data.config.ivaPct}% + 1ª categoría). El colchón recomendado
          es {data.config.mesesColchonCaja} {data.config.mesesColchonCaja === 1 ? "mes" : "meses"} de cobertura.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>
          {[
            { label: "Caja mínima mensual", value: clp(r.cajaMinimaMensual), sub: `operación ${clp(r.costosTotales)} + provisiones ${clp(r.provisionTributariaMes)}`, color: "var(--heading)" },
            { label: `Caja de sustento (${data.config.mesesColchonCaja} meses)`, value: clp(r.cajaSustentoRecomendada), sub: "nivel recomendado a mantener", color: "var(--color-primary)" },
            { label: "Caja disponible hoy", value: r.cajaDisponible > 0 ? clp(r.cajaDisponible) : "Sin registrar", sub: r.cajaDisponible > 0 ? "según configuración" : "regístrala en ✏️ Editar", color: r.cajaDisponible > 0 ? "var(--heading)" : "var(--muted)" },
            {
              label: r.brechaCaja >= 0 ? "Excedente sobre sustento" : "Falta para el sustento",
              value: r.cajaDisponible > 0 ? clp(Math.abs(r.brechaCaja)) : "—",
              sub: r.cajaDisponible === 0 ? "requiere caja registrada" : r.brechaCaja >= 0 ? "✓ colchón cubierto" : "acumular antes de nuevos gastos",
              color: r.cajaDisponible === 0 ? "var(--muted)" : r.brechaCaja >= 0 ? "#16a34a" : "#dc2626",
            },
          ].map((k, i) => (
            <div key={i} style={{ background: "var(--bg-soft)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>{k.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        {r.cajaDisponible > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 8, background: "var(--bg-soft)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, Math.round((r.cajaDisponible / Math.max(1, r.cajaSustentoRecomendada)) * 100))}%`,
                background: r.brechaCaja >= 0 ? "#16a34a" : r.cajaDisponible >= r.cajaMinimaMensual ? "#ca8a04" : "#dc2626",
                borderRadius: 6,
                transition: "width .4s",
              }} />
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
              Cobertura: {Math.min(999, Math.round((r.cajaDisponible / Math.max(1, r.cajaSustentoRecomendada)) * 100))}% del nivel de sustento
            </div>
          </div>
        )}
      </div>

      {/* Historial 3 meses */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {data.historial.map((m, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 16px", minWidth: 150 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{m.label}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--heading)" }}>{clp(m.bruto)}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.pagos} pagos</div>
          </div>
        ))}
      </div>

      {/* Configuración de costos */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--heading)", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Costos operativos mensuales y parámetros tributarios
          </div>
          <button className="button ghost" type="button" style={{ fontSize: 12 }} onClick={() => setEditConfig((v) => !v)}>
            {editConfig ? "Cancelar" : "✏️ Editar"}
          </button>
        </div>

        {!editConfig ? (
          <>
            {data.config.costosMensualesClp.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--line)", fontSize: 13 }}>
                <span style={{ color: "var(--muted)" }}>{c.nombre}</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{clp(c.montoClp)}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
              <span>Comisión MP: <strong>{data.config.comisionMpPct}%</strong></span>
              <span>IVA: <strong>{data.config.ivaPct}%</strong></span>
              <span>1ª Categoría: <strong>{data.config.primeraCategoriaPct}%</strong></span>
              <span>Caja disponible: <strong>{clp(data.config.cajaDisponibleClp)}</strong></span>
              <span>Margen objetivo: <strong>{data.config.margenObjetivoPct}%</strong></span>
              <span>Colchón de caja: <strong>{data.config.mesesColchonCaja} meses</strong></span>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {costos.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <input value={c.nombre} onChange={(e) => setCostos((prev) => prev.map((x, j) => j === i ? { ...x, nombre: e.target.value } : x))} placeholder="Nombre del costo" style={{ flex: 1, fontSize: 13 }} />
                <input value={c.montoClp} onChange={(e) => setCostos((prev) => prev.map((x, j) => j === i ? { ...x, montoClp: e.target.value.replace(/\D/g, "") } : x))} inputMode="numeric" placeholder="CLP/mes" style={{ width: 110, fontSize: 13 }} />
                <button className="button ghost" type="button" style={{ fontSize: 12 }} onClick={() => setCostos((prev) => prev.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button className="button ghost" type="button" style={{ fontSize: 12, alignSelf: "flex-start" }} onClick={() => setCostos((prev) => [...prev, { nombre: "", montoClp: "0" }])}>
              + Agregar costo
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 8, marginTop: 6 }}>
              {([
                ["comisionMpPct", "Comisión MP (%)"],
                ["primeraCategoriaPct", "1ª Categoría (%)"],
                ["cajaDisponibleClp", "Caja disponible (CLP)"],
                ["margenObjetivoPct", "Margen objetivo (%)"],
                ["mesesColchonCaja", "Colchón de caja (meses)"],
              ] as const).map(([key, label]) => (
                <label key={key} style={{ fontSize: 11, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 3 }}>
                  {label}
                  <input value={params[key]} onChange={(e) => setParams((prev) => ({ ...prev, [key]: e.target.value.replace(/[^\d.]/g, "") }))} inputMode="decimal" style={{ fontSize: 13 }} />
                </label>
              ))}
            </div>
            <button className="button primary" type="button" disabled={saving} onClick={saveConfig} style={{ alignSelf: "flex-start", marginTop: 4 }}>
              {saving ? "Guardando…" : "Guardar configuración"}
            </button>
          </div>
        )}
        {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>{error}</p>}
      </div>

      <p style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
        Tasa 1ª Categoría Pro Pyme: 12,5% vigente 2025-2027, 15% desde 2028 (Ley 21.755). Precios al consumidor incluyen IVA 19%.
        Este panel es una herramienta de gestión — la declaración formal la hace tu contador con los libros del SII.
      </p>
    </section>
  );
}

function ExportsView() {
  const [loadingW, setLoadingW] = useState(false);
  const [loadingP, setLoadingP] = useState(false);
  const [error, setError] = useState("");

  async function downloadCsv(fnName: string, filename: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    setError("");
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("@/lib/firebase/client");
      const fn = httpsCallable(functions, fnName);
      const res = await fn({});
      const csv = (res.data as { csv: string }).csv;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem" }}>📥 Exportar datos CSV</h2>
      {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}>
        {[
          { label: "Postulantes (workers)", desc: "Todos los perfiles públicos con sector, región, sueldo esperado y estado.", fnName: "exportWorkersCsv", filename: `workers-${new Date().toISOString().slice(0,10)}.csv`, loading: loadingW, setLoading: setLoadingW },
          { label: "Pagos", desc: "Todos los pagos con estado, monto, proveedor y fecha.", fnName: "exportPaymentsCsv", filename: `pagos-${new Date().toISOString().slice(0,10)}.csv`, loading: loadingP, setLoading: setLoadingP },
        ].map((item, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--heading)" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{item.desc}</div>
            </div>
            <button
              onClick={() => downloadCsv(item.fnName, item.filename, item.setLoading)}
              disabled={item.loading}
              style={{ padding: "8px 16px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: item.loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
            >
              {item.loading ? "Exportando…" : "Descargar CSV"}
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 16 }}>Los archivos se descargan directamente en tu navegador. Úsalos en Excel, Google Sheets o cualquier herramienta de análisis.</p>
    </section>
  );
}

type OmilImpact = { omilId: string; totalProfiles: number; activeProfiles: number; hiredCount: number; municipalityName?: string };

function OmilImpactView() {
  const [data, setData] = useState<OmilImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("@/lib/firebase/client");
      const fn = httpsCallable(functions, "getOmilImpactPanel");
      const res = await fn({});
      setData(res.data as OmilImpact);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar datos OMIL");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <section style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: "1.5rem" }}>🏛 Panel de Impacto OMIL</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>Métricas del operador OMIL actualmente autenticado. Para ver datos de una OMIL específica, inicia sesión desde esa cuenta.</p>
      {loading && <p style={{ color: "var(--muted)" }}>Cargando…</p>}
      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
      {!loading && data && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Perfiles creados", value: data.totalProfiles, icon: "👤" },
            { label: "Perfiles activos", value: data.activeProfiles, icon: "✅" },
            { label: "Contrataciones", value: data.hiredCount, icon: "🎉" },
            { label: "Tasa de éxito", value: data.totalProfiles > 0 ? `${Math.round((data.hiredCount / data.totalProfiles) * 100)}%` : "0%", icon: "📊" },
          ].map((k, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1.25rem", minWidth: 140 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--color-primary)" }}>{k.value}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}
      {!loading && !data && !error && (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Sin datos OMIL disponibles aún.</p>
      )}
    </section>
  );
}

function FunnelView({ dashboard }: { dashboard: AdminDashboard }) {
  const s = dashboard.summary;

  const steps = [
    { label: "Usuarios registrados", value: s.usersTotal, icon: "👤", color: "#3aaee0" },
    { label: "Perfiles de postulantes creados", value: s.workersTotal, icon: "📄", color: "#1a7ac7" },
    { label: "Pagos iniciados", value: s.paymentsTotal, icon: "💳", color: "#1a5ca0" },
    { label: "Pagos completados", value: s.paymentsPaid, icon: "✅", color: "#1a3e78" },
    { label: "Perfiles activos/visibles", value: Object.values(s.workerVisibilityCounts as Record<string,number>).reduce((a,b)=>a+b,0) > 0 ? (s.workerVisibilityCounts as Record<string,number>)["visible"] ?? 0 : 0, icon: "🔍", color: "#1a2f5e" },
    { label: "Invitaciones enviadas", value: s.paymentsTotal > 0 ? (s.invitationStatusCounts as Record<string,number>)["sent"] ?? 0 : 0, icon: "📨", color: "#0f1f40" },
    { label: "Contrataciones", value: (s.invitationStatusCounts as Record<string,number>)["hired"] ?? 0, icon: "🎉", color: "#0a1428" },
  ];

  const maxVal = Math.max(...steps.map(s => s.value), 1);

  function rate(a: number, b: number) {
    if (!b) return "—";
    return `${Math.round((a / b) * 100)}%`;
  }

  return (
    <section style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--heading)", marginBottom: 6 }}>🔽 Embudo de conversión</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Tasa de conversión en cada etapa del proceso — desde registro hasta contratación.</p>

      <div style={{ maxWidth: 640 }}>
        {steps.map((step, i) => {
          const prev = steps[i - 1];
          const pct = (step.value / maxVal) * 100;
          const conv = prev ? rate(step.value, prev.value) : null;
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              {conv && (
                <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "right", marginBottom: 2 }}>
                  Conversión desde anterior: <strong style={{ color: "var(--color-primary)" }}>{conv}</strong>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{step.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--heading)" }}>{step.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-primary)" }}>{step.value.toLocaleString("es-CL")}</span>
                  </div>
                  <div style={{ height: 10, background: "var(--line)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: step.color, borderRadius: 5, transition: "width .4s ease" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 28, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          { label: "Conversión registro→pago", value: rate(s.paymentsPaid, s.usersTotal) },
          { label: "Conversión pago→contratación", value: rate((s.invitationStatusCounts as Record<string,number>)["hired"] ?? 0, s.paymentsPaid) },
          { label: "Ingreso por usuario", value: s.usersTotal > 0 ? `$${Math.round(s.revenuePaidClp / Math.max(s.usersTotal,1)).toLocaleString("es-CL")} CLP` : "—" },
        ].map((k, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-primary)" }}>{k.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
