"use client";

import { FormEvent, useState } from "react";
import { ensureUserRecord, getUserRole, loginWithEmail, loginWithGoogle, logout, registerWithEmail } from "@/lib/firebase/auth";
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
  const [mode, setMode] = useState<"register" | "login">(isInstitutional ? "login" : "register");
  const [status, setStatus] = useState("");

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Procesando...");

    try {
      const user =
        mode === "register"
          ? await registerWithEmail(email, password, role)
          : await loginWithEmail(email, password);
      await ensureUserRecord(user.uid, user.email ?? email, role);
      await assertExpectedRole(user.uid);
      onReady(user.uid, user.email ?? email);
      setStatus("Sesión lista.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo iniciar sesion.");
    }
  }

  async function handleGoogle() {
    setStatus("Abriendo Google...");

    try {
      const user = await loginWithGoogle(role);
      await assertExpectedRole(user.uid);
      onReady(user.uid, user.email ?? "");
      setStatus("Sesión lista.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo iniciar con Google.");
    }
  }

  async function assertExpectedRole(uid: string) {
    const actualRole = await getUserRole(uid);
    if (actualRole && actualRole !== role) {
      await logout();
      throw new Error(`Esta cuenta esta registrada como ${roleLabel(actualRole)}. Usa una cuenta de ${roleLabel(role)} para entrar aqui.`);
    }
  }

  return (
    <section className="authCard">
      <div>
        <p className="eyebrow">
          {role === "worker" ? "Cuenta postulante" : role === "company" ? "Cuenta empresa" : role === "omil" ? "Cuenta OMIL" : "Cuenta admin"}
        </p>
        <h2>{mode === "register" ? "Crear cuenta" : "Iniciar sesion"}</h2>
      </div>
      <form className="authForm" onSubmit={handleEmail}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Contrasena
          <input
            value={password}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        <button className="button primary" type="submit">
          {mode === "register" ? "Crear cuenta" : "Entrar"}
        </button>
      </form>
      {!isInstitutional && (
        <>
          <button className="button secondary full" type="button" onClick={handleGoogle}>
            <GoogleIcon />
            Entrar con Gmail
          </button>
          <button
            className="textButton"
            type="button"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
          >
            {mode === "register" ? "Ya tengo cuenta" : "Crear una cuenta nueva"}
          </button>
        </>
      )}
      {isInstitutional && (
        <p className="helperText" style={{ textAlign: "center", fontSize: "12px" }}>
          Acceso institucional. Las credenciales son asignadas por el administrador.
        </p>
      )}
      {status ? <p className="statusText">{status}</p> : null}
    </section>
  );
}

function roleLabel(role: UserRole) {
  if (role === "worker") return "postulante";
  if (role === "company") return "empresa";
  if (role === "omil") return "OMIL";
  return "administrador";
}
