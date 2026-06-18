import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { CompanyWorkspace } from "@/components/company-workspace";

export const metadata: Metadata = {
  title: "Panel Empresa | Perfil Primero",
  description: "Busca talento disponible en Chile. Perfiles anónimos con renta esperada, habilidades y modalidad. Contacta solo cuando hay interés mutuo.",
};

export default function CompanyPage() {
  return (
    <main className="workspace">
      <section className="workspaceHeader">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
          <span>Perfil Primero</span>
        </a>
        <div className="workspaceHeaderMeta">
          <a className="backLink" href="/"><ArrowLeft size={13} /> Inicio</a>
          <p className="eyebrow">Panel empresa</p>
          <h1>Encuentra postulantes disponibles y contacta con reglas claras.</h1>
        </div>
      </section>

      <CompanyWorkspace />
    </main>
  );
}
