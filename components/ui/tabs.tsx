"use client";
import { useState, useId, type ReactNode, type CSSProperties } from "react";

interface Tab {
  id: string;
  label: ReactNode;
  content: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  variant?: "line" | "pill";
  style?: CSSProperties;
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, defaultTab, variant = "line", style, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const baseId = useId();

  function select(id: string) {
    setActive(id);
    onChange?.(id);
  }

  function handleKey(e: React.KeyboardEvent, i: number) {
    const enabled = tabs.filter((t) => !t.disabled);
    const curr = enabled.findIndex((t) => t.id === active);
    if (e.key === "ArrowRight") { e.preventDefault(); select(enabled[(curr + 1) % enabled.length].id); }
    if (e.key === "ArrowLeft") { e.preventDefault(); select(enabled[(curr - 1 + enabled.length) % enabled.length].id); }
    if (e.key === "Home") { e.preventDefault(); select(enabled[0].id); }
    if (e.key === "End") { e.preventDefault(); select(enabled[enabled.length - 1].id); }
  }

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div style={style}>
      <div
        role="tablist"
        aria-label="Pestañas"
        style={{
          display: "flex",
          gap: variant === "pill" ? 4 : 0,
          borderBottom: variant === "line" ? "2px solid var(--line)" : undefined,
          marginBottom: 16,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab, i) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => !tab.disabled && select(tab.id)}
              onKeyDown={(e) => handleKey(e, i)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: variant === "line" ? "10px 16px" : "7px 14px",
                background: variant === "pill" ? (isActive ? "var(--blue, #0a66c2)" : "transparent") : "transparent",
                color: variant === "pill"
                  ? (isActive ? "var(--white)" : "var(--muted-strong)")
                  : (isActive ? "var(--blue, #0a66c2)" : "var(--muted)"),
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                border: 0,
                borderBottom: variant === "line" ? `2px solid ${isActive ? "var(--blue, #0a66c2)" : "transparent"}` : undefined,
                borderRadius: variant === "pill" ? 8 : 0,
                cursor: tab.disabled ? "not-allowed" : "pointer",
                opacity: tab.disabled ? 0.5 : 1,
                marginBottom: variant === "line" ? -2 : 0,
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "var(--blue-soft, #dce6f1)",
                    color: isActive && variant === "pill" ? "white" : "var(--blue, #0a66c2)",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
        >
          {tab.id === active && tab.content}
        </div>
      ))}
    </div>
  );
}
