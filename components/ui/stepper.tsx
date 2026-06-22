interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <nav aria-label="Pasos del proceso">
      <ol
        style={{
          display: "flex",
          listStyle: "none",
          margin: 0,
          padding: 0,
          gap: 0,
          alignItems: "center",
        }}
      >
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  aria-current={active ? "step" : undefined}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: done ? "var(--green)" : active ? "var(--blue)" : "var(--line)",
                    color: done || active ? "#fff" : "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--blue)" : done ? "var(--green)" : "var(--muted)",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: done ? "var(--green)" : "var(--line)",
                    margin: "0 6px",
                    marginBottom: 18,
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
