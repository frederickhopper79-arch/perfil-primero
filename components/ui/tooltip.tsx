"use client";
import { useState, useRef, useId, type ReactNode, type CSSProperties } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  maxWidth?: number;
}

export function Tooltip({ content, children, placement = "top", maxWidth = 220 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    timerRef.current = setTimeout(() => setVisible(true), 300);
  }
  function hide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }

  const tooltipStyle: CSSProperties = {
    position: "absolute",
    zIndex: 9500,
    background: "var(--heading, #0d1b2a)",
    color: "var(--white, #fff)",
    fontSize: 12,
    lineHeight: 1.5,
    borderRadius: 6,
    padding: "6px 10px",
    maxWidth,
    whiteSpace: "normal",
    pointerEvents: "none",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.15s ease",
    ...(placement === "top" ? { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" } : {}),
    ...(placement === "bottom" ? { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" } : {}),
    ...(placement === "left" ? { right: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" } : {}),
    ...(placement === "right" ? { left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" } : {}),
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={id}>{children}</span>
      <span id={id} role="tooltip" style={tooltipStyle}>
        {content}
      </span>
    </span>
  );
}
