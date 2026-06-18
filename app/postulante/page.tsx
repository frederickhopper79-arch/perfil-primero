import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { WorkerOnboarding } from "@/components/worker-onboarding";

export const metadata: Metadata = {
  title: "Panel Postulante | Perfil Primero",
  description: "Crea tu perfil laboral anónimo en Chile. Recibe invitaciones de empresas verificadas con cargo, sueldo y modalidad claros antes de dar tus datos.",
};

export default function PostulantPage() {
  return (
    <main className="workspace">
      <section className="workspaceHeader">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
          <span>Perfil Primero</span>
        </a>
        <div className="workspaceHeaderMeta">
          <a className="backLink" href="/"><ArrowLeft size={13} /> Inicio</a>
          <p className="eyebrow">Panel postulante</p>
          <h1>Crea un perfil visible sin exponer tus datos privados.</h1>
        </div>
      </section>

      <WorkerOnboarding />
    </main>
  );
}
