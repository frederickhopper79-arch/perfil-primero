"use client";
import { useState, useEffect } from "react";

export function useIdleDetection(idleAfterMs = 60_000): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function reset() {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), idleAfterMs);
    }

    const events = ["mousemove", "keydown", "touchstart", "scroll", "pointerdown"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    timer = setTimeout(() => setIdle(true), idleAfterMs);

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [idleAfterMs]);

  return idle;
}
