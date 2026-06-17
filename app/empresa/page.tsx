import { CompanyWorkspace } from "@/components/company-workspace";

export default function CompanyPage() {
  return (
    <main className="workspace">
      <section className="workspaceHeader">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
          <span>Perfil Primero</span>
        </a>
        <div>
          <p className="eyebrow">Panel empresa</p>
          <h1>Encuentra postulantes disponibles y contacta con reglas claras.</h1>
        </div>
      </section>

      <CompanyWorkspace />
    </main>
  );
}
