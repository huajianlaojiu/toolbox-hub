// 缓存抢救：翻译进程被 kill 时 .cache 没落盘，但每种语言完成后 JSON 已写盘。
// 这个脚本从 src/i18n/{messages,content,posts}/<lang>.json 反推出翻译缓存，
// 让后续运行能接着跑（只补没译过的），不用从零再译一遍。
//
// 用法：node scripts/_cache_from_output.mjs .cache/translate-gtx.json
import fs from "node:fs";
import path from "node:path";
import { LOCALES, loadSource, collectStrings } from "./translate-content.mjs";

const outFile = process.argv[2] || path.join(process.cwd(), ".cache", "translate-gtx.json");

const src = await loadSource();
const items = collectStrings(src);
const idToSrc = new Map(items.map((i) => [i.id, i.str]));

const cache = {};
let kept = 0, skippedEn = 0, skippedBrand = 0;

function put(str, code, val) {
  if (!str) return;
  if (val == null || val === str) { skippedEn++; return; }   // 英文回退不是真译文
  if (str.includes("Toolbox Hub")) { skippedBrand++; return; } // 品牌串留给带保护的新逻辑重译
  (cache[str] ||= {})[code] = val;
  kept++;
}

const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };

for (const l of LOCALES) {
  // UI 消息：key 即英文源串
  const ui = readJson(path.join("src/i18n/messages", l.code + ".json"));
  if (ui) for (const [k, v] of Object.entries(ui)) put(k, l.code, v);

  // 工具内容
  const c = readJson(path.join("src/i18n/content", l.code + ".json"));
  if (c) {
    const g = c.generic || {};
    put(idToSrc.get("generic:intro"), l.code, g.intro);
    (g.howTo || []).forEach((h, i) => {
      put(idToSrc.get(`generic:howTo:${i}:step`), l.code, h.step);
      put(idToSrc.get(`generic:howTo:${i}:detail`), l.code, h.detail);
    });
    (g.faq || []).forEach((q, i) => {
      put(idToSrc.get(`generic:faq:${i}:q`), l.code, q.q);
      put(idToSrc.get(`generic:faq:${i}:a`), l.code, q.a);
    });
    (g.useCases || []).forEach((u, i) => put(idToSrc.get(`generic:useCases:${i}`), l.code, u));
    (g.tips || []).forEach((t, i) => put(idToSrc.get(`generic:tips:${i}`), l.code, t));
    for (const [slug, o] of Object.entries(c.overrides || {})) {
      put(idToSrc.get(`override:${slug}:intro`), l.code, o.intro);
      (o.howTo || []).forEach((h, i) => {
        put(idToSrc.get(`override:${slug}:howTo:${i}:step`), l.code, h.step);
        put(idToSrc.get(`override:${slug}:howTo:${i}:detail`), l.code, h.detail);
      });
      (o.faq || []).forEach((q, i) => {
        put(idToSrc.get(`override:${slug}:faq:${i}:q`), l.code, q.q);
        put(idToSrc.get(`override:${slug}:faq:${i}:a`), l.code, q.a);
      });
      (o.useCases || []).forEach((u, i) => put(idToSrc.get(`override:${slug}:useCases:${i}`), l.code, u));
      (o.tips || []).forEach((t, i) => put(idToSrc.get(`override:${slug}:tips:${i}`), l.code, t));
    }
    for (const [slug, m] of Object.entries(c.meta || {})) {
      put(idToSrc.get(`meta:${slug}:title`), l.code, m.title);
      put(idToSrc.get(`meta:${slug}:description`), l.code, m.description);
      (m.keywords || []).forEach((kw, i) => put(idToSrc.get(`meta:${slug}:keywords:${i}`), l.code, kw));
    }
  }

  // 博客文章
  const p = readJson(path.join("src/i18n/posts", l.code + ".json"));
  if (p) {
    for (const [slug, post] of Object.entries(p)) {
      put(idToSrc.get(`post:${slug}:title`), l.code, post.title);
      put(idToSrc.get(`post:${slug}:description`), l.code, post.description);
      put(idToSrc.get(`post:${slug}:category`), l.code, post.category);
      (post.blocks || []).forEach((b, i) => {
        if (b.h) put(idToSrc.get(`post:${slug}:blocks:${i}:h`), l.code, b.h);
        if (b.p) put(idToSrc.get(`post:${slug}:blocks:${i}:p`), l.code, b.p);
        if (b.b) put(idToSrc.get(`post:${slug}:blocks:${i}:b`), l.code, b.b);
        if (b.s) put(idToSrc.get(`post:${slug}:blocks:${i}:s`), l.code, b.s);
        (b.l || []).forEach((li, j) => put(idToSrc.get(`post:${slug}:blocks:${i}:l:${j}`), l.code, li));
      });
    }
  }
  console.log(`  ${l.code}: 缓存条目累计 ${Object.keys(cache).length}`);
}

fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(cache));
console.log(`\n完成：${Object.keys(cache).length} 条源串 / ${kept} 条译文 → ${outFile}`);
console.log(`已跳过：英文回退 ${skippedEn}、品牌待重译 ${skippedBrand}`);
