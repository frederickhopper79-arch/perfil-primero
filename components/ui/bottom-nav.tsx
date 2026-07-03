"use client";
import { useEffect, useState } from "react";
import { Home, Search, User, HelpCircle } from "lucide-react";

const links = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/empresa", label: "Buscar", Icon: Search },
  { href: "/postulante", label: "Mi perfil", Icon: User },
  { href: "/ayuda", label: "Ayuda", Icon: HelpCircle },
];

export function BottomNav() {
  const [path, setPath] = useState("");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  return (
    <nav className="bottomNav" aria-label="Navegación principal mobile">
      {links.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          className={`bottomNavItem${path === href ? " active" : ""}`}
          aria-current={path === href ? "page" : undefined}
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
