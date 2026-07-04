"use client";
import { useEffect, useRef, useState } from "react";

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface GuidedTourProps {
  steps: TourStep[];
  active: boolean;
  onFinish: () => void;
  storageKey?: string;
}

export function GuidedTour({ steps, active, onFinish, storageKey }: GuidedTourProps) {
  const [current, setCurrent] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // En móvil el tooltip es una hoja inferior fija (position:fixed) — no se
    // calcula por coordenadas para evitar solapar topbar y desbordes.
    if (!active || !steps[current] || isMobile) return;
    const el = document.querySelector(steps[current].target);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const placement = steps[current].placement ?? "bottom";
    const tp = tooltipRef.current;
    const th = tp?.offsetHeight ?? 100;
    const tw = tp?.offsetWidth ?? 260;

    let top = 0, left = 0;
    if (placement === "bottom") { top = rect.bottom + 12 + window.scrollY; left = rect.left + rect.width / 2 - tw / 2; }
    else if (placement === "top") { top = rect.top - th - 12 + window.scrollY; left = rect.left + rect.width / 2 - tw / 2; }
    else if (placement === "right") { top = rect.top + rect.height / 2 - th / 2 + window.scrollY; left = rect.right + 12; }
    else { top = rect.top + rect.height / 2 - th / 2 + window.scrollY; left = rect.left - tw - 12; }

    setPos({ top, left });
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [active, current, steps, isMobile]);

  function next() {
    if (current < steps.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      finish();
    }
  }

  function finish() {
    if (storageKey) localStorage.setItem(storageKey, "1");
    onFinish();
    setCurrent(0);
  }

  if (!active || !steps[current]) return null;

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 8000,
          background: "rgba(0,0,0,0.45)", pointerEvents: "none",
        }}
      />
      {/* Tooltip — hoja inferior fija en móvil, posicionada por coordenadas en desktop */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="false"
        aria-label={steps[current].title}
        style={
          isMobile
            ? {
                position: "fixed",
                left: 12,
                right: 12,
                bottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
                zIndex: 8001,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                boxShadow: "0 -4px 30px rgba(0,0,0,0.2)",
                padding: "16px 20px",
              }
            : {
                position: "absolute",
                top: pos.top,
                left: Math.max(8, pos.left),
                zIndex: 8001,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                boxShadow: "var(--shadow-lg, 0 10px 40px rgba(0,0,0,0.16))",
                padding: "16px 20px",
                maxWidth: 280,
                width: "max-content",
              }
        }
      >
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 6 }}>
          Paso {current + 1} de {steps.length}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "var(--heading)" }}>
          {steps[current].title}
        </div>
        <p style={{ fontSize: 13, color: "var(--muted-strong)", margin: "0 0 16px", lineHeight: 1.5 }}>
          {steps[current].content}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={finish}
            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", padding: "10px 4px", minHeight: 44 }}
          >
            Saltar tour
          </button>
          <button
            type="button"
            className="button"
            onClick={next}
            style={{ fontSize: 14, padding: "10px 20px", minHeight: 44 }}
          >
            {current < steps.length - 1 ? "Siguiente →" : "Finalizar"}
          </button>
        </div>
      </div>
    </>
  );
}
