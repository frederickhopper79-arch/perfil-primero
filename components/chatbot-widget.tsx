"use client";

import { useEffect, useRef, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola! Soy el asistente de Perfil Primero. ¿En qué puedo ayudarte?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const fns = getFunctions(app, "us-central1");
      const call = httpsCallable<
        { message: string; history: Message[] },
        { reply: string }
      >(fns, "platformChatbot");
      const history = messages.slice(-6);
      const { data } = await call({ message: text, history });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Lo siento, no pude responder ahora. Escríbenos a contacto@perfil-primero.cl"
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <>
      {/* Burbuja flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente de ayuda"}
        className="chatbotToggle"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Panel de chat */}
      {open && (
        <div className="chatbotPanel" role="dialog" aria-label="Asistente de Perfil Primero">
          <div className="chatbotHeader">
            <span>Asistente Perfil Primero</span>
            <button onClick={() => setOpen(false)} aria-label="Cerrar" className="chatbotClose">✕</button>
          </div>

          <div className="chatbotMessages" aria-live="polite">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbotMsg ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="chatbotMsg assistant">
                <p className="chatbotTyping">
                  <span/><span/><span/>
                </p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbotInput">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu consulta…"
              disabled={loading}
              aria-label="Mensaje al asistente"
              maxLength={800}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} aria-label="Enviar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
