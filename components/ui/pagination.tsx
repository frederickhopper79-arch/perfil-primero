"use client";
import type { CSSProperties } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  showEdges?: boolean;
  style?: CSSProperties;
}

export function Pagination({ page, totalPages, onPage, showEdges = true, style }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pages(): (number | "...")[] {
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    const result: (number | "...")[] = [];
    if (showEdges && range[0] > 0) { result.push(0); if (range[0] > 1) result.push("..."); }
    result.push(...range);
    if (showEdges && range[range.length - 1] < totalPages - 1) {
      if (range[range.length - 1] < totalPages - 2) result.push("...");
      result.push(totalPages - 1);
    }
    return result;
  }

  const btnStyle = (active: boolean, disabled: boolean): CSSProperties => ({
    minWidth: 36,
    height: 36,
    padding: "0 10px",
    border: `1.5px solid ${active ? "var(--blue, #0a66c2)" : "var(--line)"}`,
    borderRadius: 8,
    background: active ? "var(--blue, #0a66c2)" : "var(--surface)",
    color: active ? "white" : disabled ? "var(--muted)" : "var(--text)",
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <nav aria-label="Paginación" style={style}>
      <ul style={{ display: "flex", gap: 4, listStyle: "none", margin: 0, padding: 0, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
        <li>
          <button
            style={btnStyle(false, page === 0)}
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
            aria-label="Página anterior"
          >
            ←
          </button>
        </li>
        {pages().map((p, i) => (
          <li key={i}>
            {p === "..." ? (
              <span style={{ padding: "0 6px", color: "var(--muted)", fontSize: 13 }}>…</span>
            ) : (
              <button
                style={btnStyle(p === page, false)}
                onClick={() => onPage(p as number)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Página ${(p as number) + 1}`}
              >
                {(p as number) + 1}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            style={btnStyle(false, page === totalPages - 1)}
            disabled={page === totalPages - 1}
            onClick={() => onPage(page + 1)}
            aria-label="Página siguiente"
          >
            →
          </button>
        </li>
      </ul>
    </nav>
  );
}
