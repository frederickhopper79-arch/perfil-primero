"use client";
import { useEffect, useState } from "react";

const COOKIE_KEY = "pp_cookies_accepted";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_KEY, "1");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, "0");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookieBanner" role="alert" aria-live="polite">
      <span style={{ flex: 1 }}>
        Usamos cookies esenciales para el funcionamiento de la plataforma. Consulta nuestra{" "}
        <a href="/legal/privacidad">política de privacidad</a>.
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="button secondary" onClick={decline} style={{ fontSize: 13, padding: "6px 14px" }}>
          Solo esenciales
        </button>
        <button type="button" className="button" onClick={accept} style={{ fontSize: 13, padding: "6px 14px" }}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
