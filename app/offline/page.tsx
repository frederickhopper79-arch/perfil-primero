"use client";

export default function OfflinePage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center", background: "var(--bg)" }}>
      <img src="/isotipo.png" alt="Perfil Primero" style={{ height: "48px", marginBottom: "2rem" }} />
      <h1 style={{ color: "var(--heading)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Sin conexión a internet</h1>
      <p style={{ color: "var(--muted)", maxWidth: "360px", lineHeight: 1.6 }}>
        No pudimos conectarnos a Perfil Primero. Revisa tu conexión y vuelve a intentarlo.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: "1.5rem", background: "var(--primary-700)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontWeight: 700, fontSize: "15px", cursor: "pointer" }}
      >
        Reintentar
      </button>
    </main>
  );
}

