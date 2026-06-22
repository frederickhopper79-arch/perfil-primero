"use client";
import { useEffect, type RefObject } from "react";

interface KeyPressOptions {
  target?: RefObject<HTMLElement | null> | null;
  event?: "keydown" | "keyup" | "keypress";
  disabled?: boolean;
}

/** Ejecuta callback cuando se presiona una tecla */
export function useKeyPress(
  key: string | string[],
  callback: (e: KeyboardEvent) => void,
  options: KeyPressOptions = {}
) {
  const { target = null, event = "keydown", disabled = false } = options;
  const keys = Array.isArray(key) ? key : [key];

  useEffect(() => {
    if (disabled) return;
    const el = target?.current ?? window;
    function handler(e: Event) {
      const ke = e as KeyboardEvent;
      if (keys.includes(ke.key)) callback(ke);
    }
    el.addEventListener(event, handler);
    return () => el.removeEventListener(event, handler);
  }, [keys.join(","), callback, disabled, target, event]);
}
