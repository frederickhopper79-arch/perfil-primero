"use client";
import { useState } from "react";
import { getSalaryBenchmark } from "@/lib/firebase/referrals";

const SECTORS = [
  "Tecnología / Software", "Finanzas / Banca", "Salud / Clínico", "Marketing / Comunicaciones",
  "Logística / Operaciones", "Educación / Capacitación", "Comercio / Ventas",
  "Construcción / Minería", "Gastronomía / Turismo", "RRHH / Administración",
];

const REGIONS = [
  "Metropolitana", "Valparaíso", "Biobío", "La Araucanía", "Los Lagos", "Maule", "Antofagasta", "Coquimbo",
];

const LEVELS = [
  { value: "", label: "Todos los niveles" },
  { value: "junior", label: "Junior (0–2 años)" },
  { value: "mid", label: "Semi Senior (3–5 años)" },
  { value: "senior", label: "Senior (6–10 años)" },
  { value: "lead", label: "Lead / Manager (10+ años)" },
];

interface BenchmarkResult {
  count: number;
  medianMin: number | null;
  medianMax: number | null;
  p25Min: number | null;
  p75Max: number | null;
  sector: string;
  region: string;
  experienceLevel: string;
}

function clp(n: number | null) {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

export function SalaryBenchmarkWidget() {
  const [sector, setSector] = useState(SECTORS[0]);
  const [region, setRegion] = useState("");
  const [level, setLevel] = useState("");
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    try {
      const data = await getSalaryBenchmark({ sector, region: region || undefined, experienceLevel: level || undefined });
      setResult(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--line)", padding: "1.5rem" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)", marginBottom: 14 }}>Benchmark salarial por industria</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 12, alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Sector</label>
          <select value={sector} onChange={e => setSector(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Región</label>
          <select value={region} onChange={e => setRegion(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
            <option value="">Todas las regiones</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>Nivel</label>
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 13 }}>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button className="button" onClick={search} disabled={loading} style={{ whiteSpace: "nowrap" }}>
          {loading ? "..." : "Consultar"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 12 }}>
          {result.count === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "1rem" }}>No hay suficientes datos para este filtro. Prueba ampliando la búsqueda.</p>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                Basado en <strong>{result.count}</strong> perfiles activos en <strong>{result.sector}</strong>
                {result.region !== "Chile" ? ` · ${result.region}` : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {[
                  { label: "Sueldo mínimo (p25)", value: clp(result.p25Min) },
                  { label: "Mediana mínima", value: clp(result.medianMin) },
                  { label: "Mediana máxima", value: clp(result.medianMax) },
                  { label: "Sueldo máximo (p75)", value: clp(result.p75Max) },
                ].map((item, i) => (
                  <div key={i} style={{ background: "var(--bg-soft)", borderRadius: 10, padding: "0.875rem", textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-primary)" }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>CLP bruto mensual. Basado en rangos declarados por postulantes en Perfil Primero.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
