// 视觉验证脚本：用系统 Edge 打开本地构建产物，截语言菜单图。
// 用法：node scripts/_shot.mjs <url> <输出png> [--menu]
import { chromium } from "playwright-core";

const url = process.argv[2] || "http://127.0.0.1:8899/";
const out = process.argv[3] || "shot.png";
const openMenu = process.argv.includes("--menu");

const browser = await chromium.launch({ channel: "msedge" });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  if (openMenu) {
    await page.click(".lang-menu > button");
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: out, fullPage: false });
  console.log("saved:", out);
} finally {
  await browser.close();
}
