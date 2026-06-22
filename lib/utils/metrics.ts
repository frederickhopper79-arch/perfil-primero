// Performance metrics helpers

export function markStart(name: string): void {
  if (typeof performance !== "undefined") {
    performance.mark(`${name}:start`);
  }
}

export function markEnd(name: string): number {
  if (typeof performance === "undefined") return 0;
  performance.mark(`${name}:end`);
  try {
    performance.measure(name, `${name}:start`, `${name}:end`);
    const entries = performance.getEntriesByName(name, "measure");
    return entries[entries.length - 1]?.duration ?? 0;
  } catch {
    return 0;
  }
}

export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  markStart(name);
  const result = await fn();
  const durationMs = markEnd(name);
  return { result, durationMs };
}

export function reportMetric(name: string, valueMs: number, label?: string): void {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as Window & { gtag: Function }).gtag("event", name, {
      event_category: "Performance",
      value: Math.round(valueMs),
      event_label: label,
      non_interaction: true,
    });
  }
}

export function getMemorySnapshot(): { usedMB: number; limitMB: number } | null {
  if (typeof performance !== "undefined" && "memory" in performance) {
    const mem = (performance as Performance & {
      memory: { usedJSHeapSize: number; jsHeapSizeLimit: number };
    }).memory;
    return {
      usedMB: Math.round(mem.usedJSHeapSize / 1024 / 1024),
      limitMB: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
    };
  }
  return null;
}
