/* openreel-video 嵌入实测：欢迎屏挂载 + 新建项目进编辑器 + 错误收集 + 截图 */
import { chromium } from "playwright-core";

const BASE = process.env.OPENREEL_BASE || "http://127.0.0.1:3300";
const results = [];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message.slice(0, 300)}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[console] ${m.text().slice(0, 300)}`);
  });

  // ── 1. 欢迎屏挂载 ──
  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForFunction(
      () => document.querySelector("#root")?.children.length > 0,
      { timeout: 30000 }
    );
    await page.waitForTimeout(2500); // 等懒加载组件/字体稳定
    const rootHtmlLen = await page.evaluate(() => document.querySelector("#root").innerHTML.length);
    const hasSpinner = await page.locator(".animate-spin").count();
    console.log(`  welcome mounted: root html ${rootHtmlLen} chars, spinners=${hasSpinner}`);
    console.log(`  welcome ${rootHtmlLen > 2000 ? "PASS" : "FAIL"}`);
    results.push({ name: "welcome-mount", ok: rootHtmlLen > 2000 });
    await page.screenshot({ path: "test-fixtures/openreel-welcome.png" });
  } catch (e) {
    console.log(`  welcome FAIL: ${e.message.slice(0, 200)}`);
    results.push({ name: "welcome-mount", ok: false });
  }

  // ── 2. 深链接：全新 context 直接加载 #/new?preset=tiktok → 编辑器挂载 ──
  try {
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await ctx2.newPage();
    page2.on("pageerror", (e) => errors.push(`[deep-link pageerror] ${e.message.slice(0, 300)}`));
    page2.on("console", (m) => {
      if (m.type() === "error") errors.push(`[deep-link console] ${m.text().slice(0, 300)}`);
    });
    await page2.goto(`${BASE}/index.html#/new?preset=tiktok`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page2.waitForFunction(
      () => {
        const root = document.querySelector("#root");
        if (!root || root.children.length === 0) return false;
        const html = root.innerHTML;
        return (
          document.querySelector(".bg-tl-bg") !== null ||
          (root.querySelector("canvas") !== null && html.length > 20000) ||
          (html.length > 30000 && !html.includes("Opening project"))
        );
      },
      { timeout: 60000 }
    );
    await page2.waitForTimeout(3000); // 等播放器/预览初始化
    const info = await page2.evaluate(() => ({
      canvases: document.querySelectorAll("canvas").length,
      buttons: document.querySelectorAll("button").length,
      rootLen: document.querySelector("#root").innerHTML.length,
      hash: location.hash,
    }));
    console.log(`  deep-link editor: canvases=${info.canvases} buttons=${info.buttons} root=${info.rootLen} hash=${info.hash}`);
    const ok = info.rootLen > 20000;
    console.log(`  deep-link ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "editor-deep-link", ok });
    await page2.screenshot({ path: "test-fixtures/openreel-editor.png" });
    await ctx2.close();
  } catch (e) {
    console.log(`  deep-link FAIL: ${e.message.slice(0, 200)}`);
    results.push({ name: "editor-deep-link", ok: false });
    try { await page.screenshot({ path: "test-fixtures/openreel-editor-fail.png" }); } catch {}
  }

  // ── 3. 真实用户流程：欢迎屏 → 点 Create Project → 编辑器挂载 ──
  try {
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page3 = await ctx3.newPage();
    page3.on("pageerror", (e) => errors.push(`[flow pageerror] ${e.message.slice(0, 300)}`));
    await page3.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page3.waitForFunction(() => document.querySelector("#root")?.children.length > 0, { timeout: 30000 });
    await page3.waitForTimeout(1500);
    // 欢迎屏是格式卡片：Vertical/Horizontal/Square → 点卡片（可能进 StartFromScratch 再点 Create Project）
    await page3.locator("div,button").filter({ hasText: /^Vertical/ }).first().click({ timeout: 15000 });
    await page3.waitForTimeout(800);
    const createBtn = page3.locator("button").filter({ hasText: /Create Project|Open editor/ }).first();
    if (await createBtn.count()) {
      await createBtn.click({ timeout: 10000 }).catch(() => {});
    }
    await page3.waitForFunction(
      () => {
        const root = document.querySelector("#root");
        if (!root) return false;
        const html = root.innerHTML;
        return (
          document.querySelector(".bg-tl-bg") !== null ||
          (root.querySelector("canvas") !== null && html.length > 20000) ||
          (html.length > 30000 && !html.includes("Opening project"))
        );
      },
      { timeout: 60000 }
    );
    await page3.waitForTimeout(2500);
    const info = await page3.evaluate(() => ({
      canvases: document.querySelectorAll("canvas").length,
      buttons: document.querySelectorAll("button").length,
      rootLen: document.querySelector("#root").innerHTML.length,
      hash: location.hash,
    }));
    console.log(`  click-flow editor: canvases=${info.canvases} buttons=${info.buttons} root=${info.rootLen} hash=${info.hash}`);
    const ok = info.rootLen > 20000;
    console.log(`  click-flow ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "editor-click-flow", ok });
    await page3.screenshot({ path: "test-fixtures/openreel-editor-flow.png" });
    await ctx3.close();
  } catch (e) {
    console.log(`  click-flow FAIL: ${e.message.slice(0, 250)}`);
    results.push({ name: "editor-click-flow", ok: false });
    try { await page.screenshot({ path: "test-fixtures/openreel-editor-fail.png" }); } catch {}
  }

  // ── 4. 集成实测：toolbox-hub 工具页 + iframe 内编辑器挂载 ──
  const SITE = process.env.SITE_BASE || "http://localhost:3100";
  try {
    const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page4 = await ctx4.newPage();
    page4.on("pageerror", (e) => errors.push(`[site pageerror] ${e.message.slice(0, 300)}`));
    await page4.goto(`${SITE}/tools/openreel-video-editor/`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const frame = page4.frameLocator('iframe[src*="/embed/openreel/"]');
    // 等 iframe 内 React 挂载（#root 有子节点）
    await page4.waitForFunction(
      () => {
        const f = document.querySelector('iframe[src*="/embed/openreel/"]');
        if (!f?.contentDocument) return false;
        const root = f.contentDocument.querySelector("#root");
        return !!root && root.children.length > 0;
      },
      { timeout: 60000 }
    );
    await page4.waitForTimeout(2000);
    const info = await page4.evaluate(() => {
      const f = document.querySelector('iframe[src*="/embed/openreel/"]');
      const root = f.contentDocument.querySelector("#root");
      return {
        rootLen: root.innerHTML.length,
        height: f.getBoundingClientRect().height,
        title: document.title,
      };
    });
    console.log(`  site iframe: root=${info.rootLen} iframeH=${Math.round(info.height)} title="${info.title}"`);
    const ok = info.rootLen > 2000 && info.height > 400;
    console.log(`  site-integration ${ok ? "PASS" : "FAIL"}`);
    results.push({ name: "site-integration", ok });
    await page4.screenshot({ path: "test-fixtures/openreel-site.png" });
    await ctx4.close();
  } catch (e) {
    console.log(`  site-integration FAIL: ${e.message.slice(0, 250)}`);
    results.push({ name: "site-integration", ok: false });
  }

  // ── 5. 错误报告（过滤良性：SW scope 注册失败 / favicon / COEP 提示） ──
  const benign = /service worker|sw\.js|favicon|manifest\.json|COEP|Cross-Origin|net::ERR_FAILED.*3300/i;
  const fatal = errors.filter((e) => !benign.test(e));
  console.log(`\n  console/page errors: ${errors.length} total, ${fatal.length} after benign filter`);
  fatal.slice(0, 10).forEach((e) => console.log(`    ${e}`));
  results.push({ name: "no-fatal-errors", ok: fatal.length === 0 });

  await browser.close();

  const passed = results.filter((r) => r.ok).length;
  console.log(`\n===== ${passed}/${results.length} passed =====`);
  process.exit(passed === results.length ? 0 : 1);
})();
