export const REGIONES_CHILE = [
  { codigo: "RM", nombre: "Región Metropolitana de Santiago", capital: "Santiago" },
  { codigo: "I", nombre: "Tarapacá", capital: "Iquique" },
  { codigo: "II", nombre: "Antofagasta", capital: "Antofagasta" },
  { codigo: "III", nombre: "Atacama", capital: "Copiapó" },
  { codigo: "IV", nombre: "Coquimbo", capital: "La Serena" },
  { codigo: "V", nombre: "Valparaíso", capital: "Valparaíso" },
  { codigo: "VI", nombre: "O'Higgins", capital: "Rancagua" },
  { codigo: "VII", nombre: "Maule", capital: "Talca" },
  { codigo: "VIII", nombre: "Biobío", capital: "Concepción" },
  { codigo: "IX", nombre: "La Araucanía", capital: "Temuco" },
  { codigo: "X", nombre: "Los Lagos", capital: "Puerto Montt" },
  { codigo: "XI", nombre: "Aysén", capital: "Coyhaique" },
  { codigo: "XII", nombre: "Magallanes", capital: "Punta Arenas" },
  { codigo: "XIV", nombre: "Los Ríos", capital: "Valdivia" },
  { codigo: "XV", nombre: "Arica y Parinacota", capital: "Arica" },
  { codigo: "XVI", nombre: "Ñuble", capital: "Chillán" },
];

export const SECTORES_LABORALES = [
  "Tecnología / Software",
  "Finanzas / Contabilidad / Auditoría",
  "Salud / Medicina / Enfermería",
  "Educación / Capacitación",
  "Marketing / Comunicaciones / Publicidad",
  "Ingeniería / Manufactura",
  "Construcción / Inmobiliaria",
  "Retail / Comercio / Ventas",
  "Logística / Transporte / Cadena de suministro",
  "Recursos Humanos / Selección",
  "Legal / Jurídico",
  "Gastronomía / Turismo / Hotelería",
  "Administración / Secretariado",
  "Diseño / Arte / Creatividad",
  "Agricultura / Minería / Pesca",
  "Energía / Minería",
  "Gobierno / Sector público",
  "ONG / Organizaciones sin fines de lucro",
  "Medios de comunicación / Periodismo",
  "Investigación / Ciencia",
];

export const NIVELES_EXPERIENCIA = [
  { valor: "sin_experiencia", label: "Sin experiencia (0 años)" },
  { valor: "junior", label: "Junior (0-2 años)" },
  { valor: "mid", label: "Mid-level (2-5 años)" },
  { valor: "senior", label: "Senior (5-10 años)" },
  { valor: "experto", label: "Experto / Lead (10+ años)" },
];

export const MODALIDADES_TRABAJO = [
  { valor: "presencial", label: "Presencial" },
  { valor: "remoto", label: "100% Remoto" },
  { valor: "hibrido", label: "Híbrido" },
];

export function getRegionNombre(codigo: string): string {
  return REGIONES_CHILE.find(r => r.codigo === codigo)?.nombre ?? codigo;
}

export function getSectorLabel(sector: string): string {
  return SECTORES_LABORALES.find(s => s.toLowerCase().includes(sector.toLowerCase())) ?? sector;
}

export function rutToDisplay(rut: string): string {
  const clean = rut.replace(/\./g, "").replace(/-/g, "");
  if (clean.length < 2) return rut;
  const dv = clean.slice(-1);
  const num = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${num}-${dv}`;
}
