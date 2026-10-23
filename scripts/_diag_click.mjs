// 交互诊断：点分类按钮 + 点工具卡片，抓 console 错误与导航结果。
// 用法：node scripts/_diag_click.mjs <url> [--lang xx]
import { chromium } from "playwright-core";

const url = process.argv[2] || "http://127.0.0.1:8899/";
const mobile = process.argv.includes("--mobile");
const browser = await chromium.launch({ channel: "msedge" });
const errors = [];
const page = await browser.newPage(
  mobile
    ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" }
    : { viewport: { width: 1280, height: 900 } }
);
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 200));
});
page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e.message).slice(0, 200)));

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(2500); // 给 hydration 留时间

// ---- 1. 分类按钮点击 ----
const btns = await page.$$(".filter-btn");
console.log("filter-btn 数量:", btns.length);
const before = await page.$$eval("#tools-grid > *", (n) => n.length);
console.log("点击前网格子元素:", before);
if (btns.length > 3) {
  const label = await btns[3].getAttribute("data-filter");
  await btns[3].click();
  await page.waitForTimeout(600);
  const after = await page.$$eval("#tools-grid > *", (n) => n.length);
  const visible = await page.$$eval("#tools-grid > *", (n) => n.filter((x) => x.offsetParent !== null).length);
  const count = await page.$eval("#filter-count", (n) => n.textContent).catch(() => "?");
  console.log(`点击 [${label}] 后: 子元素 ${after} | 可见 ${visible} | #filter-count=${count}`);
} else {
  console.log("按钮不足，跳过点击");
}

// ---- 2. 工具卡片点击（先重置到「所有工具」避免卡片被筛掉）----
const allBtn = await page.$('.filter-btn[data-filter="All Tools"]');
if (allBtn) await allBtn.click();
await page.waitForTimeout(300);
const cards = await page.$$("#tools-grid a[data-cat]");
console.log("工具卡片数量:", cards.length);
if (cards.length > 0) {
  const href = await cards[0].getAttribute("href");
  const title = (await cards[0].innerText()).split("\n")[0];
  // 记录点击前的 URL，点击后等导航
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 8000 }).catch(() => null),
    cards[0].click(),
  ]);
  console.log(`点击卡片「${title}」 href=${href}`);
  console.log("导航后 URL:", page.url());
  console.log("新页面标题:", await page.title());
}

console.log("=== console 错误 ===");
console.log(errors.length ? errors.slice(0, 8).join("\n") : "（无）");
await browser.close();
