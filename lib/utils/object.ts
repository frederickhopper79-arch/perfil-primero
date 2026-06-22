// Utilidades de objetos

/** Omite claves de un objeto */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
}

/** Selecciona solo ciertas claves */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);
}

/** Deep equals básico para objetos serializables */
export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Elimina keys con valor null/undefined de un objeto */
export function compact<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

/** Aplana objeto anidado con punto: {a:{b:1}} → {"a.b":1} */
export function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(acc, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      acc[fullKey] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);
}

/** Genera diff entre dos objetos: retorna keys cambiadas */
export function diff<T extends object>(prev: T, next: T): Partial<T> {
  const result: Partial<T> = {};
  (Object.keys(next) as (keyof T)[]).forEach((key) => {
    if (!deepEqual(prev[key], next[key])) result[key] = next[key];
  });
  return result;
}

/** Merge profundo de dos objetos */
export function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  (Object.keys(override) as (keyof T)[]).forEach((key) => {
    const bv = base[key];
    const ov = override[key];
    if (bv !== null && typeof bv === "object" && !Array.isArray(bv) && ov !== null && typeof ov === "object" && !Array.isArray(ov)) {
      result[key] = deepMerge(bv as object, ov as object) as T[keyof T];
    } else if (ov !== undefined) {
      result[key] = ov as T[keyof T];
    }
  });
  return result;
}
