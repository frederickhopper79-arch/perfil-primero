"use client";
import { useEffect, useRef } from "react";

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  function getSignal(): AbortSignal {
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { getSignal };
}
