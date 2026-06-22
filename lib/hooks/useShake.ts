"use client";
import { useCallback, useRef } from "react";

export function useShake<T extends HTMLElement>() {
  const ref = useRef<T>(null!);

  const shake = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth; // force reflow
    el.classList.add("shake");
    const cleanup = () => el.classList.remove("shake");
    el.addEventListener("animationend", cleanup, { once: true });
  }, []);

  return { ref, shake };
}
