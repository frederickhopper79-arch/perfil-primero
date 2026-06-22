import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="notFoundPage">
      <a className="brand" href="/">
        <img className="brandLogo" src="/logo-perfil-primero.png" alt="Perfil Primero" />
        <span>Perfil Primero</span>
      </a>
      <div className="notFoundBody">
        <p className="notFoundCode">404</p>
        <h1>Página no encontrada</h1>
        <p>La dirección que buscas no existe o fue removida. Vuelve al inicio para continuar.</p>
        <div className="notFoundActions">
          <a className="button primary" href="/">Ir al inicio</a>
          <a className="button secondary" href="/como-funciona">Cómo funciona</a>
        </div>
      </div>
    </main>
  );
}
