import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = "https://toolbox-hub.io";

// 与 src/lib/locales.ts 保持一致（内联，避免 TS 解析）
const LANGS = [
  { code: "en", hreflang: "en" },
  { code: "zh", hreflang: "zh-Hans" },
  { code: "zh-TW", hreflang: "zh-Hant" },
  { code: "ja", hreflang: "ja" },
  { code: "ko", hreflang: "ko" },
  { code: "es", hreflang: "es" },
  { code: "fr", hreflang: "fr" },
  { code: "de", hreflang: "de" },
  { code: "pt", hreflang: "pt-BR" },
  { code: "ru", hreflang: "ru" },
  { code: "ar", hreflang: "ar" },
  { code: "it", hreflang: "it" },
  { code: "nl", hreflang: "nl" },
  { code: "tr", hreflang: "tr" },
  { code: "pl", hreflang: "pl" },
  { code: "vi", hreflang: "vi" },
];
// 已发布（有真实译文、允许收录）的语言白名单，与 src/lib/locales.ts PUBLISHED_LANGS 同步。
// 未发布语言仍会构建静态页（语言选择器可直达），但不写进 sitemap、也不作为 hreflang 目标，
// 避免 9 份英文壳页被 Google 当作独立语言版本而稀释整站 SEO。
const PUBLISHED = new Set([
  "en", "zh", "zh-TW", "fr", "de", "it", "nl",
]);
const LANGS_PUB = LANGS.filter((l) => PUBLISHED.has(l.code));
const prefix = (code) => (code === "en" ? "" : `/${code}`);

const data = readFileSync(join(ROOT, "src/lib/tools-data.ts"), "utf8");
// 跳过已被收编（redirect）的旧工具，避免 noindex 页进 sitemap 造成冲突
const slugs = [...data.matchAll(/\{ slug: "([^"]+)"([^}]*)\}/g)]
  .filter((m) => !/redirect:\s*"/.test(m[2]))
  .map((m) => m[1]);

const postsData = readFileSync(join(ROOT, "src/lib/posts.ts"), "utf8");
const postSlugs = [...postsData.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about/", priority: "0.4", changefreq: "monthly" },
  { loc: "/tools/", priority: "0.95", changefreq: "weekly" },
  { loc: "/blog/", priority: "0.9", changefreq: "weekly" },
  { loc: "/contact/", priority: "0.4", changefreq: "monthly" },
  { loc: "/privacy/", priority: "0.3", changefreq: "yearly" },
  { loc: "/terms/", priority: "0.3", changefreq: "yearly" },
  { loc: "/disclaimer/", priority: "0.3", changefreq: "yearly" },
];

const LASTMOD = new Date().toISOString().slice(0, 10);

function alternateLinks(loc) {
  const links = LANGS_PUB.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${SITE}${prefix(l.code)}${loc}"/>`
  );
  links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${loc}"/>`);
  return links.join("\n");
}

const urls = [];
for (const p of STATIC_PAGES) {
  for (const l of LANGS_PUB) {
    urls.push(
      `  <url><loc>${SITE}${prefix(l.code)}${p.loc}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority>\n${alternateLinks(p.loc)}\n  </url>`
    );
  }
}
for (const s of postSlugs) {
  const loc = `/blog/${s}/`;
  for (const l of LANGS_PUB) {
    urls.push(
      `  <url><loc>${SITE}${prefix(l.code)}${loc}</loc><lastmod>${LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>\n${alternateLinks(loc)}\n  </url>`
    );
  }
}
for (const s of slugs) {
  const loc = `/tools/${s}/`;
  for (const l of LANGS_PUB) {
    urls.push(
      `  <url><loc>${SITE}${prefix(l.code)}${loc}</loc><lastmod>${LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>\n${alternateLinks(loc)}\n  </url>`
    );
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "public/sitemap.xml"), xml, "utf8");
console.log(`sitemap: ${urls.length} urls (${slugs.length} tools × ${LANGS_PUB.length} langs + ${postSlugs.length} posts + ${STATIC_PAGES.length} static)`);
