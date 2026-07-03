import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteTopbar } from "@/components/site-topbar";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { BackToTop } from "@/components/ui/back-to-top";
import { InstallPrompt } from "@/components/ui/install-prompt";
import { GlobalUI } from "@/components/ui/global-ui";
import { AppInit } from "@/components/app-init";
import { CookieConsent } from "@/components/cookie-consent";
import { BottomNav } from "@/components/ui/bottom-nav";
import { ChatbotWidget } from "@/components/chatbot-widget";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3aaee0" },
    { media: "(prefers-color-scheme: dark)",  color: "#0d1b2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://perfil-primero.web.app"),
  title: {
    default: "Perfil Primero | Trabajo en Chile con sueldo claro",
    template: "%s | Perfil Primero"
  },
  description: "La plataforma laboral invertida de Chile. Publica tu perfil anónimo y recibe ofertas de empresas verificadas con cargo, sueldo y modalidad antes de revelar tus datos.",
  keywords: ["trabajo Chile", "empleo Chile", "buscar trabajo", "ofertas laborales", "perfil anónimo", "sueldo claro", "empresas verificadas"],
  authors: [{ name: "Perfil Primero SpA" }],
  creator: "Perfil Primero SpA",
  publisher: "Perfil Primero SpA",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: "https://perfil-primero.web.app/" },
  openGraph: {
    title: "Perfil Primero | Publica tu perfil y recibe ofertas con sueldo claro",
    description: "Encuentra trabajo en Chile sin enviar CV. Publica tu perfil y recibe ofertas de empresas verificadas con sueldo y modalidad claros.",
    url: "https://perfil-primero.web.app",
    siteName: "Perfil Primero",
    images: [{ url: "/isotipo.png", width: 512, height: 512, alt: "Perfil Primero — Plataforma laboral invertida de Chile" }],
    locale: "es_CL",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfil Primero | Trabajo en Chile con sueldo claro",
    description: "Publica tu perfil anónimo y recibe ofertas con sueldo visible desde el primer contacto.",
    images: ["/isotipo.png"]
  },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Perfil Primero" },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://us-central1-perfil-primero.cloudfunctions.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebaseapp.com" />
        <link rel="dns-prefetch" href="https://firebaseio.com" />
        <link rel="dns-prefetch" href="https://cloudfunctions.net" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preload" href="/isotipo.png" as="image" />
        <link rel="icon" href="/isotipo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/isotipo.png" />
        <link rel="alternate" type="application/rss+xml" title="Blog Perfil Primero" href="/feed.xml" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{page_path:window.location.pathname});` }} />
          </>
        )}
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <noscript>
          <style>{`.jsOnly{display:none!important}`}</style>
        </noscript>
        {/* Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Perfil Primero SpA",
              "legalName": "Perfil Primero SpA",
              "taxID": "78.449.783-6",
              "url": "https://perfil-primero.web.app",
              "logo": "https://perfil-primero.web.app/isotipo.png",
              "description": "Plataforma laboral invertida de Chile. Postulantes publican perfiles anónimos y empresas verificadas llegan con sueldo claro.",
              "foundingDate": "2025",
              "areaServed": { "@type": "Country", "name": "Chile" },
              "address": { "@type": "PostalAddress", "addressCountry": "CL", "addressLocality": "Puerto Montt", "addressRegion": "Los Lagos" },
              "contactPoint": [
                { "@type": "ContactPoint", "email": "contacto@perfil-primero.cl", "contactType": "customer support", "availableLanguage": "es" }
              ],
              "sameAs": [
                "https://www.linkedin.com/company/perfil-primero"
              ]
            }).replace(/</g, "\\u003c")
          }}
        />
        {/* WebSite with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Perfil Primero",
              "url": "https://perfil-primero.web.app",
              "description": "Plataforma laboral invertida de Chile. Publica tu perfil anónimo y recibe ofertas con sueldo claro.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": { "@type": "EntryPoint", "urlTemplate": "https://perfil-primero.web.app/empresa?q={search_term_string}" },
                "query-input": "required name=search_term_string"
              }
            }).replace(/</g, "\\u003c")
          }}
        />
        {/* WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Perfil Primero",
              "url": "https://perfil-primero.web.app",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, Android, iOS",
              "offers": [
                { "@type": "Offer", "price": "0", "priceCurrency": "CLP", "description": "Activación de perfil postulante — gratis durante lanzamiento" },
                { "@type": "Offer", "price": "4990", "priceCurrency": "CLP", "description": "Desbloqueo de contacto de candidato — precio lanzamiento" }
              ]
            }).replace(/</g, "\\u003c")
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skipLink">Saltar al contenido</a>
        <SiteTopbar />
        <ToastProvider>
          <AppInit />
          <OfflineBanner />
          <ErrorBoundary section="root">
            <div id="main-content">{children}</div>
          </ErrorBoundary>
          <BackToTop />
          <InstallPrompt />
          <GlobalUI />
          <BottomNav />
          <CookieConsent />
          <ChatbotWidget />
        </ToastProvider>
        <footer className="siteFooter" role="contentinfo">
          <div className="footerGrid">
            <div className="footerCol">
              <div className="footerColTitle">Perfil Primero</div>
              <a href="/como-funciona">Cómo funciona</a>
              <a href="/sobre-nosotros">Sobre nosotros</a>
              <a href="/precios">Precios</a>
              <a href="/faq">Preguntas frecuentes</a>
              <a href="/prensa">Prensa</a>
              <a href="/contacto">Contacto</a>
            </div>
            <div className="footerCol">
              <div className="footerColTitle">Trabajadores</div>
              <a href="/para-postulantes">Cómo funciona para ti</a>
              <a href="/postulante">Crear mi perfil</a>
              <a href="/referidos">Programa de referidos</a>
              <a href="/estadisticas">Estadísticas salariales</a>
              <a href="/calculadora-salarial">Calculadora salarial</a>
              <a href="/tips-profesionales">Tips profesionales</a>
            </div>
            <div className="footerCol">
              <div className="footerColTitle">Empresas</div>
              <a href="/para-empresas">Cómo funciona para empresas</a>
              <a href="/empresa">Buscar talento</a>
              <a href="/para-pymes">Solución para PyMEs</a>
              <a href="/para-omil">OMIL · Municipalidades</a>
              <a href="/empresa-verificada">Verificación empresa</a>
            </div>
            <div className="footerCol">
              <div className="footerColTitle">Plataforma</div>
              <a href="/vs-portales-tradicionales">Vs portales tradicionales</a>
              <a href="/casos-de-exito">Casos de éxito</a>
              <a href="/blog">Blog de empleo</a>
              <a href="/comunidad">Comunidad</a>
            </div>
            <div className="footerCol">
              <div className="footerColTitle">Soporte</div>
              <a href="/ayuda">Centro de ayuda</a>
              <a href="/legal/privacidad">Privacidad</a>
              <a href="/legal/terminos">Términos de uso</a>
              <a href="/accesibilidad">Accesibilidad</a>
              <a href="mailto:contacto@perfil-primero.cl">contacto@perfil-primero.cl</a>
            </div>
          </div>
          <div className="footerBottom">
            <span className="footerCredit">© 2026 Perfil Primero SpA · RUT 78.449.783-6 · Puerto Montt, Chile · El empleo que viene a ti</span>
            <div className="footerBadges">
              <span className="footerBadge">🔒 Datos protegidos</span>
              <span className="footerBadge">✅ Empresas verificadas</span>
              <span className="footerBadge">💰 Sueldo siempre visible</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
