"use client";
import { useState, useCallback } from "react";

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

type ShareStatus = "idle" | "shared" | "copied" | "error";

export function useShare() {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const share = useCallback(async (data: ShareData) => {
    try {
      if (canShare) {
        await navigator.share(data);
        setStatus("shared");
      } else if (data.url) {
        await navigator.clipboard.writeText(data.url);
        setStatus("copied");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }, [canShare]);

  return { share, status, canShare };
}
