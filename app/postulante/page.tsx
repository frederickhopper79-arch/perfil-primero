import { WorkerOnboarding } from "@/components/worker-onboarding";

export default function PostulantPage() {
  return (
    <main className="workspace">
      <section className="workspaceHeader">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
          <span>Perfil Primero</span>
        </a>
        <div>
          <p className="eyebrow">Panel postulante</p>
          <h1>Crea un perfil visible sin exponer tus datos privados.</h1>
        </div>
      </section>

      <WorkerOnboarding />
    </main>
  );
}
