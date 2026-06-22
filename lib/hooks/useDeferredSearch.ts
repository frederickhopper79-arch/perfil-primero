"use client";
import { useDeferredValue, useState, useTransition } from "react";

export function useDeferredSearch(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const deferred = useDeferredValue(value);

  function set(next: string) {
    startTransition(() => setValue(next));
  }

  return { value, deferred, isPending, set };
}
