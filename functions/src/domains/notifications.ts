// Dominio: Notificaciones (push web + preferencias). RFC-001.
import * as webpush from "web-push";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db, CALL_OPTS_FAST } from "../shared";

// ── Guardar suscripción push del usuario ──────────────────────────────────────
export const savePushSubscription = onCall<{
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
}>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const { subscription } = request.data;
  if (!subscription?.endpoint) throw new HttpsError("invalid-argument", "Suscripción inválida.");
  await db.collection("users").doc(uid).set(
    { pushSubscription: subscription, pushEnabledAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  return { ok: true };
});

// ── Enviar notificación push a un usuario ─────────────────────────────────────
export const sendPushToUser = onCall<{ targetUid: string; title: string; body: string; url?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const callerDoc = await db.collection("users").doc(uid).get();
  if (callerDoc.data()?.role !== "admin" && uid !== request.data.targetUid) {
    throw new HttpsError("permission-denied", "No autorizado.");
  }
  const targetDoc = await db.collection("users").doc(request.data.targetUid).get();
  const sub = targetDoc.data()?.pushSubscription as { endpoint: string; keys: { p256dh: string; auth: string } } | undefined;
  if (!sub?.endpoint) return { sent: false, reason: "sin_suscripcion" };

  const vapidPublic = process.env.VAPID_PUBLIC_KEY ?? "";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY ?? "";
  const vapidEmail = process.env.VAPID_EMAIL ?? "mailto:admin@perfil-primero.web.app";
  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);

  try {
    await webpush.sendNotification(sub, JSON.stringify({
      title: request.data.title,
      body: request.data.body,
      url: request.data.url ?? "/postulante",
      tag: `pp-${Date.now()}`
    }));
    return { sent: true };
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode === 410) {
      await db.collection("users").doc(request.data.targetUid).update({ pushSubscription: FieldValue.delete() });
    }
    return { sent: false, reason: "error_envio" };
  }
});

// ── Enviar push a todos los workers con suscripción (admin) ───────────────────
export const broadcastPushToWorkers = onCall<{ title: string; body: string; url?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const callerDoc = await db.collection("users").doc(uid).get();
  if (callerDoc.data()?.role !== "admin") throw new HttpsError("permission-denied", "Solo admins.");

  const vapidPublic = process.env.VAPID_PUBLIC_KEY ?? "";
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY ?? "";
  webpush.setVapidDetails(process.env.VAPID_EMAIL ?? "mailto:admin@perfil-primero.web.app", vapidPublic, vapidPrivate);

  const snap = await db.collection("users").where("pushSubscription", "!=", null).limit(500).get();
  const payload = JSON.stringify({ title: request.data.title, body: request.data.body, url: request.data.url ?? "/" });
  let sent = 0;
  await Promise.all(snap.docs.map(async (doc) => {
    const sub = doc.data().pushSubscription as { endpoint: string; keys: { p256dh: string; auth: string } };
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (err) {
      if ((err as { statusCode?: number }).statusCode === 410) {
        await doc.ref.update({ pushSubscription: FieldValue.delete() });
      }
    }
  }));
  return { sent, total: snap.size };
});

// ── Actualizar preferencias de notificación ───────────────────────────────────
export const updateNotificationPreferences = onCall<{
  email?: {
    newInvitations?: boolean;
    messages?: boolean;
    profileExpiry?: boolean;
    weeklyDigest?: boolean;
    marketing?: boolean;
  };
  push?: {
    newInvitations?: boolean;
    messages?: boolean;
  };
}>(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const uid = request.auth.uid;
  const prefs: Record<string, unknown> = {};
  if (request.data.email) prefs["notifPrefs.email"] = request.data.email;
  if (request.data.push) prefs["notifPrefs.push"] = request.data.push;
  if (Object.keys(prefs).length === 0) return { ok: true };
  await db.collection("users").doc(uid).set({ notifPrefs: request.data }, { merge: true });
  return { ok: true };
});

// ── Obtener preferencias de notificación ──────────────────────────────────────
export const getNotificationPreferences = onCall(CALL_OPTS_FAST, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const snap = await db.collection("users").doc(request.auth.uid).get();
  const defaults = {
    email: { newInvitations: true, messages: true, profileExpiry: true, weeklyDigest: true, marketing: false },
    push: { newInvitations: true, messages: true },
  };
  return { prefs: snap.data()?.notifPrefs ?? defaults };
});
