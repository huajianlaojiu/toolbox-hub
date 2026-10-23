// 一次性修复：把 zh-TW 的简体残留转换成台湾正体（OpenCC s2twp）。
// 背景：Google gtx 的 tl=zh-TW 只做粗糙字符转换，产出大量简体字 + 大陆词汇
// （文件→檔案、網絡→網路、默認→預設、支持→支援、粘貼→貼上……都不是台湾用法）。
// 本脚本对「值」做递归转换（key 是英文源串/ slug，绝不能动），
// 同时把 gtx 缓存里 zh-TW 的译文一起转正，保证重跑 translate-content.mjs 不回归。
// 用法：node scripts/_s2tw_fix.mjs        # 干跑：只统计不写回
//       node scripts/_s2tw_fix.mjs --apply # 写回 JSON + 缓存
import fs from "node:fs";
import path from "node:path";
import OpenCC from "opencc-js";

const root = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
const convert = OpenCC.Converter({ from: "cn", to: "twp" });

// 简体特有字精确集（与 _scan_simplified.mjs 同源），用于量化修复效果
const SIMP_SET = new Set("个们这麽时说过没后错开关门问闻间见笔记学国会发数据务页载书签订击键盘标内网线离闭启动态静处设备软硬驱装卸安装运维护复制贴贝除查替义属类实例版号码符串段落节志识别名称词语言文件档案夹录树结构点边顶端层组块区域范顺队列栈表格式写储输转变计测统析较级优升降联整体部并发布显误异常败试验证认禁止激注登陆销搜索导航链应该".split(""));

function countSimp(s) {
  let n = 0;
  for (const ch of s) if (SIMP_SET.has(ch)) n++;
  return n;
}

// 只转值不动 key：key 是英文源串（t() 查找用）或 slug（路由用），
// 但本函数不区分语义——所有对象 key 一律不碰，值递归转换。
function walk(node, stats) {
  if (typeof node === "string") {
    const before = countSimp(node);
    const after = convert(node);
    const afterN = countSimp(after);
    if (after !== node) stats.changed++;
    stats.simpBefore += before;
    stats.simpAfter += afterN;
    return after;
  }
  if (Array.isArray(node)) return node.map((x) => walk(x, stats));
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v, stats);
    return out;
  }
  return node;
}

const files = ["messages", "content", "posts"].map((d) => path.join(root, "src/i18n", d, "zh-TW.json"));
const cacheFile = path.join(root, ".cache", "translate-gtx.json");

console.log(APPLY ? "=== 应用模式 ===" : "=== 干跑模式（加 --apply 写回）===");
for (const f of files) {
  if (!fs.existsSync(f)) { console.log(`  跳过（不存在）: ${f}`); continue; }
  const obj = JSON.parse(fs.readFileSync(f, "utf8"));
  const stats = { changed: 0, simpBefore: 0, simpAfter: 0 };
  const out = walk(obj, stats);
  console.log(`  ${path.basename(path.dirname(f))}/zh-TW.json: 改动值 ${stats.changed} 处 | 简体残留 ${stats.simpBefore} → ${stats.simpAfter}`);
  if (APPLY && stats.changed > 0) fs.writeFileSync(f, JSON.stringify(out) + "\n");
}

// 缓存：只转 cache[src]["zh-TW"] 的值
if (fs.existsSync(cacheFile)) {
  const cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  let changed = 0;
  let sb = 0;
  let sa = 0;
  for (const src of Object.keys(cache)) {
    const entry = cache[src];
    if (!entry || typeof entry !== "object" || typeof entry["zh-TW"] !== "string") continue;
    const v = entry["zh-TW"];
    const nv = convert(v);
    sb += countSimp(v);
    sa += countSimp(nv);
    if (nv !== v) { entry["zh-TW"] = nv; changed++; }
  }
  console.log(`  .cache/translate-gtx.json: zh-TW 改动 ${changed} 条 | 简体残留 ${sb} → ${sa}`);
  if (APPLY && changed > 0) fs.writeFileSync(cacheFile, JSON.stringify(cache));
} else {
  console.log("  跳过（缓存不存在）: .cache/translate-gtx.json");
}
