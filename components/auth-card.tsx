"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ensureUserRecord, getUserRole, loginWithEmail, loginWithGoogle, logout, registerWithEmail, resetPassword } from "@/lib/firebase/auth";
import type { UserRole } from "@/lib/domain/types";
import { GoogleIcon } from "./brand-icons";

export function AuthCard({
  role,
  onReady
}: {
  role: UserRole;
  onReady: (uid: string, email: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isInstitutional = role === "omil" || role === "admin";
  const [mode, setMode] = useState<"register" | "login" | "reset">(isInstitutional ? "login" : "register");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const safeSet = <T,>(setter: (v: T) => void) => (v: T) => { if (mounted.current) setter(v); };

  function passwordStrength(p: string): 0 | 1 | 2 | 3 | 4 {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s as 0 | 1 | 2 | 3 | 4;
  }
  const strength = mode === "register" ? passwordStrength(password) : 0;
  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][strength];
  const strengthColor = ["", "#e74c3c", "#e67e22", "#f1c40f", "#27ae60"][strength];

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setStatus("Ingresa un correo electrónico válido.");
      return;
    }

    safeSet(setIsLoading)(true);
    safeSet(setStatus)("Procesando...");

    if (mode === "reset") {
      try {
        await resetPassword(trimmedEmail);
        safeSet(setStatus)("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
        safeSet(setMode)("login");
      } catch {
        safeSet(setStatus)("No se pudo enviar el correo. Verifica que esté registrado.");
      } finally {
        safeSet(setIsLoading)(false);
      }
      return;
    }

    try {
      const user =
        mode === "register"
          ? await registerWithEmail(trimmedEmail, password, role, name.trim() || undefined)
          : await loginWithEmail(trimmedEmail, password);
      // Roles institucionales (omil/admin) nunca crean su documento desde el
      // cliente: debe existir previamente (creado por el backend). Si no,
      // ensureUserRecord "adoptaría" el rol de la página — escalada de rol.
      if (!isInstitutional) {
        await ensureUserRecord(user.uid, user.email ?? trimmedEmail, role);
      }
      await assertExpectedRole(user.uid);
      onReady(user.uid, user.email ?? trimmedEmail);
      safeSet(setStatus)("Sesión lista.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("email-already-in-use")) safeSet(setStatus)("Este correo ya tiene una cuenta. Inicia sesión.");
      else if (msg.includes("wrong-password") || msg.includes("invalid-credential")) safeSet(setStatus)("Contraseña incorrecta. Inténtalo de nuevo.");
      else if (msg.includes("user-not-found")) safeSet(setStatus)("No hay cuenta con ese correo. ¿Quieres crear una?");
      else if (msg.includes("too-many-requests")) safeSet(setStatus)("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
      else safeSet(setStatus)(msg || "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      safeSet(setIsLoading)(false);
    }
  }

  async function handleGoogle() {
    if (isLoading) return;
    safeSet(setIsLoading)(true);
    safeSet(setStatus)("");
    try {
      const user = await loginWithGoogle(role);
      await assertExpectedRole(user.uid);
      onReady(user.uid, user.email ?? "");
      safeSet(setStatus)("Sesión lista.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("popup-closed") || msg.includes("popup-blocked")) {
        safeSet(setStatus)("El navegador bloqueó el popup. Permite ventanas emergentes para este sitio e intenta de nuevo.");
      } else if (msg.includes("cancelled-popup-request")) {
        safeSet(setStatus)("Solicitud cancelada. Inténtalo de nuevo.");
      } else {
        safeSet(setStatus)(msg || "No se pudo iniciar con Google. Inténtalo de nuevo.");
      }
    } finally {
      safeSet(setIsLoading)(false);
    }
  }

  async function assertExpectedRole(uid: string) {
    const actualRole = await getUserRole(uid);
    if (actualRole && actualRole !== role) {
      await logout().catch(() => {});
      throw new Error(`Esta cuenta está registrada como ${roleLabel(actualRole)}. Usa una cuenta de ${roleLabel(role)} para entrar aquí.`);
    }
  }

  return (
    <section className="authCard">

      {/* Eyebrow */}
      <p className="eyebrow" style={{ marginBottom: 12 }}>
        {role === "worker" ? "Cuenta postulante" : role === "company" ? "Cuenta empresa" : role === "omil" ? "Cuenta OMIL" : "Cuenta admin"}
      </p>

      {/* Tabs prominentes — solo para roles no institucionales y fuera del modo reset */}
      {!isInstitutional && mode !== "reset" && (
        <div style={{ display: "flex", background: "var(--bg-soft)", borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
          <button
            type="button"
            onClick={() => { setMode("register"); setStatus(""); setPassword(""); setName(""); }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .15s",
              background: mode === "register" ? "var(--surface)" : "transparent",
              color: mode === "register" ? "var(--primary-700)" : "var(--muted)",
              boxShadow: mode === "register" ? "0 1px 4px rgba(0,0,0,.12)" : "none",
            }}
          >
            Crear cuenta
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setStatus(""); setPassword(""); setName(""); }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 9,
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .15s",
              background: mode === "login" ? "var(--surface)" : "transparent",
              color: mode === "login" ? "var(--primary-700)" : "var(--muted)",
              boxShadow: mode === "login" ? "0 1px 4px rgba(0,0,0,.12)" : "none",
            }}
          >
            Iniciar sesión
          </button>
        </div>
      )}

      {/* Título en modo reset */}
      {mode === "reset" && (
        <h2 style={{ marginBottom: 16 }}>Recuperar contraseña</h2>
      )}

      {/* Botón Google — primero en register para reducir fricción */}
      {!isInstitutional && mode === "register" && (
        <button className="button secondary full" type="button" onClick={handleGoogle} disabled={isLoading} style={{ marginBottom: 16 }}>
          <GoogleIcon />
          Registrarse con Gmail
        </button>
      )}
      {!isInstitutional && mode === "register" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--line)" }} />
          <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>o con correo</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--line)" }} />
        </div>
      )}

      <form className="authForm" onSubmit={handleEmail} noValidate>
        {mode === "register" && (
          <label>
            Tu nombre
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              autoComplete="name"
              disabled={isLoading}
              placeholder={role === "company" ? "Nombre del responsable de RRHH" : "¿Cómo te llamamos?"}
              maxLength={80}
            />
          </label>
        )}
        <label>
          Correo electrónico
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            inputMode="email"
            autoComplete={mode === "register" ? "email" : "username"}
            required
            disabled={isLoading}
            placeholder="tucorreo@ejemplo.com"
          />
        </label>
        {mode !== "reset" && (
          <label>
            Contraseña
            <input
              value={password}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              disabled={isLoading}
              placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"}
            />
            {mode === "register" && password.length > 0 && (
              <span style={{ fontSize: "12px", color: strengthColor, marginTop: "4px", display: "block" }}>
                Contraseña: {strengthLabel}
              </span>
            )}
          </label>
        )}
        <button className="button primary" type="submit" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Procesando..." : mode === "register" ? "Crear cuenta gratis →" : mode === "reset" ? "Enviar correo de recuperación" : "Entrar →"}
        </button>
      </form>

      {/* Botón Google en login */}
      {!isInstitutional && mode === "login" && (
        <button className="button secondary full" type="button" onClick={handleGoogle} disabled={isLoading} style={{ marginTop: 8 }}>
          <GoogleIcon />
          Entrar con Gmail
        </button>
      )}

      {/* Recuperar contraseña — solo en login */}
      {mode === "login" && (
        <button className="textButton" type="button" style={{ fontSize: "12px", marginTop: 4 }} onClick={() => { setMode("reset"); setStatus(""); }}>
          Olvidé mi contraseña
        </button>
      )}

      {/* Volver — solo en reset */}
      {mode === "reset" && (
        <button className="textButton" type="button" onClick={() => { setMode("login"); setStatus(""); }}>
          ← Volver a iniciar sesión
        </button>
      )}

      {isInstitutional && mode === "login" && (
        <p className="helperText" style={{ textAlign: "center", fontSize: "12px" }}>
          Acceso institucional. Las credenciales son asignadas por el administrador.
        </p>
      )}

      {status ? (
        <p className="statusText" role="alert" aria-live="polite"
          style={{ color: status.includes("lista") || status.includes("enviado") ? "var(--green)" : "var(--coral)" }}>
          {status}
        </p>
      ) : null}
    </section>
  );
}

function roleLabel(role: UserRole) {
  if (role === "worker") return "postulante";
  if (role === "company") return "empresa";
  if (role === "omil") return "OMIL";
  return "administrador";
}
