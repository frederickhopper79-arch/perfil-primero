"use client";
import { useState, useMemo } from "react";

const SECTORES = [
  { nombre: "Tecnología / Software", junior: 800000, mid: 1400000, senior: 2200000 },
  { nombre: "Finanzas / Contabilidad", junior: 700000, mid: 1100000, senior: 1800000 },
  { nombre: "Salud / Medicina", junior: 750000, mid: 1200000, senior: 2000000 },
  { nombre: "Educación", junior: 580000, mid: 800000, senior: 1200000 },
  { nombre: "Marketing / Comunicaciones", junior: 600000, mid: 950000, senior: 1500000 },
  { nombre: "Ingeniería / Manufactura", junior: 700000, mid: 1100000, senior: 1800000 },
  { nombre: "Construcción / Inmobiliaria", junior: 650000, mid: 1000000, senior: 1600000 },
  { nombre: "Retail / Comercio", junior: 500000, mid: 750000, senior: 1200000 },
  { nombre: "Logística / Transporte", junior: 550000, mid: 800000, senior: 1300000 },
  { nombre: "Recursos Humanos", junior: 600000, mid: 900000, senior: 1500000 },
  { nombre: "Legal / Abogacía", junior: 700000, mid: 1100000, senior: 2000000 },
  { nombre: "Diseño / Creatividad", junior: 550000, mid: 850000, senior: 1400000 },
  { nombre: "Gastronomía / Turismo", junior: 480000, mid: 700000, senior: 1100000 },
  { nombre: "Agropecuario / Forestal", junior: 500000, mid: 750000, senior: 1200000 },
];

const REGIONES = [
  { nombre: "Región Metropolitana", factor: 1.0 },
  { nombre: "Antofagasta", factor: 1.12 },
  { nombre: "Tarapacá", factor: 1.08 },
  { nombre: "Atacama", factor: 1.05 },
  { nombre: "Coquimbo", factor: 0.92 },
  { nombre: "Valparaíso", factor: 0.95 },
  { nombre: "O'Higgins", factor: 0.90 },
  { nombre: "Maule", factor: 0.88 },
  { nombre: "Biobío", factor: 0.93 },
  { nombre: "La Araucanía", factor: 0.85 },
  { nombre: "Los Ríos", factor: 0.87 },
  { nombre: "Los Lagos", factor: 0.88 },
  { nombre: "Aysén", factor: 1.06 },
  { nombre: "Magallanes", factor: 1.10 },
];

const MODALIDADES = [
  { nombre: "Presencial", factor: 1.0 },
  { nombre: "Híbrido", factor: 1.05 },
  { nombre: "100% Remoto", factor: 1.08 },
];

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Math.round(n / 10000) * 10000);
}

export function CalculadoraClient() {
  const [sector, setSector] = useState(0);
  const [nivel, setNivel] = useState<"junior" | "mid" | "senior">("mid");
  const [region, setRegion] = useState(0);
  const [modalidad, setModalidad] = useState(0);

  const resultado = useMemo(() => {
    const base = SECTORES[sector][nivel];
    const rfactor = REGIONES[region].factor;
    const mfactor = MODALIDADES[modalidad].factor;
    const valor = base * rfactor * mfactor;
    return { p25: valor * 0.8, mediana: valor, p75: valor * 1.2 };
  }, [sector, nivel, region, modalidad]);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 4px",
    borderRadius: 10,
    border: `1px solid ${active ? "var(--color-primary)" : "var(--line)"}`,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    background: active ? "var(--color-primary)" : "var(--bg)",
    color: active ? "#fff" : "var(--muted)",
    transition: "all .15s",
  });

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid var(--line)",
    fontSize: 13,
    background: "var(--bg)",
    color: "var(--text)",
  };

  return (
    <div style={{ background: "var(--surface)", borderRadius: 18, border: "1px solid var(--line)", padding: "1.75rem", marginBottom: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Sector / Industria</label>
          <select value={sector} onChange={e => setSector(Number(e.target.value))} style={selectStyle}>
            {SECTORES.map((s, i) => <option key={i} value={i}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Nivel de experiencia</label>
          <div style={{ display: "flex", gap: 6 }}>
            {(["junior", "mid", "senior"] as const).map(n => (
              <button key={n} onClick={() => setNivel(n)} style={btnStyle(nivel === n)}>
                {n === "junior" ? "Jr (0–2a)" : n === "mid" ? "Mid (2–5a)" : "Sr (5+a)"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Región</label>
          <select value={region} onChange={e => setRegion(Number(e.target.value))} style={selectStyle}>
            {REGIONES.map((r, i) => <option key={i} value={i}>{r.nombre}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Modalidad</label>
          <div style={{ display: "flex", gap: 6 }}>
            {MODALIDADES.map((m, i) => (
              <button key={i} onClick={() => setModalidad(i)} style={btnStyle(modalidad === i)}>
                {m.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultado */}
      <div style={{ background: "linear-gradient(135deg, var(--color-dark), var(--color-primary))", borderRadius: 14, padding: "1.5rem", color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".08em", lineHeight: 1.4 }}>
          {SECTORES[sector].nombre} · {nivel === "junior" ? "Junior" : nivel === "mid" ? "Mid-level" : "Senior"} · {REGIONES[region].nombre} · {MODALIDADES[modalidad].nombre}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Percentil 25</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{fmt(resultado.p25)}</div>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,.25)", borderRight: "1px solid rgba(255,255,255,.25)" }}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Mediana (P50)</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{fmt(resultado.mediana)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>Percentil 75</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{fmt(resultado.p75)}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 14, textAlign: "center" }}>
          Sueldos brutos mensuales en CLP · Referencias orientativas · {new Date().getFullYear()}
        </div>
      </div>

      {/* Factor breakdown */}
      {REGIONES[region].factor !== 1.0 && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg-soft)", borderRadius: 8, fontSize: 12, color: "var(--muted)" }}>
          Factor regional {REGIONES[region].nombre}: ×{REGIONES[region].factor.toFixed(2)} respecto a la RM
          {MODALIDADES[modalidad].factor !== 1.0 && ` · Factor modalidad remota: ×${MODALIDADES[modalidad].factor.toFixed(2)}`}
        </div>
      )}
    </div>
  );
}
