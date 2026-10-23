// 构建期翻译脚本：把站点所有英文源文案（UI 字符串 + 工具 SEO 内容 + 工具元数据）
// 翻译成各目标语言，固化成静态 JSON，由 [lang] 路由在构建时按语言注入。
//
// 翻译在 CI（海外机器）跑，Key 仅来自环境变量 / GitHub Actions secret，
// 不进代码、不进前端。本地可用 MyMemory 免密钥做冒烟验证。
//
// 用法：
//   node scripts/translate-content.mjs                                  # 全量 14 语言，provider=google
//   TRANSLATE_PROVIDER=mymemory node scripts/translate-content.mjs --langs es zh   # 本地子集冒烟

import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT_DIR = path.join(SRC, "i18n");
const MSG_DIR = path.join(OUT_DIR, "messages");
const CONTENT_DIR = path.join(OUT_DIR, "content");
const POSTS_DIR = path.join(OUT_DIR, "posts");
const CACHE_DIR = path.join(ROOT, ".cache");
fs.mkdirSync(MSG_DIR, { recursive: true });
fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.mkdirSync(CACHE_DIR, { recursive: true });

const PROVIDER = (process.env.TRANSLATE_PROVIDER || "google").toLowerCase();
const GOOGLE_KEY = process.env.GOOGLE_TRANSLATE_KEY || "";
const MEMORY_EMAIL = process.env.MYMEMORY_EMAIL || "";
const onlyLangs = process.argv.includes("--langs")
  ? process.argv[process.argv.indexOf("--langs") + 1].split(",").filter(Boolean)
  : null;

// 与 src/lib/locales.ts 保持一致（内联，避免循环依赖）
const LOCALES = [
  { code: "zh", google: "zh", mymemory: "zh-CN" },
  { code: "zh-TW", google: "zh-TW", mymemory: "zh-TW" },
  { code: "ja", google: "ja", mymemory: "ja" },
  { code: "ko", google: "ko", mymemory: "ko" },
  { code: "es", google: "es", mymemory: "es" },
  { code: "fr", google: "fr", mymemory: "fr" },
  { code: "de", google: "de", mymemory: "de" },
  { code: "pt", google: "pt-BR", mymemory: "pt-BR" },
  { code: "ru", google: "ru", mymemory: "ru" },
  { code: "ar", google: "ar", mymemory: "ar" },
  { code: "it", google: "it", mymemory: "it" },
  { code: "nl", google: "nl", mymemory: "nl" },
  { code: "tr", google: "tr", mymemory: "tr" },
  { code: "pl", google: "pl", mymemory: "pl" },
  { code: "vi", google: "vi", mymemory: "vi" },
];
const TARGETS = onlyLangs ? LOCALES.filter((l) => onlyLangs.includes(l.code)) : LOCALES;

// 没有 Key 时（Key 尚未在 GitHub Actions 配置）不翻译，全部回退英文源，
// 保证 /lang/ 路由仍能构建部署（内容为英文），配置 Key 后下次构建即出译文。
const SKIP_TRANSLATE = PROVIDER === "google" && !GOOGLE_KEY;
if (SKIP_TRANSLATE) console.warn("⚠ GOOGLE_TRANSLATE_KEY 未设置：跳过翻译，/lang/ 页面将以英文源构建。配置密钥后重新部署即可出译文。");

// ---------- 1. 加载英文源 ----------
async function loadSource() {
  const tc = await bundle(SRC, "lib/tool-content.ts");
  const td = await bundle(SRC, "lib/tools-data.ts");
  const pd = await bundle(SRC, "lib/posts.ts");
  return {
    getGenericTemplate: tc.getGenericTemplate,
    overrides: tc.contentOverrides,
    tools: td.tools,
    posts: pd.posts,
  };
}

/** esbuild 把 TS 数据模块打包成 ESM 后在 Node 里 import */
function bundle(root, entry) {
  const tmp = path.join(CACHE_DIR, entry.replace(/[/\\]/g, "_").replace(/\.[cm]?[jt]sx?$/, "") + ".mjs");
  return build({
    entryPoints: [path.join(root, entry)],
    bundle: true, format: "esm", platform: "node", write: false,
    external: ["react", "react/*"], logLevel: "silent",
  })
    .then((r) => fs.writeFileSync(tmp, r.outputFiles[0].text))
    .then(() => import("file://" + tmp + "?t=" + Date.now()));
}

// ---------- 2. 收集源字符串（带稳定 id） ----------
function collectStrings(src) {
  const ui = new Set();
  const items = []; // { id, str }

  // 2a. UI 字符串
  const files = walk(SRC).filter(
    (f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.includes(path.sep + "i18n" + path.sep)
  );
  // 三种来源：L()/t()/tl() 调用、<I18nText id="..." />、langPageMeta(lang, "/path", "标题", "描述")
  const reCall = /\b(?:L|tl|t)\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g;
  const reJsx = /<I18nText\b[^>]*?\bid="((?:[^"\\]|\\.)*)"/g;
  const reMeta = /\blangPageMeta\(\s*[^,]+,\s*"[^"]*"\s*,\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"/g;
  for (const f of files) {
    const text = fs.readFileSync(f, "utf8");
    let m;
    while ((m = reCall.exec(text))) { const s = unescapeStr(m[1]); if (s) ui.add(s); }
    while ((m = reJsx.exec(text))) { const s = unescapeStr(m[1]); if (s) ui.add(s); }
    while ((m = reMeta.exec(text))) {
      for (const g of [m[1], m[2]]) { const s = unescapeStr(g); if (s) ui.add(s); }
    }
  }
  for (const s of ui) items.push({ id: "ui:" + s, str: s });

  // 2b. generic 模板
  const g = src.getGenericTemplate();
  items.push({ id: "generic:intro", str: g.intro });
  g.howTo.forEach((h, i) => { items.push({ id: `generic:howTo:${i}:step`, str: h.step }); items.push({ id: `generic:howTo:${i}:detail`, str: h.detail }); });
  g.faq.forEach((fq, i) => { items.push({ id: `generic:faq:${i}:q`, str: fq.q }); items.push({ id: `generic:faq:${i}:a`, str: fq.a }); });
  (g.useCases || []).forEach((u, i) => items.push({ id: `generic:useCases:${i}`, str: u }));
  (g.tips || []).forEach((t, i) => items.push({ id: `generic:tips:${i}`, str: t }));

  // 2c. 自定义内容
  for (const [slug, c] of Object.entries(src.overrides)) {
    if (c.intro) items.push({ id: `override:${slug}:intro`, str: c.intro });
    (c.howTo || []).forEach((h, i) => { items.push({ id: `override:${slug}:howTo:${i}:step`, str: h.step }); items.push({ id: `override:${slug}:howTo:${i}:detail`, str: h.detail }); });
    (c.faq || []).forEach((fq, i) => { items.push({ id: `override:${slug}:faq:${i}:q`, str: fq.q }); items.push({ id: `override:${slug}:faq:${i}:a`, str: fq.a }); });
    (c.useCases || []).forEach((u, i) => items.push({ id: `override:${slug}:useCases:${i}`, str: u }));
    (c.tips || []).forEach((t, i) => items.push({ id: `override:${slug}:tips:${i}`, str: t }));
  }

  // 2d. 元数据
  for (const t of src.tools) {
    items.push({ id: `meta:${t.slug}:title`, str: t.title });
    items.push({ id: `meta:${t.slug}:description`, str: t.description });
    (t.keywords || []).forEach((kw, i) => items.push({ id: `meta:${t.slug}:keywords:${i}`, str: kw }));
  }

  // 2e. 博客文章（标题/描述/分类/正文块）
  for (const p of src.posts || []) {
    items.push({ id: `post:${p.slug}:title`, str: p.title });
    items.push({ id: `post:${p.slug}:metaTitle`, str: p.metaTitle });
    items.push({ id: `post:${p.slug}:description`, str: p.description });
    items.push({ id: `post:${p.slug}:category`, str: p.category });
    (p.blocks || []).forEach((b, i) => {
      if (b.h) items.push({ id: `post:${p.slug}:blocks:${i}:h`, str: b.h });
      if (b.p) items.push({ id: `post:${p.slug}:blocks:${i}:p`, str: b.p });
      if (b.b) items.push({ id: `post:${p.slug}:blocks:${i}:b`, str: b.b });
      if (b.s) items.push({ id: `post:${p.slug}:blocks:${i}:s`, str: b.s });
      (b.l || []).forEach((li, j) => items.push({ id: `post:${p.slug}:blocks:${i}:l:${j}`, str: li }));
    });
  }

  return items;
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".next", "out"].includes(e.name)) continue;
      out.push(...walk(p));
    } else out.push(p);
  }
  return out;
}
function unescapeStr(s) {
  // JSX 属性里不能写 \" 转义，源码用 &quot; 实体；这里解回英文原文，保证与 t() 侧 key 一致
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

// ---------- 3. 令牌保护 ----------
const TOKEN_RE = /\{(\w+)\}/g;
function protectTokens(s) {
  const map = [];
  const text = s.replace(TOKEN_RE, (_, w) => { const i = map.length; map.push(w); return `__TK${i}__`; });
  return { text, restore: (t) => t.replace(/__TK(\d+)__/g, (_, i) => `{${map[+i]}}`) };
}

// ---------- 4. 翻译 + 缓存 ----------
const cacheFile = path.join(CACHE_DIR, `translate-${PROVIDER}.json`);
let cache = {};
try { cache = JSON.parse(fs.readFileSync(cacheFile, "utf8")); } catch { cache = {}; }
function getCached(src, code) { return cache[src]?.[code]; }
function setCached(src, code, val) { (cache[src] ||= {})[code] = val; }

async function translateItems(items, lang) {
  const result = new Map();
  if (SKIP_TRANSLATE) return result; // 无 Key：全部回退英文源
  const todo = [];
  items.forEach((it) => {
    const c = getCached(it.str, lang.code);
    if (c != null) result.set(it.id, c);
    else todo.push(it);
  });
  if (todo.length === 0) return result;

  const target = lang[PROVIDER];
  const prot = todo.map((x) => protectTokens(x.str));
  const sources = prot.map((x) => x.text);
  let tr;
  if (PROVIDER === "google") {
    if (!GOOGLE_KEY) throw new Error("GOOGLE_TRANSLATE_KEY 未设置（CI 需配置 GitHub Actions secret）");
    tr = await googleTranslate(sources, target);
  } else if (PROVIDER === "mymemory") {
    tr = await myMemoryTranslate(sources, target);
  } else throw new Error("未知 provider: " + PROVIDER);

  todo.forEach((it, k) => {
    let v = tr[k];
    if (v == null) v = it.str; // 失败回退英文
    else v = prot[k].restore(v);
    result.set(it.id, v);
    setCached(it.str, lang.code, v);
  });
  return result;
}

async function googleTranslate(sources, target) {
  const out = new Array(sources.length);
  const BATCH = 80;
  for (let s = 0; s < sources.length; s += BATCH) {
    const chunk = sources.slice(s, s + BATCH);
    const body = JSON.stringify({ q: chunk, source: "en", target, format: "text" });
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const r = await fetch("https://translation.googleapis.com/language/translate/v2?key=" + GOOGLE_KEY, {
          method: "POST", headers: { "Content-Type": "application/json" }, body,
        });
        if (r.status === 429 || r.status >= 500) { await sleep(800 * (attempt + 1)); lastErr = "HTTP " + r.status; continue; }
        if (!r.ok) { lastErr = "HTTP " + r.status + " " + (await r.text()).slice(0, 120); break; }
        const j = await r.json();
        (j.data?.translations || []).forEach((t, i) => (out[s + i] = t.translatedText));
        break;
      } catch (e) { lastErr = String(e); await sleep(800 * (attempt + 1)); }
    }
    if (out[s] == null) console.warn(`  [google] 批次 ${s}-${s + chunk.length} 失败: ${lastErr}`);
    if (s + BATCH < sources.length) await sleep(120);
  }
  return out;
}

async function myMemoryTranslate(sources, target) {
  const out = new Array(sources.length);
  const lp = "en|" + target;
  for (let i = 0; i < sources.length; i++) {
    const q = sources[i];
    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(q) + "&langpair=" + encodeURIComponent(lp) + (MEMORY_EMAIL ? "&de=" + encodeURIComponent(MEMORY_EMAIL) : "");
        const r = await fetch(url);
        const j = await r.json();
        const txt = j?.responseData?.translatedText;
        if (txt && !/MYMEMORY WARNING/i.test(txt) && j?.responseStatus === 200) { out[i] = txt; break; }
        lastErr = j?.responseDetails || "no translation";
      } catch (e) { lastErr = String(e); }
      await sleep(400 * (attempt + 1));
    }
    if (out[i] == null) { out[i] = sources[i]; console.warn(`  [mymemory] 跳过(${lp}): ${String(lastErr).slice(0, 50)}`); }
    await sleep(250);
  }
  return out;
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ---------- 5. 主流程 ----------
async function main() {
  console.log(`翻译 provider=${PROVIDER}  目标语言=${TARGETS.map((l) => l.code).join(",")}`);
  const src = await loadSource();
  const items = collectStrings(src);
  console.log(`源字符串总数=${items.length}`);

  for (const lang of TARGETS) {
    console.log(`\n→ ${lang.code} (${lang[PROVIDER]})`);
    const tr = await translateItems(items, lang);
    const get = (id, fallback) => tr.get(id) ?? fallback;

    // UI 消息
    const uiMsg = {};
    for (const it of items) {
      if (!it.id.startsWith("ui:")) continue;
      const key = it.id.slice(3);
      const v = tr.get(it.id);
      if (v && v !== key) uiMsg[key] = v;
    }
    fs.writeFileSync(path.join(MSG_DIR, lang.code + ".json"), JSON.stringify(uiMsg) + "\n");

    // 内容
    const out = { generic: {}, overrides: {}, meta: {} };
    const g = src.getGenericTemplate();
    out.generic.intro = get("generic:intro", g.intro);
    out.generic.howTo = g.howTo.map((h, i) => ({ step: get(`generic:howTo:${i}:step`, h.step), detail: get(`generic:howTo:${i}:detail`, h.detail) }));
    out.generic.faq = g.faq.map((fq, i) => ({ q: get(`generic:faq:${i}:q`, fq.q), a: get(`generic:faq:${i}:a`, fq.a) }));
    out.generic.useCases = (g.useCases || []).map((u, i) => get(`generic:useCases:${i}`, u));
    out.generic.tips = (g.tips || []).map((t, i) => get(`generic:tips:${i}`, t));

    for (const [slug, c] of Object.entries(src.overrides)) {
      out.overrides[slug] = {
        intro: c.intro ? get(`override:${slug}:intro`, c.intro) : undefined,
        howTo: (c.howTo || []).map((h, i) => ({ step: get(`override:${slug}:howTo:${i}:step`, h.step), detail: get(`override:${slug}:howTo:${i}:detail`, h.detail) })),
        faq: (c.faq || []).map((fq, i) => ({ q: get(`override:${slug}:faq:${i}:q`, fq.q), a: get(`override:${slug}:faq:${i}:a`, fq.a) })),
        useCases: (c.useCases || []).map((u, i) => get(`override:${slug}:useCases:${i}`, u)),
        tips: (c.tips || []).map((t, i) => get(`override:${slug}:tips:${i}`, t)),
      };
    }

    for (const t of src.tools) {
      out.meta[t.slug] = {
        title: get(`meta:${t.slug}:title`, t.title),
        description: get(`meta:${t.slug}:description`, t.description),
        keywords: (t.keywords || []).map((kw, i) => get(`meta:${t.slug}:keywords:${i}`, kw)),
      };
    }
    fs.writeFileSync(path.join(CONTENT_DIR, lang.code + ".json"), JSON.stringify(out) + "\n");

    // 博客文章译文
    const postsOut = {};
    for (const p of src.posts || []) {
      const blocks = (p.blocks || []).map((b, i) => {
        const o = {};
        if (b.h) o.h = get(`post:${p.slug}:blocks:${i}:h`, b.h);
        if (b.p) o.p = get(`post:${p.slug}:blocks:${i}:p`, b.p);
        if (b.b) o.b = get(`post:${p.slug}:blocks:${i}:b`, b.b);
        if (b.s) o.s = get(`post:${p.slug}:blocks:${i}:s`, b.s);
        if (b.l) o.l = b.l.map((li, j) => get(`post:${p.slug}:blocks:${i}:l:${j}`, li));
        return o;
      });
      postsOut[p.slug] = {
        title: get(`post:${p.slug}:title`, p.title),
        description: get(`post:${p.slug}:description`, p.description),
        category: get(`post:${p.slug}:category`, p.category),
        blocks,
      };
    }
    fs.writeFileSync(path.join(POSTS_DIR, lang.code + ".json"), JSON.stringify(postsOut) + "\n");
    console.log(`  UI 词条=${Object.keys(uiMsg).length}  内容字节≈${JSON.stringify(out).length}  文章=${Object.keys(postsOut).length}`);
  }

  const san = (c) => c.replace(/[^a-zA-Z0-9]/g, "_");
  const imports = TARGETS.map((l) => `import ${san(l.code)} from "./${l.code}.json";`).join("\n");
  const map = TARGETS.map((l) => `  ${JSON.stringify(l.code)}: ${san(l.code)}`).join(",\n");
  const registry =
    imports + "\n\nexport const CONTENT: Record<string, any> = {\n" + map + "\n};\n" +
    "export const CONTENT_LANGS = " + JSON.stringify(TARGETS.map((l) => l.code)) + ";\n";
  fs.writeFileSync(path.join(CONTENT_DIR, "index.ts"), registry);

  const msgImports = TARGETS.map((l) => `import ${san(l.code)}Msg from "./${l.code}.json";`).join("\n");
  const msgMap = TARGETS.map((l) => `  ${JSON.stringify(l.code)}: ${san(l.code)}Msg`).join(",\n");
  const msgRegistry = msgImports + "\nexport const MESSAGES: Record<string, any> = {\n" + msgMap + "\n};\n";
  fs.writeFileSync(path.join(MSG_DIR, "index.ts"), msgRegistry);

  const postImports = TARGETS.map((l) => `import ${san(l.code)}Post from "./${l.code}.json";`).join("\n");
  const postMap = TARGETS.map((l) => `  ${JSON.stringify(l.code)}: ${san(l.code)}Post`).join(",\n");
  const postRegistry = postImports + "\nexport const POSTS: Record<string, any> = {\n" + postMap + "\n};\n";
  fs.writeFileSync(path.join(POSTS_DIR, "index.ts"), postRegistry);

  fs.writeFileSync(cacheFile, JSON.stringify(cache));
  console.log("\n完成：messages/ + content/ + content/index.ts + messages/index.ts");
}

main().catch((e) => { console.error(e); process.exit(1); });
