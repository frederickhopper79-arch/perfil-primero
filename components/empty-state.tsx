import type { FC, ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon = "📭",
  title,
  description,
  action,
  size = "md",
}) => {
  const padding = size === "lg" ? "3rem 2rem" : size === "sm" ? "1.25rem" : "2rem 1.5rem";
  const iconSize = size === "lg" ? 48 : size === "sm" ? 28 : 36;
  const titleSize = size === "lg" ? 18 : size === "sm" ? 13 : 15;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding,
        gap: 10,
      }}
      role="status"
      aria-label={title}
    >
      <span style={{ fontSize: iconSize, lineHeight: 1 }} aria-hidden="true">{icon}</span>
      <div style={{ fontSize: titleSize, fontWeight: 700, color: "var(--heading)" }}>{title}</div>
      {description && (
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 320, margin: 0 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
};
