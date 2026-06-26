import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap | Perfil Primero",
  robots: { index: false, follow: false },
};

export default function RoadmapPage() {
  return (
    <main style={{ maxWidth: 560, margin: "6rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🗺</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--heading)", marginBottom: 12 }}>
        Contenido interno
      </h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>
        El roadmap de producto está disponible en la consola de administración.
        Esta sección es de uso interno del equipo Perfil Primero.
      </p>
      <a href="/consola-admin" className="button primary">
        Ir a consola admin
      </a>
    </main>
  );
}
