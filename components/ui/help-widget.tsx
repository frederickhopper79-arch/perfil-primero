"use client";
import { useState, useCallback } from "react";
import { Modal } from "@/components/modal";

interface HelpWidgetProps {
  context?: "worker" | "company";
}

const FAQ_WORKER = [
  { q: "¿Mi nombre y datos son visibles?", a: "No. Tu identidad está completamente oculta. Las empresas solo ven tu experiencia, habilidades y expectativa salarial. Tus datos personales se revelan solo si tú aceptas una invitación." },
  { q: "¿Cuánto cuesta publicar mi perfil?", a: "Durante el lanzamiento es completamente gratis. Después del período de lanzamiento, activar tu perfil cuesta $999 CLP por 30 días. Si vienes de una OMIL municipal, siempre es gratuito." },
  { q: "¿Qué pasa si no me contacta nadie?", a: "Puedes mejorar tu perfil agregando más habilidades, ajustando tu expectativa salarial o activando la opción de trabajo remoto. Perfiles completos reciben 3× más invitaciones." },
];

const FAQ_COMPANY = [
  { q: "¿Cómo verifico mi empresa?", a: "Revisamos que exista en el SII y que el dominio de correo coincida con el nombre de la empresa. El proceso toma 24–48 horas hábiles." },
  { q: "¿Tengo que declarar el sueldo siempre?", a: "Sí, es obligatorio. Al enviar una invitación debes indicar el rango salarial, el cargo y la modalidad. No hay 'a convenir'. Es parte del modelo que hace que los candidatos respondan." },
  { q: "¿Qué pasa si el candidato no responde?", a: "La invitación expira después de 7 días. Puedes enviar invitaciones a otros candidatos sin costo adicional. Solo pagas cuando el candidato acepta y ves sus datos de contacto." },
];

export function HelpWidget({ context = "worker" }: HelpWidgetProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const faqs = context === "company" ? FAQ_COMPANY : FAQ_WORKER;

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ayuda rápida"
        title="¿Tienes dudas?"
        style={{
          position: "fixed",
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          right: 20,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          fontSize: 22,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,.25)",
          zIndex: 90,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        ?
      </button>

      <Modal open={open} onClose={close} title="Preguntas frecuentes" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((item, i) => (
            <div key={i} style={{ background: "var(--bg-soft)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--heading)", margin: "0 0 6px" }}>
                {item.q}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
                {item.a}
              </p>
            </div>
          ))}

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, textAlign: "center" }}>
              ¿No encontraste tu respuesta?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <a
                href="/faq"
                onClick={close}
                style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, fontWeight: 600, color: "var(--text)", textDecoration: "none" }}
              >
                Ver FAQ completo
              </a>
              <a
                href="/contacto"
                onClick={close}
                className="button"
                style={{ flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, fontSize: 13 }}
              >
                Escribirnos →
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
