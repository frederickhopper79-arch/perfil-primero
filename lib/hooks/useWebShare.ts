"use client";

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export function useWebShare() {
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function share(data: ShareData): Promise<"shared" | "unsupported" | "cancelled" | "error"> {
    if (!canShare) return "unsupported";
    try {
      await navigator.share(data);
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return "cancelled";
      return "error";
    }
  }

  return { canShare, share };
}
