export function formatCLP(amount: number): string {
  return `$${amount.toLocaleString("es-CL")}`;
}

export function formatDate(
  value: Date | { seconds: number } | string | null | undefined
): string {
  if (!value) return "—";
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "object" && "seconds" in value) {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value as string);
  }
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatRelativeDate(
  value: Date | { seconds: number } | string | null | undefined
): string {
  if (!value) return "—";
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "object" && "seconds" in value) {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value as string);
  }
  if (isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

export function formatSalaryRange(min: number, max: number): string {
  if (!min && !max) return "No especificado";
  if (!max) return `Desde ${formatCLP(min)}`;
  if (!min) return `Hasta ${formatCLP(max)}`;
  return `${formatCLP(min)} – ${formatCLP(max)}`;
}

export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Formatea número como CLP abreviado: 1200000 → "$1,2M" */
export function formatCLPCompact(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return formatCLP(amount);
}

/** Capitaliza primera letra de cada palabra */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Convierte snake_case o kebab-case a Título */
export function toTitle(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Formatea número de teléfono chileno: "912345678" → "+56 9 1234 5678" */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "").replace(/^56/, "");
  if (clean.length === 9 && clean.startsWith("9")) {
    return `+56 ${clean[0]} ${clean.slice(1, 5)} ${clean.slice(5)}`;
  }
  return phone;
}

/** Sanitiza texto para HTML (previene XSS en interpolaciones) */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Formatea bytes en unidad legible: 1536 → "1,5 KB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Genera slug URL-friendly desde texto */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
