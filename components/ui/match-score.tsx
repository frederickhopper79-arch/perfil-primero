import type { CSSProperties } from "react";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  style?: CSSProperties;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#057642";
  if (score >= 60) return "#0a66c2";
  if (score >= 40) return "#f59e0b";
  return "#9ca3af";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excelente match";
  if (score >= 60) return "Buen match";
  if (score >= 40) return "Match moderado";
  return "Match bajo";
}

const SIZE_MAP = { sm: 36, md: 48, lg: 64 };

export function MatchScore({ score, size = "md", showLabel = true, style }: MatchScoreProps) {
  const dim = SIZE_MAP[size];
  const radius = dim / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const fontSize = size === "sm" ? 11 : size === "md" ? 14 : 18;

  return (
    <div
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, ...style }}
      aria-label={`Match: ${score}% — ${scoreLabel(score)}`}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} aria-hidden="true">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={3}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={fontSize} fontWeight={700} fill={color}>
          {score}%
        </text>
      </svg>
      {showLabel && (
        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  );
}
