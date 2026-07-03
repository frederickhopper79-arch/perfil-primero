// Web Vitals reporting — envía CWV a Firebase Analytics si está disponible
// Uso: llamar initWebVitals() una vez desde un Client Component raíz

type MetricName = "CLS" | "INP" | "LCP" | "FCP" | "TTFB";

interface Metric {
  name: MetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
}

function sendToAnalytics(metric: Metric) {
  try {
    if (typeof window === "undefined") return;
    // Enviar a Firebase Analytics vía gtag si está disponible
    if ("gtag" in window) {
      (window as Window & { gtag: Function }).gtag("event", metric.name, {
        value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_rating: metric.rating,
        non_interaction: true,
      });
    }
    // Static export: no hay API routes, solo gtag
  } catch {
    // nunca propagar errores de analytics
  }
}

export async function initWebVitals() {
  if (typeof window === "undefined") return;
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import("web-vitals");
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch {
    // web-vitals no instalado aún — sin-op
  }
}
