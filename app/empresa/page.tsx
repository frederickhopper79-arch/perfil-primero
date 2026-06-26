import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { CompanyWorkspace } from "@/components/company-workspace";
import { HelpWidget } from "@/components/ui/help-widget";

export const metadata: Metadata = {
  title: "Panel Empresa | Perfil Primero",
  description: "Busca talento disponible en Chile. Perfiles anónimos con renta esperada, habilidades y modalidad. Contacta solo cuando hay interés mutuo.",
};

export default function CompanyPage() {
  return (
    <main className="workspace">
      <CompanyWorkspace />
      <HelpWidget context="company" />
    </main>
  );
}
