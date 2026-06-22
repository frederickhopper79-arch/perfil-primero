"use client";
import { useState, useId, type ReactNode } from "react";

interface AccordionItem {
  id?: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<Set<number>>(
    new Set(defaultOpen.map((_, i) => i).filter((i) => defaultOpen.includes(String(i))))
  );

  function toggle(i: number) {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : new Set<number>());
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const triggerId = `${baseId}-trigger-${i}`;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--line)" : undefined }}>
            <h3 style={{ margin: 0 }}>
              <button
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  padding: "14px 18px",
                  background: isOpen ? "var(--surface-muted)" : "var(--surface)",
                  border: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--heading)",
                  gap: 12,
                }}
              >
                <span style={{ flex: 1 }}>{item.title}</span>
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    fontSize: 12,
                    color: "var(--muted)",
                    transform: isOpen ? "rotate(180deg)" : undefined,
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▾
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              style={{
                padding: isOpen ? "0 18px 16px" : 0,
                fontSize: 14,
                color: "var(--muted-strong)",
                lineHeight: 1.6,
              }}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
