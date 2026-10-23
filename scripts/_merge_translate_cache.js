// 合并多个翻译缓存文件为一个（并行跑语言子集时各进程有独立缓存，避免互相覆盖）。
// 用法：node scripts/_merge_translate_cache.js .cache/translate-gtx-*.json .cache/translate-gtx.json
import fs from "node:fs";
import path from "node:path";

const [outFile, ...inFiles] = process.argv.slice(2);
if (!outFile || inFiles.length === 0) {
  console.error("用法: node scripts/_merge_translate_cache.js <输出.json> <输入.json...>");
  process.exit(1);
}

const merged = {};
let added = 0;
let droppedEn = 0, droppedBrand = 0;
for (const f of inFiles) {
  let data;
  try { data = JSON.parse(fs.readFileSync(f, "utf8")); } catch { console.warn("跳过(读取失败):", f); continue; }
  for (const [src, byLang] of Object.entries(data)) {
    // 丢弃两类缓存，迫使下次运行重译：
    // 1) 译文 === 英文源（说明当时翻译失败回退了，不是真译文）
    // 2) 源串含品牌名 "Toolbox Hub"（已改为品牌保护，需带保护重译）
    const isEnFallback = (v) => v === src;
    const isBrand = src.includes("Toolbox Hub");
    merged[src] ||= {};
    for (const [code, val] of Object.entries(byLang)) {
      if (isEnFallback(val)) { droppedEn++; continue; }
      if (isBrand) { droppedBrand++; continue; }
      if (merged[src][code] == null) { merged[src][code] = val; added++; }
    }
  }
  console.log(`合并 ${path.basename(f)}: ${Object.keys(data).length} 条源串`);
}

fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(merged));
console.log(`\n完成：${Object.keys(merged).length} 条源串 / ${added} 条译文 → ${outFile}`);
console.log(`已丢弃：英文回退 ${droppedEn} 条、品牌待重译 ${droppedBrand} 条`);
