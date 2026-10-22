/* 用 playwright-core + 系统 Chrome 实测 ffmpeg.wasm blob worker 方案 */
import { chromium } from "playwright-core";

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("  [console:" + m.type() + "] " + m.text().slice(0, 200)));
  page.on("pageerror", (e) => console.log("  [pageerror] " + e.message.slice(0, 300)));
  page.on("requestfailed", (r) => console.log("  [reqfail] " + r.url().slice(0, 120) + " :: " + (r.failure() || {}).errorText));

  const t0 = Date.now();
  await page.goto("http://127.0.0.1:8899/test-ffmpeg.html", { waitUntil: "domcontentloaded", timeout: 60000 });
  try {
    await page.waitForFunction(
      () => /PASS|FAIL|ERROR/.test(document.getElementById("result").textContent),
      { timeout: 180000 }
    );
  } catch (e) {
    console.log("waitForFunction timeout after " + ((Date.now() - t0) / 1000).toFixed(0) + "s");
  }
  const result = await page.evaluate(() => document.getElementById("result").textContent);
  const title = await page.title();
  console.log("---- RESULT (title=" + title + ", " + ((Date.now() - t0) / 1000).toFixed(1) + "s) ----");
  console.log(result);
  await browser.close();
  process.exit(0);
})();
