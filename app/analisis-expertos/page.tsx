import type { Metadata } from "next";
import ExpertPanel from "@/components/expert-panel";

export const metadata: Metadata = {
  title: "Panel de Expertos | Perfil Primero",
  description: "4 expertos analizan Perfil Primero: un abogado laboral, una ingeniera en administración, un psicólogo organizacional y un crítico de plataformas tecnológicas."
};

export default function AnalisisExpertosPage() {
  return <ExpertPanel />;
}

