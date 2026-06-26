"use client";
import { type FC, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  hideClose?: boolean;
}

export const Modal: FC<ModalProps> = ({ open, onClose, title, children, size = "md", hideClose = false }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal?.();
      document.body.style.overflow = "hidden";
    } else {
      el.close?.();
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "sm" ? 420 : size === "lg" ? 800 : 580;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(2px)" }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "relative",
          background: "var(--surface)",
          borderRadius: 18,
          width: "100%",
          maxWidth: maxW,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,.3)",
          zIndex: 1,
        }}
        onClick={e => e.stopPropagation()}
      >
        {(title || !hideClose) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--line)" }}>
            {title && <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", margin: 0 }}>{title}</h2>}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 20, padding: "2px 6px", borderRadius: 6, lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div style={{ padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
