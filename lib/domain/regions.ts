// Regiones de Chile para Perfil Primero

export interface Region {
  id: string;
  code: string;
  name: string;
  capital: string;
  remote?: boolean;
}

export const REGIONS: Region[] = [
  { id: "remote", code: "REM", name: "Trabajo Remoto", capital: "Chile", remote: true },
  { id: "arica", code: "XV", name: "Arica y Parinacota", capital: "Arica" },
  { id: "tarapaca", code: "I", name: "Tarapacá", capital: "Iquique" },
  { id: "antofagasta", code: "II", name: "Antofagasta", capital: "Antofagasta" },
  { id: "atacama", code: "III", name: "Atacama", capital: "Copiapó" },
  { id: "coquimbo", code: "IV", name: "Coquimbo", capital: "La Serena" },
  { id: "valparaiso", code: "V", name: "Valparaíso", capital: "Valparaíso" },
  { id: "metropolitana", code: "RM", name: "Metropolitana", capital: "Santiago" },
  { id: "ohiggins", code: "VI", name: "O'Higgins", capital: "Rancagua" },
  { id: "maule", code: "VII", name: "Maule", capital: "Talca" },
  { id: "nuble", code: "XVI", name: "Ñuble", capital: "Chillán" },
  { id: "biobio", code: "VIII", name: "Biobío", capital: "Concepción" },
  { id: "araucania", code: "IX", name: "La Araucanía", capital: "Temuco" },
  { id: "los-rios", code: "XIV", name: "Los Ríos", capital: "Valdivia" },
  { id: "los-lagos", code: "X", name: "Los Lagos", capital: "Puerto Montt" },
  { id: "aysen", code: "XI", name: "Aysén", capital: "Coyhaique" },
  { id: "magallanes", code: "XII", name: "Magallanes", capital: "Punta Arenas" },
];

export const REGION_OPTIONS = REGIONS.map((r) => ({ value: r.id, label: r.remote ? r.name : `${r.name} (${r.capital})` }));

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getRegionName(id: string): string {
  return getRegionById(id)?.name ?? id;
}

export function getRegionCapital(id: string): string {
  return getRegionById(id)?.capital ?? "";
}
