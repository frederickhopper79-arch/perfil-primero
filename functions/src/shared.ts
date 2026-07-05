// Infraestructura compartida de las Cloud Functions: init del Admin SDK,
// handle de Firestore, configuración, logger, rate limiting y assertAdmin.
// index.ts y los módulos de dominio importan desde aquí (sin ciclos).

import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import type { CallableOptions } from "firebase-functions/v2/https";

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
