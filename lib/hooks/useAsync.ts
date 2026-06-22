"use client";
import { useCallback, useState } from "react";

type AsyncState<T> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: string };

export function useAsync<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>
): [AsyncState<T>, (...args: A) => Promise<T | undefined>] {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const execute = useCallback(async (...args: A): Promise<T | undefined> => {
    setState({ status: "loading" });
    try {
      const data = await fn(...args);
      setState({ status: "success", data });
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setState({ status: "error", error: msg });
      return undefined;
    }
  }, [fn]);

  return [state, execute];
}
