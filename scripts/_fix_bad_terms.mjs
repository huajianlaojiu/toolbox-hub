// 一次性修复：Google gtx 把技术词 "Markdown"/"Slug" 译错（降价/démarque/ribasso/SMS/Slak蜗牛/弹丸/limaces）。
// 1) 修 content/<lang>.json 的 meta（title/keywords）
// 2) 修 content/<lang>.json 的 overrides["text-to-slug"] 正文（fr/it/nl）
// 3) 修 posts/nl.json 里 "pak de slak"
// 4) 修 .cache/translate-gtx.json：6 个已知源串 + 所有 key 含 slug/markdown 且译文含烂词的条目
// 5) 全量黑名单复扫
// 用法：node scripts/_fix_bad_terms.mjs [--apply]
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const APPLY = process.argv.includes("--apply");
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

/** 每个语言的正确译法（Markdown/Slug 保留英文，其余部分本地化） */
const FIX = {
  "markdown-preview": {
    zh: { title: "Markdown 预览", keywords: ["Markdown 预览", "Markdown 编辑器"] },
    "zh-TW": { title: "Markdown 預覽", keywords: ["Markdown 預覽", "Markdown 編輯器"] },
    fr: { title: "Aperçu Markdown", keywords: ["aperçu Markdown", "éditeur Markdown"] },
    it: { title: "Anteprima Markdown", keywords: ["anteprima Markdown", "editor Markdown"] },
    nl: { title: "Markdown-voorbeeld", keywords: ["Markdown-voorbeeld", "Markdown-editor"] },
    // de 原本就正确（Markdown-Vorschau / Markdown-Editor），不动
  },
  "text-to-slug": {
    zh: { title: "文本转 Slug", keywords: ["文本转 Slug", "Slug 生成器"] },
    "zh-TW": { title: "文字轉 Slug", keywords: ["文字轉 Slug", "Slug 產生器"] },
    fr: { title: "Texte en Slug", keywords: ["texte en slug", "générateur de slug"] },
    it: { title: "Testo in Slug", keywords: ["testo in slug", "generatore di slug"] },
    de: { title: "Text zu Slug", keywords: ["Text zu Slug", "Slug-Generator"] },
    nl: { title: "Tekst naar Slug", keywords: ["tekst naar slug", "slug-generator"] },
  },
};

/** 正文修复规则：按语言做有序替换（先长后短） */
const BODY_RULES = {
  fr: [["limace", "slug"]],
  it: [["lumaca", "slug"]],
  nl: [["naaktslak", "slug"], ["Naaktslak", "Slug"], ["slak", "slug"], ["Slak", "Slug"]],
};

/** 缓存里源串 → 各语言正确译文 */
const CACHE_FIX = {
  "Markdown Preview": { zh: "Markdown 预览", "zh-TW": "Markdown 預覽", fr: "Aperçu Markdown", de: "Markdown-Vorschau", it: "Anteprima Markdown", nl: "Markdown-voorbeeld" },
  "markdown preview": { zh: "Markdown 预览", "zh-TW": "Markdown 預覽", fr: "aperçu Markdown", de: "Markdown-Vorschau", it: "anteprima Markdown", nl: "Markdown-voorbeeld" },
  "markdown editor": { zh: "Markdown 编辑器", "zh-TW": "Markdown 編輯器", fr: "éditeur Markdown", de: "Markdown-Editor", it: "editor Markdown", nl: "Markdown-editor" },
  "Text to Slug": { zh: "文本转 Slug", "zh-TW": "文字轉 Slug", fr: "Texte en Slug", de: "Text zu Slug", it: "Testo in Slug", nl: "Tekst naar Slug" },
  "text to slug": { zh: "文本转 slug", "zh-TW": "文字轉 slug", fr: "texte en slug", de: "Text zum Slug", it: "testo in slug", nl: "tekst naar slug" },
  "slug generator": { zh: "Slug 生成器", "zh-TW": "Slug 產生器", fr: "générateur de slug", de: "Slug-Generator", it: "generatore di slug", nl: "slug-generator" },
};

/** 黑名单：任何译文里出现这些词都说明该串译错了（折扣计算器里的"降价/démarque"合法，按条目范围规避） */
const BLACKLIST = ["降价", "減價", "降價", "弹丸", "彈丸", "démarque", "ribasso", "Afwaarderings", "afwaardering", "prijsverlaging", "limace", "lumaca", "Schnecken", "slak", "Slak", "SMS à Slug", "SMS a Slug", "Sms naar"];

function applyRules(s, rules) {
  let out = s;
  for (const [from, to] of rules) out = out.split(from).join(to);
  return out;
}

let jsonChanged = 0;

// ---------- 1) meta ----------
for (const [slug, perLang] of Object.entries(FIX)) {
  for (const [lang, fix] of Object.entries(perLang)) {
    const file = path.join(root, "src/i18n/content", `${lang}.json`);
    const c = read(file);
    const cur = c.meta?.[slug];
    if (!cur) { console.log(`[skip] ${lang} ${slug} 无 meta`); continue; }
    const before = JSON.stringify(cur);
    cur.title = fix.title;
    cur.keywords = fix.keywords;
    if (before !== JSON.stringify(cur)) {
      console.log(`[fix meta] ${lang} ${slug}\n    ${before}\n -> ${JSON.stringify(cur)}`);
      jsonChanged++;
      if (APPLY) fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
    }
  }
}

// ---------- 2) overrides 正文 ----------
for (const [lang, rules] of Object.entries(BODY_RULES)) {
  const file = path.join(root, "src/i18n/content", `${lang}.json`);
  const c = read(file);
  const e = c.overrides?.["text-to-slug"];
  if (!e) continue;
  const fields = [];
  if (e.intro) fields.push(["intro", e.intro]);
  (e.howTo || []).forEach((h, i) => { fields.push([`howTo[${i}].step`, h.step]); fields.push([`howTo[${i}].detail`, h.detail]); });
  (e.faq || []).forEach((f, i) => { fields.push([`faq[${i}].q`, f.q]); fields.push([`faq[${i}].a`, f.a]); });
  (e.useCases || []).forEach((u, i) => fields.push([`useCases[${i}]`, u]));
  (e.tips || []).forEach((t, i) => fields.push([`tips[${i}]`, t]));
  for (const [key, val] of fields) {
    const fixed = applyRules(val, rules);
    if (fixed !== val) {
      console.log(`[fix body] ${lang} text-to-slug ${key}\n    ${val.slice(0, 110)}\n -> ${fixed.slice(0, 110)}`);
      jsonChanged++;
      if (APPLY) {
        const m = key.match(/^(\w+)\[(\d+)\]\.(\w+)$/);
        if (m) e[m[1]][+m[2]][m[3]] = fixed;
        else if (key === "intro") e.intro = fixed;
        else if (key.startsWith("useCases")) e.useCases[+key.match(/\d+/)[0]] = fixed;
        else if (key.startsWith("tips")) e.tips[+key.match(/\d+/)[0]] = fixed;
      }
    }
  }
  if (APPLY) fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
}

// ---------- 3) posts/nl.json ----------
{
  const file = path.join(root, "src/i18n/posts/nl.json");
  const p = read(file);
  let changed = false;
  const walk = (v) => {
    if (typeof v === "string") return applyRules(v, BODY_RULES.nl);
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = walk(v[k]); return o; }
    return v;
  };
  const before = JSON.stringify(p);
  const after = walk(p);
  if (before !== JSON.stringify(after)) {
    console.log(`[fix post] posts/nl.json (text-tools-for-writers 等)`);
    jsonChanged++;
    changed = true;
  }
  if (APPLY && changed) fs.writeFileSync(file, JSON.stringify(after, null, 2) + "\n");
}

// ---------- 4) 缓存 ----------
const cacheFile = path.join(root, ".cache/translate-gtx.json");
let cacheChanged = 0;
if (fs.existsSync(cacheFile)) {
  const cache = read(cacheFile);
  for (const [src, perLang] of Object.entries(CACHE_FIX)) {
    if (!cache[src]) { console.log(`[skip cache] "${src}" 不在缓存`); continue; }
    const before = JSON.stringify(cache[src]);
    for (const [lang, val] of Object.entries(perLang)) cache[src][lang] = val;
    if (before !== JSON.stringify(cache[src])) { console.log(`[fix cache] "${src}"`); cacheChanged++; }
  }
  // 兜底：key 含 slug/markdown 且某语言译文含烂词 → 按同语言正文规则修
  for (const [src, perLang] of Object.entries(cache)) {
    if (!/slug|markdown/i.test(src)) continue;
    for (const [lang, val] of Object.entries(perLang)) {
      if (typeof val !== "string") continue;
      const rules = BODY_RULES[lang];
      if (!rules) continue;
      if (!BLACKLIST.some((b) => val.includes(b))) continue;
      const fixed = applyRules(val, rules);
      if (fixed !== val) { console.log(`[fix cache*] ${lang} "${src.slice(0, 60)}..."\n    ${val.slice(0, 90)}\n -> ${fixed.slice(0, 90)}`); perLang[lang] = fixed; cacheChanged++; }
    }
  }
  if (APPLY && cacheChanged) fs.writeFileSync(cacheFile, JSON.stringify(cache));
}

// ---------- 5) 黑名单复扫 ----------
console.log("\n=== 黑名单残留复扫 ===");
let residue = 0;
for (const dir of ["messages", "content", "posts"]) {
  const dirPath = path.join(root, "src/i18n", dir);
  if (!fs.existsSync(dirPath)) continue;
  for (const f of fs.readdirSync(dirPath).filter((x) => x.endsWith(".json"))) {
    const lang = f.replace(".json", "");
    const raw = fs.readFileSync(path.join(dirPath, f), "utf8");
    for (const bad of BLACKLIST) {
      let idx = raw.indexOf(bad);
      while (idx !== -1) {
        const ctx = raw.slice(Math.max(0, idx - 70), idx + bad.length + 30).replace(/\s+/g, " ");
        console.log(`[残留] ${dir}/${lang}.json: ...${ctx}...`);
        residue++;
        idx = raw.indexOf(bad, idx + 1);
      }
    }
  }
}
console.log(`--- json 修复 ${jsonChanged} 处 | 缓存修复 ${cacheChanged} 处 | 黑名单残留 ${residue} 处 | APPLY=${APPLY} ---`);
