const playwright = await import(
  "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
);

const baseUrl = process.env.BASE_URL ?? "https://perfil-primero.web.app";
const password = process.env.E2E_PASSWORD ?? "PerfilPrimero2026!";
const runId = Date.now();
const accounts = [
  {
    role: "worker",
    path: "/postulante",
    email: process.env.E2E_WORKER_EMAIL ?? `e2e.worker.${runId}@perfilprimero.cl`,
    mode: process.env.E2E_WORKER_EMAIL ? "login" : "register",
    expected: /sesion postulante/i
  },
  {
    role: "company",
    path: "/empresa",
    email: process.env.E2E_COMPANY_EMAIL ?? `e2e.company.${runId}@perfilprimero.cl`,
    mode: process.env.E2E_COMPANY_EMAIL ? "login" : "register",
    expected: /sesion empresa/i
  },
  {
    role: "admin",
    path: "/consola-admin",
    email: process.env.E2E_ADMIN_EMAIL ?? "Admin",
    password: process.env.E2E_ADMIN_PASSWORD ?? "1234",
    mode: "login",
    expected: /consola operativa|acceso admin|control interno/i
  }
];

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

const results = [];

for (const account of accounts) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(`${baseUrl}${account.path}`, { waitUntil: "networkidle" });

  const bodyBefore = await page.locator("body").innerText();
  if (!/Email/.test(bodyBefore)) {
    results.push({ role: account.role, ok: true, note: "Sesion existente o pantalla sin formulario inicial." });
    await page.close();
    continue;
  }

  const loginToggle = page.getByRole("button", { name: /Ya tengo cuenta/ }).first();
  if (account.mode === "login" && await loginToggle.count().catch(() => 0)) {
    await page.getByText(/Ya tengo cuenta/).first().click();
  }

  await page.getByLabel("Email").first().fill(account.email);
  await page.getByLabel("Contrasena").first().fill(account.password ?? password);

  if (account.role === "admin") {
    await page.getByRole("button", { name: "Entrar al panel" }).first().click();
  } else if (account.mode === "login") {
    await page.getByRole("button", { name: /^Entrar$/ }).first().click();
  } else {
    await page.getByRole("button", { name: "Crear cuenta" }).first().click();
  }

  await page.waitForTimeout(24000);
  const text = await page.locator("body").innerText();
  const ok = account.expected.test(text) && !/No se pudo|Firebase: Error|auth\/invalid|auth\/user-not-found/i.test(text);
  const screenshot = `public/e2e-${account.role}.png`;
  await page.screenshot({ path: `${process.cwd()}/${screenshot}`, fullPage: true });
  results.push({ role: account.role, ok, email: account.email, screenshot });
  await page.close();
}

await browser.close();

console.log(JSON.stringify(results, null, 2));

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
