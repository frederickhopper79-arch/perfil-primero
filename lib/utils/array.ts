// Utilidades de arrays funcionales

/** Agrupa array por clave: groupBy([{a:1},{a:2},{a:1}], 'a') → {1:[...],2:[...]} */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key] ?? "");
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/** Elimina duplicados por clave */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Ordena array de objetos por campo */
export function sortBy<T>(arr: T[], key: keyof T, dir: "asc" | "desc" = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const av = String(a[key] ?? "");
    const bv = String(b[key] ?? "");
    const cmp = av.localeCompare(bv, "es-CL", { numeric: true });
    return dir === "asc" ? cmp : -cmp;
  });
}

/** Divide array en chunks de n elementos */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/** Aplana array de arrays un nivel */
export function flatten<T>(arr: T[][]): T[] {
  return arr.flat();
}

/** Intersección de dos arrays */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

/** Diferencia: elementos en a que no están en b */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}

/** Mueve elemento de índice from a índice to */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/** Rellena array hasta longitud n con valor */
export function padEnd<T>(arr: T[], length: number, fill: T): T[] {
  return [...arr, ...Array(Math.max(0, length - arr.length)).fill(fill)];
}

/** Suma campo numérico de array de objetos */
export function sumBy<T>(arr: T[], key: keyof T): number {
  return arr.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
}

/** Promedio de campo numérico */
export function avgBy<T>(arr: T[], key: keyof T): number {
  if (arr.length === 0) return 0;
  return sumBy(arr, key) / arr.length;
}

/** Toma muestra aleatoria de n elementos */
export function sample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/** Retorna elemento aleatorio */
export function randomItem<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Cuenta ocurrencias de cada valor */
export function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = String(item[key] ?? "");
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
