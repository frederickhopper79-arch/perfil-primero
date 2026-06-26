"use client";
import { useState, useEffect, useRef } from "react";

export function SiteTopbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Cierra el menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Cierra el menú al cambiar de ruta (Next.js SPA)
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className="topbar siteTopbar">
      <a className="brand" href="/">
        <img className="brandLogo" src="/logo-perfil-primero.png" alt="Perfil Primero" style={{ height: "36px", width: "auto" }} />
      </a>

      {/* Nav desktop — siempre visible en ≥820px */}
      <nav aria-label="Principal" className="topbarNavDesktop">
        <a href="/" className="navLink">Inicio</a>
        <a href="/como-funciona" className="navLink">Cómo funciona</a>
        <a href="/precios" className="navLink">Precios</a>
        <a href="/ayuda" className="navLink">Ayuda</a>
        <a className="navButton navPostulant" href="/postulante">Soy postulante</a>
        <a className="navAction navButton" href="/empresa">Soy empresa</a>
      </nav>

      {/* Botón hamburger — solo visible en móvil <820px */}
      <button
        className="topbarHamburger"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className={`hamburgerLine ${menuOpen ? "open" : ""}`} />
        <span className={`hamburgerLine ${menuOpen ? "open" : ""}`} />
        <span className={`hamburgerLine ${menuOpen ? "open" : ""}`} />
      </button>

      {/* Nav móvil — dropdown */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          ref={navRef as React.RefObject<HTMLElement>}
          className="topbarNavMobile"
          aria-label="Menú principal"
        >
          <a href="/" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Inicio</a>
          <a href="/como-funciona" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
          <a href="/precios" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Precios</a>
          <a href="/estadisticas" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Estadísticas</a>
          <a href="/calculadora-salarial" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Calculadora salarial</a>
          <a href="/blog" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Blog</a>
          <a href="/ayuda" className="mobileNavLink" onClick={() => setMenuOpen(false)}>Ayuda</a>
          <div className="mobileNavDivider" />
          <a href="/postulante" className="mobileNavLink mobileNavCta" onClick={() => setMenuOpen(false)}>Soy postulante</a>
          <a href="/empresa" className="mobileNavLink mobileNavCtaPrimary" onClick={() => setMenuOpen(false)}>Soy empresa</a>
        </nav>
      )}
    </header>
  );
}
