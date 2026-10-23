// 工具页交互诊断：打开 json-formatter，输入 JSON，点格式化，看是否有输出。
import { chromium } from "playwright-core";

const url = process.argv[2] || "https://toolbox-hub.io/zh/tools/json-formatter/";
const browser = await chromium.launch({ channel: "msedge" });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 150)); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e.message).slice(0, 150)));

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(2500);

// 找输入框
const ta = await page.$("textarea");
console.log("textarea 数量:", ta ? 1 : 0);
if (ta) {
  await ta.fill('{"a":1,"b":[2,3]}');
  // 找主按钮
  const btns = await page.$$("button");
  console.log("按钮数量:", btns.length);
  const labels = [];
  for (const b of btns.slice(0, 12)) labels.push((await b.innerText()).replace(/\n/g, " ").slice(0, 20));
  console.log("按钮标签:", JSON.stringify(labels));
  // 点第一个看起来像动作的按钮
  for (const b of btns) {
    const t = (await b.innerText()).trim();
    if (/格式化|Format|美化|校验/i.test(t)) { await b.click(); console.log("已点击按钮:", t); break; }
  }
  await page.waitForTimeout(800);
  const out = await page.$$eval("textarea", (ns) => ns.map((n) => n.value.slice(0, 80)));
  console.log("点击后 textarea 值:", JSON.stringify(out));
}
console.log("=== console 错误 ===");
console.log(errors.length ? errors.slice(0, 6).join("\n") : "（无）");
await browser.close();
