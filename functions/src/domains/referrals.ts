// Dominio: Referidos. Handlers movidos desde index.ts (RFC-001 paso 3).
// Los nombres se re-exportan desde index.ts (`export * from "./domains/referrals"`)
// para que Firebase los siga descubriendo con el mismo nombre desplegado.

import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db, appUrl, CALL_OPTS_FAST, log } from "../shared";
import { sanitize } from "../lib/validation";

// ── getReferralStats — estadísticas de referidos del usuario ──────────────────
export const getReferralStats = onCall(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const uid = request.auth.uid;
  const userDoc = await db.collection("users").doc(uid).get();
  const referralCode = userDoc.data()?.referralCode ?? null;
  if (!referralCode) return { referralCode: null, referralCount: 0, earnedDays: 0, referrals: [] };
  const referralsSnap = await db.collection("referrals")
    .where("referrerUid", "==", uid)
    .where("status", "==", "activated")
    .orderBy("activatedAt", "desc")
    .limit(50)
    .get();
  const referrals = referralsSnap.docs.map(d => ({
    refereeEmail: String(d.data().refereeEmail ?? "").replace(/(?<=.{3}).(?=.*@)/g, "*"),
    activatedAt: (d.data().activatedAt as Timestamp)?.toDate().toISOString() ?? null,
    earnedDays: Number(d.data().earnedDays ?? 30),
  }));
  const earnedDays = referrals.reduce((s, r) => s + r.earnedDays, 0);
  return { referralCode, referralCount: referrals.length, earnedDays, referrals };
});

// ── applyReferralCode — aplica código de referido en registro ─────────────────
export const applyReferralCode = onCall<{ referralCode: string }>(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const uid = request.auth.uid;
  const code = sanitize(request.data.referralCode, 20).toUpperCase();
  if (!code || code.length < 4) throw new HttpsError("invalid-argument", "Código de referido inválido.");
  const existingRef = await db.collection("referrals")
    .where("refereeUid", "==", uid).limit(1).get();
  if (!existingRef.empty) throw new HttpsError("already-exists", "Ya aplicaste un código de referido.");
  const referrerSnap = await db.collection("users").where("referralCode", "==", code).limit(1).get();
  if (referrerSnap.empty) throw new HttpsError("not-found", "Código de referido no encontrado.");
  const referrerDoc = referrerSnap.docs[0];
  if (referrerDoc.id === uid) throw new HttpsError("invalid-argument", "No puedes usar tu propio código.");
  await db.collection("referrals").add({
    referralCode: code,
    referrerUid: referrerDoc.id,
    refereeUid: uid,
    status: "pending",
    earnedDays: 30,
    createdAt: FieldValue.serverTimestamp(),
  });
  log("INFO", "referral_code_applied", { uid, referrerUid: referrerDoc.id, code });
  return { ok: true, referrerUid: referrerDoc.id };
});

// ── activateReferral — se activa cuando el referee activa su perfil ───────────
export const activateReferral = onCall<{ refereeUid: string }>(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const snap = await db.collection("referrals")
    .where("refereeUid", "==", request.data.refereeUid)
    .where("status", "==", "pending")
    .limit(1).get();
  if (snap.empty) return { ok: false };
  const ref = snap.docs[0];
  const { referrerUid, earnedDays } = ref.data();
  const batch = db.batch();
  batch.update(ref.ref, { status: "activated", activatedAt: FieldValue.serverTimestamp() });
  const referrerUser = db.collection("users").doc(referrerUid);
  batch.update(referrerUser, { referralDaysEarned: FieldValue.increment(earnedDays) });
  await batch.commit();
  log("INFO", "referral_activated", { referrerUid, refereeUid: request.data.refereeUid, earnedDays });
  return { ok: true };
});

// ── getReferralLink — enlace de referido del usuario ──────────────────────────
export const getReferralLink = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const code = `REF-${uid.slice(0, 8).toUpperCase()}`;
  const ref = db.collection("referralCodes").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ uid, code, uses: 0, conversions: 0, createdAt: FieldValue.serverTimestamp() });
  }
  const data = snap.data() ?? {};
  return { code: snap.exists ? (data.code ?? code) : code, uses: Number(data.uses ?? 0), conversions: Number(data.conversions ?? 0), url: `${appUrl}/?ref=${snap.exists ? (data.code ?? code) : code}` };
});

// ── trackReferralVisit — registra una visita por código ───────────────────────
export const trackReferralVisit = onCall<{ code: string }>(async (request) => {
  const { code } = request.data;
  if (!code) return { ok: false };
  const snap = await db.collection("referralCodes").where("code", "==", code.toUpperCase()).limit(1).get();
  if (snap.empty) return { ok: false };
  await snap.docs[0].ref.update({ uses: FieldValue.increment(1) });
  return { ok: true };
});
