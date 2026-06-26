"use client";
import { useEffect, useState } from "react";
import { getReferralStats } from "@/lib/firebase/referrals";

interface ReferralStats {
  referralCode: string | null;
  referralCount: number;
  earnedDays: number;
  referrals: Array<{ refereeEmail: string; activatedAt: string | null; earnedDays: number }>;
}

export function ReferralPanel() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copyCode() {
    if (!stats?.referralCode) return;
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!stats?.referralCode) return;
    const msg = encodeURIComponent(`Te invito a Perfil Primero — la plataforma donde las empresas llegan a ti con sueldo claro. Usa mi código ${stats.referralCode} y obtienes 30 días gratis: https://perfil-primero.web.app/postulante?ref=${stats.referralCode}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function shareLinkedIn() {
    if (!stats?.referralCode) return;
    const url = encodeURIComponent(`https://perfil-primero.web.app/postulante?ref=${stats.referralCode}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  }

  if (loading) return <div style={{ padding: "1.5rem", color: "var(--muted)", fontSize: 13 }}>Cargando...</div>;
  if (!stats) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Código", value: stats.referralCode ?? "—" },
          { label: "Referidos activados", value: String(stats.referralCount) },
          { label: "Días ganados", value: `${stats.earnedDays} días` },
        ].map((item, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "0.875rem", textAlign: "center" }}>
            <div style={{ fontSize: i === 0 ? 16 : 22, fontWeight: 800, color: "var(--color-dark)", marginBottom: 4, letterSpacing: i === 0 ? ".1em" : 0 }}>{item.value}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      {stats.referralCode && (
        <div style={{ background: "var(--blue-soft)", borderRadius: 12, padding: "1rem" }}>
          <p style={{ fontSize: 13, color: "var(--muted-strong)", marginBottom: 10, fontWeight: 600 }}>Comparte tu código y ambos ganan 30 días gratis</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="button" onClick={copyCode} style={{ fontSize: 12 }}>
              {copied ? "✓ Copiado" : "Copiar código"}
            </button>
            <button className="button ghost" onClick={shareWhatsApp} style={{ fontSize: 12 }}>WhatsApp</button>
            <button className="button ghost" onClick={shareLinkedIn} style={{ fontSize: 12 }}>LinkedIn</button>
            <a href="/referidos" className="button ghost" style={{ fontSize: 12 }}>Más info →</a>
          </div>
        </div>
      )}

      {/* Historial */}
      {stats.referrals.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", marginBottom: 8 }}>Historial de referidos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.referrals.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                <span style={{ color: "var(--text)" }}>{r.refereeEmail}</span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>+{r.earnedDays} días</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.referralCount === 0 && (
        <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "1rem" }}>
          Aún no tienes referidos activados. ¡Comparte tu código y empieza a ganar días gratuitos!
        </p>
      )}
    </div>
  );
}
