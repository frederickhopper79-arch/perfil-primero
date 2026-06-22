import type { ReactNode, CSSProperties } from "react";

interface TimelineEvent {
  date: string;
  title: string;
  description?: ReactNode;
  icon?: string;
  color?: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
  style?: CSSProperties;
}

export function EventTimeline({ events, style }: EventTimelineProps) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, ...style }}>
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        return (
          <li key={i} style={{ display: "flex", gap: 16, paddingBottom: isLast ? 0 : 24 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: event.color ?? "var(--blue-soft, #dce6f1)",
                  border: `2px solid ${event.color ?? "var(--blue, #0a66c2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}
              >
                {event.icon ?? "●"}
              </div>
              {!isLast && <div style={{ width: 2, flex: 1, background: "var(--line)", marginTop: 4 }} />}
            </div>
            <div style={{ paddingTop: 4, paddingBottom: isLast ? 0 : 8 }}>
              <time style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 3 }}>
                {event.date}
              </time>
              <strong style={{ fontSize: 14, color: "var(--heading)", display: "block", marginBottom: 4 }}>
                {event.title}
              </strong>
              {event.description && (
                <div style={{ fontSize: 13, color: "var(--muted-strong)", lineHeight: 1.5 }}>
                  {event.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
