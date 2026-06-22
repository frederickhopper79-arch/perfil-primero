import { SLA_DAYS } from "@/lib/domain/constants";

type InvitationStatus = keyof typeof SLA_DAYS;

export type SlaLight = "green" | "yellow" | "red" | "none";

export function getSlaLight(
  status: string,
  updatedAt: { seconds: number } | Date | string | undefined
): SlaLight {
  if (!(status in SLA_DAYS)) return "none";
  if (!updatedAt) return "none";

  let date: Date;
  if (updatedAt instanceof Date) {
    date = updatedAt;
  } else if (typeof updatedAt === "object" && "seconds" in updatedAt) {
    date = new Date((updatedAt as { seconds: number }).seconds * 1000);
  } else {
    date = new Date(updatedAt as string);
  }

  const daysElapsed = (Date.now() - date.getTime()) / 86400000;
  const sla = SLA_DAYS[status as InvitationStatus];

  if (daysElapsed < sla * 0.5) return "green";
  if (daysElapsed < sla) return "yellow";
  return "red";
}

export function getSlaLabel(light: SlaLight): string {
  switch (light) {
    case "green": return "En tiempo";
    case "yellow": return "Cerca del límite";
    case "red": return "SLA vencido";
    default: return "";
  }
}

export function getDaysRemaining(
  status: string,
  updatedAt: { seconds: number } | Date | string | undefined
): number | null {
  if (!(status in SLA_DAYS)) return null;
  if (!updatedAt) return null;

  let date: Date;
  if (updatedAt instanceof Date) {
    date = updatedAt;
  } else if (typeof updatedAt === "object" && "seconds" in updatedAt) {
    date = new Date((updatedAt as { seconds: number }).seconds * 1000);
  } else {
    date = new Date(updatedAt as string);
  }

  const daysElapsed = (Date.now() - date.getTime()) / 86400000;
  const sla = SLA_DAYS[status as InvitationStatus];
  return Math.max(0, Math.ceil(sla - daysElapsed));
}
