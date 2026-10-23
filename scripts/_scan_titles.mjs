// 质检脚本：扫描 6 种已翻译语言里工具标题/描述的烂翻译。
// 规则1：英文标题含技术词（JSON/Base64/Markdown...），译文必须保留该词（大小写不敏感）。
// 规则2：英文标题整体是一个纯技术词时，译文不能把它译成普通词（如 Markdown->降价）。
// 用法：node scripts/_scan_titles.mjs
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const LANGS = ["zh", "zh-TW", "fr", "it", "de", "nl"];

// 从 tools-data.ts 提取 { slug, title, description }
const src = fs.readFileSync(path.join(root, "src/lib/tools-data.ts"), "utf8");
const tools = [];
const re = /\{\s*slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)"/g;
let m;
while ((m = re.exec(src)) !== null) tools.push({ slug: m[1], title: m[2], description: m[3] });
if (tools.length === 0) {
  console.error("!! tools-data.ts 解析到 0 个工具，正则可能不适配，终止");
  process.exit(2);
}

// 技术词表：英文标题出现时必须保留
const TECH = /Base64|Base32|Base58|JSON5?|URL|URI|HTML|XML|YAML|CSV|TSV|TOML|SQL|Regex|Cron|UUID|GUID|MD5|SHA-?1|SHA-?256|SHA-?512|CRC32|HEX|RGB|RGBA|HSL|HSV|CMYK|ASCII|UTF-?8|Unix|Epoch|Timestamp|WAV|MP3|MP4|AAC|FLAC|OGG|WEBM|GIF|PNG|JPG|JPEG|WEBP|SVG|ICO|PDF|BMP|TIFF|AVIF|Slug|Markdown|LaTeX|Diff|Hash|JWT|OAuth|GraphQL|WebSocket|TCP|UDP|SSL|TLS|SSH|FTP|SMTP|CORS|XSS/i;

// 已知误译黑名单（词 → 说明），出现在任何译文里都报
const BLACKLIST = ["降价", "減價", "降價", "démarque", "ribasso", "Afwaarderings", "afwaardering"];

let issues = 0;
for (const lang of LANGS) {
  const file = path.join(root, "src/i18n/content", `${lang}.json`);
  if (!fs.existsSync(file)) continue;
  const c = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!c.meta) continue;
  for (const t of tools) {
    const meta = c.meta[t.slug];
    if (!meta) continue;
    const et = t.title || "";
    const tt = meta.title || "";
    // 规则1：技术词丢失
    const tech = et.match(TECH);
    if (tech && !new RegExp(tech[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(tt)) {
      console.log(`[技术词丢失] ${lang} ${t.slug}: "${et}" => "${tt}"`);
      issues++;
    }
    // 规则2：黑名单误译
    for (const bad of BLACKLIST) {
      if (tt.includes(bad)) {
        console.log(`[误译黑名单] ${lang} ${t.slug}: "${et}" => "${tt}" (含 "${bad}")`);
        issues++;
      }
    }
    // 规则3：英文标题整体是技术词且译文完全不含任何 ASCII 字母（被整词意译）
    if (tech && tech[0].length >= 4 && et.replace(TECH, "").trim() === "" && !/[A-Za-z]/.test(tt)) {
      console.log(`[整词意译] ${lang} ${t.slug}: "${et}" => "${tt}"`);
      issues++;
    }
  }
}
console.log(`--- 扫描完成：${tools.length} 个工具 × ${LANGS.length} 语言，问题 ${issues} 个 ---`);
