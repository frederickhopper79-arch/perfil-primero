"use client";
interface ChipProps {
  label: string;
  onRemove?: () => void;
  color?: string;
}

export function Chip({ label, onRemove, color }: ChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: color ?? "var(--blue-soft)",
        color: color ? "#fff" : "var(--blue)",
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          aria-label={`Quitar ${label}`}
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
            color: "inherit",
            opacity: 0.7,
            fontSize: 14,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
