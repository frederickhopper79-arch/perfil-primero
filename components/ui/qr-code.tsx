interface QrCodeProps {
  url: string;
  size?: number;
  label?: string;
  profileCode?: string;
}

export function QrCode({ url, size = 120, label, profileCode }: QrCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${size}x${size}&margin=4`;

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><head><title>QR Perfil Primero${profileCode ? ` — ${profileCode}` : ""}</title></head>` +
      `<body style="text-align:center;font-family:sans-serif;padding:40px">` +
      `<img src="https://perfil-primero.web.app/isotipo.png" width="80" style="margin-bottom:16px"/>` +
      `${profileCode ? `<h2 style="margin:0 0 12px">Perfil ${profileCode}</h2>` : ""}` +
      `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=250x250&margin=8" width="250" height="250"/>` +
      `<p style="margin-top:16px;font-size:13px;color:#555">${url}</p>` +
      `<p style="font-size:11px;color:#999">Perfil Primero — perfil-primero.web.app</p>` +
      `<script>window.print();<\/script></body></html>`
    );
    win.document.close();
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
      <div style={{ textAlign: "center" }}>
        <img
          src={src}
          alt={label ?? "Código QR de perfil"}
          width={size}
          height={size}
          style={{ borderRadius: 8, border: "1px solid var(--line,#e5e7eb)" }}
          loading="lazy"
        />
        {label && <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{label}</p>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
        <p style={{ fontSize: 13, margin: 0 }}>Comparte este QR para que empresas accedan directamente a tu perfil.</p>
        <button type="button" className="button ghost" style={{ fontSize: 12 }} onClick={handlePrint}>
          Imprimir QR
        </button>
      </div>
    </div>
  );
}
