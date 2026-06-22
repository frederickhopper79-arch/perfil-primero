"use client";

export function scheduleIdleTask(callback: () => void) {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: IdleRequestCallback) => void }).requestIdleCallback(callback);
  } else {
    setTimeout(callback, 100);
  }
}

export function scheduleTask(callback: () => void) {
  if (typeof queueMicrotask !== "undefined") {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback);
  }
}

export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function hasOwn(obj: object, key: string): boolean {
  return Object.hasOwn(obj, key);
}

export function lastItem<T>(arr: T[]): T | undefined {
  return arr.at(-1);
}

export async function settleAll<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }>> {
  return Promise.allSettled(promises) as Promise<
    Array<{ status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown }>
  >;
}

export async function checkStorageQuota(): Promise<{ usedMb: number; quotaMb: number; percentUsed: number } | null> {
  if (!("storage" in navigator && "estimate" in navigator.storage)) return null;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return {
    usedMb: Math.round(usage / (1024 * 1024)),
    quotaMb: Math.round(quota / (1024 * 1024)),
    percentUsed: quota > 0 ? Math.round((usage / quota) * 100) : 0,
  };
}

export function getConnectionType(): string {
  if (typeof navigator === "undefined") return "unknown";
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return conn?.effectiveType ?? "unknown";
}
