const SUELDO_MINIMO_2025 = 500_000;
const SUELDO_MINIMO_2026 = 530_000;

const UF_MENSUAL = 37_200;

export function formatCLP(amount: number, compact = false): string {
  if (compact && amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}k`;
  }
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSalaryRange(min: number, max: number): string {
  if (min === max) return formatCLP(min);
  return `${formatCLP(min)} – ${formatCLP(max)}`;
}

export function isAboveMinimumWage(salary: number, year: 2025 | 2026 = 2026): boolean {
  const min = year === 2025 ? SUELDO_MINIMO_2025 : SUELDO_MINIMO_2026;
  return salary >= min;
}

export function clpToUF(clp: number): number {
  return Math.round((clp / UF_MENSUAL) * 100) / 100;
}

export function ufToClp(uf: number): number {
  return Math.round(uf * UF_MENSUAL);
}

export function salaryPercentile(salary: number, median: number): "below_p25" | "p25_p50" | "p50_p75" | "above_p75" {
  const p25 = median * 0.8;
  const p75 = median * 1.2;
  if (salary < p25) return "below_p25";
  if (salary < median) return "p25_p50";
  if (salary < p75) return "p50_p75";
  return "above_p75";
}

export function salaryPercentileLabel(percentile: ReturnType<typeof salaryPercentile>): string {
  switch (percentile) {
    case "below_p25": return "Por debajo del mercado";
    case "p25_p50": return "Bajo la mediana";
    case "p50_p75": return "Sobre la mediana";
    case "above_p75": return "Top 25% del mercado";
  }
}

export function grossToNet(gross: number): number {
  const afp = gross * 0.10;
  const salud = gross * 0.07;
  const cesantia = gross * 0.006;
  return Math.round(gross - afp - salud - cesantia);
}

export function netToGross(net: number): number {
  const factor = 1 - 0.10 - 0.07 - 0.006;
  return Math.round(net / factor);
}

export function annualBonus(monthly: number, months = 1): number {
  return monthly * months;
}
