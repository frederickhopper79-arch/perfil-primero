import { pathToFileURL } from "node:url";

const playwright = await import(
  "file:///C:/Users/fabia/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright/index.mjs"
);

const root = process.cwd();
const previewUrl = pathToFileURL(`${root}/public/preview.html`).href;
const screenshotPath = `${root}/public/preview-screenshot.png`;

const browser = await playwright.chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto(previewUrl);
await page.screenshot({ path: screenshotPath, fullPage: true });
const title = await page.title();
const h1 = await page.locator("h1").innerText();
await browser.close();

console.log(JSON.stringify({ title, h1, screenshotPath }, null, 2));
