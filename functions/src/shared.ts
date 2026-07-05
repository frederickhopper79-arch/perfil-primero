// Infraestructura compartida de las Cloud Functions: init del Admin SDK,
// handle de Firestore, configuración, logger, rate limiting y assertAdmin.
// index.ts y los módulos de dominio importan desde aquí (sin ciclos).

import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { HttpsError } from "firebase-functions/v2/https";
import type { CallableOptions } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";

initializeApp();

export const db = getFirestore();
export const appUrl = process.env.APP_URL ?? "https://perfil-primero.web.app";

// Precios base (fallback si no hay configuración en Firestore)
export const workerLaunchClp = 0;      // gratis durante lanzamiento
export const companyLaunchClp = 4990;  // precio lanzamiento empresa
export const workerRegularClp = 999;   // precio normal post-lanzamiento postulante
export const companyRegularClp = 9990; // precio normal post-lanzamiento empresa

// Opciones de runtime para funciones de alta frecuencia
export const CALL_OPTS_FAST: CallableOptions = { timeoutSeconds: 30, memory: "256MiB", minInstances: 0 };
export const CALL_OPTS_HEAVY: CallableOptions = { timeoutSeconds: 120, memory: "512MiB", minInstances: 0 };

// ── Structured logger ─────────────────────────────────────────────────────
export function log(severity: "INFO" | "WARNING" | "ERROR", msg: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ severity, message: msg, ...data, timestamp: new Date().toISOString() }));
}

// ── Rate limiting híbrido: in-memory (rápido) + Firestore (persistente) ────
const _rateLimitStore = new Map<string, number[]>();
export function checkRateLimit(uid: string, key: string, maxRequests: number, windowMs: number): void {
  const storeKey = `${uid}:${key}`;
  const now = Date.now();
  const timestamps = (_rateLimitStore.get(storeKey) ?? []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    throw new HttpsError("resource-exhausted", "Demasiadas solicitudes. Espera un momento antes de intentarlo nuevamente.");
  }
  _rateLimitStore.set(storeKey, [...timestamps, now]);
}

// Rate limiting persistente via Firestore para endpoints críticos (sobrevive cold starts)
export async function checkRateLimitPersistent(uid: string, key: string, maxRequests: number, windowMs: number): Promise<void> {
  const storeKey = `${uid}:${key}`;
  const ref = db.collection("rateLimits").doc(storeKey);
  const now = Date.now();
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();
    const windowStart = Number(data?.windowStart ?? 0);
    const count = Number(data?.count ?? 0);
    if (now - windowStart > windowMs) {
      tx.set(ref, { uid, key, count: 1, windowStart: now, updatedAt: FieldValue.serverTimestamp() });
    } else if (count >= maxRequests) {
      throw new HttpsError("resource-exhausted", "Demasiadas solicitudes. Espera un momento antes de intentarlo nuevamente.");
    } else {
      tx.update(ref, { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() });
    }
  });
}

// ── Autorización admin ─────────────────────────────────────────────────────
export async function assertAdmin(uid?: string) {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }
  const user = await db.collection("users").doc(uid).get();
  if (!user.exists || user.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "No tienes permisos de administrador.");
  }
  return uid;
}

// ── Auditoría ──────────────────────────────────────────────────────────────
export async function writeAudit(
  actorId: string,
  actorRole: "worker" | "company" | "admin" | "omil",
  eventType: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, string>
) {
  const eventRef = db.collection("auditEvents").doc();
  await eventRef.set({
    eventId: eventRef.id, actorId, actorRole, eventType, targetType, targetId, metadata,
    createdAt: FieldValue.serverTimestamp()
  });
}

// ── Configuración de precios (con cache de 5 min) ──────────────────────────
export type PricingConfig = {
  launchPhaseActive: boolean;
  workerSubscriptionClp: number;
  companyContactClp: number;
  workerRegularClp: number;
  companyRegularClp: number;
};

let _pricingCache: { data: PricingConfig; expiresAt: number } | null = null;

export async function getPricingConfig(): Promise<PricingConfig> {
  if (_pricingCache && Date.now() < _pricingCache.expiresAt) return _pricingCache.data;
  const defaults: PricingConfig = {
    launchPhaseActive: true,
    workerSubscriptionClp: workerLaunchClp,
    companyContactClp: companyLaunchClp,
    workerRegularClp: workerRegularClp,
    companyRegularClp: companyRegularClp
  };

  const snap = await db.collection("configuracion_sistema").doc("tarifas").get();
  const data = snap.data();

  if (!snap.exists || !data) {
    await db.collection("configuracion_sistema").doc("tarifas").set(
      {
        fase_lanzamiento_activa: defaults.launchPhaseActive,
        tarifa_suscripcion_postulante_clp: defaults.workerSubscriptionClp,
        tarifa_contacto_empresa_clp: defaults.companyContactClp,
        tarifa_postulante_precio_real: defaults.workerRegularClp,
        tarifa_empresa_precio_real: defaults.companyRegularClp,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return defaults;
  }

  const result: PricingConfig = {
    launchPhaseActive: data.fase_lanzamiento_activa !== false,
    workerSubscriptionClp: Math.max(0, Number(data.tarifa_suscripcion_postulante_clp ?? defaults.workerSubscriptionClp)),
    companyContactClp: Math.max(1, Number(data.tarifa_contacto_empresa_clp ?? defaults.companyContactClp)),
    workerRegularClp: Math.max(1, Number(data.tarifa_postulante_precio_real ?? defaults.workerRegularClp)),
    companyRegularClp: Math.max(1, Number(data.tarifa_empresa_precio_real ?? defaults.companyRegularClp))
  };
  _pricingCache = { data: result, expiresAt: Date.now() + 5 * 60 * 1000 };
  return result;
}

// ── Notificaciones push (FCM) ──────────────────────────────────────────────
export async function sendFcmToUser(uid: string, title: string, body: string, url = "/"): Promise<void> {
  const tokensSnap = await db.collection("users").doc(uid).collection("pushTokens").limit(10).get();
  if (tokensSnap.empty) return;
  const messaging = getMessaging();
  await Promise.all(tokensSnap.docs.map(async (tokenDoc) => {
    const token = tokenDoc.id;
    try {
      await messaging.send({
        token,
        notification: { title, body },
        webpush: {
          notification: { icon: "/logo-perfil-primero.png", badge: "/logo-perfil-primero.png" },
          fcmOptions: { link: url }
        }
      });
    } catch (err) {
      const code = (err as { errorInfo?: { code?: string } }).errorInfo?.code ?? "";
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        await tokenDoc.ref.delete();
      }
    }
  }));
}

// ── Email transaccional (SendGrid) ─────────────────────────────────────────
export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "contacto@perfil-primero.cl";
  if (!apiKey) return; // email deshabilitado si no hay key
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: "Perfil Primero" },
      subject,
      content: [{ type: "text/html", value: html }]
    })
  });
}

// ── IA: Vertex/Gemini y Groq ───────────────────────────────────────────────
export function getGeminiAI(): GoogleGenAI {
  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "perfil-primero",
    location: "us-central1"
  });
}

export async function generateJsonWithGroq(prompt: string, modelOverride?: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new HttpsError("failed-precondition", "GROQ_API_KEY no configurada.");

  const model = modelOverride ?? process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  const startedAt = Date.now();

  const body = JSON.stringify({
    model,
    messages: [
      { role: "system", content: "Eres un asistente experto en recursos humanos chilenos. Responde SOLO con JSON válido, sin texto adicional, sin markdown." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.25,
    max_tokens: 1800
  });

  let responseText = "";
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      const lower = errBody.toLowerCase();
      if (res.status === 429 || lower.includes("rate_limit")) {
        throw new HttpsError("resource-exhausted", "Groq: límite de tasa alcanzado. Intenta en unos minutos.");
      }
      throw new HttpsError("internal", `Groq respondió ${res.status}: ${errBody.slice(0, 200)}`);
    }

    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    responseText = json.choices?.[0]?.message?.content?.trim() ?? "";

    await db.collection("aiUsageLogs").doc().set({
      endpointApi: "groq-json", model, status: "success",
      latencyMs: Date.now() - startedAt, promptChars: prompt.length,
      responseChars: responseText.length, createdAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    await db.collection("aiUsageLogs").doc().set({
      endpointApi: "groq-json", model, status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - startedAt, promptChars: prompt.length,
      createdAt: FieldValue.serverTimestamp()
    });
    throw new HttpsError("internal", `Error al conectar con Groq: ${error instanceof Error ? error.message : "desconocido"}`);
  }

  if (!responseText) throw new HttpsError("internal", "Groq no devolvió contenido.");

  try {
    return JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new HttpsError("internal", "Groq no devolvió JSON válido.");
  }
}
