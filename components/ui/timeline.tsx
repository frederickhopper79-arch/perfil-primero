interface TimelineItem {
  label: string;
  date?: string;
  active?: boolean;
  done?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: 16,
            paddingBottom: i < items.length - 1 ? 20 : 0,
            position: "relative",
          }}
        >
          {/* Connector line */}
          {i < items.length - 1 && (
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 22,
                bottom: 0,
                width: 2,
                background: item.done ? "var(--green)" : "var(--line)",
              }}
            />
          )}
          {/* Dot */}
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              flexShrink: 0,
              background: item.done
                ? "var(--green)"
                : item.active
                ? "var(--blue)"
                : "var(--line)",
              border: "2px solid var(--surface)",
              boxShadow: item.active ? "0 0 0 3px var(--blue-soft)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              zIndex: 1,
            }}
          >
            {item.done ? "✓" : ""}
          </div>
          <div style={{ paddingTop: 2 }}>
            <div
              style={{
                fontWeight: item.active ? 700 : 500,
                fontSize: 14,
                color: item.active ? "var(--heading)" : "var(--muted-strong)",
              }}
            >
              {item.label}
            </div>
            {item.date && (
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {item.date}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
