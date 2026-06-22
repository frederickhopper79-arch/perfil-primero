import { initials } from "@/lib/utils/format";

const COLORS = [
  "#2563eb","#7c3aed","#db2777","#ea580c","#16a34a","#0891b2","#d97706","#9333ea",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

const SIZE_MAP = { xs: 24, sm: 28, md: 36, lg: 48, xl: 64 } as const;
type AvatarSize = keyof typeof SIZE_MAP;

interface AvatarProps {
  name: string;
  src?: string;
  size?: number | AvatarSize;
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  const bg = colorFor(name);
  const text = initials(name) || "?";
  return (
    <div
      aria-label={name}
      style={{
        width: px, height: px, borderRadius: "50%",
        background: bg, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: px * 0.38, fontWeight: 700, flexShrink: 0,
      }}
    >
      {text}
    </div>
  );
}
