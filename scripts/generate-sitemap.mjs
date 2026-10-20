import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = "https://toolbox-hub.io";

const data = readFileSync(join(ROOT, "src/lib/tools-data.ts"), "utf8");
const slugs = [...data.matchAll(/\{ slug: "([^"]+)"/g)].map((m) => m[1]);

const postsData = readFileSync(join(ROOT, "src/lib/posts.ts"), "utf8");
const postSlugs = [...postsData.matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1]);

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about/", priority: "0.4", changefreq: "monthly" },
  { loc: "/blog/", priority: "0.9", changefreq: "weekly" },
  { loc: "/contact/", priority: "0.4", changefreq: "monthly" },
  { loc: "/privacy/", priority: "0.3", changefreq: "yearly" },
  { loc: "/terms/", priority: "0.3", changefreq: "yearly" },
  { loc: "/disclaimer/", priority: "0.3", changefreq: "yearly" },
];

const urls = [
  ...STATIC_PAGES.map(
    (p) =>
      `  <url><loc>${SITE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
  ),
  ...postSlugs.map(
    (s) =>
      `  <url><loc>${SITE}/blog/${s}/</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  ),
  ...slugs.map(
    (s) =>
      `  <url><loc>${SITE}/tools/${s}/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

writeFileSync(join(ROOT, "public/sitemap.xml"), xml, "utf8");
console.log(`sitemap: ${urls.length} urls (${slugs.length} tools, ${postSlugs.length} posts)`);
