"use client";
import { useState, useMemo, type ReactNode } from "react";

type SortDir = "asc" | "desc";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T, i: number) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  emptyMessage?: string;
  pageSize?: number;
  stickyHeader?: boolean;
}

export function DataTable<T extends object>({
  data,
  columns,
  caption,
  emptyMessage = "No hay registros.",
  pageSize = 20,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), "es-CL", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const thStyle = (col: Column<T>): React.CSSProperties => ({
    padding: "10px 14px",
    textAlign: col.align ?? "left",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--muted-strong)",
    background: stickyHeader ? "var(--surface)" : undefined,
    position: stickyHeader ? "sticky" : undefined,
    top: stickyHeader ? 0 : undefined,
    zIndex: stickyHeader ? 1 : undefined,
    borderBottom: "2px solid var(--line)",
    whiteSpace: "nowrap",
    width: col.width,
    cursor: col.sortable ? "pointer" : undefined,
    userSelect: "none",
  });

  return (
    <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid var(--line)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        {caption && <caption style={{ captionSide: "top", padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 14 }}>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                style={thStyle(col)}
                onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                aria-sort={
                  sortKey === String(col.key)
                    ? sortDir === "asc" ? "ascending" : "descending"
                    : col.sortable ? "none" : undefined
                }
              >
                {col.label}
                {col.sortable && sortKey === String(col.key) && (
                  <span aria-hidden="true" style={{ marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: "32px 14px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            pageData.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? "var(--surface)" : "var(--surface-muted)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    style={{ padding: "10px 14px", textAlign: col.align ?? "left", color: "var(--text)", verticalAlign: "middle" }}
                  >
                    {col.render
                      ? col.render(row, i)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Pág. {page + 1} de {totalPages} · {sorted.length} registros
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="button secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)} style={{ fontSize: 12, padding: "4px 10px" }}>
              ← Anterior
            </button>
            <button className="button secondary" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} style={{ fontSize: 12, padding: "4px 10px" }}>
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
