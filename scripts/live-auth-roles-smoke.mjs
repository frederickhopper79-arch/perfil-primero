/**
 * Smoke test de autenticación por rol.
 * Verifica que los 3 roles (worker, company, admin) puedan iniciar sesión
 * y que la pantalla post-login sea la correcta.
 *
 * Uso:
 *   E2E_WORKER_EMAIL=x@x.cl E2E_COMPANY_EMAIL=y@y.cl \
 *   E2E_ADMIN_EMAIL=admin@x.cl E2E_ADMIN_PASSWORD=pass \
 *   node scripts/live-auth-roles-smoke.mjs
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let playwright;
try {
  playwright = await import("playwright");
} catch {
  // fallback a ruta de cache local si playwright no está en node_modules
  playwright = await import(
    "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
  );
}

const baseUrl = process.env.BASE_URL ?? "https://perfil-primero.web.app";
const password = process.env.E2E_PASSWORD ?? "PerfilPrimero2026!";
const runId = Date.now();

const accounts = [
  {
    role: "worker",
    path: "/postulante",
    email: process.env.E2E_WORKER_EMAIL ?? `e2e.worker.${runId}@perfilprimero.cl`,
    mode: process.env.E2E_WORKER_EMAIL ? "login" : "register",
    expected: /perfil.*activo|mi perfil|cerrar sesion|panel.*postulante|paso.*\d/i
  },
  {
    role: "company",
    path: "/empresa",
    email: process.env.E2E_COMPANY_EMAIL ?? `e2e.company.${runId}@perfilprimero.cl`,
    mode: process.env.E2E_COMPANY_EMAIL ? "login" : "register",
    expected: /buscar talento|panel.*empresa|cerrar sesion|dashboard|verificac/i
  },
  // Admin solo se prueba si las credenciales llegan por variables de entorno —
  // nunca contraseñas hardcodeadas en el repo.
  ...(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD ? [{
    role: "admin",
    path: "/consola-admin",
    email: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD,
    mode: "login",
    expected: /consola operativa|control interno|empresas|pagos/i
  }] : [])
];

const chromePath = process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await playwright.chromium.launch({
  executablePath: chromePath,
  headless: process.env.HEADED !== "1"
});

const results = [];

for (const account of accounts) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const label = `[${account.role}]`;

  try {
    console.log(`${label} Navegando a ${baseUrl}${account.path}`);
    await page.goto(`${baseUrl}${account.path}`, { waitUntil: "networkidle", timeout: 30_000 });

    // Si ya hay sesión activa (no aparece formulario de email)
    const bodyBefore = await page.locator("body").innerText();
    const hasEmailForm = /Correo electr|Usuario o email/i.test(bodyBefore);
    if (!hasEmailForm) {
      const ok = account.expected.test(bodyBefore);
      results.push({ role: account.role, ok, note: "Sesión preexistente detectada." });
      console.log(`${label} ${ok ? "OK" : "FAIL"} — sesión preexistente`);
      await page.close();
      continue;
    }

    if (account.role === "admin") {
      // Panel admin tiene su propio formulario
      await page.getByLabel("Usuario o email").fill(account.email);
      await page.getByLabel("Contraseña").fill(account.password ?? password);
      await page.getByRole("button", { name: "Entrar al panel" }).click();
    } else {
      // Postulante y empresa usan AuthCard con tabs
      if (account.mode === "login") {
        await page.getByRole("button", { name: "Iniciar sesión" }).first().click();
        await page.waitForTimeout(300);
      }
      await page.getByLabel("Correo electrónico").fill(account.email);
      await page.getByLabel("Contraseña").fill(account.password ?? password);
      const btnName = account.mode === "register" ? /Crear cuenta/i : /Entrar/i;
      await page.getByRole("button", { name: btnName }).last().click();
    }

    // Esperar resultado (máx 20s)
    await page.waitForFunction(
      (expected) => {
        const body = document.body.innerText;
        return new RegExp(expected, "i").test(body) ||
          /No se pudo|Firebase: Error|auth\/invalid|demasiados intentos/i.test(body);
      },
      account.expected.source,
      { timeout: 20_000 }
    ).catch(() => null);

    const text = await page.locator("body").innerText();
    const ok = account.expected.test(text) &&
      !/No se pudo|Firebase: Error|auth\/invalid|demasiados intentos/i.test(text);

    const screenshot = `public/e2e-${account.role}.png`;
    await page.screenshot({ path: `${process.cwd()}/${screenshot}`, fullPage: true });
    results.push({ role: account.role, ok, email: account.email, screenshot });
    console.log(`${label} ${ok ? "OK" : "FAIL"} — ${account.email}`);
    if (!ok) console.log(`${label} Texto recibido: ${text.slice(0, 200)}`);

  } catch (err) {
    results.push({ role: account.role, ok: false, error: String(err) });
    console.error(`${label} ERROR: ${err}`);
  }

  await page.close();
}

await browser.close();

console.log("\n=== RESULTADOS ===");
console.log(JSON.stringify(results, null, 2));

if (results.some((r) => !r.ok)) process.exit(1);
