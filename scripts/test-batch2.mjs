/* 批次 2 实测：提词器 + 字幕编辑器 + 两个嵌入工具 */
import { chromium } from "playwright-core";
import path from "node:path";

const BASE = "http://localhost:3100";
const results = [];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  [pageerror] ${e.message.slice(0, 200)}`));

  // ── 1. 提词器 ──
  try {
    await page.goto(`${BASE}/tools/teleprompter/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.locator("textarea").first().fill("Line one of the script.\nLine two of the script.\nLine three.");
    await page.locator("button").filter({ hasText: /Start presenting|开始演讲/ }).first().click();
    await page.waitForTimeout(600);
    const scroller = page.locator('[class*="overflow-y-auto"]').first();
    const before = await scroller.evaluate((el) => el.scrollTop);
    await page.locator("button").filter({ hasText: /^Play$|^播放$/ }).first().click();
    await page.waitForTimeout(1200);
    const after = await scroller.evaluate((el) => el.scrollTop);
    const ok = after > before;
    console.log(`  teleprompter scroll: ${before} -> ${after} ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "teleprompter", ok });
  } catch (e) {
    console.log(`  teleprompter FAIL: ${e.message.slice(0, 200)}`);
    results.push({ name: "teleprompter", ok: false });
  }

  // ── 2. 字幕编辑器：上传 SRT → 解析 → 编辑 → 导出 SRT ──
  try {
    await page.goto(`${BASE}/tools/subtitle-editor/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.locator('input[type="file"]').first().setInputFiles(path.resolve("test-fixtures/test.srt"));
    await page.waitForTimeout(800);
    const cueCount = await page.evaluate(() => document.body.innerText.includes("3 cues") || document.body.innerText.includes("3 条字幕"));
    const hasCueText = await page.evaluate(() => document.body.innerText.includes("This is a test subtitle"));
    // 编辑第一条文本
    await page.locator("textarea").first().fill("Edited first line");
    await page.waitForTimeout(300);
    // 整体平移 +1s
    await page.locator('input[type="number"]').first().fill("1");
    await page.locator("button").filter({ hasText: /Shift all|整体平移/ }).first().click();
    await page.waitForTimeout(300);
    const shifted = true; // 平移功能由导出内容的时间戳校验覆盖
    // 导出 SRT 并校验内容（编辑生效 + 整体平移 +1s 生效）
    const dlPromise = page.waitForEvent("download", { timeout: 10000 });
    await page.locator("button").filter({ hasText: /^SRT$/ }).first().click();
    const dl = await dlPromise;
    const dlPath = path.join(path.resolve("test-fixtures"), "exported.srt");
    await dl.saveAs(dlPath);
    const content = await import("node:fs").then((fs) => fs.readFileSync(dlPath, "utf-8"));
    const exportOk = content.includes("Edited first line") && content.includes("00:00:01,500 --> 00:00:03,000");
    const ok = cueCount && hasCueText && shifted && exportOk;
    console.log(`  subtitle-editor: parsed=${cueCount} shifted=${shifted} exportOk=${exportOk} ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "subtitle-editor", ok });
  } catch (e) {
    console.log(`  subtitle-editor FAIL: ${e.message.slice(0, 250)}`);
    results.push({ name: "subtitle-editor", ok: false });
  }

  // ── 3. Pilko iframe 嵌入 ──
  const waitIframe = async () => {
    await page.waitForFunction(() => {
      const ifr = document.querySelector("iframe");
      return ifr && ifr.contentWindow && ifr.contentWindow.document && ifr.contentWindow.document.body && ifr.contentWindow.document.body.innerText.length > 20;
    }, { timeout: 20000 });
  };
  try {
    await page.goto(`${BASE}/tools/pilko-frame-studio/`, { waitUntil: "domcontentloaded" });
    await waitIframe();
    const inner = await page.evaluate(() => document.querySelector("iframe").contentWindow.document.body.innerText);
    const hasUpload = await page.evaluate(() => document.querySelector("iframe").contentWindow.document.querySelectorAll('input[type="file"]').length);
    const ok = inner.length > 50 && hasUpload > 0;
    console.log(`  pilko embed: innerTextLen=${inner.length} fileInputs=${hasUpload} ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "pilko-frame-studio", ok });
  } catch (e) {
    console.log(`  pilko FAIL: ${e.message.slice(0, 200)}`);
    results.push({ name: "pilko-frame-studio", ok: false });
  }

  // ── 4. viral-video-studio iframe 嵌入 ──
  try {
    await page.goto(`${BASE}/tools/viral-video-studio/`, { waitUntil: "domcontentloaded" });
    await waitIframe();
    const inner = await page.evaluate(() => document.querySelector("iframe").contentWindow.document.body.innerText);
    const ok = inner.includes("爆款") || inner.includes("赛道");
    console.log(`  viral embed: innerTextLen=${inner.length} ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "viral-video-studio", ok });
  } catch (e) {
    console.log(`  viral FAIL: ${e.message.slice(0, 200)}`);
    results.push({ name: "viral-video-studio", ok: false });
  }

  await browser.close();
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n===== ${pass}/${results.length} passed =====`);
  process.exit(pass === results.length ? 0 : 1);
})();
