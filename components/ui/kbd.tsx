import type { ReactNode, CSSProperties } from "react";

interface KbdProps {
  children: ReactNode;
  style?: CSSProperties;
}

/** Renderiza un atajo de teclado con estilo de tecla física */
export function Kbd({ children, style }: KbdProps) {
  return (
    <kbd
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 22,
        height: 22,
        padding: "0 5px",
        fontSize: 11,
        fontFamily: "inherit",
        fontWeight: 600,
        lineHeight: 1,
        color: "var(--muted-strong)",
        background: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderBottom: "2px solid var(--line-strong)",
        borderRadius: 4,
        letterSpacing: 0,
        userSelect: "none",
        ...style,
      }}
    >
      {children}
    </kbd>
  );
}
