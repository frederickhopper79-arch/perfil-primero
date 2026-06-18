"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type Stats = { workers: number; companies: number };

export function SocialProofCounter() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getDoc(doc(collection(db, "publicStats"), "main"))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as Stats;
          if (data.workers > 0 || data.companies > 0) setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="proofCounter" aria-label="Actividad de la plataforma">
      {stats.workers > 0 && <span>{stats.workers.toLocaleString("es-CL")} perfiles activos</span>}
      {stats.workers > 0 && stats.companies > 0 && <span className="proofDot" aria-hidden="true" />}
      {stats.companies > 0 && <span>{stats.companies.toLocaleString("es-CL")} empresas verificadas</span>}
    </div>
  );
}
