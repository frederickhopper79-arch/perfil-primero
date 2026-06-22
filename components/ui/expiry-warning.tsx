import { formatDate } from "@/lib/utils/format";

interface ExpiryWarningProps {
  expiresAt: Date | { seconds: number } | string | null;
  onRenew?: () => void;
  renewLabel?: string;
}

export function ExpiryWarning({ expiresAt, onRenew, renewLabel = "Renovar ahora" }: ExpiryWarningProps) {
  if (!expiresAt) return null;

  let date: Date;
  if (expiresAt instanceof Date) {
    date = expiresAt;
  } else if (typeof expiresAt === "object" && "seconds" in expiresAt) {
    date = new Date((expiresAt as { seconds: number }).seconds * 1000);
  } else {
    date = new Date(expiresAt as string);
  }

  const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;
  const color = isExpired ? "#dc2626" : daysLeft <= 3 ? "#d97706" : "#ca8a04";
  const bg = isExpired ? "#fee2e2" : "#fef9c3";
  const border = isExpired ? "#dc2626" : "#ca8a04";

  return (
    <div
      role="alert"
      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontSize: 13, fontWeight: 600, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}
    >
      <span>
        {isExpired
          ? "Tu perfil ha expirado y no es visible para las empresas."
          : `Tu perfil expira en ${daysLeft} día${daysLeft !== 1 ? "s" : ""} (${formatDate(date)}).`}
      </span>
      {onRenew && (
        <button type="button" className="button secondary" style={{ fontSize: 12, padding: "4px 14px", whiteSpace: "nowrap" }} onClick={onRenew}>
          {renewLabel}
        </button>
      )}
    </div>
  );
}
