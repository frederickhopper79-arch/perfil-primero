"use client";
import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { withRetry } from "@/lib/utils/retry";

export function useFirestoreDoc<T = DocumentData>(
  collection: string,
  id: string | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    async function subscribe() {
      try {
        await withRetry(
          () =>
            new Promise<void>((resolve, reject) => {
              const ref = doc(db, collection, id!);
              const unsub = onSnapshot(
                ref,
                (snap) => {
                  setData(snap.exists() ? (snap.data() as T) : null);
                  setLoading(false);
                  setError(null);
                  resolve();
                },
                (err) => {
                  setError(err);
                  setLoading(false);
                  reject(err);
                }
              );
              unsubRef.current = unsub;
            }),
          { attempts: 3, baseDelayMs: 1000 }
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Firestore error"));
        setLoading(false);
      }
    }

    subscribe();
    return () => { unsubRef.current?.(); };
  }, [collection, id]);

  return { data, loading, error };
}
