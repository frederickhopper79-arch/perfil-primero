"use client";
import { useState, useEffect, type ReactNode } from "react";
import { storageGet, storageSet } from "@/lib/utils/storage";

interface AnnouncementBannerProps {
  id: string;
  children: ReactNode;
  variant?: "info" | "success" | "warning";
  dismissible?: boolean;
  href?: string;
  hrefLabel?: string;
}

const VARIANT_STYLES = {
  info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
  success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  warning: { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
};

export function AnnouncementBanner({
  id,
  children,
  variant = "info",
  dismissible = true,
  href,
  hrefLabel,
}: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(false);
  const storageKey = `announcement_${id}`;

  useEffect(() => {
    const dismissed = storageGet<boolean>(storageKey, false);
    if (!dismissed) setVisible(true);
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    storageSet(storageKey, true);
  }

  if (!visible) return null;

  const s = VARIANT_STYLES[variant];

  return (
    <div
      role="banner"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "10px 20px",
        background: s.bg,
        borderBottom: `1px solid ${s.border}`,
        fontSize: 13,
        color: s.color,
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <span style={{ lineHeight: 1.5 }}>{children}</span>
      {href && (
        <a href={href} style={{ color: s.color, fontWeight: 700, textDecoration: "underline", whiteSpace: "nowrap" }}>
          {hrefLabel ?? "Ver más →"}
        </a>
      )}
      {dismissible && (
        <button
          onClick={dismiss}
          aria-label="Cerrar anuncio"
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            fontSize: 18,
            color: s.color,
            lineHeight: 1,
            padding: "0 4px",
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
