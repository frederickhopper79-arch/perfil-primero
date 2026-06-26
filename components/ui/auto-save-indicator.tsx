"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

type Status = "idle" | "saving" | "saved";

export function AutoSaveIndicator({ saving }: { saving: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (saving) {
      setStatus("saving");
    } else if (status === "saving") {
      setStatus("saved");
      const t = setTimeout(() => setStatus("idle"), 2500);
      return () => clearTimeout(t);
    }
  }, [saving]);

  if (status === "idle") return null;

  return (
    <span className={`autoSaveIndicator ${status}`} aria-live="polite" aria-atomic="true">
      {status === "saving" ? (
        <><Loader2 size={12} className="spin" aria-hidden="true" /> Guardando…</>
      ) : (
        <><Check size={12} aria-hidden="true" /> Guardado</>
      )}
    </span>
  );
}
