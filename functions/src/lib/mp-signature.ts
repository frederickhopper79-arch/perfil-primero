import * as crypto from "crypto";

/**
 * Valida la firma `x-signature` de un webhook de Mercado Pago.
 * Función pura y testable: recibe headers, query y secreto explícitos.
 *
 * Manifiesto firmado por MP: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * comparado por HMAC-SHA256 en tiempo constante.
 */
export function validateMpSignature(
  headers: Record<string, string | string[] | undefined>,
  query: Record<string, string | string[] | undefined>,
  secret: string | undefined
): boolean {
  if (!secret) return false;

  const xSignature = String(headers["x-signature"] ?? "");
  const xRequestId = String(headers["x-request-id"] ?? "");
  const dataId = String(query["data.id"] ?? "");
  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(",");
  const tsPart = parts.find((p) => p.trim().startsWith("ts="))?.split("=")[1] ?? "";
  const v1Part = parts.find((p) => p.trim().startsWith("v1="))?.split("=")[1] ?? "";
  if (!tsPart || !v1Part) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${tsPart};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  const expBuf = Buffer.from(expected);
  const v1Buf = Buffer.from(v1Part);
  // timingSafeEqual lanza si los buffers difieren en largo — comparar largo
  // primero evita que una firma malformada tumbe el handler del webhook.
  if (expBuf.length !== v1Buf.length) return false;
  return crypto.timingSafeEqual(expBuf, v1Buf);
}
