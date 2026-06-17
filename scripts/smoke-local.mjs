const playwright = await import(
  "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
);

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const root = process.cwd();
const browser = await playwright.chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const checks = [
  { path: "/", text: "Publica tu perfil y que las empresas te ofrezcan trabajo", name: "home" },
  { path: "/postulante", text: "Crea un perfil visible sin exponer tus datos privados.", name: "worker" },
  { path: "/empresa", text: "Encuentra postulantes disponibles y contacta con reglas claras.", name: "company" },
  { path: "/omil", text: "Carga institucional gratuita de postulantes", name: "omil" },
  { path: "/consola-admin", text: "Verifica empresas antes de abrir contacto con postulantes.", name: "admin" },
  { path: "/precios", text: "Pagas por visibilidad y por resultados", name: "pricing" },
  { path: "/legal/privacidad", text: "Politica de privacidad", name: "privacy" },
  { path: "/legal/terminos", text: "Terminos de uso", name: "terms" }
];

const viewports = [
  { suffix: "local", width: 1366, height: 900 },
  { suffix: "mobile", width: 390, height: 844 }
];

const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });

  for (const check of checks) {
    const shot = `${check.name}-${viewport.suffix}.png`;
    await page.goto(`${baseUrl}${check.path}`, { waitUntil: "domcontentloaded" });
    await page.locator("body").filter({ hasText: check.text }).waitFor({ timeout: 15000 });
    const content = await page.locator("body").innerText();
    await page.screenshot({ path: `${root}/public/${shot}`, fullPage: true });
    results.push({
      path: check.path,
      viewport: viewport.suffix,
      ok: content.includes(check.text),
      expectedText: check.text,
      screenshot: `${root}/public/${shot}`
    });
  }

  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
