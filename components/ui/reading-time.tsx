"use client";

const WPM = 200;

export function ReadingTime({ text, className }: { text: string; className?: string }) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / WPM));
  return (
    <span className={className} style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
      {minutes} min de lectura
    </span>
  );
}
