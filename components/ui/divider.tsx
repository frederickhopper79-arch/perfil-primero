import type { ReactNode, CSSProperties } from "react";

interface DividerProps {
  label?: ReactNode;
  style?: CSSProperties;
  vertical?: boolean;
}

export function Divider({ label, style, vertical = false }: DividerProps) {
  if (vertical) {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        style={{
          display: "inline-block",
          width: 1,
          alignSelf: "stretch",
          background: "var(--line)",
          ...style,
        }}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "12px 0",
          ...style,
        }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>
    );
  }

  return (
    <hr
      style={{
        border: 0,
        borderTop: "1px solid var(--line)",
        margin: "12px 0",
        ...style,
      }}
    />
  );
}
