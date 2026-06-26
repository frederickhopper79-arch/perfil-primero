"use client";
import { useEffect } from "react";

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; }
}

type Metric = { name: string; value: number; id: string; rating?: string };

function sendToAnalytics({ name, value, id, rating }: Metric) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, {
      event_category: "Web Vitals",
      event_label: id,
      value: Math.round(name === "CLS" ? value * 1000 : value),
      non_interaction: true,
      metric_rating: rating,
    });
  }
}

export function WebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    import("web-vitals").then((wv) => {
      wv.onCLS?.(sendToAnalytics);
      wv.onFCP?.(sendToAnalytics);
      wv.onLCP?.(sendToAnalytics);
      wv.onTTFB?.(sendToAnalytics);
      wv.onINP?.(sendToAnalytics);
    }).catch(() => {});
  }, []);
  return null;
}
