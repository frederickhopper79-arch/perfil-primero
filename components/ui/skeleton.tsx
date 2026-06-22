import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 6, style, className }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className ?? ""}`}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, var(--skeleton-base,#e5e7eb) 25%, var(--skeleton-shine,#f3f4f6) 50%, var(--skeleton-base,#e5e7eb) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeletonShimmer 1.4s infinite",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="50%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton height={18} borderRadius={4} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={36} borderRadius={4} />
      ))}
    </div>
  );
}

export function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Skeleton en formato grid — proporciones de tarjeta cuadrada */
export function SkeletonGrid({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
          <Skeleton height={120} borderRadius={8} />
          <Skeleton height={16} width="70%" />
          <Skeleton height={13} width="50%" />
          <Skeleton height={13} width="40%" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton inline para una sola línea de texto */
export function SkeletonText({ lines = 3, lastWidth = "60%" }: { lines?: number; lastWidth?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? lastWidth : "100%"} />
      ))}
    </div>
  );
}
