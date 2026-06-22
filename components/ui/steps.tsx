import type { ReactNode, CSSProperties } from "react";

type StepStatus = "complete" | "active" | "upcoming";

interface Step {
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface StepsProps {
  steps: Step[];
  current: number;
  orientation?: "horizontal" | "vertical";
  style?: CSSProperties;
}

function getStatus(i: number, current: number): StepStatus {
  if (i < current) return "complete";
  if (i === current) return "active";
  return "upcoming";
}

const STATUS_COLOR: Record<StepStatus, string> = {
  complete: "var(--green, #057642)",
  active: "var(--blue, #0a66c2)",
  upcoming: "var(--line-strong, #b8c5d3)",
};

export function Steps({ steps, current, orientation = "horizontal", style }: StepsProps) {
  const isH = orientation === "horizontal";

  return (
    <nav aria-label="Progreso" style={style}>
      <ol
        style={{
          display: "flex",
          flexDirection: isH ? "row" : "column",
          gap: isH ? 0 : 0,
          listStyle: "none",
          margin: 0,
          padding: 0,
          alignItems: isH ? "flex-start" : undefined,
        }}
      >
        {steps.map((step, i) => {
          const status = getStatus(i, current);
          const isLast = i === steps.length - 1;
          const color = STATUS_COLOR[status];

          return (
            <li
              key={i}
              aria-current={status === "active" ? "step" : undefined}
              style={{
                flex: isH ? 1 : undefined,
                display: "flex",
                flexDirection: isH ? "column" : "row",
                alignItems: isH ? "center" : "flex-start",
                gap: isH ? 6 : 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", width: isH ? "100%" : undefined, gap: 0 }}>
                {/* Line before */}
                {isH && i > 0 && (
                  <div style={{ flex: 1, height: 2, background: i <= current ? "var(--blue, #0a66c2)" : "var(--line)", marginRight: 4 }} />
                )}
                {/* Circle */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: status === "upcoming" ? "transparent" : color,
                    border: `2px solid ${color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: status === "upcoming" ? color : "white",
                    fontSize: status === "complete" ? 14 : 13,
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  {status === "complete" ? "✓" : (step.icon ?? i + 1)}
                </div>
                {/* Line after (horizontal) */}
                {isH && !isLast && (
                  <div style={{ flex: 1, height: 2, background: i < current ? "var(--blue, #0a66c2)" : "var(--line)", marginLeft: 4 }} />
                )}
                {/* Line (vertical) */}
                {!isH && !isLast && (
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -17, top: 32, width: 2, height: 24, background: i < current ? "var(--blue, #0a66c2)" : "var(--line)" }} />
                  </div>
                )}
              </div>
              <div style={{ textAlign: isH ? "center" : "left", paddingBottom: !isH && !isLast ? 24 : 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: status === "upcoming" ? "var(--muted)" : "var(--heading)" }}>
                  {step.label}
                </p>
                {step.description && (
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--muted)" }}>{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
