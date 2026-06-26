"use client";
import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";

type UserType = "worker" | "company" | "omil" | "other";
type Status = "idle" | "sending" | "ok" | "error";

const USER_TYPES: { value: UserType; label: string }[] = [
  { value: "worker", label: "Soy postulante" },
  { value: "company", label: "Soy empresa" },
  { value: "omil", label: "Soy OMIL / municipio" },
  { value: "other", label: "Otro / prensa" },
];

const SUBJECTS = [
  "Tengo un problema con mi cuenta",
  "Pregunta sobre pagos o facturación",
  "Quiero registrar mi empresa",
  "Alianza institucional u OMIL",
  "Consulta de prensa",
  "Sugerencia o feedback",
  "Otro",
];

export function ContactoForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "", userType: "other" as UserType });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const fn = httpsCallable(functions, "createContactTicket");
      await fn({ ...form });
      setStatus("ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar. Intenta de nuevo o escríbenos directamente.";
      setErrorMsg(msg);
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    fontSize: 14,
    background: "var(--bg)",
    color: "var(--text)",
    boxSizing: "border-box",
  };

  if (status === "ok") {
    return (
      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", padding: "2.5rem", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--heading)", marginBottom: 10 }}>
          Mensaje enviado
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 24px" }}>
          Recibimos tu mensaje y te responderemos en menos de 24 horas hábiles a <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "", userType: "other" }); }}
          style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", padding: "2rem" }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--heading)", marginBottom: "1.5rem" }}>
        Envíanos un mensaje
      </h2>

      {/* Tipo de usuario */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>
          ¿Quién eres?
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {USER_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => set("userType", t.value)}
              style={{
                padding: "7px 16px",
                borderRadius: 999,
                border: form.userType === t.value ? "none" : "1px solid var(--line)",
                background: form.userType === t.value ? "var(--color-primary)" : "var(--bg)",
                color: form.userType === t.value ? "#fff" : "var(--text)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nombre y email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Nombre *
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            placeholder="Tu nombre"
            maxLength={100}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Email *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            placeholder="tu@email.cl"
            maxLength={200}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Asunto */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Asunto *
        </label>
        <select
          value={form.subject}
          onChange={e => set("subject", e.target.value)}
          style={inputStyle}
        >
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Mensaje */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>
          Mensaje * <span style={{ fontWeight: 400, textTransform: "none" }}>({form.message.length}/2000)</span>
        </label>
        <textarea
          required
          value={form.message}
          onChange={e => set("message", e.target.value)}
          placeholder="Cuéntanos en qué podemos ayudarte…"
          maxLength={2000}
          rows={5}
          style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
        />
      </div>

      {status === "error" && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="button"
        style={{ width: "100%", opacity: status === "sending" ? 0.7 : 1, cursor: status === "sending" ? "wait" : "pointer" }}
      >
        {status === "sending" ? "Enviando…" : "Enviar mensaje →"}
      </button>

      <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
        Respondemos en menos de 24 horas hábiles. Tus datos solo se usan para responderte y no se comparten con terceros.
      </p>
    </form>
  );
}
