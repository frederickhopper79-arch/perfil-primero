"use client";
import { type ReactNode, type CSSProperties } from "react";

interface FabProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  color?: string;
  style?: CSSProperties;
}

const POS_MAP = {
  "bottom-right": { bottom: 24, right: 24 },
  "bottom-left": { bottom: 24, left: 24 },
  "bottom-center": { bottom: 24, left: "50%", transform: "translateX(-50%)" },
};

export function FloatingActionButton({ onClick, icon, label, position = "bottom-right", color, style }: FabProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        position: "fixed",
        zIndex: 800,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: color ?? "var(--blue, #0a66c2)",
        color: "white",
        border: 0,
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        ...POS_MAP[position],
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(0,0,0,0.28)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
      }}
    >
      {icon}
    </button>
  );
}
