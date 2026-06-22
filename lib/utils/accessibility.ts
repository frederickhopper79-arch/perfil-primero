// Utilidades de accesibilidad para Perfil Primero

/** Anuncia mensaje a lectores de pantalla via aria-live region */
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  if (typeof document === "undefined") return;
  const id = priority === "assertive" ? "pp-aria-assertive" : "pp-aria-polite";
  let region = document.getElementById(id);
  if (!region) {
    region = document.createElement("div");
    region.id = id;
    region.setAttribute("aria-live", priority);
    region.setAttribute("aria-atomic", "true");
    region.setAttribute("aria-relevant", "additions");
    region.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    document.body.appendChild(region);
  }
  // Vaciar y volver a poner para que el lector lo reanuncie
  region.textContent = "";
  requestAnimationFrame(() => { region!.textContent = message; });
}

/** Genera aria-label descriptivo para badge de número */
export function badgeAriaLabel(count: number, singular: string, plural: string): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

/** Retorna aria-sort válido de HTML */
export type AriaSortValue = "ascending" | "descending" | "none" | "other";
export function ariaSortValue(column: string, sortKey: string, dir: "asc" | "desc"): AriaSortValue {
  if (column !== sortKey) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

/** Verifica si un elemento es visible para accesibilidad */
export function isVisiblyHidden(el: HTMLElement): boolean {
  if (el.hidden) return true;
  const style = window.getComputedStyle(el);
  return style.display === "none" || style.visibility === "hidden" || style.opacity === "0";
}

/** Mueve foco al primer elemento focusable dentro de un contenedor */
export function focusFirstIn(container: HTMLElement) {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const el = container.querySelector<HTMLElement>(selector);
  el?.focus();
}

/** Genera id único determinístico para ARIA */
export function ariaId(prefix: string, value: string): string {
  return `${prefix}-${value.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
}

/** Comprueba si el contraste de dos colores hex cumple WCAG AA */
export function checkContrast(hex1: string, hex2: string): { ratio: number; aa: boolean; aaa: boolean } {
  function relative(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }
  const l1 = relative(hex1);
  const l2 = relative(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return { ratio: Math.round(ratio * 100) / 100, aa: ratio >= 4.5, aaa: ratio >= 7 };
}
