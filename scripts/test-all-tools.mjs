/* 全工具实测 v2：上传真实素材 → 触发处理 → 验证输出出现 */
import { chromium } from "playwright-core";
import path from "node:path";

const BASE = "http://localhost:3100";
const MP4 = path.resolve("test-fixtures/test.mp4");
const WAV = path.resolve("test-fixtures/test.wav");

const TOOLS = [
  {
    slug: "video-compressor", file: MP4, meta: true,
    action: /开始压缩|Compress/, done: /Download|下载/,
  },
  {
    slug: "video-converter", file: MP4, meta: true,
    action: /Convert to MP4|转换为 MP4/, done: /Download|下载/,
  },
  {
    slug: "video-speed-changer", file: MP4, meta: true,
    action: /Apply 2x|应用 2 倍速/, done: /Download|下载/,
  },
  {
    slug: "video-transformer", file: MP4, meta: true,
    pre: /Flip H|水平镜像/,
    action: /Apply & export|应用并导出/, done: /Download|下载/,
  },
  {
    slug: "video-trimmer", file: MP4, meta: true,
    action: /Trim & export|裁剪并导出/, done: /Download|下载/,
  },
  {
    slug: "video-to-gif", file: MP4, meta: true,
    action: /Convert to GIF|转换为 GIF/, done: /Download|下载/,
  },
  {
    slug: "video-to-audio", file: MP4, meta: true,
    action: /Extract MP3|提取 MP3/, done: /Download|下载/,
  },
  {
    slug: "video-frame-capture", file: MP4, meta: true,
    action: /Capture this frame|截取当前帧/, done: /Save|保存|Download all|打包下载/,
  },
  {
    slug: "video-merger", file: MP4, meta: false, multi: true,
    waitFor: /test\.mp4/,
    action: /Merge 2 videos|合并 2 个视频/, done: /Download|下载/,
  },
  {
    slug: "audio-converter", file: WAV, meta: false,
    waitFor: /test\.wav/,
    action: /开始转换|^Convert$/, done: /Download|下载/,
  },
  {
    slug: "audio-trimmer", file: WAV, meta: false,
    waitFor: /test\.wav/,
    action: /Trim & export|裁剪并导出/, done: /Download|下载/,
  },
];

const results = [];

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const ctx = await browser.newContext({ acceptDownloads: true });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(`[pageerror] ${e.message.slice(0, 250)}`));

  for (const t of TOOLS) {
    consoleErrors.length = 0;
    const label = t.slug;
    process.stdout.write(`\n=== ${label} ===\n`);
    const t0 = Date.now();
    try {
      await page.goto(`${BASE}/tools/${t.slug}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(800);

      // 上传
      const input = page.locator('input[type="file"]').first();
      await input.setInputFiles(t.multi ? [t.file, t.file] : t.file);

      // 等待就绪
      if (t.meta) {
        await page.waitForFunction(
          () => {
            const v = document.querySelector("video, audio");
            return v && v.duration > 0 && Number.isFinite(v.duration);
          },
          { timeout: 30000 }
        );
      } else {
        await page.waitForFunction(
          (kw) => kw.test(document.body.innerText),
          t.waitFor,
          { timeout: 30000 }
        );
      }
      await page.waitForTimeout(400);

      // 预处理（如 transformer 先选一个变换）
      if (t.pre) {
        const preBtn = page.locator("button").filter({ hasText: t.pre }).first();
        await preBtn.click();
        await page.waitForTimeout(200);
      }

      // 主动作按钮（文本匹配）
      const actionBtn = page.locator("button").filter({ hasText: t.action }).first();
      const btnText = (await actionBtn.textContent()) || "";
      if (!t.action.test(btnText)) throw new Error(`action button mismatch: "${btnText.trim()}"`);
      await actionBtn.click();

      // 等待结果
      await page.waitForFunction(
        (kw) => {
          const els = Array.from(document.querySelectorAll("button, a"));
          return els.some((b) => kw.test(b.textContent || ""));
        },
        t.done,
        { timeout: 180000 }
      );
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  PASS in ${secs}s`);
      results.push({ tool: label, ok: true, secs });
    } catch (e) {
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  FAIL after ${secs}s: ${e.message.slice(0, 250)}`);
      if (consoleErrors.length) console.log("  " + consoleErrors.slice(0, 3).join("\n  "));
      results.push({ tool: label, ok: false, err: e.message.slice(0, 250), secs });
    }
  }

  await browser.close();
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n===== SUMMARY: ${pass}/${results.length} passed =====`);
  for (const r of results) console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.tool}${r.ok ? "" : "  :: " + r.err}`);
  process.exit(pass === results.length ? 0 : 1);
})();
