"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "pp_install_dismissed";

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    function handler(e: Event) {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: 80,
        left: 16,
        right: 16,
        maxWidth: 420,
        margin: "0 auto",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        boxShadow: "var(--shadow-panel)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        zIndex: 1000,
      }}
    >
      <img src="/isotipo.png" alt="Logo" width={40} height={40} style={{ borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Instala Perfil Primero</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Accede más rápido desde tu pantalla de inicio.
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className="button secondary"
          onClick={dismiss}
          style={{ fontSize: 12, padding: "4px 10px" }}
        >
          No
        </button>
        <button
          type="button"
          className="button"
          onClick={handleInstall}
          style={{ fontSize: 12, padding: "4px 12px" }}
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
