import { MercadoPagoIcon } from "@/components/brand-icons";

export default function PricingPage() {
  return (
    <main className="workspace">
      <section className="workspaceHeader">
        <a className="brand" href="/">
          <img className="brandLogo" src="/logo-perfil-primero.svg" alt="" />
          <span>Perfil Primero</span>
        </a>
        <div>
          <p className="eyebrow">Precios claros</p>
          <h1>Pagas por visibilidad y por resultados, no por ruido.</h1>
        </div>
      </section>
      <section className="pricingGrid">
        <article className="pricingCard">
          <span>Postulante</span>
          <h2>$999</h2>
          <p>Perfil visible por 30 dias, CV analizado por IA, tests y recepcion de invitaciones.</p>
          <a className="button primary" href="/postulante">Activar perfil</a>
        </article>
        <article className="pricingCard">
          <span>Empresa</span>
          <h2>$999</h2>
          <p>Pago de prueba por exito cuando el trato con el postulante ya esta cerrado o avanzado.</p>
          <a className="button secondary" href="/empresa">
            <MercadoPagoIcon />
            Buscar talento
          </a>
        </article>
      </section>
    </main>
  );
}
