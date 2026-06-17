const playwright = await import(
  "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
);

const email = `postulante.cv.${Date.now()}@example.com`;
const password = "PerfilPrimeroDemo123!";
const baseUrl = process.env.BASE_URL ?? "https://perfil-primero.web.app";
const cvPath = `${process.cwd()}/scripts/fixtures/worker-cv.txt`;

async function fillStable(page, locator, value) {
  await locator.waitFor({ state: "visible", timeout: 20000 });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await locator.fill(value);
    await locator.dispatchEvent("input");
    await locator.dispatchEvent("change");
    await page.waitForTimeout(500);
    if (await locator.inputValue() === value) {
      return;
    }
  }
  throw new Error(`No se pudo completar el campo con valor ${value}`);
}

const browser = await playwright.chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

try {
  await page.goto(`${baseUrl}/postulante`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await fillStable(page, page.locator("input[type='email']").first(), email);
  await fillStable(page, page.locator("input[type='password']").first(), password);
  await page.getByRole("button", { name: "Crear cuenta" }).first().click();
  await page.getByText("SESION POSTULANTE").waitFor({ timeout: 30000 });

  await page.setInputFiles("input[type='file']", cvPath);
  await page.getByRole("button", { name: /Analizar CV con Google IA/ }).click();
  await page.getByText(/CV analizado y perfil actualizado|CV subido y perfil base creado|La IA de Google no tiene cuota|No se pudo analizar/).waitFor({ timeout: 60000 });

  const text = await page.locator("body").innerText();
  const ok =
    /CV analizado y perfil actualizado|CV subido y perfil base creado/.test(text) &&
    !/Sin CV analizado/i.test(text) &&
    !/Gemini no pudo responder|RESOURCE_EXHAUSTED|quotaFailure/i.test(text);
  const screenshot = ok ? "public/live-worker-cv-smoke.png" : "public/live-worker-cv-smoke-error.png";
  await page.screenshot({ path: `${process.cwd()}/${screenshot}`, fullPage: true });
  await browser.close();

  console.log(JSON.stringify({ ok, email, screenshot, quotaFallback: /cuota de Google/i.test(text) }, null, 2));

  if (!ok) {
    process.exit(1);
  }
} catch (error) {
  const screenshot = "public/live-worker-cv-smoke-error.png";
  const text = await page.locator("body").innerText().catch(() => "");
  await page.screenshot({ path: `${process.cwd()}/${screenshot}`, fullPage: true }).catch(() => undefined);
  await browser.close();
  console.log(JSON.stringify({ ok: false, email, screenshot, text, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
}
