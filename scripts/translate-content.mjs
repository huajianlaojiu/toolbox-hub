// 构建期翻译脚本：把站点所有英文源文案（UI 字符串 + 工具 SEO 内容 + 工具元数据）
// 翻译成各目标语言，固化成静态 JSON，由 [lang] 路由在构建时按语言注入。
//
// 翻译在 CI（海外机器）跑，Key 仅来自环境变量 / GitHub Actions secret，
// 不进代码、不进前端。本地可用 MyMemory 免密钥做冒烟验证。
//
// 用法：
//   node scripts/translate-content.mjs                                  # 全量 15 语言，provider=google（需 Key）
//   TRANSLATE_PROVIDER=mymemory node scripts/translate-content.mjs --langs es zh   # 本地子集冒烟
//   TRANSLATE_PROVIDER=gtx HTTPS_PROXY=http://127.0.0.1:7897 node scripts/translate-content.mjs
//     # 本地免密钥全量：走 Google 网页版免费端点（translate_a/single），
//     # 国内机器需配 HTTPS_PROXY；Node>=22 也可用 NODE_USE_ENV_PROXY=1 让内置 fetch 走代理

import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import OpenCC from "opencc-js";

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
const PROXY = process.env.TRANSLATE_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || "";
const onlyLangs = process.argv.includes("--langs")
  ? process.argv[process.argv.indexOf("--langs") + 1].split(",").filter(Boolean)
  : null;

// 与 src/lib/locales.ts 保持一致（内联，避免循环依赖）
// gtx = Google 网页版免费端点（translate_a/single），仅本地/免密钥场景使用，
//      质量与 Cloud Translation 同源；google = Cloud Translation v2（CI 正式通道）。
const LOCALES = [
  { code: "zh", google: "zh", gtx: "zh-CN", mymemory: "zh-CN" },
  { code: "zh-TW", google: "zh-TW", gtx: "zh-CN", mymemory: "zh-TW" }, // gtx 的 tl=zh-TW 是粗糙转换（残留简体+大陆词汇），改用 zh-CN + 下方 s2tw 转正
  { code: "ja", google: "ja", gtx: "ja", mymemory: "ja" },
  { code: "ko", google: "ko", gtx: "ko", mymemory: "ko" },
  { code: "es", google: "es", gtx: "es", mymemory: "es" },
  { code: "fr", google: "fr", gtx: "fr", mymemory: "fr" },
  { code: "de", google: "de", gtx: "de", mymemory: "de" },
  { code: "pt", google: "pt-BR", gtx: "pt-BR", mymemory: "pt-BR" },
  { code: "ru", google: "ru", gtx: "ru", mymemory: "ru" },
  { code: "ar", google: "ar", gtx: "ar", mymemory: "ar" },
  { code: "it", google: "it", gtx: "it", mymemory: "it" },
  { code: "nl", google: "nl", gtx: "nl", mymemory: "nl" },
  { code: "tr", google: "tr", gtx: "tr", mymemory: "tr" },
  { code: "pl", google: "pl", gtx: "pl", mymemory: "pl" },
  { code: "vi", google: "vi", gtx: "vi", mymemory: "vi" },
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
    categories: td.categories,
    categoryBlurbs: td.CATEGORY_BLURBS,
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

  // 2a-2. 分类名与分类区块描述：页面上以 id={cat} / id={CATEGORY_BLURBS[cat]} 动态渲染，
  // 上面的字面量正则发现不了。messages 是每次从零重建的，漏收=永久英文，
  // 所以必须显式收录（否则手工补的键也会在下次自动翻译时被冲掉）。
  for (const c of src.categories || []) items.push({ id: "ui:" + c, str: c });
  for (const blurb of Object.values(src.categoryBlurbs || {})) {
    items.push({ id: "ui:" + blurb, str: blurb });
  }

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
// 品牌名不翻译：各语言保持统一的 "Toolbox Hub"（导航/页脚本就是硬编码英文，
// 正文若翻成"工具箱中心"会品牌不一致）。与 {title} 占位符同一套保护机制。
const BRAND_RE = /Toolbox Hub/g;
// 术语表不翻译：Google gtx 实测会把 Markdown 译成"降价/démarque/ribasso/降價"、
// Slug 译成"SMS/蜗牛(slak/limace/lumaca/Schnecke)/弹丸"，都是错译。
// 这些词在任何语言里保留英文原文（大小写原样保留）。
const GLOSSARY_RE = /\b(Markdown|Slug)\b/g;
function protectTokens(s) {
  const map = [];
  const stash = (lit) => { const i = map.length; map.push(lit); return `__TK${i}__`; };
  let text = s.replace(TOKEN_RE, (_, w) => stash(`{${w}}`));
  text = text.replace(BRAND_RE, () => stash("Toolbox Hub"));
  text = text.replace(GLOSSARY_RE, (m) => stash(m));
  return { text, restore: (t) => t.replace(/__TK(\d+)__/g, (_, i) => map[+i] ?? `__TK${i}__`) };
}

// ---------- 4. 翻译 + 缓存 ----------
// gtx 的 tl=zh-TW 只做粗糙字符转换：产出大量简体残留和大陆词汇（文件/網絡/默認/支持）。
// 正解是 tl=zh-CN 拿高质量简体译文，再用 OpenCC s2twp 转台湾正体
// （文件→檔案、網絡→網路、默認→預設、支持→支援，词汇级本地化）。
// 仅 gtx 通道需要：Cloud Translation（google，CI 正式通道）的 zh-TW 质量已达标。
const s2tw = OpenCC.Converter({ from: "cn", to: "twp" });
// 并行跑多个语言子集时用 TRANSLATE_CACHE_FILE 给每个进程分配独立缓存，避免互相覆盖
const cacheFile = process.env.TRANSLATE_CACHE_FILE || path.join(CACHE_DIR, `translate-${PROVIDER}.json`);
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
    // 防缓存投毒：若缓存值等于英文源串（= 上次 API 失败时的英文回退被错误缓存），
    // 视为未命中、强制重新翻译，否则该串会永久卡在英文、后续构建再也无法修复。
    if (c != null && c !== it.str) result.set(it.id, c);
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
  } else if (PROVIDER === "gtx") {
    tr = await gtxTranslate(sources, target);
  } else if (PROVIDER === "mymemory") {
    tr = await myMemoryTranslate(sources, target);
  } else throw new Error("未知 provider: " + PROVIDER);

  todo.forEach((it, k) => {
    let v = tr[k];
    if (v == null) v = it.str; // 失败回退英文
    else {
      v = prot[k].restore(v);
      // zh-TW 走 gtx 时拿到的是简体（tl=zh-CN），先转台湾正体再入缓存/JSON
      if (lang.code === "zh-TW" && PROVIDER === "gtx") v = s2tw(v);
    }
    result.set(it.id, v);
    // 不要把英文回退值写进缓存，否则失败串被永久毒化为英文、后续再也无法自愈
    if (v !== it.str) setCached(it.str, lang.code, v);
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

// ---------- Google 网页版免费端点（translate_a/single，免密钥） ----------
// 与 Cloud Translation 同源质量，适合本地一次性全量生成后提交静态 JSON。
// 多条源串用 "\n" 合并成一次请求（省请求数），回来按 "\n" 切分；
// 切分数与源不一致时退化为逐条翻译，保证译文与字符串不错位。
const GTX_MAX_CHARS = 1800;
const GTX_DELAY_MS = Number(process.env.GTX_DELAY_MS || 110); // 请求间隔；被限流时调大（如 2500）
let gtxFetch = globalThis.fetch;
if (PROVIDER === "gtx" && PROXY) {
  try {
    const undici = await import("undici");
    undici.setGlobalDispatcher(new undici.ProxyAgent(PROXY));
    gtxFetch = undici.fetch;
    console.log(`[gtx] 代理已启用：${PROXY}`);
  } catch {
    console.warn("[gtx] 未找到 undici：将直连。国内机器请设 NODE_USE_ENV_PROXY=1，或 npm i -D undici");
  }
}

function unescapeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function gtxOne(text, target) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" +
    encodeURIComponent(target) + "&dt=t&q=" + encodeURIComponent(text);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // 20s 超时：Google 限流时会挂住不响应，没超时会无限等下去
      const r = await gtxFetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(20000) });
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (attempt + 1)); continue; }
      if (!r.ok) { await sleep(800 * (attempt + 1)); continue; }
      const j = await r.json();
      const segs = j?.[0];
      if (!Array.isArray(segs)) throw new Error("bad payload");
      return unescapeEntities(segs.map((s) => (Array.isArray(s) ? s[0] : "")).join(""));
    } catch (e) {
      if (attempt === 4) { console.warn(`  [gtx] 失败(${target}): ${String(e).slice(0, 60)}`); return null; }
      await sleep(1000 * (attempt + 1));
    }
  }
  return null;
}

async function gtxTranslate(sources, target) {
  const out = new Array(sources.length);
  // 组批：不含换行的串才能合并；超长的单独发
  const batches = [];
  let cur = [], chars = 0;
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const solo = s.includes("\n") || s.length > GTX_MAX_CHARS;
    if (cur.length && (solo || chars + s.length > GTX_MAX_CHARS || cur.length >= 40)) {
      batches.push(cur); cur = []; chars = 0;
    }
    if (solo) { batches.push([i]); continue; }
    cur.push(i); chars += s.length;
  }
  if (cur.length) batches.push(cur);

  let done = 0;
  for (const batch of batches) {
    if (batch.length === 1) {
      out[batch[0]] = await gtxOne(sources[batch[0]], target);
    } else {
      const joined = batch.map((i) => sources[i]).join("\n");
      const tr = await gtxOne(joined, target);
      const parts = tr == null ? [] : tr.split("\n");
      if (parts.length === batch.length) {
        batch.forEach((idx, k) => (out[idx] = parts[k]));
      } else {
        for (const idx of batch) out[idx] = await gtxOne(sources[idx], target); // 错位保护
      }
    }
    done += batch.length;
    if (done % 500 < batch.length) console.log(`  [gtx] 进度 ${done}/${sources.length}`);
    await sleep(GTX_DELAY_MS);
  }
  return out;
}

// ---------- 5. 主流程 ----------
// 无密钥时，已提交的译文 JSON 原样保留（线上多语言依赖它们），
// 仅在文件缺失时写英文回退，保证全新 checkout 也能构建。
function writeJson(file, data) {
  if (SKIP_TRANSLATE && fs.existsSync(file)) {
    console.log(`  保留已提交译文 ${path.basename(file)}`);
    return;
  }
  fs.writeFileSync(file, JSON.stringify(data) + "\n");
}

/** 安全读取已提交译文，作为 API 缺失/回退时的兜底（避免被英文源串覆盖） */
function readJsonSafe(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return {}; }
}

async function main() {
  console.log(`翻译 provider=${PROVIDER}  目标语言=${TARGETS.map((l) => l.code).join(",")}`);
  const src = await loadSource();
  const items = collectStrings(src);
  console.log(`源字符串总数=${items.length}`);

  for (const lang of TARGETS) {
    console.log(`\n→ ${lang.code} (${lang[PROVIDER]})`);
    const tr = await translateItems(items, lang);
    const get = (id, fallback) => tr.get(id) ?? fallback;

    // 已提交译文作为兜底：API 没给出有效译文（缺失或回退成英文源串）时，
    // 优先用仓库里已提交的各语种译文，而不是直接回退英文源。
    const prevContent = readJsonSafe(path.join(CONTENT_DIR, lang.code + ".json"));
    const prevMeta = (slug) => prevContent?.meta?.[slug] || {};
    const prevMsg = readJsonSafe(path.join(MSG_DIR, lang.code + ".json"));

    // UI 消息：以已提交译文为底，API 给出真译文（≠英文源串）才覆盖；
    // 若 API 把串原样返回英文源串，保留已提交译文，绝不把手动补的分类名冲掉。
    const uiMsg = { ...prevMsg };
    for (const it of items) {
      if (!it.id.startsWith("ui:")) continue;
      const key = it.id.slice(3);
      const v = tr.get(it.id);
      if (v && v !== key) uiMsg[key] = v;
      else if (uiMsg[key] == null || uiMsg[key] === key) uiMsg[key] = prevMsg[key] ?? key;
    }
    writeJson(path.join(MSG_DIR, lang.code + ".json"), uiMsg);

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

    // 当 API 把串原样返回英文源串（如把 "PDF Toolkit" 当作品牌名不翻译）时，
    // 不能让它覆盖已提交的中文译文：优先用 API 真译文，其次回退已提交译文，最后才是英文源。
    const pick = (apiVal, fallback, source) =>
      apiVal && apiVal !== source ? apiVal : fallback;
    for (const t of src.tools) {
      const pm = prevMeta(t.slug);
      out.meta[t.slug] = {
        title: pick(tr.get(`meta:${t.slug}:title`), pm.title ?? t.title, t.title),
        description: pick(tr.get(`meta:${t.slug}:description`), pm.description ?? t.description, t.description),
        keywords: (t.keywords || []).map((kw, i) =>
          pick(tr.get(`meta:${t.slug}:keywords:${i}`), pm.keywords?.[i] ?? kw, kw)),
      };
    }
    writeJson(path.join(CONTENT_DIR, lang.code + ".json"), out);

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
    writeJson(path.join(POSTS_DIR, lang.code + ".json"), postsOut);
    const real = items.filter((it) => { const v = tr.get(it.id); return v != null && v !== it.str; }).length;
    console.log(`  UI 词条=${Object.keys(uiMsg).length}  内容字节≈${JSON.stringify(out).length}  文章=${Object.keys(postsOut).length}  译文覆盖=${real}/${items.length}`);
    // 每完成一种语言立即落盘缓存：进程被 kill / 断网也不丢已完成进度
    try { fs.writeFileSync(cacheFile, JSON.stringify(cache)); } catch { /* ignore */ }
  }

  const san = (c) => c.replace(/[^a-zA-Z0-9]/g, "_");
  // 索引始终覆盖全部 15 语言（即使本次 --langs 只跑子集），
  // 否则子集运行会生成缺语言的 index.ts 把构建搞坏。
  const ALL = LOCALES;
  const imports = ALL.map((l) => `import ${san(l.code)} from "./${l.code}.json";`).join("\n");
  const map = ALL.map((l) => `  ${JSON.stringify(l.code)}: ${san(l.code)}`).join(",\n");
  const registry =
    imports + "\n\nexport const CONTENT: Record<string, any> = {\n" + map + "\n};\n" +
    "export const CONTENT_LANGS = " + JSON.stringify(ALL.map((l) => l.code)) + ";\n";
  fs.writeFileSync(path.join(CONTENT_DIR, "index.ts"), registry);

  const msgImports = ALL.map((l) => `import ${san(l.code)}Msg from "./${l.code}.json";`).join("\n");
  const msgMap = ALL.map((l) => `  ${JSON.stringify(l.code)}: ${san(l.code)}Msg`).join(",\n");
  const msgRegistry = msgImports + "\nexport const MESSAGES: Record<string, any> = {\n" + msgMap + "\n};\n";
  fs.writeFileSync(path.join(MSG_DIR, "index.ts"), msgRegistry);

  const postImports = ALL.map((l) => `import ${san(l.code)}Post from "./${l.code}.json";`).join("\n");
  const postMap = ALL.map((l) => `  ${JSON.stringify(l.code)}: ${san(l.code)}Post`).join(",\n");
  const postRegistry = postImports + "\nexport const POSTS: Record<string, any> = {\n" + postMap + "\n};\n";
  fs.writeFileSync(path.join(POSTS_DIR, "index.ts"), postRegistry);

  fs.writeFileSync(cacheFile, JSON.stringify(cache));
  console.log("\n完成：messages/ + content/ + content/index.ts + messages/index.ts");
}

// 导出内部件，供 _cache_from_output.mjs（缓存抢救）等工具复用
export { LOCALES, loadSource, collectStrings };

// 仅当直接运行时才执行主流程（被 import 时不跑）
import { pathToFileURL } from "node:url";
const invokedDirectly =
  process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
