import type { WorkerPublicProfile } from "./types";

export function calculateProfileCompleteness(profile: Pick<
  WorkerPublicProfile,
  "skills" | "summary" | "workModes" | "expectedSalaryMin" | "expectedSalaryMax" | "assessmentScores" | "cvAnalysisSummary"
>) {
  let score = 0;

  if (profile.skills.length >= 3) score += 20;
  if (profile.summary.length >= 80) score += 20;
  if (profile.workModes.length) score += 15;
  if (profile.expectedSalaryMin > 0 && profile.expectedSalaryMax >= profile.expectedSalaryMin) score += 15;
  if (profile.cvAnalysisSummary) score += 15;
  if (profile.assessmentScores && Object.values(profile.assessmentScores).some((value) => value > 0)) score += 15;

  return Math.min(score, 100);
}

export function profileAvailabilityLabel(profile: Pick<WorkerPublicProfile, "availability" | "visibilityStatus">) {
  if (profile.visibilityStatus !== "visible") return "No visible";
  if (profile.availability === "actively_looking") return "Busca activamente";
  if (profile.availability === "listening") return "Escucha ofertas";
  return "No disponible";
}
