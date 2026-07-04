"use client";
import { useState } from "react";

const terminos = [
  { letra: "A", término: "AFP", def: "Administradora de Fondos de Pensiones. Institución privada que administra los ahorros previsionales del trabajador (10% del sueldo imponible obligatorio)." },
  { letra: "A", término: "Asignación familiar", def: "Beneficio estatal para trabajadores con cargas familiares (hijos menores o discapacitados). El monto varía según el tramo de renta." },
  { letra: "A", término: "Artículo 161", def: "Causal de despido por necesidades de la empresa. Obliga al empleador a pagar indemnización por años de servicio + aviso previo (30 días o mes de remuneración)." },
  { letra: "B", término: "Boleta de honorarios", def: "Documento tributario emitido por trabajadores independientes (no dependientes). No genera contrato laboral ni cotizaciones automáticas, aunque la ley 21.133 obliga a retención del 17% para cotizar." },
  { letra: "B", término: "Base imponible", def: "Parte del sueldo sobre la que se calculan los descuentos obligatorios (AFP, salud, seguro de cesantía). No incluye asignaciones no imponibles." },
  { letra: "C", término: "Carta de amonestación", def: "Sanción escrita que el empleador entrega al trabajador por incumplimiento. Puede ser requisito previo para invocar causal de despido grave." },
  { letra: "C", término: "Código del Trabajo", def: "Cuerpo legal chileno que regula las relaciones laborales entre empleador y trabajador. Establece derechos, deberes, contratos, jornada, remuneraciones y despidos." },
  { letra: "C", término: "Cotizaciones previsionales", def: "Aportes obligatorios descontados del sueldo bruto: AFP (10%), salud (7%), seguro de cesantía (0.6% trabajador + 2.4% empleador)." },
  { letra: "C", término: "Contrato indefinido", def: "Contrato sin fecha de término. El despido requiere causal justificada. Otorga mayor protección al trabajador." },
  { letra: "C", término: "Contrato a plazo fijo", def: "Contrato con fecha de vencimiento definida. Si se renueva 2 veces o el trabajador lleva más de 12 meses consecutivos, se entiende indefinido." },
  { letra: "D", término: "Desafuero", def: "Procedimiento judicial para despedir a un trabajador con fuero laboral (dirigentes sindicales, embarazadas). Requiere autorización del tribunal." },
  { letra: "D", término: "Días hábiles", def: "Días laborales (lunes a viernes, excluidos feriados). Relevante para calcular plazos de aviso de vacaciones, finiquito, licencias, etc." },
  { letra: "E", término: "Empleador", def: "Persona natural o jurídica que contrata trabajadores y dirige el trabajo. Tiene obligaciones de pago, seguridad, cotizaciones y respeto a derechos laborales." },
  { letra: "F", término: "Finiquito", def: "Documento que pone término a la relación laboral. Debe ser firmado ante ministro de fe y detalla indemnizaciones, vacaciones pendientes y haberes adeudados." },
  { letra: "F", término: "FONASA", def: "Fondo Nacional de Salud. Seguro de salud público. El trabajador aporta 7% del sueldo imponible; puede ser cotizante de FONASA o de ISAPRE privada." },
  { letra: "F", término: "Feriado legal", def: "Vacaciones anuales. Mínimo 15 días hábiles por año trabajado (21 en zona extrema). Se cobra el sueldo bruto con descuentos proporcionales." },
  { letra: "F", término: "Fuero maternal", def: "Protección que impide el despido de la trabajadora embarazada y hasta 1 año después del parto, salvo desafuero judicial." },
  { letra: "G", término: "Gratificación", def: "Participación del trabajador en las utilidades de la empresa. Puede pagarse legalmente (30% utilidades) o convencionalmente (25% del sueldo anual, tope 4.75 IMM)." },
  { letra: "H", término: "Horas extraordinarias", def: "Horas trabajadas sobre la jornada pactada. Se pagan con recargo mínimo del 50% sobre el valor hora ordinaria. Máximo 2 horas extra diarias." },
  { letra: "I", término: "Ingreso mínimo mensual (IMM)", def: "Sueldo mínimo legal en Chile. Al año 2024, $500.000 CLP para trabajadores de 18-65 años. Revisado anualmente." },
  { letra: "I", término: "ISAPRE", def: "Institución de Salud Previsional privada. El trabajador puede optar por ISAPRE en lugar de FONASA pagando el 7% de cotización legal, con posible copago adicional." },
  { letra: "I", término: "Indemnización por años de servicio", def: "Pago al término de contrato por causal del art. 161. Equivale a 1 mes de sueldo por año trabajado, tope 11 meses." },
  { letra: "J", término: "Jornada laboral", def: "Tiempo durante el cual el trabajador debe prestar servicio. Máximo 45 horas semanales (reducción gradual a 40h según Ley 21.561)." },
  { letra: "L", término: "Licencia médica", def: "Permiso de trabajo por enfermedad o accidente. El empleador paga las primeras 3 jornadas; desde el 4° día, paga FONASA/ISAPRE (subsidio de enfermedad)." },
  { letra: "L", término: "Liquidación de sueldo", def: "Documento mensual que detalla el sueldo bruto, descuentos legales y sueldo líquido que recibe el trabajador. Debe ser entregado en el pago." },
  { letra: "M", término: "Mutualidad", def: "Organismo administrador del seguro de accidentes del trabajo (Ley 16.744). Empleador paga cotización (0.9% base + adicional por riesgo). Ejemplos: ACHS, IST, Mutual de Seguridad." },
  { letra: "N", término: "Nómina", def: "Lista de trabajadores activos de una empresa con sus sueldos. En Chile, el SII exige declaración mensual de planilla de remuneraciones." },
  { letra: "P", término: "Período de prueba", def: "El Código del Trabajo chileno no regula expresamente el período de prueba. Un contrato puede terminarse dentro de los 30 primeros días invocando causal de desahucio (trabajadores de confianza) o art. 161." },
  { letra: "P", término: "Permiso postnatal parental", def: "Extensión del postnatal de 12 semanas adicionales (o 18 semanas a media jornada) para que la madre o padre cuide al recién nacido." },
  { letra: "P", término: "Postnatal", def: "Licencia postparto de 12 semanas (84 días) para la madre trabajadora, pagada por FONASA/ISAPRE. El padre tiene 5 días de postnatal paternal." },
  { letra: "R", término: "Remuneración", def: "Todo ingreso que percibe el trabajador en dinero o especies avaluables. Incluye sueldo base, gratificación, bonos y comisiones. Referencia para calcular cotizaciones y vacaciones." },
  { letra: "R", término: "RUT empresa", def: "Rol Único Tributario de la empresa. Necesario para emitir facturas, boletas de honorarios y declarar impuestos. Se obtiene al inicio de actividades en el SII." },
  { letra: "S", término: "Seguro de cesantía", def: "Sistema de ahorro individual + fondo solidario para cubrir al trabajador desempleado. Aporta 0.6% el trabajador y 2.4% el empleador (contratos indefinidos)." },
  { letra: "S", término: "SII", def: "Servicio de Impuestos Internos. Organismo fiscal que controla impuestos, inicio de actividades, facturas electrónicas y declaración de renta en Chile." },
  { letra: "S", término: "Sindicalismo", def: "Derecho de los trabajadores a organizarse en sindicatos para negociar colectivamente condiciones laborales. La afiliación es voluntaria en Chile." },
  { letra: "S", término: "Subcontratación", def: "Cuando una empresa contrata a otra (subcontratista) para ejecutar servicios dentro de sus instalaciones. La empresa principal tiene responsabilidad subsidiaria sobre obligaciones laborales." },
  { letra: "S", término: "Sueldo base", def: "Monto fijo mensual garantizado en el contrato, independiente de la producción o asistencia. No puede ser menor al ingreso mínimo." },
  { letra: "S", término: "Sueldo bruto", def: "Remuneración antes de descuentos previsionales e impuesto de segunda categoría. Es la base para calcular cotizaciones." },
  { letra: "S", término: "Sueldo líquido", def: "Lo que el trabajador recibe efectivamente en su cuenta bancaria, después de descuentos de AFP, salud, seguro de cesantía e impuesto." },
  { letra: "T", término: "Teletrabajo", def: "Modalidad de trabajo regulada por la Ley 21.220 (2020). El empleador debe proveer equipos y pagar gastos de conectividad. El trabajador puede reversarlo con 30 días de aviso." },
  { letra: "T", término: "Término de contrato", def: "Fin de la relación laboral. Puede ser por mutuo acuerdo, vencimiento de plazo, renuncia voluntaria, o despido (con o sin causal)." },
  { letra: "U", término: "Utilidades", def: "Beneficios económicos de la empresa al cierre del año comercial. Base para calcular la gratificación legal del trabajador (30% de utilidades líquidas)." },
  { letra: "V", término: "Vacaciones proporcionales", def: "Días de vacaciones proporcionales al tiempo trabajado cuando el contrato termina antes de completar un año. Se pagan en el finiquito." },
  { letra: "V", término: "Viático", def: "Asignación para cubrir gastos de alimentación, alojamiento y transporte en viajes de trabajo. Generalmente no es imponible ni tributable si corresponde a gasto efectivo." },
];

const letras = [...new Set(terminos.map(t => t.letra))].sort();

export function GlosarioClient() {
  const [search, setSearch] = useState("");
  const [letraFiltro, setLetraFiltro] = useState("Todas");

  const filtrados = terminos.filter(t =>
    (letraFiltro === "Todas" || t.letra === letraFiltro) &&
    (search === "" || t.término.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <input
          type="search"
          placeholder="Buscar término..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, background: "var(--bg)", color: "var(--text)", flex: 1, minWidth: 200 }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
        {["Todas", ...letras].map(l => (
          <button key={l} onClick={() => setLetraFiltro(l)}
            style={{ padding: "4px 12px", borderRadius: 6, border: letraFiltro === l ? "none" : "1px solid var(--line)", background: letraFiltro === l ? "var(--primary-700)" : "var(--surface)", color: letraFiltro === l ? "#fff" : "var(--text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: "3rem 0" }}>No se encontraron términos.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtrados.map((t, i) => (
            <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, background: "var(--blue-soft)", color: "var(--primary-700)", padding: "2px 8px", borderRadius: 4 }}>{t.letra}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--heading)" }}>{t.término}</span>
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65, margin: 0 }}>{t.def}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
