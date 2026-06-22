"use client";
import { useEffect, useState } from "react";
import { flushQueue, getQueue, listenSyncReady } from "@/lib/utils/sync-queue";

export function useSyncQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [flushing, setFlushing] = useState(false);

  function refresh() {
    setPendingCount(getQueue().length);
  }

  useEffect(() => {
    refresh();
    const cleanup = listenSyncReady(async () => {
      if (getQueue().length === 0) return;
      setFlushing(true);
      await flushQueue();
      refresh();
      setFlushing(false);
    });
    window.addEventListener("online", refresh);
    return () => {
      cleanup();
      window.removeEventListener("online", refresh);
    };
  }, []);

  async function manualFlush() {
    setFlushing(true);
    await flushQueue();
    refresh();
    setFlushing(false);
  }

  return { pendingCount, flushing, manualFlush };
}
