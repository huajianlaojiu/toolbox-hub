/* 站点功能实测：语言切换 + 暗色主题 + SEO 区块双语 */
import { chromium } from "playwright-core";

const results = [];
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();

  // ── 1. 暗色主题 ──
  await page.goto("http://localhost:3100/tools/video-compressor/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const before = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains("dark"),
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  await page.locator('button[aria-label*="dark"], button[title*="dark"]').first().click();
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => ({
    dark: document.documentElement.classList.contains("dark"),
    bg: getComputedStyle(document.body).backgroundColor,
    stored: localStorage.getItem("tb-theme"),
  }));
  // 刷新后保持
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const persisted = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  results.push({
    name: "dark-theme toggle + persist",
    ok: !before.dark && after.dark && after.stored === "dark" && persisted && after.bg !== before.bg,
    detail: `before=${JSON.stringify(before)} after=${JSON.stringify(after)} persisted=${persisted}`,
  });

  // ── 2. 语言切换（导航 + 工具页 SEO 区块）──
  await page.goto("http://localhost:3100/tools/video-compressor/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.locator("header button").filter({ hasText: "中" }).first().click();
  await page.waitForTimeout(800);
  const zh = await page.evaluate(() => ({
    nav: document.body.innerText.includes("首页"),
    h1: document.querySelector("h1")?.textContent || "",
    about: document.body.innerText.includes("关于视频压缩") || document.body.innerText.includes("关于"),
    faq: document.body.innerText.includes("常见问题"),
    stored: localStorage.getItem("tb-lang"),
    url: location.search,
  }));
  results.push({
    name: "lang switch to zh (nav + h1 + seo)",
    ok: zh.nav && /视频压缩/.test(zh.h1) && zh.about && zh.faq && zh.stored === "zh",
    detail: JSON.stringify(zh),
  });

  // 刷新后保持中文
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const zhPersist = await page.evaluate(() => ({
    nav: document.body.innerText.includes("首页"),
    h1: document.querySelector("h1")?.textContent || "",
  }));
  results.push({
    name: "lang persist after reload",
    ok: zhPersist.nav && /视频压缩/.test(zhPersist.h1),
    detail: JSON.stringify(zhPersist),
  });

  // ── 3. 切回英文 ──
  await page.locator("header button").filter({ hasText: "EN" }).first().click();
  await page.waitForTimeout(600);
  const en = await page.evaluate(() => ({
    nav: document.body.innerText.includes("Home"),
    h1: document.querySelector("h1")?.textContent || "",
  }));
  results.push({
    name: "lang switch back to en",
    ok: en.nav && /Video Compressor/.test(en.h1),
    detail: JSON.stringify(en),
  });

  // ── 4. 中文首页 + 工具列表卡片 ──
  await page.goto("http://localhost:3100/tools/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.locator("header button").filter({ hasText: "中" }).first().click();
  await page.waitForTimeout(800);
  const listZh = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("[data-cat]"));
    const videoCard = cards.find((c) => c.getAttribute("data-cat") === "Video");
    return {
      total: cards.length,
      videoCardTitle: videoCard?.querySelector("h3")?.textContent || "",
      hasVideoCard: !!videoCard,
    };
  });
  results.push({
    name: "tools list zh + video cards",
    ok: listZh.hasVideoCard && /视频压缩|视频|音频/.test(listZh.videoCardTitle),
    detail: JSON.stringify(listZh),
  });

  await browser.close();
  let pass = 0;
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
    if (!r.ok) console.log(`      ${r.detail}`);
    if (r.ok) pass++;
  }
  console.log(`\n===== ${pass}/${results.length} passed =====`);
  process.exit(pass === results.length ? 0 : 1);
})();
