// Dominio: NPS (encuesta de satisfacción). RFC-001.
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db, appUrl, log, sendEmail } from "../shared";
import { sanitize } from "../lib/validation";

// ── Registrar respuesta NPS ───────────────────────────────────────────────────
export const submitNps = onCall<{ score: number; comment?: string; context?: string }>(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Inicia sesión.");
  const { score, comment, context } = request.data;
  if (typeof score !== "number" || score < 0 || score > 10) {
    throw new HttpsError("invalid-argument", "El score NPS debe ser un número entre 0 y 10.");
  }
  const category = score >= 9 ? "promoter" : score >= 7 ? "passive" : "detractor";
  await db.collection("npsSurveys").add({
    uid, score, category,
    comment: sanitize(comment ?? "", 500),
    context: sanitize(context ?? "", 100),
    createdAt: FieldValue.serverTimestamp(),
  });
  log("INFO", "nps_submitted", { uid, score, category });
  return { ok: true, category };
});

// ── Limpieza mensual de NPS > 1 año ───────────────────────────────────────────
export const expireOldNpsData = onSchedule("every 720 hours", async () => {
  const cutoff = Timestamp.fromDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
  const snap = await db.collection("npsSurveys").where("createdAt", "<", cutoff).limit(200).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  log("INFO", "nps_old_data_expired", { count: snap.size });
});

// ── Envío de encuesta NPS a los 30 días de activación ─────────────────────────
export const sendNpsEmails = onSchedule(
  { schedule: "every day 11:00", timeZone: "America/Santiago", region: "us-central1" },
  async () => {
    const thirtyDaysAgo = Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const thirtyOneDaysAgo = Timestamp.fromMillis(Date.now() - 31 * 24 * 60 * 60 * 1000);
    const snap = await db.collection("workerPublicProfiles")
      .where("subscriptionStatus", "==", "active")
      .where("createdAt", ">=", thirtyOneDaysAgo)
      .where("createdAt", "<=", thirtyDaysAgo)
      .limit(100)
      .get();
    for (const doc of snap.docs) {
      const reminded = await db.collection("emailReminders").doc(`nps-d30-${doc.id}`).get();
      if (reminded.exists) continue;
      const privSnap = await db.collection("workerPrivateProfiles").doc(doc.id).get();
      const email: string | undefined = privSnap.data()?.email;
      if (!email) continue;
      const npsUrl = `${appUrl}/feedback?uid=${doc.id}&type=worker`;
      await sendEmail(email, "¿Cómo ha sido tu experiencia en Perfil Primero?",
        `<p>Hola,</p>
         <p>Llevas 30 días en Perfil Primero. Queremos saber cómo te ha ido.</p>
         <p>En una escala del 1 al 10, ¿cuánto recomendarías Perfil Primero a un amigo o colega?</p>
         <p style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0">
           ${[1,2,3,4,5,6,7,8,9,10].map(n => `<a href="${npsUrl}&score=${n}" style="background:#f0f4f8;color:#0d1b2a;padding:8px 14px;border-radius:6px;text-decoration:none;font-weight:600">${n}</a>`).join("")}
         </p>
         <p>Tu opinión nos ayuda a mejorar la plataforma.</p>
         <p>— Equipo Perfil Primero</p>`
      );
      await db.collection("emailReminders").doc(`nps-d30-${doc.id}`).set({
        type: "nps_d30", workerId: doc.id, targetEmail: email, status: "sent", sentAt: FieldValue.serverTimestamp()
      });
    }
  }
);
