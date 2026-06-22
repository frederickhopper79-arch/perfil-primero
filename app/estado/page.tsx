"use client";
import type { Metadata } from "next";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";


type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance" | "unknown";

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  note?: string;
  latencyMs?: number;
}

const SERVICES: Service[] = [
  { name: "Plataforma web", description: "App principal y navegación", status: "operational" },
  { name: "Autenticación Firebase", description: "Login con email y Google", status: "operational" },
  { name: "Base de datos Firestore", description: "Almacenamiento de perfiles y datos", status: "operational" },
  { name: "Pagos Mercado Pago", description: "Activación de perfil y desbloqueo de contacto", status: "operational" },
  { name: "Análisis de CV con IA", description: "Procesamiento con Gemini API", status: "degraded", note: "Cuota de API temporalmente limitada — funciona con mayor latencia." },
  { name: "Notificaciones push", description: "Alertas de invitaciones y mensajes", status: "operational" },
  { name: "Almacenamiento de archivos", description: "Subida y descarga de CVs y documentos", status: "operational" },
  { name: "Cloud Functions", description: "Lógica de negocio servidor", status: "operational" },
  { name: "Envío de emails", description: "Notificaciones por correo electrónico", status: "operational" },
];

const STATUS_LABEL: Record<ServiceStatus, string> = {
  operational: "Operacional",
  degraded: "Degradado",
  outage: "Interrupción",
  maintenance: "Mantenimiento",
  unknown: "Desconocido",
};

function overallStatus(services: Service[]): ServiceStatus {
  if (services.some((s) => s.status === "outage")) return "outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  if (services.every((s) => s.status === "operational")) return "operational";
  return "unknown";
}

export default function EstadoPage() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const overall = overallStatus(SERVICES);
  const allGood = overall === "operational";
  const operationalCount = SERVICES.filter((s) => s.status === "operational").length;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px" }}>
      <Breadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Estado del sistema" }]}
        style={{ marginBottom: 24 }}
      />

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, color: "var(--heading)" }}>
        Estado del sistema
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 14 }}>
        Perfil Primero · perfil-primero.web.app
      </p>

      {/* Banner general */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "18px 22px",
          background: allGood ? "var(--green-soft)" : overall === "degraded" ? "#fef9c3" : "#fee2e2",
          border: `1.5px solid ${allGood ? "var(--green, #057642)" : overall === "degraded" ? "#ca8a04" : "#dc2626"}`,
          borderRadius: 12,
          marginBottom: 28,
        }}
      >
        <div>
          <strong style={{ fontSize: 16, color: allGood ? "var(--green-dark)" : overall === "degraded" ? "#92400e" : "#991b1b" }}>
            {allGood ? "Todos los sistemas operacionales" : `${STATUS_LABEL[overall]} — algunos servicios afectados`}
          </strong>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted-strong)" }}>
            {operationalCount} de {SERVICES.length} servicios funcionando con normalidad
          </p>
        </div>
        <StatusBadge status={overall} />
      </div>

      {/* Lista de servicios */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
        {SERVICES.map((service, i) => (
          <div
            key={service.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "16px 20px",
              background: i % 2 === 0 ? "var(--surface)" : "var(--surface-muted)",
              borderBottom: i < SERVICES.length - 1 ? "1px solid var(--line)" : undefined,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "var(--heading)" }}>{service.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>{service.description}</p>
              {service.note && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#92400e", lineHeight: 1.4 }}>
                  ⚠ {service.note}
                </p>
              )}
            </div>
            <StatusBadge status={service.status} style={{ flexShrink: 0 }} />
          </div>
        ))}
      </div>

      {/* Última actualización */}
      <p style={{ marginTop: 20, fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
        Última actualización: {now ? now.toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" }) : "—"} · Para incidentes contacta{" "}
        <a href="mailto:contacto@perfil-primero.cl" style={{ color: "var(--blue, #0a66c2)" }}>
          contacto@perfil-primero.cl
        </a>
      </p>

      {/* Historial simplificado */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--heading)" }}>
          Historial reciente
        </h2>
        {[
          { date: "2026-06-15", title: "Mantenimiento programado completado", detail: "Actualización de Cloud Functions e índices Firestore.", type: "maintenance" },
          { date: "2026-06-10", title: "Cuota Gemini API temporalmente reducida", detail: "Se redujo la velocidad de análisis de CV por alta demanda de la API.", type: "degraded" },
          { date: "2026-06-01", title: "Lanzamiento de nuevas funcionalidades", detail: "Tour guiado, confetti de perfil completo y búsqueda diferida.", type: "operational" },
        ].map((evt) => (
          <div
            key={evt.date}
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                marginTop: 5,
                flexShrink: 0,
                background:
                  evt.type === "operational" ? "var(--green, #057642)"
                  : evt.type === "maintenance" ? "var(--blue, #0a66c2)"
                  : "#f59e0b",
              }}
            />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "var(--muted)" }}>{evt.date}</p>
              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14, color: "var(--heading)" }}>{evt.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--muted-strong)" }}>{evt.detail}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
