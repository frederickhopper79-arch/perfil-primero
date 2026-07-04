"use client";
import { useState, useEffect } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("pp-cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("pp-cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("pp-cookie-consent", "declined");
    setVisible(false);
    // Disable GA if present
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 520,
        margin: "0 auto",
        background: "var(--color-dark)",
        color: "#fff",
        borderRadius: 14,
        padding: "1.25rem 1.5rem",
        zIndex: 9999,
        boxShadow: "0 8px 40px rgba(0,0,0,.35)",
        display: "flex",
        gap: 16,
        flexDirection: "column",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Usamos cookies funcionales</div>
        <p style={{ fontSize: 12, color: "#d4deea", lineHeight: 1.6, margin: 0 }}>
          Utilizamos cookies esenciales para que la plataforma funcione y cookies de análisis anónimas (Google Analytics) para mejorar la experiencia. No usamos cookies de publicidad ni compartimos datos con terceros.{" "}
          <a href="/legal/privacidad" style={{ color: "#7fd0f5", textDecoration: "underline" }}>Más información</a>
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          onClick={accept}
          style={{ background: "#0e6d94", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", flex: 1 }}
        >
          Aceptar
        </button>
        <button
          onClick={decline}
          style={{ background: "transparent", color: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.3)", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
        >
          Solo esenciales
        </button>
      </div>
    </div>
  );
}
