"use client";
import { useEffect, useState } from "react";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/firebase/referrals";

type EmailPrefs = {
  newInvitations: boolean;
  messages: boolean;
  profileExpiry: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
};

type PushPrefs = {
  newInvitations: boolean;
  messages: boolean;
};

interface Prefs {
  email: EmailPrefs;
  push: PushPrefs;
}

const EMAIL_ITEMS: Array<{ key: keyof EmailPrefs; label: string; desc: string }> = [
  { key: "newInvitations", label: "Nuevas invitaciones", desc: "Cuando una empresa te envía una invitación" },
  { key: "messages", label: "Mensajes de chat", desc: "Cuando recibes un mensaje en una conversación activa" },
  { key: "profileExpiry", label: "Aviso de expiración", desc: "7 días antes de que tu perfil expire" },
  { key: "weeklyDigest", label: "Resumen semanal", desc: "Actividad de tu perfil cada lunes" },
  { key: "marketing", label: "Novedades y mejoras", desc: "Actualizaciones de producto y consejos" },
];

const PUSH_ITEMS: Array<{ key: keyof PushPrefs; label: string }> = [
  { key: "newInvitations", label: "Nuevas invitaciones" },
  { key: "messages", label: "Mensajes de chat" },
];

export function NotificationPreferencesPanel() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationPreferences()
      .then(r => setPrefs(r.prefs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!prefs) return;
    setSaving(true);
    await updateNotificationPreferences(prefs);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleEmail(key: keyof EmailPrefs) {
    setPrefs(p => p ? { ...p, email: { ...p.email, [key]: !p.email[key] } } : p);
  }

  function togglePush(key: keyof PushPrefs) {
    setPrefs(p => p ? { ...p, push: { ...p.push, [key]: !p.push[key] } } : p);
  }

  if (loading) return <div style={{ padding: "1.5rem", color: "var(--muted)", fontSize: 13 }}>Cargando preferencias...</div>;
  if (!prefs) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Email */}
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span>📧</span> Notificaciones por email
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {EMAIL_ITEMS.map(item => (
            <label key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{item.desc}</div>
              </div>
              <div
                role="switch"
                aria-checked={prefs.email[item.key]}
                onClick={() => toggleEmail(item.key)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: prefs.email[item.key] ? "var(--color-primary)" : "var(--line)",
                  position: "relative", flexShrink: 0, cursor: "pointer", transition: "background .2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: prefs.email[item.key] ? 20 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }} />
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Push */}
      <section>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--heading)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <span>🔔</span> Notificaciones push
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PUSH_ITEMS.map(item => (
            <label key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{item.label}</span>
              <div
                role="switch"
                aria-checked={prefs.push[item.key]}
                onClick={() => togglePush(item.key)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: prefs.push[item.key] ? "var(--color-primary)" : "var(--line)",
                  position: "relative", flexShrink: 0, cursor: "pointer", transition: "background .2s",
                }}
              >
                <div style={{
                  position: "absolute", top: 3, left: prefs.push[item.key] ? 20 : 3,
                  width: 16, height: 16, borderRadius: "50%", background: "#fff",
                  transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }} />
              </div>
            </label>
          ))}
        </div>
      </section>

      <button
        className="button"
        onClick={save}
        disabled={saving}
        style={{ alignSelf: "flex-start" }}
      >
        {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar preferencias"}
      </button>
    </div>
  );
}
