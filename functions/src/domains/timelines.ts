// Dominio: Timelines (historial de eventos de worker/empresa). RFC-001.
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";
import { db, CALL_OPTS_FAST } from "../shared";

// ── Historial de eventos del postulante ───────────────────────────────────────
export const getWorkerTimeline = onCall(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const uid = request.auth.uid;
  const [invitationsSnap, paymentsSnap] = await Promise.all([
    db.collection("invitations").where("workerId", "==", uid).orderBy("expiresAt", "desc").limit(20).get(),
    db.collection("payments").where("uid", "==", uid).orderBy("createdAt", "desc").limit(10).get(),
  ]);
  const events: Array<{ type: string; date: string | null; label: string; meta?: Record<string,unknown> }> = [];
  invitationsSnap.docs.forEach(d => {
    const data = d.data();
    const ts = (data.createdAt as Timestamp)?.toDate().toISOString() ?? null;
    const statusLabels: Record<string,string> = {
      sent: "Invitación recibida", accepted: "Invitación aceptada", hired: "Contratación confirmada",
      rejected: "Invitación rechazada", expired: "Invitación expirada", in_process: "Proceso en curso",
    };
    events.push({ type: "invitation", date: ts, label: statusLabels[data.status] ?? data.status, meta: { opportunityTitle: data.opportunityTitle, status: data.status } });
  });
  paymentsSnap.docs.forEach(d => {
    const data = d.data();
    const ts = (data.createdAt as Timestamp)?.toDate().toISOString() ?? null;
    events.push({ type: "payment", date: ts, label: "Pago realizado — perfil activado", meta: { amount: data.amount, currency: data.currency } });
  });
  events.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return { events };
});

// ── Historial de eventos de la empresa ────────────────────────────────────────
export const getCompanyTimeline = onCall(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const uid = request.auth.uid;
  const companyDoc = await db.collection("companyProfiles").doc(uid).get();
  if (!companyDoc.exists) throw new HttpsError("not-found", "Empresa no encontrada.");
  const [invitationsSnap, paymentsSnap] = await Promise.all([
    db.collection("invitations").where("companyId", "==", uid).orderBy("expiresAt", "desc").limit(30).get(),
    db.collection("payments").where("uid", "==", uid).orderBy("createdAt", "desc").limit(10).get(),
  ]);
  const events: Array<{ type: string; date: string | null; label: string; meta?: Record<string,unknown> }> = [];
  const statusLabels: Record<string,string> = {
    sent: "Invitación enviada", accepted: "Candidato aceptó", hired: "Contratación confirmada",
    rejected: "Candidato rechazó", expired: "Invitación expirada", in_process: "Proceso activo",
  };
  invitationsSnap.docs.forEach(d => {
    const data = d.data();
    const ts = (data.createdAt as Timestamp)?.toDate().toISOString() ?? null;
    events.push({ type: "invitation", date: ts, label: statusLabels[data.status] ?? data.status, meta: { opportunityTitle: data.opportunityTitle, status: data.status } });
  });
  paymentsSnap.docs.forEach(d => {
    const data = d.data();
    const ts = (data.createdAt as Timestamp)?.toDate().toISOString() ?? null;
    events.push({ type: "payment", date: ts, label: "Pago procesado", meta: { amount: data.amount } });
  });
  events.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return { events };
});
