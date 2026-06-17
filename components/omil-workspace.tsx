"use client";

import { FormEvent, useMemo, useState } from "react";
import { Building2, CalendarClock, CheckCircle2, UserPlus } from "lucide-react";
import { AuthCard } from "./auth-card";
import { chileRegions, jobAreas } from "@/lib/domain/catalogs";
import { logout } from "@/lib/firebase/auth";
import { createOmilPostulantProfile } from "@/lib/firebase/omil";

export function OmilWorkspace() {
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [lastCreated, setLastCreated] = useState<{ code: string; expiresAt: string } | null>(null);
  const [form, setForm] = useState({
    legalName: "",
    email: "",
    phone: "",
    headline: "",
    summary: "",
    skills: "",
    area: "Oficios y Otros",
    region: "Region Metropolitana",
    city: "Santiago",
    salaryMin: "0",
    salaryMax: "0",
    workMode: "onsite"
  });

  const selectedRegion = useMemo(
    () => chileRegions.find((region) => region.name === form.region) ?? chileRegions[0],
    [form.region]
  );

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleLogout() {
    await logout().catch(() => undefined);
    setUid("");
    setEmail("");
    setStatus("Sesion OMIL cerrada.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Creando perfil gratuito OMIL...");

    try {
      const created = await createOmilPostulantProfile({
        legalName: form.legalName,
        email: form.email,
        phone: form.phone,
        headline: form.headline,
        summary: form.summary,
        skills: form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        area: form.area,
        region: form.region,
        city: form.city,
        expectedSalaryMin: Number(form.salaryMin || 0),
        expectedSalaryMax: Number(form.salaryMax || 0),
        workMode: form.workMode as "remote" | "hybrid" | "onsite"
      });
      setLastCreated({ code: created.profileCode, expiresAt: created.profileExpiresAt });
      setStatus("Perfil publicado sin cobro por 30 dias. El correo de continuidad quedo en cola administrativa.");
      setForm((current) => ({
        ...current,
        legalName: "",
        email: "",
        phone: "",
        headline: "",
        summary: "",
        skills: ""
      }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo crear el perfil OMIL.");
    }
  }

  if (!uid) {
    return (
      <section className="accessSplit omilAccess">
        <div className="accessPitch">
          <span className="smallLabel">Ingreso institucional</span>
          <h2>OMIL puede cargar postulantes sin cobro inicial y con vigencia controlada.</h2>
          <p>
            Cada perfil queda visible por 30 dias. Al vencer, el postulante recibe aviso para continuar
            de forma personal mediante suscripcion normal.
          </p>
          <div className="portalStatGrid">
            <div><strong>Gratis</strong><span>alta institucional</span></div>
            <div><strong>30 dias</strong><span>visibilidad inicial</span></div>
            <div><strong>Ilimitado</strong><span>postulantes por OMIL</span></div>
          </div>
        </div>
        <AuthCard
          role="omil"
          onReady={(nextUid, nextEmail) => {
            setUid(nextUid);
            setEmail(nextEmail);
          }}
        />
      </section>
    );
  }

  return (
    <section className="omilConsole">
      <aside className="steps omilSteps">
        <div className="adminBadge">
          <Building2 size={18} aria-hidden="true" />
          OMIL activa
        </div>
        <h2>Cuenta institucional</h2>
        <p>{email}</p>
        <button className="button secondary full" type="button" onClick={handleLogout}>Cerrar sesion</button>
      </aside>

      <div className="stack">
        <section className="dashboardGrid">
          <article>
            <span className="smallLabel">Modelo</span>
            <strong>Sin cobro</strong>
            <p>La OMIL no pasa por Mercado Pago.</p>
          </article>
          <article>
            <span className="smallLabel">Vigencia</span>
            <strong>30 dias</strong>
            <p>Luego se envía aviso de continuidad.</p>
          </article>
          <article>
            <span className="smallLabel">Alcance</span>
            <strong>Ilimitado</strong>
            <p>Puede crear postulantes sin tope operativo.</p>
          </article>
          <article>
            <span className="smallLabel">Privacidad</span>
            <strong>Anonimo</strong>
            <p>Datos personales quedan bloqueados.</p>
          </article>
        </section>

        <form className="formSurface omilForm" onSubmit={handleSubmit}>
          <div className="formHeader">
            <UserPlus size={24} aria-hidden="true" />
            <div>
              <h2>Crear perfil de postulante</h2>
              <p>Registra datos laborales suficientes para que empresas verificadas encuentren el perfil.</p>
            </div>
          </div>
          <div className="formGrid">
            <label>
              Nombre completo
              <input value={form.legalName} onChange={(event) => update("legalName", event.target.value)} required />
            </label>
            <label>
              Email personal
              <input value={form.email} onChange={(event) => update("email", event.target.value)} type="email" required />
            </label>
            <label>
              Telefono
              <input value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </label>
            <label>
              Cargo objetivo
              <input value={form.headline} onChange={(event) => update("headline", event.target.value)} required />
            </label>
            <label>
              Area
              <select value={form.area} onChange={(event) => update("area", event.target.value)} required>
                {jobAreas.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
            <label>
              Region
              <select value={form.region} onChange={(event) => update("region", event.target.value)} required>
                {chileRegions.map((region) => <option key={region.name} value={region.name}>{region.name}</option>)}
              </select>
            </label>
            <label>
              Comuna
              <select value={form.city} onChange={(event) => update("city", event.target.value)} required>
                {selectedRegion.communes.map((commune) => <option key={commune} value={commune}>{commune}</option>)}
              </select>
            </label>
            <label>
              Modalidad
              <select value={form.workMode} onChange={(event) => update("workMode", event.target.value)}>
                <option value="onsite">Presencial</option>
                <option value="hybrid">Hibrida</option>
                <option value="remote">Remota</option>
              </select>
            </label>
            <label>
              Renta minima
              <input value={form.salaryMin} onChange={(event) => update("salaryMin", event.target.value)} inputMode="numeric" />
            </label>
            <label>
              Renta maxima
              <input value={form.salaryMax} onChange={(event) => update("salaryMax", event.target.value)} inputMode="numeric" />
            </label>
            <label className="wide">
              Habilidades separadas por coma
              <input value={form.skills} onChange={(event) => update("skills", event.target.value)} placeholder="Ventas, caja, Excel, licencia clase B" />
            </label>
            <label className="wide">
              Resumen laboral
              <textarea value={form.summary} onChange={(event) => update("summary", event.target.value)} required />
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="submit">
              <CheckCircle2 size={18} aria-hidden="true" />
              Publicar perfil OMIL
            </button>
          </div>
          {lastCreated ? (
            <div className="omilSuccess">
              <CalendarClock size={20} aria-hidden="true" />
              <p>
                Codigo {lastCreated.code}. Visible hasta {new Date(lastCreated.expiresAt).toLocaleDateString("es-CL")}.
              </p>
            </div>
          ) : null}
          {status ? <p className="statusText">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
