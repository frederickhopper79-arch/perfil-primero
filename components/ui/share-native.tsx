"use client";
import { Share2 } from "lucide-react";

interface ShareNativeProps {
  title: string;
  text?: string;
  url?: string;
  label?: string;
}

export function ShareNative({ title, text, url, label = "Compartir" }: ShareNativeProps) {
  const target = url ?? (typeof window !== "undefined" ? window.location.href : "");

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text ?? title, url: target });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(target);
      } catch { /* silent */ }
    }
  }

  return (
    <button onClick={handleShare} className="shareNative" aria-label={`${label}: ${title}`}>
      <Share2 size={13} aria-hidden="true" />
      {label}
    </button>
  );
}
