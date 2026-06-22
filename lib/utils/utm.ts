export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export function buildUtmUrl(baseUrl: string, params: UtmParams): string {
  const url = new URL(baseUrl);
  if (params.source)   url.searchParams.set("utm_source",   params.source);
  if (params.medium)   url.searchParams.set("utm_medium",   params.medium);
  if (params.campaign) url.searchParams.set("utm_campaign", params.campaign);
  if (params.term)     url.searchParams.set("utm_term",     params.term);
  if (params.content)  url.searchParams.set("utm_content",  params.content);
  return url.toString();
}

export function parseUtmParams(search: string): UtmParams {
  const p = new URLSearchParams(search);
  return {
    source:   p.get("utm_source")   ?? undefined,
    medium:   p.get("utm_medium")   ?? undefined,
    campaign: p.get("utm_campaign") ?? undefined,
    term:     p.get("utm_term")     ?? undefined,
    content:  p.get("utm_content")  ?? undefined,
  };
}

export function saveUtmToSession(search: string) {
  if (typeof window === "undefined") return;
  const params = parseUtmParams(search);
  if (params.source) {
    sessionStorage.setItem("pp_utm", JSON.stringify(params));
  }
}

export function getStoredUtm(): UtmParams | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("pp_utm");
  if (!raw) return null;
  try { return JSON.parse(raw) as UtmParams; }
  catch { return null; }
}
