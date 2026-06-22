import type { CSSProperties } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  style?: CSSProperties;
}

export function Breadcrumbs({ items, style }: BreadcrumbsProps) {
  return (
    <nav aria-label="Ruta de navegación" style={style}>
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px 6px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {i > 0 && (
                <span aria-hidden="true" style={{ color: "var(--line-strong)", fontSize: 11 }}>
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  style={{ color: isLast ? "var(--text)" : "var(--muted)", fontWeight: isLast ? 600 : 400 }}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  style={{ color: "var(--blue, #0a66c2)", textDecoration: "none", fontWeight: 500 }}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
