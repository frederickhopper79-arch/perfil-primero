import type { CSSProperties } from "react";

interface AvatarGroupItem {
  name: string;
  src?: string;
  color?: string;
}

interface AvatarGroupProps {
  items: AvatarGroupItem[];
  max?: number;
  size?: number;
  style?: CSSProperties;
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const COLORS = ["#0a66c2", "#057642", "#7c3aed", "#db2777", "#d97706", "#0891b2"];

export function AvatarGroup({ items, max = 4, size = 32, style }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div
      style={{ display: "inline-flex", ...style }}
      aria-label={`${items.length} personas: ${items.map((i) => i.name).join(", ")}`}
    >
      {visible.map((item, i) => (
        <div
          key={i}
          title={item.name}
          aria-hidden="true"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "2px solid var(--surface)",
            marginLeft: i > 0 ? -size * 0.3 : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: item.src ? undefined : (item.color ?? COLORS[i % COLORS.length]),
            overflow: "hidden",
            fontSize: size * 0.35,
            fontWeight: 700,
            color: "white",
            zIndex: visible.length - i,
            flexShrink: 0,
          }}
        >
          {item.src ? (
            <img src={item.src} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials(item.name)
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          aria-hidden="true"
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "2px solid var(--surface)",
            marginLeft: -size * 0.3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--line)",
            fontSize: size * 0.3,
            fontWeight: 700,
            color: "var(--muted-strong)",
            zIndex: 0,
            flexShrink: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
