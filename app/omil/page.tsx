import { OmilWorkspace } from "@/components/omil-workspace";

export default function OmilPage() {
  return (
    <main className="workspace">
      <section className="workspaceHeader">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.png" alt="" />
          <span>Perfil Primero</span>
        </a>
        <div>
          <p className="eyebrow">Acceso OMIL</p>
          <h1>Carga institucional gratuita de postulantes con visibilidad controlada.</h1>
        </div>
      </section>

      <OmilWorkspace />
    </main>
  );
}
