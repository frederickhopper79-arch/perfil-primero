"use client";
import { useEffect } from "react";

interface Shortcut {
  keys: string;
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: "Ctrl + K", description: "Abrir paleta de comandos" },
  { keys: "Shift + ?", description: "Mostrar atajos de teclado" },
  { keys: "Esc", description: "Cerrar modal / paleta" },
  { keys: "↑ ↓", description: "Navegar en paleta de comandos" },
  { keys: "Enter", description: "Ejecutar comando seleccionado" },
  { keys: "Tab", description: "Navegar entre campos" },
  { keys: "Shift + Tab", description: "Navegar hacia atrás" },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atajos de teclado"
      style={{
        position: "fixed", inset: 0, zIndex: 9500,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--surface)", borderRadius: 14, padding: "24px 28px",
        maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg, 0 10px 40px rgba(0,0,0,0.2))",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Atajos de teclado</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--muted)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <div className="shortcutModal">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="shortcutRow">
              <span style={{ color: "var(--muted-strong)", fontSize: 14 }}>{s.description}</span>
              <kbd className="shortcutKey">{s.keys}</kbd>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 16, marginBottom: 0, textAlign: "center" }}>
          Presiona <kbd className="shortcutKey">Shift + ?</kbd> en cualquier momento para ver este panel
        </p>
      </div>
    </div>
  );
}
