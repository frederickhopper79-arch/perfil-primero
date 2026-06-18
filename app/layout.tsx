import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://perfil-primero.web.app"),
  title: "Perfil Primero | Trabajo en Chile con sueldo claro",
  description: "Perfil Primero SpA — Encuentra trabajo en Chile sin enviar CV. Publica tu perfil y recibe ofertas de empresas verificadas con sueldo y modalidad claros.",
  openGraph: {
    title: "Perfil Primero | Publica tu perfil y recibe ofertas con sueldo claro",
    description: "Encuentra trabajo en Chile sin enviar CV. Publica tu perfil y recibe ofertas de empresas verificadas con sueldo y modalidad claros.",
    url: "https://perfil-primero.web.app",
    siteName: "Perfil Primero",
    images: [
      {
        url: "/hero-marketplace.png",
        width: 1200,
        height: 630,
        alt: "Perfil Primero, plataforma de empleo con perfiles anonimos y sueldo claro"
      }
    ],
    locale: "es_CL",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <footer className="siteFooter">
          <span className="footerBrand">Perfil Primero · Chile</span>
          <a href="/como-funciona">Cómo funciona</a>
          <a href="/postulante">Postulante</a>
          <a href="/empresa">Empresa</a>
          <a href="/legal/privacidad">Privacidad</a>
          <a href="/legal/terminos">Términos</a>
          <a href="mailto:contacto@perfil-primero.cl">Contacto</a>
          <span className="footerCredit">Diseñado por Hopper Tech E.I.R.L.</span>
        </footer>
      </body>
    </html>
  );
}
