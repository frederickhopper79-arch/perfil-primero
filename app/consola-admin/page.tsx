import { AdminPanel } from "@/components/admin-panel";

export default function AdminConsolePage() {
  return (
    <main className="workspace adminWorkspace">
      <section className="workspaceHeader">
        <div className="brand">
          <img className="brandLogo" src="/logo-perfil-primero.png" alt="" />
          <span>Perfil Primero</span>
        </div>
        <div>
          <p className="eyebrow">Consola interna separada</p>
          <h1>Verifica empresas antes de abrir contacto con postulantes.</h1>
        </div>
      </section>

      <AdminPanel />
    </main>
  );
}
