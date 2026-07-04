"use client";
import { useState } from "react";
import { ShortcutsModal } from "@/components/ui/shortcuts-modal";
import { CommandPalette } from "@/components/ui/command-palette";
import { ExitIntent } from "@/components/ui/exit-intent";
import { useShortcuts } from "@/lib/hooks/useShortcuts";
import { useSyncQueue } from "@/lib/hooks/useSyncQueue";
import { useToast } from "@/components/ui/toast";

const NAV_ITEMS = [
  { id: "home",       label: "Inicio",         action: () => { window.location.href = "/"; } },
  { id: "postulante", label: "Panel postulante", action: () => { window.location.href = "/postulante"; } },
  { id: "empresa",    label: "Panel empresa",    action: () => { window.location.href = "/empresa"; } },
  { id: "precios",    label: "Precios",          action: () => { window.location.href = "/precios"; }, shortcut: "P" },
  { id: "blog",       label: "Blog",             action: () => { window.location.href = "/blog"; } },
  { id: "estado",     label: "Estado del sistema", action: () => { window.location.href = "/estado"; } },
  { id: "funciona",   label: "Cómo funciona",    action: () => { window.location.href = "/como-funciona"; } },
  { id: "privacidad", label: "Privacidad",       action: () => { window.location.href = "/legal/privacidad"; } },
];

export function GlobalUI() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { pendingCount, flushing, manualFlush } = useSyncQueue();
  const { show } = useToast();

  useShortcuts([
    { key: "?", shift: true, handler: () => setShortcutsOpen((v) => !v) },
  ]);

  // Notificar cuando la cola offline se vacíe
  const prevCount = { current: pendingCount };
  if (prevCount.current > 0 && pendingCount === 0 && !flushing) {
    show("Cambios sincronizados correctamente.", "success");
  }

  return (
    <>
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <CommandPalette items={NAV_ITEMS} />
      <ExitIntent />
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={manualFlush}
          aria-live="polite"
          style={{
            position: "fixed", bottom: 76, left: 16, zIndex: 998,
            background: "#d97706", color: "#fff", border: "none",
            borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
          }}
        >
          {flushing ? "Sincronizando…" : `${pendingCount} cambio${pendingCount > 1 ? "s" : ""} pendiente${pendingCount > 1 ? "s" : ""} — Reintentar`}
        </button>
      )}
    </>
  );
}
