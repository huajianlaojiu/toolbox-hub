// 生产站点（CDN 部署版本）核验：暗色主题 + 中英双语 + 16 个短视频工具 hydration
import { chromium } from "playwright-core";

const BASE = process.env.SITE_BASE || "https://toolbox-hub.io";
const TOOLS = [
  "video-compressor", "video-converter", "video-merger", "video-speed-changer",
  "video-transformer", "video-trimmer", "video-to-gif", "video-to-audio",
  "video-frame-capture", "audio-converter", "audio-trimmer",
  "pilko-frame-studio", "viral-video-studio", "teleprompter", "subtitle-editor",
  "openreel-video-editor",
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--no-sandbox"],
});
const results = [];
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// ── 1. 暗色主题切换（生产 CSS 生效） ──
try {
  await page.goto(`${BASE}/tools/`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  const btn = page.locator("header button[aria-label]").first();
  await btn.click({ timeout: 20000 });
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // 再从 localStorage 持久化维度确认
  const stored = await page.evaluate(() => localStorage.getItem("tb-theme"));
  const ok = before !== after && stored === (after ? "dark" : "light");
  console.log(`  dark toggle: ${before} -> ${after} | bg=${bg} | stored=${stored}  ${ok ? "PASS" : "FAIL"}`);
  results.push({ name: "dark-theme", ok });
  await btn.click({ timeout: 10000 }).catch(() => {});
} catch (e) {
  console.log(`  dark toggle FAIL: ${e.message.slice(0, 160)}`);
  results.push({ name: "dark-theme", ok: false });
}

// ── 2. 中英双语切换（含持久化） ──
try {
  await page.goto(`${BASE}/tools/`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(3000);
  // 双向切换：EN（应无中文）→ 中（应有中文），并校验 localStorage 持久化
  await page.locator("header button").filter({ hasText: /^EN$/ }).first().click({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const enText = await page.evaluate(() => document.querySelector("header")?.innerText || "");
  const enStored = await page.evaluate(() => localStorage.getItem("tb-lang"));

  await page.locator("header button").filter({ hasText: /^中$/ }).first().click({ timeout: 20000 });
  await page.waitForTimeout(1500);
  const zhText = await page.evaluate(() => document.querySelector("header")?.innerText || "");
  const zhStored = await page.evaluate(() => localStorage.getItem("tb-lang"));

  const enClean = !/[\u4e00-\u9fa5]/.test(enText.replace(/中/g, ""));
  const zhShown = /[\u4e00-\u9fa5]/.test(zhText);
  const ok = enClean && zhShown && enStored === "en" && zhStored === "zh";
  console.log(
    `  i18n switch: EN(clean=${enClean},stored=${enStored}) -> ZH(shown=${zhShown},stored=${zhStored})  ${ok ? "PASS" : "FAIL"}`
  );
  results.push({ name: "i18n-switch", ok });
} catch (e) {
  console.log(`  i18n switch FAIL: ${e.message.slice(0, 160)}`);
  results.push({ name: "i18n-switch", ok: false });
}

// ── 3. 16 个工具页 hydration（React fiber + 工具自身容器 + 零运行时错误） ──
for (const slug of TOOLS) {
  const p2 = await ctx.newPage();
  const perr = [];
  p2.on("pageerror", (e) => perr.push(e.message.slice(0, 150)));
  try {
    await p2.goto(`${BASE}/tools/${slug}/`, { waitUntil: "load", timeout: 120000 });
    await p2.waitForTimeout(3500);
    const info = await p2.evaluate(() => {
      const hydrated = Array.from(document.querySelectorAll("*")).some((e) =>
        Object.keys(e).some((k) => k.startsWith("__react"))
      );
      return {
        hydrated,
        fileInput: document.querySelectorAll("input[type=file]").length,
        iframe: document.querySelectorAll("iframe").length,
        textarea: document.querySelectorAll("textarea").length,
        len: document.body.innerText.length,
      };
    });
    const hasSurface = info.fileInput + info.iframe + info.textarea > 0;
    const ok = info.hydrated && hasSurface && info.len > 500 && perr.length === 0;
    console.log(
      `  ${slug.padEnd(24)} hydrated=${info.hydrated} file=${info.fileInput} iframe=${info.iframe} ta=${info.textarea} len=${info.len} ${ok ? "PASS" : "FAIL"} ${perr[0] || ""}`
    );
    results.push({ name: slug, ok });
  } catch (e) {
    console.log(`  ${slug.padEnd(24)} FAIL: ${e.message.slice(0, 120)}`);
    results.push({ name: slug, ok: false });
  }
  await p2.close();
}

await browser.close();
const pass = results.filter((r) => r.ok).length;
console.log(`\n=== ${pass}/${results.length} PASS ===`);
process.exit(pass === results.length ? 0 : 1);
