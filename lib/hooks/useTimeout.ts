"use client";
import { useEffect, useRef } from "react";

export function useTimeout(callback: () => void, delayMs: number | null) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (delayMs === null) return;
    const timer = setTimeout(() => callbackRef.current(), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
}
