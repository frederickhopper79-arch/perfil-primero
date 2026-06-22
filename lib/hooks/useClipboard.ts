"use client";
import { useState, useCallback } from "react";

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}

export function useClipboard(resetAfterMs = 2000): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para Safari antiguo
        const el = document.createElement("textarea");
        el.value = text;
        el.style.cssText = "position:absolute;left:-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setError(null);
      setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al copiar");
      return false;
    }
  }, [resetAfterMs]);

  return { copy, copied, error };
}
