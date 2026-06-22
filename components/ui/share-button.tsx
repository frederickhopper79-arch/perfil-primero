"use client";
import { useWebShare } from "@/lib/hooks/useWebShare";

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
  label?: string;
}

export function ShareButton({ title, text, url, label = "Compartir" }: ShareButtonProps) {
  const { canShare, share } = useWebShare();

  async function handleShare() {
    if (canShare) {
      await share({ title, text, url });
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      alert("Enlace copiado al portapapeles.");
    }
  }

  return (
    <button
      type="button"
      className="button secondary"
      onClick={handleShare}
      style={{ fontSize: 13, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span aria-hidden="true">↗</span>
      {label}
    </button>
  );
}
