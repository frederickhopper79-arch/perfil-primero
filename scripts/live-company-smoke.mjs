const playwright = await import(
  "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
);

const baseUrl = process.env.BASE_URL ?? "https://perfil-primero.web.app";
const email = `empresa.demo.${Date.now()}@example.com`;
const password = "PerfilPrimeroDemo123!";

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
  await page.goto(`${baseUrl}/empresa`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => undefined);

  await fillStable(page, page.locator("input[type='email']").first(), email);
  await fillStable(page, page.locator("input[type='password']").first(), password);
  await page.getByRole("button", { name: "Crear cuenta" }).first().click();
  await page.getByText("Sesion empresa").waitFor({ timeout: 30000 });

  const companyForm = page.locator("form.formSurface").first();
  const companyInputs = companyForm.locator("input");
  await fillStable(page, companyInputs.nth(0), "Empresa Demo Perfil Primero");
  await fillStable(page, companyInputs.nth(1), "Empresa Demo Perfil Primero SpA");
  await fillStable(page, companyInputs.nth(2), "76.123.456-7");
  await fillStable(page, companyInputs.nth(3), "https://empresa-demo.perfilprimero.test");
  await companyForm.locator("select").nth(2).selectOption("Tecnologia, Sistemas y Telecomunicaciones");
  await page.getByRole("button", { name: "Guardar empresa" }).click();
  await page.getByText(/Empresa enviada a revision|Completa nombre/).waitFor({ timeout: 30000 });

  const afterCompany = await page.locator("body").innerText();
  if (/Completa nombre/i.test(afterCompany)) {
    throw new Error("La empresa no se guardo: faltan datos requeridos.");
  }

  await page.getByRole("button", { name: "Publicaciones" }).click();
  await page.getByRole("button", { name: "Guardar publicacion" }).click();
  await page.getByText(/Publicacion guardada|Revisa el sueldo|Completa cargo/).waitFor({ timeout: 30000 });

  const text = await page.locator("body").innerText();
  const ok =
    /Revision pendiente/i.test(text) &&
    /Publicacion guardada/i.test(text) &&
    /Ejecutivo comercial B2B/i.test(text) &&
    !/Firebase: Error|No se pudo guardar|permission-denied|Missing or insufficient permissions/i.test(text);

  const screenshot = ok ? "public/live-company-smoke.png" : "public/live-company-smoke-error.png";
  await page.screenshot({ path: `${process.cwd()}/${screenshot}`, fullPage: true });
  await browser.close();

  console.log(JSON.stringify({ ok, email, screenshot }, null, 2));

  if (!ok) {
    process.exit(1);
  }
} catch (error) {
  const screenshot = "public/live-company-smoke-error.png";
  const text = await page.locator("body").innerText().catch(() => "");
  await page.screenshot({ path: `${process.cwd()}/${screenshot}`, fullPage: true }).catch(() => undefined);
  await browser.close();
  console.log(JSON.stringify({ ok: false, email, screenshot, text, error: error instanceof Error ? error.message : String(error) }, null, 2));
  process.exit(1);
}
