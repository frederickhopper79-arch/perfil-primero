"use client";
import { useState, useEffect, useRef } from "react";
import type { Query, DocumentData, QuerySnapshot } from "firebase/firestore";

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFirestoreCollection<T = DocumentData>(
  query: Query | null,
  transform?: (snap: QuerySnapshot) => T[]
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!query) { setData([]); setLoading(false); return; }
    setLoading(true);
    setError(null);

    let active = true;
    import("firebase/firestore").then(({ onSnapshot }) => {
      unsubRef.current?.();
      unsubRef.current = onSnapshot(
        query,
        (snap) => {
          if (!active) return;
          setData(transform ? transform(snap) : snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
          setLoading(false);
        },
        (err) => {
          if (!active) return;
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      active = false;
      unsubRef.current?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { data, loading, error, refresh: () => setTick((t) => t + 1) };
}
