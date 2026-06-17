const playwright = await import(
  "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
);

const email = `postulante.demo.${Date.now()}@example.com`;
const password = "PerfilPrimeroDemo123!";
const browser = await playwright.chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

await page.goto("https://perfil-primero.web.app/postulante", { waitUntil: "domcontentloaded" });
await page.locator("input[type='email']").first().fill(email);
await page.locator("input[type='password']").first().fill(password);
await page.getByRole("button", { name: "Crear cuenta" }).first().click();
try {
  await page.getByText("SESION POSTULANTE").waitFor({ timeout: 20000 });
} catch {
  await page.screenshot({ path: `${process.cwd()}/public/live-worker-smoke-error.png`, fullPage: true });
  const text = await page.locator("body").innerText();
  await browser.close();
  console.log(JSON.stringify({ ok: false, email, text, screenshot: "public/live-worker-smoke-error.png" }, null, 2));
  process.exit(1);
}
await page.getByRole("button", { name: /Guardar perfil/ }).click();
await page.getByText(/Perfil guardado|No se pudo guardar/).waitFor({ timeout: 20000 });
const textAfterSave = await page.locator("body").innerText();
if (/No se pudo guardar/i.test(textAfterSave)) {
  await page.screenshot({ path: `${process.cwd()}/public/live-worker-smoke-error.png`, fullPage: true });
  await browser.close();
  console.log(JSON.stringify({ ok: false, email, text: textAfterSave, screenshot: "public/live-worker-smoke-error.png" }, null, 2));
  process.exit(1);
}
await page.screenshot({ path: `${process.cwd()}/public/live-worker-smoke.png`, fullPage: true });
await browser.close();

console.log(JSON.stringify({ ok: true, email, screenshot: "public/live-worker-smoke.png" }, null, 2));
