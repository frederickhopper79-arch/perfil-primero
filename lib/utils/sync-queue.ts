"use client";
import { storageGet, storageSet } from "@/lib/utils/storage";

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: string;
  createdAt: number;
}

const QUEUE_KEY = "pp_sync_queue";

export function enqueueRequest(req: Omit<QueuedRequest, "id" | "createdAt">) {
  const queue = getQueue();
  const entry: QueuedRequest = {
    ...req,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  storageSet<QueuedRequest[]>(QUEUE_KEY, [...queue, entry]);

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((reg) => {
      (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
        .sync.register("pp-retry-queue").catch(() => {});
    });
  }
  return entry.id;
}

export function getQueue(): QueuedRequest[] {
  return storageGet<QueuedRequest[]>(QUEUE_KEY, []);
}

export function removeFromQueue(id: string) {
  storageSet<QueuedRequest[]>(QUEUE_KEY, getQueue().filter((r) => r.id !== id));
}

export async function flushQueue(): Promise<{ ok: number; failed: number }> {
  const queue = getQueue();
  let ok = 0, failed = 0;
  for (const req of queue) {
    try {
      const res = await fetch(req.url, {
        method: req.method,
        body: req.body,
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) { removeFromQueue(req.id); ok++; }
      else failed++;
    } catch {
      failed++;
    }
  }
  return { ok, failed };
}

// Escuchar mensaje del SW cuando hay conectividad y hay cola pendiente
export function listenSyncReady(callback: () => void) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type === "SW_SYNC_READY") callback();
  };
  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
}
