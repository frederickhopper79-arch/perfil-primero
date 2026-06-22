"use client";
import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

type DrawerSide = "left" | "right" | "bottom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: DrawerSide;
  width?: number | string;
  style?: CSSProperties;
}

const SLIDE_IN: Record<DrawerSide, string> = {
  left: "translateX(0)",
  right: "translateX(0)",
  bottom: "translateY(0)",
};

const SLIDE_OUT: Record<DrawerSide, string> = {
  left: "translateX(-100%)",
  right: "translateX(100%)",
  bottom: "translateY(100%)",
};

export function Drawer({ open, onClose, title, children, side = "right", width = 400, style }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const panelStyle: CSSProperties = {
    position: "fixed",
    zIndex: 9000,
    background: "var(--surface)",
    boxShadow: "var(--shadow-panel)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease",
    transform: open ? SLIDE_IN[side] : SLIDE_OUT[side],
    ...(side === "left" ? { top: 0, left: 0, bottom: 0, width, maxWidth: "90vw" } : {}),
    ...(side === "right" ? { top: 0, right: 0, bottom: 0, width, maxWidth: "90vw" } : {}),
    ...(side === "bottom" ? { bottom: 0, left: 0, right: 0, maxHeight: "80vh", borderRadius: "16px 16px 0 0" } : {}),
    ...style,
  };

  if (!open && typeof document !== "undefined") return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={title ? "pp-drawer-title" : undefined}>
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 8999, background: "rgba(13,27,42,0.4)", backdropFilter: "blur(1px)" }}
        />
      )}
      <div ref={panelRef} style={panelStyle}>
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
            <h2 id="pp-drawer-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--heading)" }}>{title}</h2>
            <button onClick={onClose} aria-label="Cerrar" style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 20, color: "var(--muted)", padding: "4px 8px" }}>×</button>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>{children}</div>
      </div>
    </div>
  );
}
