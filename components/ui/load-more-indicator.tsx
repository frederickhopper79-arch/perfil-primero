interface LoadMoreIndicatorProps {
  loading?: boolean;
  hasMore?: boolean;
  loadingLabel?: string;
  endLabel?: string;
}

export function LoadMoreIndicator({
  loading = false,
  hasMore = true,
  loadingLabel = "Cargando más...",
  endLabel = "No hay más resultados",
}: LoadMoreIndicatorProps) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: 14 }}>
        <span className="inlineSpinner" aria-hidden="true" />
        {loadingLabel}
      </div>
    );
  }
  if (!hasMore) {
    return (
      <div
        style={{
          textAlign: "center", padding: "20px 0",
          color: "var(--muted)", fontSize: 13,
          borderTop: "1px solid var(--line)", marginTop: 8,
        }}
      >
        {endLabel}
      </div>
    );
  }
  return null;
}
