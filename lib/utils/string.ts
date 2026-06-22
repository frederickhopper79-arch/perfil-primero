// Utilidades de string

/** Normaliza texto para búsqueda: sin tildes, lowercase */
export function normalizeSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Resalta ocurrencias de query en texto devolviendo partes */
export function highlightParts(text: string, query: string): Array<{ text: string; highlight: boolean }> {
  if (!query) return [{ text, highlight: false }];
  const normalText = normalizeSearch(text);
  const normalQuery = normalizeSearch(query);
  const parts: Array<{ text: string; highlight: boolean }> = [];
  let lastIndex = 0;
  let index = normalText.indexOf(normalQuery);
  while (index !== -1) {
    if (index > lastIndex) parts.push({ text: text.slice(lastIndex, index), highlight: false });
    parts.push({ text: text.slice(index, index + query.length), highlight: true });
    lastIndex = index + query.length;
    index = normalText.indexOf(normalQuery, lastIndex);
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), highlight: false });
  return parts;
}

/** Elimina HTML tags de un string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

/** Cuenta palabras en texto */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Cuenta caracteres sin espacios */
export function charCount(text: string): number {
  return text.replace(/\s/g, "").length;
}

/** Extrae primeras N palabras de un texto */
export function excerpt(text: string, words = 30): string {
  const w = text.trim().split(/\s+/);
  if (w.length <= words) return text;
  return w.slice(0, words).join(" ") + "…";
}

/** Genera acrónimo de hasta 3 letras desde nombre de empresa */
export function acronym(name: string, maxLen = 3): string {
  return name
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxLen)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/** Convierte texto a Title Case respetando preposiciones en español */
export function toTitleCase(str: string): string {
  const lower = ["de", "del", "la", "las", "el", "los", "y", "e", "o", "u", "en", "con", "por", "para", "a"];
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) => (i === 0 || !lower.includes(word)) ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(" ");
}

/** Genera initials desde nombre: "Juan Pérez" → "JP" */
export function initials(name: string, max = 2): string {
  return name
    .split(/\s+/)
    .slice(0, max)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Verifica si string contiene query (case/accent insensitive) */
export function fuzzyMatch(text: string, query: string): boolean {
  return normalizeSearch(text).includes(normalizeSearch(query));
}

/** Mascara email: "juan.perez@gmail.com" → "j***@gmail.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local[0]}***@${domain}`;
}

/** Mascara teléfono: "+56 9 1234 5678" → "+56 9 **** 5678" */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{4})(?=\s?\d{4}$)/, "****");
}
