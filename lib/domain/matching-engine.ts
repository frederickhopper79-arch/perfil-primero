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
  filters: { query: string; region: string; area: string; salaryMax: string; workMode?: string }
): number {
  let matched = 0;
  let total = 0;

  if (filters.region) {
    total += 25;
    if (worker.region === filters.region) matched += 25;
  }
  if (filters.area) {
    total += 25;
    const workerSectorsLower = worker.sectors.map((s) => s.toLowerCase());
    if (workerSectorsLower.some((s) => s === filters.area.toLowerCase() || s.includes(filters.area.toLowerCase()))) matched += 25;
  }
  if (filters.salaryMax && Number(filters.salaryMax) > 0) {
    total += 20;
    const max = Number(filters.salaryMax);
    if (worker.expectedSalaryMin <= max) {
      matched += worker.expectedSalaryMax <= max ? 20 : 10;
    }
  }
  if (filters.query) {
    total += 25;
    const q = filters.query.toLowerCase();
    const haystack = [worker.headline, worker.displayName, ...worker.skills, worker.summary ?? ""].join(" ").toLowerCase();
    if (haystack.includes(q)) matched += 25;
    else if (worker.skills.some((s) => s.toLowerCase().startsWith(q.split(" ")[0]))) matched += 12;
  }
  if (filters.workMode) {
    total += 5;
    if (worker.workModes.includes(filters.workMode as "remote" | "hybrid" | "onsite")) matched += 5;
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

  // Boost por tests y badges
  const testBonus = worker.assessmentScores
    ? Math.min(10, Object.values(worker.assessmentScores).filter((v) => v > 60).length * 3)
    : 0;

  if (total === 0) return Math.min(100, quality + testBonus);
  const filterScore = Math.round((matched / total) * 100);
  return Math.min(100, Math.round(filterScore * 0.6 + quality * 0.35 + testBonus * 0.05));
}

export type WorkerBadge =
  | "perfil_completo"
  | "cv_validado"
  | "tests_completos"
  | "busca_activamente"
  | "senior"
  | "multimodalidad";

export function calculateBadges(profile: WorkerPublicProfile): WorkerBadge[] {
  const badges: WorkerBadge[] = [];
  const completeness = calculateProfileCompleteness({
    skills: profile.skills,
    summary: profile.summary ?? "",
    workModes: profile.workModes,
    expectedSalaryMin: profile.expectedSalaryMin,
    expectedSalaryMax: profile.expectedSalaryMax,
    assessmentScores: profile.assessmentScores,
    cvAnalysisSummary: profile.cvAnalysisSummary
  });
  if (completeness >= 90) badges.push("perfil_completo");
  if (profile.cvAnalysisSummary) badges.push("cv_validado");
  if (
    profile.assessmentScores &&
    (profile.assessmentScores.english ?? 0) > 0 &&
    (profile.assessmentScores.spanish ?? 0) > 0 &&
    (profile.assessmentScores.personality ?? 0) > 0
  ) badges.push("tests_completos");
  if (profile.availability === "actively_looking") badges.push("busca_activamente");
  if (profile.experienceLevel === "senior" || profile.experienceLevel === "lead") badges.push("senior");
  if (profile.workModes.length >= 2) badges.push("multimodalidad");
  return badges;
}

const badgeLabels: Record<WorkerBadge, string> = {
  perfil_completo: "Perfil completo",
  cv_validado: "CV validado IA",
  tests_completos: "Tests completos",
  busca_activamente: "Búsqueda activa",
  senior: "Senior/Lead",
  multimodalidad: "Multimodalidad"
};

export function badgeLabel(badge: WorkerBadge): string {
  return badgeLabels[badge];
}

export function profileAvailabilityLabel(profile: Pick<WorkerPublicProfile, "availability" | "visibilityStatus">) {
  if (profile.visibilityStatus !== "visible") return "No visible";
  if (profile.availability === "actively_looking") return "Busca activamente";
  if (profile.availability === "listening") return "Escucha ofertas";
  return "No disponible";
}
