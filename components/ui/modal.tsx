"use client";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  hideClose?: boolean;
  style?: CSSProperties;
}

const SIZE_MAP = { sm: 400, md: 560, lg: 720, xl: 960 };

export function Modal({ open, onClose, title, children, size = "md", hideClose = false, style }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "pp-modal-title" : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(13,27,42,0.5)", backdropFilter: "blur(2px)" }}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className="card"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: SIZE_MAP[size],
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px 28px",
          borderRadius: 16,
          animation: "fadeInUp 0.2s ease",
          ...style,
        }}
      >
        {(title || !hideClose) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
            {title && (
              <h2 id="pp-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--heading)" }}>
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  marginLeft: "auto",
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontSize: 22,
                  lineHeight: 1,
                  color: "var(--muted)",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
