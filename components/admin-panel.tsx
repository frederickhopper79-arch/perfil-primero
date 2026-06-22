"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
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
  approveManualTransfer,
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
  | "reports";

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
  { key: "audit", label: "Auditoria" },
  { key: "reports", label: "Reportes" }
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
      setStatus(nextStatus === "verified" ? "Empresa verificada." : "Estado actualizado.");
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
    setStatus("Generando reporte cientifico de mercado...");
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
        {activeView === "coupons" ? <CouponsView coupons={data.coupons} usages={data.couponUsages} couponForm={couponForm} showForm={showCouponForm} onCouponForm={setCouponForm} onToggleForm={() => setShowCouponForm((v) => !v)} /> : null}
        {activeView === "interviews" ? <InterviewsView interviews={data.interviews} invitations={data.invitations} /> : null}
        {activeView === "urgency" ? <UrgencyView invitations={data.invitations} /> : null}
        {activeView === "reviews" ? <ReviewsView reviews={data.reviews} summary={data.summary} /> : null}
        {activeView === "security" ? <SecurityView alerts={data.securityAlerts} resolvedAlerts={resolvedAlerts} onResolve={(id) => setResolvedAlerts((prev) => new Set([...prev, id]))} /> : null}
        {activeView === "audit" ? <AuditView events={data.auditEvents} /> : null}
        {activeView === "reports" ? <ReportsView dashboard={data} onGenerateMarketReport={handleGenerateMarketReport} /> : null}

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
          { label: "Perfiles no vencidos", ok: !warnings.some(w => w.includes("perfiles visibles con")) },
          { label: "Pagos sin quedar estancados", ok: !warnings.some(w => w.includes("pagos en estado")) }
        ].map(({ label, ok }) => (
          <div key={label} className={`statusCheck ${ok ? "ok" : "fail"}`}>
            <span>{ok ? "✓" : "✗"}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SummaryView({ dashboard, onVerification }: { dashboard: AdminDashboard; onVerification?: (companyId: string, status: "verified" | "rejected" | "suspended") => void }) {
  const metrics = [
    { icon: <Building2 />, label: "Empresas", value: dashboard.summary.companiesTotal, detail: statusCounts(dashboard.summary.companyStatusCounts) },
    { icon: <Users />, label: "Postulantes", value: dashboard.summary.workersTotal, detail: statusCounts(dashboard.summary.workerVisibilityCounts) },
    { icon: <BriefcaseBusiness />, label: "Ofertas", value: dashboard.summary.jobOffersTotal, detail: `${dashboard.summary.jobOffersVisible} visibles` },
    { icon: <BadgeDollarSign />, label: "Pagos", value: dashboard.summary.paymentsTotal, detail: `${dashboard.summary.paymentsPaid} pagados / ${dashboard.summary.paymentsPending} pendientes` },
    { icon: <FileSpreadsheet />, label: "Ingresos pagados", value: money(dashboard.summary.revenuePaidClp), detail: "CLP confirmado por pagos paid" },
    { icon: <ReceiptText />, label: "Facturación pendiente", value: dashboard.summary.accountingPending, detail: "Sin folio/PDF/XML proveedor" },
    { icon: <Tag />, label: "Cupones activos", value: dashboard.summary.couponsActive, detail: "Disponibles para checkout" },
    { icon: <CalendarClock />, label: "Entrevistas", value: dashboard.summary.interviewsScheduled, detail: "Programadas en plataforma" },
    { icon: <MessageSquare />, label: "Mensajes", value: dashboard.summary.messagesTotal, detail: `${dashboard.summary.contactUnlocksTotal} contactos desbloqueados` },
    { icon: <Star />, label: "Reputación", value: dashboard.summary.reviewAverage || "0", detail: `${dashboard.summary.reviewsTotal} evaluaciones` },
    { icon: <AlertTriangle />, label: "Alertas", value: dashboard.summary.securityAlerts, detail: "Bloqueos y pendientes criticos" }
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
            <span>Ingresos paid</span>
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
          <span className="smallLabel">Desbloqueos contacto</span>
          <strong>{dashboard.summary.contactUnlocksTotal}</strong>
          <p>Contactos liberados despues de pago/cierre.</p>
        </article>
      </section>
      <AdminTable title="Usuarios registrados" rows={dashboard.users} columns={[
        ["id", "UID"],
        ["email", "Email"],
        ["role", "Rol"],
        ["status", "Estado"],
        ["lastLoginAt", "Ultimo acceso"],
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
  { key: "semantic_search", label: "Búsqueda semántica IA", description: "Activa búsqueda vectorial con Gemini en la vista empresa", defaultOn: true },
  { key: "cv_analysis", label: "Análisis de CV con IA", description: "Usa Gemini para extraer datos del CV del postulante automáticamente", defaultOn: true },
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
      <AdminTable title="Mensajeria interna" rows={messages} columns={[
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
          <p>pagos en estado pending</p>
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
  onToggleForm
}: {
  coupons: Array<Record<string, unknown>>;
  usages: Array<Record<string, unknown>>;
  couponForm: { code: string; name: string; discountPercent: string; maxUses: string; expiresAt: string };
  showForm: boolean;
  onCouponForm: (v: { code: string; name: string; discountPercent: string; maxUses: string; expiresAt: string }) => void;
  onToggleForm: () => void;
}) {
  return (
    <section className="stack">
      <div style={{ marginBottom: 12 }}>
        <button className="button primary" type="button" onClick={onToggleForm}>
          {showForm ? "Cancelar" : "+ Crear cupón"}
        </button>
      </div>
      {showForm && (
        <div className="formSurface" style={{ marginBottom: 16 }}>
          <div className="formHeader">
            <Tag size={22} aria-hidden="true" />
            <div>
              <h2>Nuevo cupón de descuento</h2>
              <p>Crear directamente en Firestore vía consola o implementar en Cloud Function.</p>
            </div>
          </div>
          <div className="formGrid">
            <label>
              Código cupón
              <input value={couponForm.code} onChange={(e) => onCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="BIENVENIDA50" />
            </label>
            <label>
              Nombre descriptivo
              <input value={couponForm.name} onChange={(e) => onCouponForm({ ...couponForm, name: e.target.value })} placeholder="Bienvenida 50% descuento" />
            </label>
            <label>
              Descuento %
              <input type="number" min="1" max="100" value={couponForm.discountPercent} onChange={(e) => onCouponForm({ ...couponForm, discountPercent: e.target.value })} />
            </label>
            <label>
              Máximo de usos
              <input type="number" min="1" value={couponForm.maxUses} onChange={(e) => onCouponForm({ ...couponForm, maxUses: e.target.value })} />
            </label>
            <label>
              Vence
              <input type="date" value={couponForm.expiresAt} onChange={(e) => onCouponForm({ ...couponForm, expiresAt: e.target.value })} />
            </label>
          </div>
          <p className="helperText" style={{ marginTop: 8 }}>
            Comando Firestore: <code>db.collection("coupons").doc("{couponForm.code || "CODIGO"}").set({"{"} couponCode: "{couponForm.code}", discountPercent: {couponForm.discountPercent}, maxUses: {couponForm.maxUses}, active: true, usedCount: 0 {"}"})</code>
          </p>
        </div>
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
          <span className="smallLabel">Total con deadline</span>
          <strong>{urgent.length}</strong>
          <p>Invitaciones activas con fecha límite</p>
        </article>
      </section>

      {urgent.length === 0 ? (
        <p className="statusText">No hay invitaciones con deadline próximo.</p>
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
        <ReportCard title="Reporte conversion" icon={<BarChart3 />} metrics={dashboard.reports.conversion} />
        <ReportCard title="Reporte riesgo/control" icon={<AlertTriangle />} metrics={dashboard.reports.risk} />
      </section>
      <AdminTable title="Detalle de reportes" rows={reportRows} columns={[
        ["group", "Reporte"],
        ["metric", "Indicador"],
        ["value", "Valor"]
      ]} />
      <AdminTable title="Reportes cientificos de mercado" rows={dashboard.marketAnalyticsReports} columns={[
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
  if (typeof value === "boolean") return value ? "Si" : "No";
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
