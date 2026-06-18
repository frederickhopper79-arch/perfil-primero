"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
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
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase/auth";
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
  updateCompanyVerification
} from "@/lib/firebase/admin";

type AdminView =
  | "summary"
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
  | "reviews"
  | "security"
  | "audit"
  | "reports";

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
  { key: "administration", label: "Administracion" },
  { key: "companies", label: "Empresas" },
  { key: "workers", label: "Postulantes" },
  { key: "offers", label: "Ofertas" },
  { key: "messages", label: "Mensajes" },
  { key: "payments", label: "Pagos" },
  { key: "accounting", label: "Contabilidad" },
  { key: "invoicing", label: "SII/OpenFactura" },
  { key: "coupons", label: "Cupones" },
  { key: "interviews", label: "Entrevistas" },
  { key: "reviews", label: "Reputacion" },
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
    status: "active" as "active" | "suspended"
  });
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
    setStatus("Validando acceso interno...");

    try {
      const user = await loginWithEmail(email, password);
      setUid(user.uid);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo entrar al panel interno.");
    }
  }

  async function handleGoogleLogin() {
    setStatus("Abriendo Google...");
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      setUid(credential.user.uid);
      await loadDashboard();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo entrar con Google.");
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
      setStatus("Consola actualizada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo cargar la consola.");
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
      const created = await createManagedUser(newUser);
      setStatus(`Usuario ${created.email} habilitado como ${created.role}.`);
      setNewUser({ email: "", password: "", role: "worker", status: "active" });
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
      setStatus("Reporte de mercado generado y cargado en administracion.");
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
      setStatus(error instanceof Error ? error.message : "No se pudo actualizar facturacion.");
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
          <h2>Consola de administracion</h2>
          <p>Monitoreo de empresas, pagos, contabilidad, entrevistas, reputacion, seguridad y auditoria.</p>
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
            Contrasena
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
        <p>Centro unico de monitoreo, contabilidad, control y auditoria.</p>
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
            Tamano pagina
            <select value={pageSize} onChange={(event) => setPageSize(event.target.value)}>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
          </label>
        </div>
        <button className="button secondary full" type="button" onClick={() => loadDashboard()}>Aplicar filtros</button>
        <button className="button secondary full" type="button" onClick={() => loadDashboard(dashboardCursors)}>Siguiente pagina</button>
        <button className="button secondary full" type="button" onClick={handleExportAccounting}>Exportar CSV contable</button>
        <button className="button ghost full" type="button" onClick={handleLogout}>Cerrar sesión</button>
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

        {activeView === "summary" ? <SummaryView dashboard={data} /> : null}
        {activeView === "administration" ? (
          <AdministrationView
            dashboard={data}
            newUser={newUser}
            onNewUser={setNewUser}
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
        {activeView === "workers" ? <WorkersView workers={data.workers} privateWorkers={data.privateWorkers} /> : null}
        {activeView === "offers" ? <OffersView offers={data.jobOffers} invitations={data.invitations} /> : null}
        {activeView === "messages" ? <MessagesView messages={data.messages} unlocks={data.contactUnlocks} reminders={data.emailReminders} /> : null}
        {activeView === "payments" ? <PaymentsView payments={data.payments} /> : null}
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
        {activeView === "coupons" ? <CouponsView coupons={data.coupons} usages={data.couponUsages} /> : null}
        {activeView === "interviews" ? <InterviewsView interviews={data.interviews} invitations={data.invitations} /> : null}
        {activeView === "reviews" ? <ReviewsView reviews={data.reviews} summary={data.summary} /> : null}
        {activeView === "security" ? <SecurityView alerts={data.securityAlerts} /> : null}
        {activeView === "audit" ? <AuditView events={data.auditEvents} /> : null}
        {activeView === "reports" ? <ReportsView dashboard={data} onGenerateMarketReport={handleGenerateMarketReport} /> : null}

        {status ? <p className="statusText">{status}</p> : null}
      </div>
    </section>
  );
}

function SummaryView({ dashboard }: { dashboard: AdminDashboard }) {
  const metrics = [
    { icon: <Building2 />, label: "Empresas", value: dashboard.summary.companiesTotal, detail: statusCounts(dashboard.summary.companyStatusCounts) },
    { icon: <Users />, label: "Postulantes", value: dashboard.summary.workersTotal, detail: statusCounts(dashboard.summary.workerVisibilityCounts) },
    { icon: <BriefcaseBusiness />, label: "Ofertas", value: dashboard.summary.jobOffersTotal, detail: `${dashboard.summary.jobOffersVisible} visibles` },
    { icon: <BadgeDollarSign />, label: "Pagos", value: dashboard.summary.paymentsTotal, detail: `${dashboard.summary.paymentsPaid} pagados / ${dashboard.summary.paymentsPending} pendientes` },
    { icon: <FileSpreadsheet />, label: "Ingresos pagados", value: money(dashboard.summary.revenuePaidClp), detail: "CLP confirmado por pagos paid" },
    { icon: <ReceiptText />, label: "Facturacion pendiente", value: dashboard.summary.accountingPending, detail: "Sin folio/PDF/XML proveedor" },
    { icon: <Tag />, label: "Cupones activos", value: dashboard.summary.couponsActive, detail: "Disponibles para checkout" },
    { icon: <CalendarClock />, label: "Entrevistas", value: dashboard.summary.interviewsScheduled, detail: "Programadas en plataforma" },
    { icon: <MessageSquare />, label: "Mensajes", value: dashboard.summary.messagesTotal, detail: `${dashboard.summary.contactUnlocksTotal} contactos desbloqueados` },
    { icon: <Star />, label: "Reputacion", value: dashboard.summary.reviewAverage || "0", detail: `${dashboard.summary.reviewsTotal} evaluaciones` },
    { icon: <AlertTriangle />, label: "Alertas", value: dashboard.summary.securityAlerts, detail: "Bloqueos y pendientes criticos" }
  ];

  return (
    <>
      <section className="commandHero adminCommandHero">
        <div className="commandHeroContent">
          <span className="smallLabel">Sala de control</span>
          <h2>Operacion, pagos, seguridad y cumplimiento en una sola consola.</h2>
          <p>
            Esta vista concentra lo que importa para abrir la plataforma con control:
            empresas verificadas, ingresos confirmados, alertas, facturacion y trazabilidad.
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
    </>
  );
}

function AdministrationView({
  dashboard,
  newUser,
  onNewUser,
  onCreateUser
}: {
  dashboard: AdminDashboard;
  newUser: {
    email: string;
    password: string;
    role: "worker" | "company" | "admin" | "omil";
    status: "active" | "suspended";
  };
  onNewUser: (value: {
    email: string;
    password: string;
    role: "worker" | "company" | "admin" | "omil";
    status: "active" | "suspended";
  }) => void;
  onCreateUser: (event: FormEvent<HTMLFormElement>) => void;
}) {
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
            <input value={newUser.email} onChange={(event) => onNewUser({ ...newUser, email: event.target.value })} type="email" required />
          </label>
          <label>
            Contrasena temporal
            <input value={newUser.password} minLength={6} onChange={(event) => onNewUser({ ...newUser, password: event.target.value })} type="password" required />
          </label>
          <label>
            Rol
            <select value={newUser.role} onChange={(event) => onNewUser({ ...newUser, role: event.target.value as typeof newUser.role })}>
              <option value="worker">Postulante</option>
              <option value="company">Empresa</option>
              <option value="admin">Administrador</option>
              <option value="omil">OMIL</option>
            </select>
          </label>
          <label>
            Estado
            <select value={newUser.status} onChange={(event) => onNewUser({ ...newUser, status: event.target.value as typeof newUser.status })}>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </label>
        </div>
        <button className="button primary" type="submit">Crear usuario</button>
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
        ["invitationId", "Invitacion"],
        ["paymentId", "Pago"],
        ["status", "Estado"],
        ["createdAt", "Creado"]
      ]} />
      <AdminTable title="Recordatorios y correos programados" rows={dashboard.emailReminders} columns={[
        ["id", "ID"],
        ["invitationId", "Invitacion"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["status", "Estado"],
        ["sendAt", "Envio"],
        ["createdAt", "Creado"]
      ]} />
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
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Empresa, RUT, razon social" />
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
              <span>{str(company.size || "Tamano no informado")}</span>
            </div>
            <div className="adminCompanyBody">
              <Building2 size={28} aria-hidden="true" />
              <div>
                <h2>{str(company.companyName || "Empresa sin nombre")}</h2>
                <p>{str(company.legalName || "Razon social pendiente")} - {str(company.taxId || "RUT pendiente")}</p>
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
  privateWorkers
}: {
  workers: Array<Record<string, unknown>>;
  privateWorkers: Array<Record<string, unknown>>;
}) {
  return (
    <section className="stack">
      <AdminTable title="Postulantes publicos" rows={workers} columns={[
        ["workerId", "Postulante"],
        ["profileCode", "Codigo"],
        ["headline", "Perfil"],
        ["region", "Region"],
        ["city", "Comuna"],
        ["visibilityStatus", "Visibilidad"],
        ["subscriptionStatus", "Suscripcion"],
        ["expectedSalaryMin", "Renta min"],
        ["expectedSalaryMax", "Renta max"],
        ["createdAt", "Creado"]
      ]} moneyFields={["expectedSalaryMin", "expectedSalaryMax"]} />
      <AdminTable title="Datos privados de postulantes" rows={privateWorkers} columns={[
        ["workerId", "Postulante"],
        ["fullName", "Nombre"],
        ["email", "Email"],
        ["phone", "Telefono"],
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
        ["area", "Area"],
        ["region", "Region"],
        ["city", "Comuna"],
        ["visibilityStatus", "Visibilidad"],
        ["vacanciesTotal", "Vacantes"],
        ["vacanciesAvailable", "Disponibles"],
        ["salaryMin", "Sueldo min"],
        ["salaryMax", "Sueldo max"],
        ["updatedAt", "Actualizado"]
      ]} moneyFields={["salaryMin", "salaryMax"]} />
      <AdminTable title="Invitaciones y pipeline" rows={invitations} columns={[
        ["invitationId", "Invitacion"],
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
        ["invitationId", "Invitacion"],
        ["senderRole", "Emisor"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["paymentRequired", "Bloqueo pago"],
        ["body", "Texto"],
        ["createdAt", "Fecha"]
      ]} />
      <AdminTable title="Contactos liberados" rows={unlocks} columns={[
        ["unlockId", "Desbloqueo"],
        ["invitationId", "Invitacion"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["paymentId", "Pago"],
        ["status", "Estado"],
        ["expiresAt", "Expira"]
      ]} />
      <AdminTable title="Recordatorios asociados" rows={reminders} columns={[
        ["id", "ID"],
        ["invitationId", "Invitacion"],
        ["status", "Estado"],
        ["sendAt", "Envio"],
        ["createdAt", "Creado"]
      ]} />
    </section>
  );
}

function PaymentsView({ payments }: { payments: Array<Record<string, unknown>> }) {
  return <AdminTable title="Listado de pagos" rows={payments} columns={[
    ["paymentId", "Pago"],
    ["payerRole", "Rol"],
    ["paymentType", "Tipo"],
    ["status", "Estado"],
    ["amount", "Monto"],
    ["currency", "Moneda"],
    ["couponCode", "Cupon"],
    ["createdAt", "Creado"]
  ]} moneyFields={["amount"]} />;
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
            <p>Conciliacion manual para empresas que pagan por banco y requieren control contable estricto.</p>
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
            Notas de conciliacion
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
          <p>Bruto, neto, IVA, comision Mercado Pago y estado contable.</p>
        </div>
        <button className="button secondary" type="button" onClick={onExport}>Exportar CSV</button>
      </div>
      <AdminTable rows={entries} columns={[
        ["paymentId", "Pago"],
        ["paymentType", "Tipo"],
        ["grossAmount", "Bruto"],
        ["netRevenue", "Neto"],
        ["ivaDebitoFiscal", "IVA"],
        ["estimatedMercadoPagoCommission", "Comision MP"],
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
            <p>Registra folio, PDF, XML y estado de emision para cerrar el control tributario del pago.</p>
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

function CouponsView({ coupons, usages }: { coupons: Array<Record<string, unknown>>; usages: Array<Record<string, unknown>> }) {
  return (
    <section className="stack">
      <AdminTable title="Cupones activos/usados" rows={coupons} columns={[
        ["couponCode", "Codigo"],
        ["name", "Nombre"],
        ["discountPercent", "%"],
        ["active", "Activo"],
        ["usedCount", "Usos"],
        ["maxUses", "Limite"],
        ["expiresAt", "Vence"]
      ]} />
      <AdminTable title="Usos de cupones" rows={usages} columns={[
        ["couponCode", "Codigo"],
        ["userId", "Usuario"],
        ["paymentId", "Pago"],
        ["createdAt", "Fecha"]
      ]} />
    </section>
  );
}

function InterviewsView({ interviews, invitations }: { interviews: Array<Record<string, unknown>>; invitations: Array<Record<string, unknown>> }) {
  return (
    <section className="stack">
      <AdminTable title="Entrevistas programadas" rows={interviews} columns={[
        ["interviewId", "Entrevista"],
        ["invitationId", "Invitacion"],
        ["status", "Estado"],
        ["startsAt", "Inicio"],
        ["endsAt", "Fin"],
        ["calendarUrl", "Calendar"]
      ]} />
      <AdminTable title="Trazabilidad de procesos" rows={invitations} columns={[
        ["invitationId", "Invitacion"],
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
          <span className="smallLabel">Promedio reputacion</span>
          <strong>{summary.reviewAverage}</strong>
          <p>{summary.reviewsTotal} evaluaciones registradas.</p>
        </article>
      </section>
      <AdminTable title="Evaluaciones y reputacion" rows={reviews} columns={[
        ["targetRole", "Evaluado"],
        ["score", "Nota"],
        ["attendedInPerson", "Asistio presencial"],
        ["comment", "Comentario"],
        ["companyId", "Empresa"],
        ["workerId", "Postulante"],
        ["createdAt", "Fecha"]
      ]} />
    </section>
  );
}

function SecurityView({ alerts }: { alerts: Array<Record<string, unknown>> }) {
  return <AdminTable title="Alertas de seguridad/control" rows={alerts} columns={[
    ["severity", "Severidad"],
    ["title", "Alerta"],
    ["detail", "Detalle"],
    ["createdAt", "Fecha"]
  ]} />;
}

function AuditView({ events }: { events: Array<Record<string, unknown>> }) {
  return <AdminTable title="Logs y auditoria" rows={events} columns={[
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
    ...reportGroup("Operacion", dashboard.reports.operations),
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
            <p>Indicadores consolidados para revisar operacion, dinero, conversion y riesgo.</p>
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
      <AdminTable title="Invitaciones por estado" rows={objectRows(dashboard.summary.invitationStatusCounts, "Estado invitacion")} columns={[
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
            <p>{rows.length} registros.</p>
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
