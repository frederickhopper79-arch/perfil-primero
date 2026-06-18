import type { WorkerPublicProfile } from "./types";

export type CompletenessProfile = Pick<
  WorkerPublicProfile,
  "skills" | "summary" | "workModes" | "expectedSalaryMin" | "expectedSalaryMax" | "assessmentScores" | "cvAnalysisSummary"
>;

export type CompletenessHint = { label: string; points: number };

export function calculateProfileCompleteness(profile: CompletenessProfile): number {
  let score = 0;
  if (profile.skills.length >= 3) score += 20;
  if (profile.summary.length >= 80) score += 20;
  if (profile.workModes.length) score += 15;
  if (profile.expectedSalaryMin > 0 && profile.expectedSalaryMax >= profile.expectedSalaryMin) score += 15;
  if (profile.cvAnalysisSummary) score += 15;
  if (profile.assessmentScores && Object.values(profile.assessmentScores).some((v) => v > 0)) score += 15;
  return Math.min(score, 100);
}

export function getCompletenessHints(profile: CompletenessProfile): CompletenessHint[] {
  const hints: CompletenessHint[] = [];
  if (profile.skills.length < 3) hints.push({ label: "Agrega al menos 3 habilidades", points: 20 });
  if (profile.summary.length < 80) hints.push({ label: "Escribe un resumen de 80+ caracteres", points: 20 });
  if (!profile.workModes.length) hints.push({ label: "Selecciona modalidad de trabajo", points: 15 });
  if (!profile.expectedSalaryMin || profile.expectedSalaryMax < profile.expectedSalaryMin) hints.push({ label: "Define rango de renta", points: 15 });
  if (!profile.cvAnalysisSummary) hints.push({ label: "Sube tu CV para análisis con IA", points: 15 });
  if (!profile.assessmentScores || !Object.values(profile.assessmentScores).some((v) => v > 0)) hints.push({ label: "Completa al menos un test de validación", points: 15 });
  return hints;
}

export function calculateMatchScore(
  worker: WorkerPublicProfile,
  filters: { query: string; region: string; area: string; salaryMax: string }
): number {
  let matched = 0;
  let total = 0;

  if (filters.region) {
    total += 25;
    if (worker.region === filters.region) matched += 25;
  }
  if (filters.area) {
    total += 25;
    if (worker.sectors.some((s) => s === filters.area)) matched += 25;
  }
  if (filters.salaryMax && Number(filters.salaryMax) > 0) {
    total += 25;
    if (worker.expectedSalaryMin <= Number(filters.salaryMax)) matched += 25;
  }
  if (filters.query) {
    total += 25;
    const q = filters.query.toLowerCase();
    const haystack = [worker.headline, ...worker.skills, worker.summary ?? ""].join(" ").toLowerCase();
    if (haystack.includes(q)) matched += 25;
  }

  const quality = calculateProfileCompleteness({
    skills: worker.skills,
    summary: worker.summary ?? "",
    workModes: worker.workModes,
    expectedSalaryMin: worker.expectedSalaryMin,
    expectedSalaryMax: worker.expectedSalaryMax,
    assessmentScores: worker.assessmentScores,
    cvAnalysisSummary: worker.cvAnalysisSummary
  });

  if (total === 0) return quality;
  const filterScore = Math.round((matched / total) * 100);
  return Math.round(filterScore * 0.6 + quality * 0.4);
}

export function profileAvailabilityLabel(profile: Pick<WorkerPublicProfile, "availability" | "visibilityStatus">) {
  if (profile.visibilityStatus !== "visible") return "No visible";
  if (profile.availability === "actively_looking") return "Busca activamente";
  if (profile.availability === "listening") return "Escucha ofertas";
  return "No disponible";
}
