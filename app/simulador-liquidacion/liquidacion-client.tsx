"use client";
import { useState, useMemo } from "react";

const AFP_COMISIONES: Record<string, number> = {
  "Capital": 0.0144,
  "Cuprum": 0.0144,
  "Habitat": 0.0127,
  "Modelo": 0.0058,
  "PlanVital": 0.0116,
  "ProVida": 0.0145,
  "Uno": 0.0069,
};

const FONDOS = ["A","B","C","D","E"] as const;

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Math.round(n));
}

function Row({ label, valor, sub, bold, negativo, destacado }: {
  label: string; valor: string; sub?: string;
  bold?: boolean; negativo?: boolean; destacado?: boolean;
}) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 14px",
      background: destacado ? "linear-gradient(90deg,#1a2f5e,#1e3a6e)" : bold ? "var(--bg-soft)" : "transparent",
      borderRadius: 8,
      borderBottom: destacado ? "none" : "1px solid var(--line)",
      color: destacado ? "#fff" : "var(--text)",
    }}>
      <div>
        <span style={{ fontSize: 13, fontWeight: bold || destacado ? 700 : 400 }}>{label}</span>
        {sub && <span style={{ fontSize: 11, color: destacado ? "rgba(255,255,255,0.65)" : "var(--muted)", display: "block" }}>{sub}</span>}
      </div>
      <span style={{
        fontSize: bold || destacado ? 16 : 13,
        fontWeight: bold || destacado ? 800 : 400,
        color: destacado ? "#fff" : negativo ? "var(--coral)" : bold ? "var(--heading)" : "var(--muted-strong)",
        fontVariantNumeric: "tabular-nums",
      }}>{negativo ? "−" : ""}{valor}</span>
    </div>
  );
}

export function LiquidacionClient() {
  const [bruto, setBruto] = useState("1200000");
  const [afp, setAfp] = useState("Habitat");
  const [salud, setSalud] = useState<"fonasa" | "isapre">("fonasa");
  const [iSalud, setISalud] = useState("7");
  const [fondoAfp, setFondoAfp] = useState<"A"|"B"|"C"|"D"|"E">("C");
  const [cesantia, setCesantia] = useState<"indefinido" | "plazo_fijo">("indefinido");

  const brutoNum = Math.max(0, parseInt(bruto.replace(/\D/g, "")) || 0);

  const calc = useMemo(() => {
    const pAfp = 0.10;
    const pComision = AFP_COMISIONES[afp] ?? 0.0127;
    const pSIS = 0.0149; // lo paga el empleador
    const pSalud = parseFloat(iSalud) / 100 || 0.07;
    const pCesantia = cesantia === "indefinido" ? 0.006 : 0.003;
    const pCesantiaEmp = cesantia === "indefinido" ? 0.024 : 0.03;

    const descAfp = brutoNum * pAfp;
    const descComision = brutoNum * pComision;
    const descSalud = brutoNum * pSalud;
    const descCesantia = brutoNum * pCesantia;
    const totalDescuentos = descAfp + descComision + descSalud + descCesantia;
    const liquido = brutoNum - totalDescuentos;

    const sisEmp = brutoNum * pSIS;
    const cesantiaEmp = brutoNum * pCesantiaEmp;
    const costoEmpresa = brutoNum + sisEmp + cesantiaEmp;

    return { descAfp, descComision, descSalud, descCesantia, totalDescuentos, liquido, sisEmp, cesantiaEmp, costoEmpresa, pAfp, pComision, pSalud, pCesantia };
  }, [brutoNum, afp, iSalud, cesantia]);

  const pct = brutoNum > 0 ? Math.round((calc.liquido / brutoNum) * 100) : 0;

  return (
    <div>
      {/* Inputs */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "1.5rem", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Sueldo bruto mensual (CLP)</label>
            <input
              type="text"
              inputMode="numeric"
              value={bruto}
              onChange={e => setBruto(e.target.value.replace(/\D/g, ""))}
              placeholder="Ej: 1200000"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 16, fontWeight: 700, background: "var(--bg)", color: "var(--text)", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>AFP</label>
            <select value={afp} onChange={e => setAfp(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, background: "var(--bg)", color: "var(--text)" }}>
              {Object.entries(AFP_COMISIONES).map(([n, c]) => (
                <option key={n} value={n}>{n} ({(c * 100).toFixed(2)}% comisión)</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Fondo AFP</label>
            <div style={{ display: "flex", gap: 4 }}>
              {FONDOS.map(f => (
                <button key={f} onClick={() => setFondoAfp(f)} style={{ flex: 1, padding: "10px 2px", borderRadius: 8, border: `1px solid ${fondoAfp === f ? "var(--primary-700)" : "var(--line)"}`, fontSize: 12, fontWeight: 700, cursor: "pointer", background: fondoAfp === f ? "var(--primary-700)" : "var(--bg)", color: fondoAfp === f ? "#fff" : "var(--muted)" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Salud</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["fonasa","isapre"] as const).map(s => (
                <button key={s} onClick={() => setSalud(s)} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1px solid ${salud === s ? "var(--primary-700)" : "var(--line)"}`, fontSize: 12, fontWeight: 600, cursor: "pointer", background: salud === s ? "var(--primary-700)" : "var(--bg)", color: salud === s ? "#fff" : "var(--muted)" }}>
                  {s === "fonasa" ? "FONASA (7%)" : "Isapre"}
                </button>
              ))}
            </div>
          </div>

          {salud === "isapre" && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>% Isapre</label>
              <input
                type="number"
                min="7"
                max="20"
                step="0.1"
                value={iSalud}
                onChange={e => setISalud(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 13, background: "var(--bg)", color: "var(--text)" }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Tipo de contrato</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["indefinido","plazo_fijo"] as const).map(t => (
                <button key={t} onClick={() => setCesantia(t)} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: `1px solid ${cesantia === t ? "var(--primary-700)" : "var(--line)"}`, fontSize: 11, fontWeight: 600, cursor: "pointer", background: cesantia === t ? "var(--primary-700)" : "var(--bg)", color: cesantia === t ? "#fff" : "var(--muted)" }}>
                  {t === "indefinido" ? "Indefinido" : "Plazo fijo"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resultado */}
      {brutoNum > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", background: "var(--bg-soft)", borderBottom: "1px solid var(--line)" }}>
            <strong style={{ fontSize: 13, color: "var(--heading)" }}>Liquidación estimada</strong>
            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>· {afp} Fondo {fondoAfp} · {salud === "fonasa" ? "FONASA 7%" : `Isapre ${iSalud}%`} · {cesantia === "indefinido" ? "Contrato indefinido" : "Plazo fijo"}</span>
          </div>

          <div style={{ padding: "0 4px" }}>
            <Row label="Sueldo bruto" valor={fmt(brutoNum)} bold />
            <div style={{ padding: "6px 14px 2px", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Descuentos del trabajador</div>
            <Row label="AFP — ahorro previsional" valor={fmt(calc.descAfp)} negativo sub={`10% del bruto → tu cuenta individual`} />
            <Row label={`AFP — comisión ${afp}`} valor={fmt(calc.descComision)} negativo sub={`${(AFP_COMISIONES[afp] * 100).toFixed(2)}% del bruto → costo administración`} />
            <Row label="Salud" valor={fmt(calc.descSalud)} negativo sub={salud === "fonasa" ? "7% → FONASA" : `${iSalud}% → Isapre`} />
            <Row label="Seguro de Cesantía" valor={fmt(calc.descCesantia)} negativo sub={cesantia === "indefinido" ? "0.6% → tu cuenta AFC" : "0.3% → tu cuenta AFC"} />
            <Row label="Total descuentos" valor={fmt(calc.totalDescuentos)} bold negativo />

            <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
            <Row label={`Sueldo líquido a recibir`} valor={fmt(calc.liquido)} destacado sub={`${pct}% del bruto`} />

            <div style={{ padding: "10px 14px 4px", fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>Costo real para el empleador</div>
            <Row label="SIS (Seguro Invalidez y Sobrevivencia)" valor={fmt(calc.sisEmp)} sub="1.49% — lo paga el empleador" />
            <Row label="Cesantía (empleador)" valor={fmt(calc.cesantiaEmp)} sub={cesantia === "indefinido" ? "2.4%" : "3.0%"} />
            <Row label="Costo total empresa" valor={fmt(calc.costoEmpresa)} bold />
          </div>

          <div style={{ padding: "10px 16px", background: "var(--bg-soft)", borderTop: "1px solid var(--line)", fontSize: 11, color: "var(--muted)" }}>
            * Cálculo orientativo. No incluye bonos, comisiones, horas extra ni asignaciones adicionales. Las comisiones AFP pueden variar.
          </div>
        </div>
      )}
    </div>
  );
}
