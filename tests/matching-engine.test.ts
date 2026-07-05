import { describe, it, expect } from "vitest";
import {
  calculateProfileCompleteness,
  getCompletenessHints,
  calculateMatchScore,
  calculateBadges,
  profileAvailabilityLabel,
} from "../lib/domain/matching-engine";
import type { WorkerPublicProfile } from "../lib/domain/types";

const summary80 = "x".repeat(80);

const completeProfileInput = {
  skills: ["a", "b", "c"],
  summary: summary80,
  workModes: ["remote"] as Array<"remote" | "hybrid" | "onsite">,
  expectedSalaryMin: 800000,
  expectedSalaryMax: 1200000,
  assessmentScores: { english: 70, spanish: 70, personality: 70 },
  cvAnalysisSummary: "CV analizado",
};

function worker(over: Partial<WorkerPublicProfile> = {}): WorkerPublicProfile {
  return {
    workerId: "w1",
    profileCode: "PP-1",
    displayName: "Perfil anónimo",
    headline: "Desarrollador Full-Stack",
    summary: summary80,
    skills: ["React", "Node", "TypeScript"],
    sectors: ["tecnologia"],
    experienceLevel: "senior",
    yearsOfExperience: 6,
    region: "Region Metropolitana",
    workModes: ["remote", "hybrid"],
    expectedSalaryMin: 1000000,
    expectedSalaryMax: 1500000,
    currency: "CLP",
    availability: "actively_looking",
    visibilityStatus: "visible",
    subscriptionStatus: "active",
    assessmentScores: { english: 80, spanish: 80, personality: 80 },
    cvAnalysisSummary: "CV validado",
    profileExpiresAt: new Date(),
    ...over,
  } as WorkerPublicProfile;
}

describe("calculateProfileCompleteness", () => {
  it("perfil completo = 100", () => {
    expect(calculateProfileCompleteness(completeProfileInput)).toBe(100);
  });
  it("perfil vacío = 0", () => {
    expect(calculateProfileCompleteness({
      skills: [], summary: "", workModes: [], expectedSalaryMin: 0, expectedSalaryMax: 0,
      assessmentScores: undefined, cvAnalysisSummary: undefined,
    })).toBe(0);
  });
  it("suma parcial correcta (solo skills + summary = 40)", () => {
    expect(calculateProfileCompleteness({
      skills: ["a", "b", "c"], summary: summary80, workModes: [], expectedSalaryMin: 0, expectedSalaryMax: 0,
      assessmentScores: undefined, cvAnalysisSummary: undefined,
    })).toBe(40);
  });
});

describe("getCompletenessHints", () => {
  it("perfil completo no genera hints", () => {
    expect(getCompletenessHints(completeProfileInput)).toHaveLength(0);
  });
  it("perfil vacío genera un hint por cada faltante", () => {
    const hints = getCompletenessHints({
      skills: [], summary: "", workModes: [], expectedSalaryMin: 0, expectedSalaryMax: 0,
      assessmentScores: undefined, cvAnalysisSummary: undefined,
    });
    expect(hints.length).toBe(6);
    expect(hints.reduce((s, h) => s + h.points, 0)).toBe(100);
  });
});

describe("calculateMatchScore", () => {
  const noFilters = { query: "", region: "", area: "", salaryMax: "" };

  it("sin filtros usa la calidad del perfil + bonus de tests", () => {
    const score = calculateMatchScore(worker(), noFilters);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("región y área que calzan suben el score", () => {
    const match = calculateMatchScore(worker(), { ...noFilters, region: "Region Metropolitana", area: "tecnologia" });
    const noMatch = calculateMatchScore(worker(), { ...noFilters, region: "Region X", area: "salud" });
    expect(match).toBeGreaterThan(noMatch);
  });

  it("query que aparece en skills/headline suma", () => {
    const hit = calculateMatchScore(worker(), { ...noFilters, query: "React" });
    const miss = calculateMatchScore(worker(), { ...noFilters, query: "cobol" });
    expect(hit).toBeGreaterThan(miss);
  });

  it("nunca excede 100", () => {
    const score = calculateMatchScore(worker(), { query: "React", region: "Region Metropolitana", area: "tecnologia", salaryMax: "2000000", workMode: "remote" });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("calculateBadges", () => {
  it("perfil completo y senior obtiene badges esperadas", () => {
    const badges = calculateBadges(worker());
    expect(badges).toContain("cv_validado");
    expect(badges).toContain("tests_completos");
    expect(badges).toContain("busca_activamente");
    expect(badges).toContain("senior");
    expect(badges).toContain("multimodalidad"); // 2 modalidades
  });
  it("perfil junior con una sola modalidad no obtiene senior ni multimodalidad", () => {
    const badges = calculateBadges(worker({ experienceLevel: "junior", workModes: ["remote"] }));
    expect(badges).not.toContain("senior");
    expect(badges).not.toContain("multimodalidad");
  });
});

describe("profileAvailabilityLabel", () => {
  it("no visible tiene prioridad", () => {
    expect(profileAvailabilityLabel({ availability: "actively_looking", visibilityStatus: "paused" })).toBe("No visible");
  });
  it("visible + busca activamente", () => {
    expect(profileAvailabilityLabel({ availability: "actively_looking", visibilityStatus: "visible" })).toBe("Busca activamente");
  });
});
