export function SiteTopbar() {
  return (
    <header className="topbar siteTopbar">
      <a className="brand" href="/">
        <img className="brandLogo" src="/logo-perfil-primero.png" alt="Perfil Primero" />
        <span className="brandName">Perfil Primero</span>
      </a>
      <nav aria-label="Principal">
        <a href="/como-funciona" className="navLink">Cómo funciona</a>
        <a href="/precios" className="navLink">Precios</a>
        <a href="/ayuda" className="navLink">Ayuda</a>
        <a className="navButton navPostulant" href="/postulante">Soy postulante</a>
        <a className="navAction navButton" href="/empresa">Soy empresa</a>
      </nav>
    </header>
  );
}
