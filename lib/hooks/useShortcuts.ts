"use client";
import { useEffect } from "react";

type ShortcutHandler = (e: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  handler: ShortcutHandler;
}

export function useShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      for (const s of shortcuts) {
        const matchKey   = e.key.toLowerCase() === s.key.toLowerCase();
        const matchCtrl  = s.ctrl  ? e.ctrlKey  : !e.ctrlKey;
        const matchMeta  = s.meta  ? e.metaKey  : !e.metaKey;
        const matchShift = s.shift ? e.shiftKey : !e.shiftKey;
        if (matchKey && matchCtrl && matchMeta && matchShift) {
          e.preventDefault();
          s.handler(e);
          return;
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts]);
}
