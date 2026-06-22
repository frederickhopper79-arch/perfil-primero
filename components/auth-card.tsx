"use client";

import { FormEvent, useState } from "react";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isInstitutional = role === "omil" || role === "admin";
  const [mode, setMode] = useState<"register" | "login" | "reset">(isInstitutional ? "login" : "register");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    setStatus("Procesando...");

    if (mode === "reset") {
      try {
        await resetPassword(trimmedEmail);
        setStatus("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
        setMode("login");
      } catch {
        setStatus("No se pudo enviar el correo. Verifica que esté registrado.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const user =
        mode === "register"
          ? await registerWithEmail(trimmedEmail, password, role)
          : await loginWithEmail(trimmedEmail, password);
      await ensureUserRecord(user.uid, user.email ?? trimmedEmail, role);
      await assertExpectedRole(user.uid);
      onReady(user.uid, user.email ?? trimmedEmail);
      setStatus("Sesión lista.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("email-already-in-use")) setStatus("Este correo ya tiene una cuenta. Inicia sesión.");
      else if (msg.includes("wrong-password") || msg.includes("invalid-credential")) setStatus("Contraseña incorrecta. Inténtalo de nuevo.");
      else if (msg.includes("user-not-found")) setStatus("No hay cuenta con ese correo. ¿Quieres crear una?");
      else if (msg.includes("too-many-requests")) setStatus("Demasiados intentos. Espera unos minutos e inténtalo de nuevo.");
      else setStatus(msg || "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    if (isLoading) return;
    setIsLoading(true);
    setStatus("");
    try {
      const user = await loginWithGoogle(role);
      await assertExpectedRole(user.uid);
      onReady(user.uid, user.email ?? "");
      setStatus("Sesión lista.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("popup-closed") || msg.includes("popup-blocked")) {
        setStatus("El navegador bloqueó el popup. Permite ventanas emergentes para este sitio e intenta de nuevo.");
      } else if (msg.includes("cancelled-popup-request")) {
        setStatus("Solicitud cancelada. Inténtalo de nuevo.");
      } else {
        setStatus(msg || "No se pudo iniciar con Google. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
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
      <div>
        <p className="eyebrow">
          {role === "worker" ? "Cuenta postulante" : role === "company" ? "Cuenta empresa" : role === "omil" ? "Cuenta OMIL" : "Cuenta admin"}
        </p>
        <h2>{mode === "register" ? "Crear cuenta" : mode === "reset" ? "Recuperar contraseña" : "Iniciar sesión"}</h2>
      </div>
      <form className="authForm" onSubmit={handleEmail} noValidate>
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
          {isLoading ? "Procesando..." : mode === "register" ? "Crear cuenta" : mode === "reset" ? "Enviar correo de recuperación" : "Entrar"}
        </button>
      </form>
      {!isInstitutional && mode !== "reset" && (
        <>
          <button className="button secondary full" type="button" onClick={handleGoogle} disabled={isLoading}>
            <GoogleIcon />
            Entrar con Gmail
          </button>
          <button
            className="textButton"
            type="button"
            disabled={isLoading}
            onClick={() => { setMode(mode === "register" ? "login" : "register"); setStatus(""); }}
          >
            {mode === "register" ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
          </button>
        </>
      )}
      {mode === "login" && (
        <button className="textButton" type="button" style={{ fontSize: "12px" }} onClick={() => { setMode("reset"); setStatus(""); }}>
          Olvidé mi contraseña
        </button>
      )}
      {mode === "reset" && (
        <button className="textButton" type="button" onClick={() => { setMode("login"); setStatus(""); }}>
          Volver a iniciar sesión
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
