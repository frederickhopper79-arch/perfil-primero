export type NpsCategory = "promoter" | "passive" | "detractor";

export function categorizNps(score: number): NpsCategory {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

export function calcNpsScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  const promoters  = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}
