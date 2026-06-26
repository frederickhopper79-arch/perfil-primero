"use client";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "pp_exit_dismissed";
const DELAY_MS = 8000;

export function ExitIntent() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let timer: ReturnType<typeof setTimeout>;

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY > 20) return;
      if (triggered.current) return;
      triggered.current = true;
      setVisible(true);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden" && !triggered.current) {
        triggered.current = true;
        setVisible(true);
      }
    }

    timer = setTimeout(() => {
      document.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }, DELAY_MS);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
    setTimeout(dismiss, 2500);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-title"
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div style={{
        background: "var(--bg)", borderRadius: 18, padding: "2rem 2rem 1.75rem", maxWidth: 420, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,.25)", position: "relative",
      }}>
        <button onClick={dismiss} aria-label="Cerrar" style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 22, color: "var(--muted)", cursor: "pointer", lineHeight: 1 }}>×</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "var(--heading)", marginBottom: 8 }}>¡Listo! Te avisamos cuando haya novedades.</div>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Revisa tu bandeja de entrada.</p>
          </div>
        ) : (
          <>
            <div style={{ background: "linear-gradient(135deg, var(--color-dark), var(--color-primary))", borderRadius: 12, padding: "18px 20px", marginBottom: 18, color: "#fff" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>💼</div>
              <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.3 }}>El empleo que viene a ti.</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>Sin mandar CVs al vacío. Sin esperar semanas. Sin sorpresas de sueldo.</div>
            </div>
            <h2 id="exit-title" style={{ fontSize: 19, fontWeight: 800, color: "var(--heading)", marginBottom: 8 }}>
              Espera — activa tu perfil gratis hoy
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
              Estamos en lanzamiento. Publicar tu perfil es <strong style={{ color: "var(--color-primary)" }}>$0 CLP</strong> y las empresas verificadas llegan a ti con cargo, sueldo y modalidad antes de pedirte datos.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                required
                placeholder="tu@correo.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, background: "var(--surface)", color: "var(--text)" }}
              />
              <button type="submit" style={{ padding: "11px", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Quiero acceso gratis →
              </button>
            </form>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
              <a href="/postulante" onClick={dismiss} style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>Ir directo a registrarme</a>
              <span style={{ color: "var(--line)" }}>·</span>
              <button onClick={dismiss} style={{ background: "none", border: "none", fontSize: 13, color: "var(--muted)", cursor: "pointer" }}>No gracias</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
