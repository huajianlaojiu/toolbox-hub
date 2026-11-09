/**
 * 清理译文 JSON 里的「英文回退」条目（值 === 源串 key）。
 *
 * 背景：gtx 免密钥端点失败时，translate-content.mjs 会把英文源串原样写成
 * 「译文」。这类条目有两个坏处：
 *   1. 翻译脚本把它当成已翻译，永久跳过，之后再也不会补翻；
 *   2. 让译文覆盖率统计虚高。
 * 删掉它们对渲染零影响 —— 运行时查不到 key 本来就是回退英文源串。
 *
 * 用法：
 *   node scripts/clean-fallbacks.mjs            # 清理并写回（幂等）
 *   node scripts/clean-fallbacks.mjs --dry-run  # 只报告不修改
 *
 * 只处理 messages / content 的顶层字符串值；posts 是按 slug 索引的对象，
 * 不存在「key 即源串」结构，故不处理。
 * 输出格式与 translate-content.mjs 保持一致（紧凑 JSON + 换行），diff 最小。
 */
import fs from "node:fs";
import path from "node:path";

const dryRun = process.argv.includes("--dry-run");
const DIRS = ["src/i18n/messages", "src/i18n/content"];
let touchedFiles = 0;
let total = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) continue;
  const names = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  for (const name of names) {
    const file = path.join(dir, name);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      console.warn(`skip ${file}: ${e.message}`);
      continue;
    }
    const hits = Object.keys(data).filter(
      (k) => typeof data[k] === "string" && data[k] === k
    );
    if (hits.length === 0) continue;
    for (const k of hits) delete data[k];
    if (!dryRun) fs.writeFileSync(file, JSON.stringify(data) + "\n");
    touchedFiles++;
    total += hits.length;
    console.log(`${dryRun ? "[dry-run] " : ""}${file}: ${hits.length} fallback(s)`);
  }
}

console.log(
  `${dryRun ? "[dry-run] " : ""}done: ${total} fallback entries in ${touchedFiles} files`
);
