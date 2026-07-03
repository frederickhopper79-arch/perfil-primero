"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, query, where, Timestamp, getCountFromServer } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { Building2, CalendarClock, CheckCircle2, FileText, UserPlus } from "lucide-react";
import { AuthCard } from "./auth-card";
import { chileRegions, jobAreas } from "@/lib/domain/catalogs";
import { getUserRole, logout } from "@/lib/firebase/auth";
import { fileToBase64 } from "@/lib/utils/file";
import { extractTextFromPdf } from "@/lib/utils/pdf-extract";
import { analyzeCvWithAi, listOmilWorkers, uploadWorkerCv } from "@/lib/firebase/workers";
import type { WorkerPublicProfile } from "@/lib/domain/types";
import { createOmilPostulantProfile } from "@/lib/firebase/omil";

export function OmilWorkspace() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ code: string; expiresAt: string } | null>(null);
  const [createdCount, setCreatedCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState<number | null>(null);
  const [omilMeta, setOmilMeta] = useState<{ municipalityName?: string; contactPersonName?: string; municipalityLogoUrl?: string } | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvAnalyzing, setCvAnalyzing] = useState(false);
  const [cvStep, setCvStep] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sessionProfiles, setSessionProfiles] = useState<Array<{ code: string; name: string; headline: string; expiresAt: string }>>([]);
  const [skillsSuggestions] = useState<Record<string, string[]>>({
    "Tecnología": ["Python", "Excel avanzado", "Soporte técnico", "Redes", "SQL", "SAP"],
    "Ventas": ["CRM", "Prospección", "Negociación", "Atención al cliente", "Presentaciones"],
    "Administración": ["Contabilidad", "Excel", "SAP", "Facturación", "Atención al público"],
    "Salud": ["Primeros auxilios", "Atención al paciente", "Farmacología", "Registro médico"],
    "Oficios y Otros": ["Conducción B", "Trabajo en altura", "Electricidad básica", "Gasfitería"],
    "Construcción": ["Albañilería", "Enfierradura", "Hormigón", "Lectura de planos", "Soldadura"],
    "Logística": ["Montacargas", "Gestión de inventario", "WMS", "Despacho", "Picking"]
  });
  const [showPrintable, setShowPrintable] = useState(false);
  const [printProfile, setPrintProfile] = useState<typeof sessionProfiles[0] | null>(null);
  const [sessionSearch, setSessionSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [firestoreHistory, setFirestoreHistory] = useState<WorkerPublicProfile[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [form, setForm] = useState({
    legalName: "",
    email: "",
    phone: "",
    headline: "",
    summary: "",
    skills: "",
    area: "Oficios y Otros",
    region: "Región Metropolitana",
    city: "Santiago",
    salaryMin: "0",
    salaryMax: "0",
    workMode: "onsite",
    urgency: "media" as "alta" | "media" | "baja",
    origin: "espontanea" as "espontanea" | "sence" | "omil" | "derivacion",
    internalNotes: ""
  });

  const selectedRegion = useMemo(
    () => chileRegions.find((region) => region.name === form.region) ?? chileRegions[0],
    [form.region]
  );

  // Mantiene la sesión activa aunque Firebase renueve el token o haya re-renders
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setUid(""); setEmail(""); return; }
      const role = await getUserRole(user.uid).catch(() => null);
      if (role !== "omil" && role !== "admin") { setUid(""); return; }
      setUid(user.uid);
      setEmail(user.email ?? "");
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) setOmilMeta(snap.data()?.omil ?? null);
    }).catch(() => undefined);
    // Cargar historial desde Firestore
    setHistoryLoading(true);
    listOmilWorkers(uid).then(setFirestoreHistory).catch(() => {}).finally(() => setHistoryLoading(false));
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const q = query(
      collection(db, "workerPublicProfiles"),
      where("createdByOmilId", "==", uid),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
      where("createdAt", "<", Timestamp.fromDate(startOfNextMonth))
    );
    getCountFromServer(q).then((snap) => setMonthlyCount(snap.data().count)).catch(() => undefined);
  }, [uid, createdCount]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleLogout() {
    await logout().catch(() => undefined);
    setUid("");
    setEmail("");
    setStatus("Sesión OMIL cerrada.");
  }

  async function handleCvAnalysis() {
    if (!uid) return;
    if (!cvFile) { setStatus("Seleccione un archivo CV antes de continuar."); return; }
    if (cvFile.size > 5 * 1024 * 1024) { setStatus("El archivo supera los 5 MB. Reduzca el tamaño o seleccione otro archivo."); return; }
    if (!["application/pdf", "text/plain"].includes(cvFile.type) && !cvFile.name.match(/\.(doc|docx)$/i)) {
      setStatus("Formato no admitido. Use PDF, DOC, DOCX o TXT.");
      return;
    }
    setCvAnalyzing(true);
    setCvStep("Subiendo archivo...");
    setStatus("");
    try {
      await uploadWorkerCv(uid, cvFile);
      setCvStep("Extrayendo texto...");
      const [base64, preExtractedText] = await Promise.all([
        fileToBase64(cvFile),
        extractTextFromPdf(cvFile)
      ]);
      setCvStep("Analizando con IA...");
      const analysis = await analyzeCvWithAi({ fileName: cvFile.name, mimeType: cvFile.type || "application/pdf", base64, preExtractedText: preExtractedText || undefined });
      setForm((current) => ({
        ...current,
        headline: analysis.headline || current.headline,
        summary: analysis.summary || current.summary,
        skills: analysis.skills.length ? analysis.skills.join(", ") : current.skills,
        area: jobAreas.includes(analysis.sectors[0]) ? analysis.sectors[0] : current.area,
        salaryMin: String(analysis.suggestedSalaryMin || current.salaryMin),
        salaryMax: String(analysis.suggestedSalaryMax || current.salaryMax)
      }));
      setStatus(analysis.aiStatus === "quota_exceeded"
        ? "CV cargado. Complete los campos manualmente."
        : "CV analizado. Revise y complete los campos antes de publicar.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo analizar el CV.");
    } finally {
      setCvAnalyzing(false);
      setCvStep("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Publicando perfil…");

    try {
      const created = await createOmilPostulantProfile({
        legalName: form.legalName,
        email: form.email,
        phone: form.phone,
        headline: form.headline,
        summary: form.summary,
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        area: form.area,
        region: form.region,
        city: form.city,
        expectedSalaryMin: Number(form.salaryMin || 0),
        expectedSalaryMax: Number(form.salaryMax || 0),
        workMode: form.workMode as "remote" | "hybrid" | "onsite"
      });
      setLastCreated({ code: created.profileCode, expiresAt: created.profileExpiresAt });
      setCreatedCount((n) => n + 1);
      setSessionProfiles((prev) => [{
        code: created.profileCode,
        name: form.legalName,
        headline: form.headline,
        expiresAt: created.profileExpiresAt
      }, ...prev]);
      setStatus("Perfil publicado sin cobro por 60 días. El postulante recibirá aviso 7 días antes del vencimiento.");
      setForm((current) => ({
        ...current,
        legalName: "",
        email: "",
        phone: "",
        headline: "",
        summary: "",
        skills: ""
      }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el perfil OMIL.");
    }
  }


  if (accessDenied) {
    return (
      <section className="accessSplit omilAccess">
        <div className="accessPitch">
          <span className="smallLabel">Acceso restringido</span>
          <h2>Portal exclusivo para funcionarios OMIL autorizados</h2>
          <p>Esta cuenta no tiene permisos para acceder a este portal. Si es representante de una Oficina Municipal de Información Laboral, contacte al administrador de la plataforma para solicitar acceso.</p>
          <a className="button secondary" href="/">Volver al inicio</a>
        </div>
      </section>
    );
  }

  if (!uid) {
    return (
      <section className="accessSplit omilAccess">
        <div className="accessPitch">
          <span className="smallLabel">Ingreso institucional OMIL</span>
          <h2>Publique perfiles de postulantes sin costo y con vigencia controlada</h2>
          <p>
            Cada perfil queda visible por 60 días. A los 53 días, el postulante recibe un aviso
            para renovarlo de forma autónoma. Sin pasarela de pago para la OMIL.
          </p>
          <div className="portalStatGrid">
            <div><strong>Sin costo</strong><span>registro institucional</span></div>
            <div><strong>60 días</strong><span>vigencia del perfil</span></div>
            <div><strong>100 / mes</strong><span>perfiles por OMIL</span></div>
          </div>
        </div>
        <AuthCard
          role="omil"
          onReady={async (nextUid, nextEmail) => {
            const role = await getUserRole(nextUid).catch(() => null);
            if (role !== "omil" && role !== "admin") {
              await logout().catch(() => undefined);
              setAccessDenied(true);
              return;
            }
            setUid(nextUid);
            setEmail(nextEmail);
          }}
        />
      </section>
    );
  }

  return (
    <section className="omilConsole">
      <aside className="steps omilSteps">
        {omilMeta?.municipalityLogoUrl ? (
          <img src={omilMeta.municipalityLogoUrl} alt={omilMeta.municipalityName ?? "Logo municipalidad"} className="omilMunicipalityLogo" />
        ) : (
          <div className="adminBadge">
            <Building2 size={18} aria-hidden="true" />
            Sesión OMIL
          </div>
        )}
        <h2>{omilMeta?.municipalityName ?? "Cuenta institucional"}</h2>
        {omilMeta?.contactPersonName && <p className="omilContactName">{omilMeta.contactPersonName}</p>}
        <p className="omilEmail">{email}</p>
        <button className="button secondary full" type="button" onClick={handleLogout}>Cerrar sesión</button>
      </aside>

      <div className="stack">
        <section className="dashboardGrid">
          <article>
            <span className="smallLabel">Perfiles esta sesión</span>
            <strong>{createdCount}</strong>
            <p>Publicados desde que inició sesión.</p>
          </article>
          <article>
            <span className="smallLabel">Tipo de cuenta</span>
            <strong>Sin cobro</strong>
            <p>Sin pasarela de pago para la OMIL.</p>
          </article>
          <article>
            <span className="smallLabel">Vigencia por perfil</span>
            <strong>60 días</strong>
            <p>El postulante recibe aviso 7 días antes para renovar.</p>
          </article>
          <article>
            <span className="smallLabel">Cupo mensual</span>
            <strong style={{ color: (monthlyCount ?? 0) >= 90 ? "#dc2626" : undefined }}>
              {monthlyCount === null ? "..." : `${monthlyCount} / 100`}
            </strong>
            <div style={{ background: "var(--line)", borderRadius: 4, height: 6, marginTop: 6, overflow: "hidden" }}>
              <div style={{ background: (monthlyCount ?? 0) >= 90 ? "#dc2626" : "var(--accent)", width: `${Math.min(100, ((monthlyCount ?? 0) / 100) * 100)}%`, height: "100%", transition: "width 0.3s" }} />
            </div>
            <p style={{ marginTop: 4 }}>{monthlyCount !== null && monthlyCount >= 90 ? "⚠️ Cerca del límite mensual." : "Se reinicia el 1° de cada mes."}</p>
          </article>
        </section>

        {/* Historial completo desde Firestore */}
        {uid && (
          <section className="formSurface" style={{ marginTop: 0 }}>
            <div className="formHeader">
              <CalendarClock size={20} aria-hidden="true" />
              <div>
                <h2>Historial de perfiles OMIL</h2>
                <p>Todos los perfiles registrados desde esta cuenta, incluyendo sesiones anteriores.</p>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Buscar por código o cargo…"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            {historyLoading ? (
              <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center" }}>Cargando historial…</p>
            ) : firestoreHistory.length === 0 ? (
              <p className="emptyState">Aún no hay perfiles registrados desde esta cuenta.</p>
            ) : (
              <div className="results">
                {firestoreHistory
                  .filter((w) => !historySearch ||
                    w.profileCode.toLowerCase().includes(historySearch.toLowerCase()) ||
                    w.headline.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((w) => (
                    <article className="resultCard" key={w.workerId}>
                      <div>
                        <div className="resultCardTop">
                          <span className="profileCode">{w.profileCode}</span>
                          <span style={{ fontSize: 11, color: w.visibilityStatus === "visible" ? "#16a34a" : "var(--muted)" }}>
                            {w.visibilityStatus === "visible" ? "Activo" : "Vencido"}
                          </span>
                        </div>
                        <h2 style={{ fontSize: 14 }}>{w.headline}</h2>
                        <p style={{ fontSize: 12 }}>{w.region}{w.city ? ` · ${w.city}` : ""} · Vence: {w.profileExpiresAt instanceof Date ? w.profileExpiresAt.toLocaleDateString("es-CL") : new Date((w.profileExpiresAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString("es-CL")}</p>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </section>
        )}

        <form className="formSurface omilForm" onSubmit={handleSubmit}>
          <div className="formHeader">
            <UserPlus size={24} aria-hidden="true" />
            <div>
              <h2>Crear perfil de postulante</h2>
              <p>Registre los datos laborales necesarios para que empresas verificadas encuentren el perfil.</p>
            </div>
          </div>
          <div className="cvUploadBlock">
            <label className="cvUploadLabel">
              <FileText size={18} aria-hidden="true" />
              Cargar CV (opcional) — el sistema completará los campos automáticamente
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {cvFile && <p className="helperText">📄 {cvFile.name}</p>}
            <button
              className="button secondary"
              type="button"
              onClick={handleCvAnalysis}
              disabled={cvAnalyzing || !cvFile}
            >
              {cvAnalyzing ? cvStep || "Procesando..." : "Completar desde CV"}
            </button>
            {cvAnalyzing && (
              <div className="cvAnalyzingBar" role="status" aria-live="polite">
                <span className="cvAnalyzingDot" />
                {cvStep}
              </div>
            )}
          </div>
          <div className="formGrid">
            <label>
              Nombre completo
              <input value={form.legalName} onChange={(event) => update("legalName", event.target.value)} required />
            </label>
            <label>
              Correo electrónico
              <input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" required />
            </label>
            <label>
              Teléfono
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </label>
            <label>
              Cargo objetivo
              <input value={form.headline} onChange={(event) => update("headline", event.target.value)} required />
            </label>
            <label>
              Área
              <select value={form.area} onChange={(event) => update("area", event.target.value)} required>
                {jobAreas.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
            <label>
              Región
              <select value={form.region} onChange={(event) => update("region", event.target.value)} required>
                {chileRegions.map((region) => <option key={region.name} value={region.name}>{region.name}</option>)}
              </select>
            </label>
            <label>
              Comuna
              <select value={form.city} onChange={(event) => update("city", event.target.value)} required>
                {selectedRegion.communes.map((commune) => <option key={commune} value={commune}>{commune}</option>)}
              </select>
            </label>
            <label>
              Modalidad
              <select value={form.workMode} onChange={(event) => update("workMode", event.target.value)}>
                <option value="onsite">Presencial</option>
                <option value="hybrid">Híbrida</option>
                <option value="remote">Remota</option>
              </select>
            </label>
            <label>
              Renta mínima
              <input value={form.salaryMin} onChange={(event) => update("salaryMin", event.target.value)} inputMode="numeric" />
            </label>
            <label>
              Renta máxima
              <input value={form.salaryMax} onChange={(event) => update("salaryMax", event.target.value)} inputMode="numeric" />
            </label>
            <label className="wide">
              Habilidades
              <input value={form.skills} onChange={(event) => update("skills", event.target.value)} placeholder="Ventas, caja, Excel, licencia clase B (separe con comas)" />
              {skillsSuggestions[form.area] && (
                <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>Sugeridas:</span>
                  {skillsSuggestions[form.area].filter((s) => !form.skills.toLowerCase().includes(s.toLowerCase())).slice(0, 5).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className="button ghost"
                      style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12 }}
                      onClick={() => update("skills", form.skills ? `${form.skills}, ${skill}` : skill)}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              )}
              {form.skills && (
                <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, display: "block" }}>
                  {form.skills.split(",").filter((s) => s.trim()).length} habilidades
                </span>
              )}
            </label>
            <label className="wide">
              Resumen laboral
              <textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} required rows={4} />
            </label>
            <label>
              Urgencia de búsqueda
              <select value={form.urgency} onChange={(e) => update("urgency", e.target.value as typeof form.urgency)}>
                <option value="alta">Alta — búsqueda inmediata</option>
                <option value="media">Media — búsqueda activa</option>
                <option value="baja">Baja — evaluando opciones</option>
              </select>
            </label>
            <label>
              Procedencia del postulante
              <select value={form.origin} onChange={(e) => update("origin", e.target.value as typeof form.origin)}>
                <option value="espontanea">Atención espontánea</option>
                <option value="sence">Derivación SENCE</option>
                <option value="omil">Programa OMIL</option>
                <option value="derivacion">Derivación de otra entidad</option>
              </select>
            </label>
            <label className="wide">
              Notas internas
              <textarea
                value={form.internalNotes}
                onChange={(e) => update("internalNotes", e.target.value)}
                placeholder="Ej: Derivado desde SENCE. Disponible solo mañanas. Prefiere modalidad presencial."
                rows={2}
              />
              <span style={{ fontSize: 11, color: "var(--muted)" }}>Solo las ve el equipo OMIL — no es visible para empresas ni postulantes.</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="submit">
              <CheckCircle2 size={18} aria-hidden="true" />
              Publicar perfil OMIL
            </button>
            {confirmClear ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>¿Limpiar todos los campos?</span>
                <button
                  type="button"
                  className="button ghost"
                  style={{ fontSize: 12, color: "#dc2626" }}
                  onClick={() => {
                    setForm({ legalName: "", email: "", phone: "", headline: "", summary: "", skills: "", area: "Oficios y Otros", region: "Region Metropolitana", city: "Santiago", salaryMin: "0", salaryMax: "0", workMode: "onsite", urgency: "media", origin: "espontanea", internalNotes: "" });
                    setCvFile(null);
                    setConfirmClear(false);
                  }}
                >
                  Sí, limpiar
                </button>
                <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={() => setConfirmClear(false)}>Cancelar</button>
              </div>
            ) : (
              <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={() => setConfirmClear(true)}>
                Limpiar formulario
              </button>
            )}
          </div>
          {lastCreated ? (
            <div className="omilSuccess">
              <CalendarClock size={20} aria-hidden="true" />
              <p>
                Perfil publicado · Código: <strong>{lastCreated.code}</strong> · Vigente hasta {new Date(lastCreated.expiresAt).toLocaleDateString("es-CL")}
              </p>
              <button
                className="button ghost"
                type="button"
                style={{ fontSize: 11, marginTop: 4 }}
                onClick={async () => {
                  try { await navigator.clipboard.writeText(lastCreated.code); setCopiedCode(lastCreated.code); setTimeout(() => setCopiedCode(null), 2000); } catch {}
                }}
              >
                {copiedCode === lastCreated.code ? "✓ Copiado" : "Copiar código"}
              </button>
            </div>
          ) : null}
          {status ? <p className="statusText">{status}</p> : null}
        </form>
      </div>

      {sessionProfiles.length > 0 && (
        <div className="stack" style={{ marginTop: 0 }}>
          <section className="formSurface">
            <div className="formHeader">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <h2>Perfiles creados esta sesión ({sessionProfiles.length})</h2>
                <p>Perfiles publicados desde que inició esta sesión.</p>
              </div>
              <button
                className="button ghost"
                type="button"
                style={{ fontSize: 12, marginLeft: "auto" }}
                onClick={() => {
                  const rows = [["Código","Nombre","Cargo","Vigencia"]].concat(
                    sessionProfiles.map((p) => [p.code, p.name, p.headline, new Date(p.expiresAt).toLocaleDateString("es-CL")])
                  );
                  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv" }));
                  a.download = `perfiles_omil_${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                }}
              >
                ⬇ Exportar CSV
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Buscar por código o nombre…"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            <div className="results">
              {sessionProfiles.filter((p) => !sessionSearch || p.code.toLowerCase().includes(sessionSearch.toLowerCase()) || p.name.toLowerCase().includes(sessionSearch.toLowerCase())).map((profile) => (
                <article className="resultCard" key={profile.code}>
                  <div>
                    <div className="resultCardTop">
                      <span className="profileCode">{profile.code}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>Vigente hasta {new Date(profile.expiresAt).toLocaleDateString("es-CL")}</span>
                    </div>
                    <h2 style={{ fontSize: 14 }}>{profile.name}</h2>
                    <p>{profile.headline}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <button
                      className="button ghost"
                      type="button"
                      style={{ fontSize: 11 }}
                      onClick={async () => {
                        try { await navigator.clipboard.writeText(profile.code); setCopiedCode(profile.code); setTimeout(() => setCopiedCode(null), 2000); } catch {}
                      }}
                    >
                      {copiedCode === profile.code ? "✓ Copiado" : "Copiar código"}
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      style={{ fontSize: 11 }}
                      onClick={() => { setPrintProfile(profile); setShowPrintable(true); }}
                    >
                      Hoja para el postulante
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {showPrintable && printProfile && (
            <section className="formSurface" style={{ border: "2px solid var(--accent)", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>Instrucciones para el postulante</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="button secondary" type="button" style={{ fontSize: 12 }} onClick={() => window.print()}>🖨 Imprimir</button>
                  <button className="button ghost" type="button" style={{ fontSize: 12 }} onClick={() => setShowPrintable(false)}>✕ Cerrar</button>
                </div>
              </div>
              <div style={{ fontFamily: "serif", lineHeight: 1.8, fontSize: 14 }}>
                <p><strong>Estimado/a {printProfile.name}:</strong></p>
                <p>Su perfil laboral ha sido publicado en <strong>Perfil Primero</strong> por la OMIL de {omilMeta?.municipalityName ?? "su municipio"}.</p>
                <p>Su código de perfil es: <strong style={{ fontSize: 18 }}>{printProfile.code}</strong></p>
                <p>El perfil estará visible hasta el: <strong>{new Date(printProfile.expiresAt).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}</strong></p>
                <p><strong>¿Qué hacer ahora?</strong></p>
                <ol>
                  <li>Cuando una empresa esté interesada, recibirá una invitación a través de la plataforma.</li>
                  <li>No comparta sus datos personales antes de aceptar la entrevista en la plataforma.</li>
                  <li>Si su perfil vence y desea renovarlo, visítenos en <strong>perfil-primero.web.app/postulante</strong>.</li>
                </ol>
                <p style={{ marginTop: 16, fontSize: 12, color: "#666" }}>OMIL {omilMeta?.municipalityName} · Contacto: {omilMeta?.contactPersonName}</p>
              </div>
            </section>
          )}
        </div>
      )}

    </section>
  );
}


