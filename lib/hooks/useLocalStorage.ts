"use client";
import { useCallback, useState } from "react";
import { storageGet, storageSet } from "@/lib/utils/storage";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValueState] = useState<T>(() => storageGet<T>(key, initialValue));

  const setValue = useCallback((v: T | ((prev: T) => T)) => {
    setValueState((prev) => {
      const next = typeof v === "function" ? (v as (prev: T) => T)(prev) : v;
      storageSet(key, next);
      return next;
    });
  }, [key]);

  return [value, setValue];
}
