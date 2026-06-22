// Sectores industriales de Chile para Perfil Primero
// Taxonomía CIIU adaptada al mercado laboral chileno

export interface Sector {
  id: string;
  label: string;
  emoji: string;
  group: string;
}

export const SECTORS: Sector[] = [
  // Tecnología
  { id: "software", label: "Desarrollo de Software", emoji: "💻", group: "Tecnología" },
  { id: "data", label: "Ciencia de Datos / IA", emoji: "🤖", group: "Tecnología" },
  { id: "cybersecurity", label: "Ciberseguridad", emoji: "🔒", group: "Tecnología" },
  { id: "devops", label: "DevOps / Cloud", emoji: "☁️", group: "Tecnología" },
  { id: "ux", label: "UX / UI / Diseño", emoji: "🎨", group: "Tecnología" },
  { id: "product", label: "Product Management", emoji: "📋", group: "Tecnología" },

  // Finanzas
  { id: "finance", label: "Finanzas y Contabilidad", emoji: "💰", group: "Finanzas" },
  { id: "banking", label: "Banca y Seguros", emoji: "🏦", group: "Finanzas" },
  { id: "investment", label: "Inversiones / Bolsa", emoji: "📈", group: "Finanzas" },
  { id: "audit", label: "Auditoría", emoji: "🔍", group: "Finanzas" },

  // Salud
  { id: "medicine", label: "Medicina / Salud", emoji: "🏥", group: "Salud" },
  { id: "nursing", label: "Enfermería", emoji: "💊", group: "Salud" },
  { id: "psych", label: "Psicología", emoji: "🧠", group: "Salud" },
  { id: "kine", label: "Kinesiología / Fisioterapia", emoji: "💪", group: "Salud" },
  { id: "nutrition", label: "Nutrición", emoji: "🥗", group: "Salud" },

  // Ingeniería
  { id: "civil", label: "Ingeniería Civil", emoji: "🏗️", group: "Ingeniería" },
  { id: "industrial", label: "Ingeniería Industrial", emoji: "⚙️", group: "Ingeniería" },
  { id: "electrical", label: "Ingeniería Eléctrica", emoji: "⚡", group: "Ingeniería" },
  { id: "mining", label: "Minería", emoji: "⛏️", group: "Ingeniería" },

  // Comercial
  { id: "marketing", label: "Marketing", emoji: "📣", group: "Comercial" },
  { id: "sales", label: "Ventas", emoji: "🤝", group: "Comercial" },
  { id: "ecommerce", label: "E-commerce", emoji: "🛒", group: "Comercial" },
  { id: "crm", label: "CRM / Customer Success", emoji: "🎯", group: "Comercial" },

  // Legal
  { id: "law", label: "Derecho", emoji: "⚖️", group: "Legal" },
  { id: "compliance", label: "Compliance / Regulatorio", emoji: "📜", group: "Legal" },

  // Educación
  { id: "education", label: "Educación / Docencia", emoji: "🎓", group: "Educación" },
  { id: "training", label: "Capacitación Corporativa", emoji: "📚", group: "Educación" },

  // Logística
  { id: "logistics", label: "Logística y Supply Chain", emoji: "🚛", group: "Logística" },
  { id: "transport", label: "Transporte", emoji: "🚢", group: "Logística" },

  // Recursos Humanos
  { id: "hr", label: "Recursos Humanos", emoji: "👥", group: "RRHH" },
  { id: "recruitment", label: "Reclutamiento", emoji: "🔎", group: "RRHH" },

  // Otros
  { id: "architecture", label: "Arquitectura", emoji: "🏛️", group: "Otros" },
  { id: "agro", label: "Agroindustria", emoji: "🌾", group: "Otros" },
  { id: "hospitality", label: "Turismo / Hotelería", emoji: "🏨", group: "Otros" },
  { id: "creative", label: "Artes / Medios / Comunicación", emoji: "🎭", group: "Otros" },
  { id: "public", label: "Sector Público / Municipio", emoji: "🏛", group: "Otros" },
  { id: "social", label: "ONG / Trabajo Social", emoji: "❤️", group: "Otros" },
];

export const SECTOR_GROUPS = [...new Set(SECTORS.map((s) => s.group))];

export function getSectorById(id: string): Sector | undefined {
  return SECTORS.find((s) => s.id === id);
}

export function getSectorLabel(id: string): string {
  return getSectorById(id)?.label ?? id;
}

export function getSectorsByGroup(group: string): Sector[] {
  return SECTORS.filter((s) => s.group === group);
}

export const SECTOR_OPTIONS = SECTORS.map((s) => ({ value: s.id, label: `${s.emoji} ${s.label}` }));
