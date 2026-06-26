import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { WorkerOnboarding } from "@/components/worker-onboarding";
import { WorkerTour } from "@/components/worker-tour";
import { HelpWidget } from "@/components/ui/help-widget";

export const metadata: Metadata = {
  title: "Panel Postulante | Perfil Primero",
  description: "Crea tu perfil laboral anónimo en Chile. Recibe invitaciones de empresas verificadas con cargo, sueldo y modalidad claros antes de dar tus datos.",
};

export default function PostulantPage() {
  return (
    <main className="workspace">
      <WorkerOnboarding />
      <WorkerTour />
      <HelpWidget context="worker" />
    </main>
  );
}
