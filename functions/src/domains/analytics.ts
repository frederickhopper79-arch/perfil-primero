// Dominio: Analítica y estadísticas públicas. RFC-001.
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db, CALL_OPTS_FAST } from "../shared";
import { sanitize } from "../lib/validation";

// ── Estadísticas públicas para la landing ─────────────────────────────────────
export const getPublicWorkerStats = onCall(async () => {
  const [workersSnap, companiesSnap, invSnap] = await Promise.all([
    db.collection("workerPublicProfiles").where("visibilityStatus", "==", "visible").count().get(),
    db.collection("companyProfiles").where("verificationStatus", "==", "verified").count().get(),
    db.collection("invitations").where("status", "==", "hired").count().get(),
  ]);
  return {
    activeWorkers:      workersSnap.data().count,
    verifiedCompanies:  companiesSnap.data().count,
    successfulHires:    invSnap.data().count,
  };
});

// ── Guardar atribución UTM al registro ────────────────────────────────────────
export const recordUtmConversion = onCall<{
  source?: string; medium?: string; campaign?: string; event: string;
}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  await db.collection("utmConversions").add({
    uid,
    source:   sanitize(request.data.source ?? "", 100),
    medium:   sanitize(request.data.medium ?? "", 100),
    campaign: sanitize(request.data.campaign ?? "", 100),
    event:    sanitize(request.data.event, 100),
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
});

// ── Estadísticas públicas para páginas de blog ────────────────────────────────
export const getPublicBlogStats = onCall(CALL_OPTS_FAST, async () => {
  const statsDoc = await db.collection("publicStats").doc("platform").get();
  const data = statsDoc.data() ?? {};
  return {
    totalWorkers: Number(data.totalActiveWorkers ?? 0),
    totalCompanies: Number(data.totalVerifiedCompanies ?? 0),
    totalHired: Number(data.totalHired ?? 0),
    avgDaysToOffer: Number(data.avgDaysToFirstOffer ?? 11),
    responseRate: Number(data.companyResponseRate ?? 73),
    topSectors: Array.isArray(data.topSectors) ? data.topSectors.slice(0, 5) : [],
    topRegions: Array.isArray(data.topRegions) ? data.topRegions.slice(0, 5) : [],
    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() ?? null,
  };
});
