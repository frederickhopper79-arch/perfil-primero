// Dominio: Herramientas salariales (benchmark, sugerencia, validación). RFC-001.
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { Query } from "firebase-admin/firestore";
import { db, CALL_OPTS_FAST } from "../shared";
import { sanitize } from "../lib/validation";

// Referencia de mercado por sector (CLP bruto/mes) — estimaciones Chile 2026.
const SALARY_REFERENCE: Record<string, { min: number; median: number; max: number }> = {
  "Tecnología / Software": { min: 1200000, median: 2200000, max: 4500000 },
  "Finanzas / Banca": { min: 900000, median: 1900000, max: 3800000 },
  "Salud / Clínico": { min: 800000, median: 1500000, max: 3200000 },
  "Marketing / Comunicaciones": { min: 700000, median: 1300000, max: 2800000 },
  "Logística / Operaciones": { min: 600000, median: 1100000, max: 2200000 },
  "Educación / Capacitación": { min: 550000, median: 950000, max: 1800000 },
  "Comercio / Ventas": { min: 600000, median: 1050000, max: 2500000 },
  "Construcción / Minería": { min: 800000, median: 1600000, max: 3500000 },
  "Gastronomía / Turismo": { min: 500000, median: 750000, max: 1500000 },
  "RRHH / Administración": { min: 650000, median: 1100000, max: 2100000 },
};

// ── Benchmark salarial real por sector/región desde los perfiles publicados ───
export const getSalaryBenchmark = onCall<{ sector: string; region?: string; experienceLevel?: string }>(CALL_OPTS_FAST, async (request) => {
  const sector = sanitize(request.data.sector, 100);
  const region = sanitize(request.data.region ?? "", 80);
  const experienceLevel = sanitize(request.data.experienceLevel ?? "", 20);
  let q: Query = db.collection("workerPublicProfiles")
    .where("visibilityStatus", "==", "visible")
    .where("sectors", "array-contains", sector);
  if (region) q = (q as Query).where("region", "==", region);
  if (experienceLevel) q = (q as Query).where("experienceLevel", "==", experienceLevel);
  const snap = await q.limit(200).get();
  if (snap.empty) return { count: 0, medianMin: null, medianMax: null, p25Min: null, p75Max: null };
  const mins: number[] = [];
  const maxes: number[] = [];
  snap.docs.forEach(d => {
    const mn = Number(d.data().expectedSalaryMin ?? 0);
    const mx = Number(d.data().expectedSalaryMax ?? 0);
    if (mn > 0) mins.push(mn);
    if (mx > 0) maxes.push(mx);
  });
  mins.sort((a, b) => a - b);
  maxes.sort((a, b) => a - b);
  const median = (arr: number[]) => arr.length === 0 ? null : arr[Math.floor(arr.length / 2)];
  const p = (arr: number[], pct: number) => arr.length === 0 ? null : arr[Math.floor(arr.length * pct)];
  return {
    count: snap.size,
    medianMin: median(mins),
    medianMax: median(maxes),
    p25Min: p(mins, 0.25),
    p75Max: p(maxes, 0.75),
    sector,
    region: region || "Chile",
    experienceLevel: experienceLevel || "todos",
  };
});

// ── Sugerencia de renta esperada por sector y experiencia ─────────────────────
export const getSalarySuggestion = onCall<{ sector: string; region: string; yearsExp: number }>(async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const { sector, yearsExp } = request.data;
  const ref = SALARY_REFERENCE[sector];
  if (!ref) return { min: 560000, median: 900000, max: 1800000, note: "Estimación general de mercado" };
  const expFactor = Math.min(1 + (Number(yearsExp ?? 0) * 0.04), 1.5);
  return {
    min: Math.round(ref.min * expFactor / 1000) * 1000,
    median: Math.round(ref.median * expFactor / 1000) * 1000,
    max: Math.round(ref.max * expFactor / 1000) * 1000,
    note: `Estimación de referencia para ${sector} en Chile 2026`
  };
});

// ── Validación del sueldo de una oferta (piso legal + referencia de mercado) ──
export const validateJobOfferSalary = onCall<{ salaryMin: number; salaryMax: number; sector: string }>(async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  const INGRESO_MINIMO = 560000;
  const { salaryMin, salaryMax, sector } = request.data;
  const ref = SALARY_REFERENCE[sector];
  const marketMin = ref?.min ?? INGRESO_MINIMO;
  const warnings: string[] = [];
  if (Number(salaryMin) < INGRESO_MINIMO) warnings.push(`El sueldo mínimo ($${salaryMin?.toLocaleString("es-CL")}) está bajo el ingreso mínimo legal ($${INGRESO_MINIMO.toLocaleString("es-CL")}).`);
  if (ref && Number(salaryMax) < marketMin * 0.6) warnings.push(`El sueldo máximo parece muy bajo para ${sector} (referencia de mercado: $${marketMin.toLocaleString("es-CL")} mínimo).`);
  if (Number(salaryMax) < Number(salaryMin)) warnings.push("El sueldo máximo es menor que el mínimo.");
  return { valid: warnings.length === 0, warnings };
});
