import { describe, it, expect } from "vitest";
import * as crypto from "crypto";
import { validateMpSignature } from "../functions/src/lib/mp-signature";

const SECRET = "test_webhook_secret_123";
const REQUEST_ID = "req-abc-123";
const DATA_ID = "payment-999";
const TS = "1717000000";

// Construye un x-signature válido para los valores dados
function sign(secret: string, dataId: string, requestId: string, ts: string): string {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${ts},v1=${v1}`;
}

const headers = (xSignature: string, xRequestId = REQUEST_ID) => ({
  "x-signature": xSignature,
  "x-request-id": xRequestId,
});
const query = (dataId = DATA_ID) => ({ "data.id": dataId });

describe("validateMpSignature", () => {
  it("acepta una firma válida", () => {
    const sig = sign(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(validateMpSignature(headers(sig), query(), SECRET)).toBe(true);
  });

  it("rechaza si falta el secreto", () => {
    const sig = sign(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(validateMpSignature(headers(sig), query(), undefined)).toBe(false);
    expect(validateMpSignature(headers(sig), query(), "")).toBe(false);
  });

  it("rechaza con secreto incorrecto", () => {
    const sig = sign("otro_secreto", DATA_ID, REQUEST_ID, TS);
    expect(validateMpSignature(headers(sig), query(), SECRET)).toBe(false);
  });

  it("rechaza si se manipula el data.id (manifiesto alterado)", () => {
    const sig = sign(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(validateMpSignature(headers(sig), query("payment-OTRO"), SECRET)).toBe(false);
  });

  it("rechaza si se manipula el request-id", () => {
    const sig = sign(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(validateMpSignature(headers(sig, "req-FALSO"), query(), SECRET)).toBe(false);
  });

  it("rechaza si faltan headers", () => {
    const sig = sign(SECRET, DATA_ID, REQUEST_ID, TS);
    expect(validateMpSignature({ "x-request-id": REQUEST_ID }, query(), SECRET)).toBe(false);
    expect(validateMpSignature({ "x-signature": sig }, query(), SECRET)).toBe(false);
  });

  it("rechaza x-signature malformado (sin v1 o sin ts)", () => {
    expect(validateMpSignature(headers("v1=abc"), query(), SECRET)).toBe(false);
    expect(validateMpSignature(headers("ts=123"), query(), SECRET)).toBe(false);
    expect(validateMpSignature(headers("basura"), query(), SECRET)).toBe(false);
  });

  it("no lanza excepción si v1 tiene largo distinto (no crashea el webhook)", () => {
    // Regresión: crypto.timingSafeEqual lanza con buffers de distinto largo.
    expect(() => validateMpSignature(headers(`ts=${TS},v1=corto`), query(), SECRET)).not.toThrow();
    expect(validateMpSignature(headers(`ts=${TS},v1=corto`), query(), SECRET)).toBe(false);
  });
});
