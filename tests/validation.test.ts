import { describe, it, expect } from "vitest";
import { sanitize, assertString, assertPositiveInt, validateRutCl } from "../functions/src/lib/validation";

describe("sanitize", () => {
  it("quita etiquetas HTML", () => {
    expect(sanitize("<b>hola</b>")).toBe("hola");
    expect(sanitize("<script>alert(1)</script>x")).toBe("alert(1)x");
  });
  it("quita el esquema javascript:", () => {
    expect(sanitize("javascript:alert(1)")).toBe("alert(1)");
  });
  it("recorta al máximo y hace trim", () => {
    expect(sanitize("  hola  ")).toBe("hola");
    expect(sanitize("abcdef", 3)).toBe("abc");
  });
  it("no-string devuelve vacío", () => {
    expect(sanitize(123)).toBe("");
    expect(sanitize(null)).toBe("");
  });
});

describe("assertString", () => {
  it("devuelve el valor saneado si es válido", () => {
    expect(assertString("  hola  ", "campo")).toBe("hola");
  });
  it("lanza si vacío o no-string", () => {
    expect(() => assertString("", "campo")).toThrow(/campo/);
    expect(() => assertString("   ", "campo")).toThrow();
    expect(() => assertString(5, "campo")).toThrow();
  });
});

describe("assertPositiveInt", () => {
  it("acepta enteros positivos", () => {
    expect(assertPositiveInt(5, "n")).toBe(5);
    expect(assertPositiveInt("7", "n")).toBe(7);
  });
  it("rechaza 0, negativos, decimales y no-números", () => {
    expect(() => assertPositiveInt(0, "n")).toThrow();
    expect(() => assertPositiveInt(-3, "n")).toThrow();
    expect(() => assertPositiveInt(2.5, "n")).toThrow();
    expect(() => assertPositiveInt("x", "n")).toThrow();
  });
});

describe("validateRutCl (módulo 11)", () => {
  it("acepta RUTs válidos (con y sin formato)", () => {
    expect(validateRutCl("11111111-1")).toBe(true);
    expect(validateRutCl("11.111.111-1")).toBe(true);
    expect(validateRutCl("12.345.678-5")).toBe(true);
    expect(validateRutCl("10000013-K")).toBe(true); // dígito verificador K
    expect(validateRutCl("10.000.013-k")).toBe(true); // minúscula
  });
  it("rechaza dígito verificador incorrecto", () => {
    expect(validateRutCl("11111111-2")).toBe(false);
    expect(validateRutCl("12.345.678-9")).toBe(false);
    expect(validateRutCl("10000013-0")).toBe(false);
  });
  it("rechaza entradas demasiado cortas o basura", () => {
    expect(validateRutCl("123")).toBe(false);
    expect(validateRutCl("")).toBe(false);
  });
});
