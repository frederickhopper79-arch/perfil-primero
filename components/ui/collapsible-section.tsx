"use client";
import { useState, useRef, useEffect } from "react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(defaultOpen ? "auto" : "0px");

  useEffect(() => {
    if (!contentRef.current) return;
    if (open) {
      const h = contentRef.current.scrollHeight;
      setHeight(`${h}px`);
      const t = setTimeout(() => setHeight("auto"), 250);
      return () => clearTimeout(t);
    } else {
      setHeight(`${contentRef.current.scrollHeight}px`);
      requestAnimationFrame(() => setHeight("0px"));
    }
  }, [open]);

  return (
    <div style={{ borderBottom: "1px solid var(--line)" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: "14px 0",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 15,
          color: "var(--heading)",
          textAlign: "left",
        }}
      >
        {title}
        <span
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 220ms",
            display: "inline-block",
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          ▾
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          height,
          overflow: "hidden",
          transition: "height 240ms ease",
        }}
      >
        <div style={{ paddingBottom: 16 }}>{children}</div>
      </div>
    </div>
  );
}
