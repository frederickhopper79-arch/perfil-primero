interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: string;
}

export function EmptyState({ title, description, action, icon = "📭" }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px 24px", textAlign: "center", gap: 12,
      }}
    >
      <span style={{ fontSize: 40, lineHeight: 1 }}>{icon}</span>
      <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>{title}</p>
      {description && (
        <p style={{ color: "var(--muted,#6b7280)", fontSize: 14, margin: 0, maxWidth: 320 }}>
          {description}
        </p>
      )}
      {action && (
        <button type="button" className="button secondary" style={{ marginTop: 8 }} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
