"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface Size { width: number; height: number; }

export function useResizeObserver<T extends HTMLElement>(): [React.RefObject<T>, Size] {
  const ref = useRef<T>(null!);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const observe = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    return observe();
  }, [observe]);

  return [ref, size];
}
