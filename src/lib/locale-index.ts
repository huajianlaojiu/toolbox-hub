import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ToolContent } from "@/lib/tool-content";
import { getToolContent } from "@/lib/tool-content";
import { isPublished } from "@/lib/locales";

const overrideCache = new Map<string, Record<string, ToolContent>>();

function localeOverrides(lang: string): Record<string, ToolContent> {
  const cached = overrideCache.get(lang);
  if (cached) return cached;
  const raw = JSON.parse(readFileSync(join(process.cwd(), "src/i18n/content", `${lang}.json`), "utf8")) as {
    overrides?: Record<string, ToolContent>;
  };
  const overrides = raw.overrides ?? {};
  overrideCache.set(lang, overrides);
  return overrides;
}

/**
 * 这些英文页在这一轮改写过，其他语言没有对应的完整译文。
 * 语言版会显示英文，并且 noindex，避免把英文重复页或中英混排页当成独立语言内容收录。
 */
export const UNTRANSLATED_STATIC_PATHS = new Set([
  "/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/pdf/",
  "/images/",
  "/video/",
]);

/**
 * 中日韩字符更密，同一篇译文的字符数会短一截。
 * 低于这条线的正文不是当前英文的完整译文（缺段、旧稿，或只剩一句）。
 */
export function minIntroRatio(lang: string): number {
  if (lang === "zh" || lang === "zh-TW") return 0.22;
  if (lang === "ja" || lang === "ko") return 0.38;
  return 0.75;
}

export function toolTranslationMatches(lang: string, english: ToolContent, localized: ToolContent | undefined): boolean {
  if (!localized?.intro || !english.intro) return false;
  const ratio = localized.intro.length / english.intro.length;
  if (ratio < minIntroRatio(lang)) return false;
  if ((localized.howTo?.length ?? 0) !== english.howTo.length) return false;
  if ((localized.faq?.length ?? 0) !== english.faq.length) return false;
  return true;
}

/** 语言版工具页的长文是否可以当作该语言的独立内容收录。英文永远可以。 */
export function toolTranslationIndexable(lang: string, slug: string): boolean {
  if (lang === "en") return true;
  if (!isPublished(lang)) return false;
  const english = getToolContent(slug);
  const localized = localeOverrides(lang)[slug];
  return toolTranslationMatches(lang, english, localized);
}

/**
 * 某个语言 URL 是否可以进 sitemap / hreflang / 索引。
 * path 用英文规范路径，例如 "/"、"/about/"、"/tools/loan-calculator/"。
 */
export function localePathIndexable(lang: string, path: string): boolean {
  if (lang === "en") return true;
  if (!isPublished(lang)) return false;
  const key = path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`;
  if (UNTRANSLATED_STATIC_PATHS.has(key)) return false;
  const tool = /^\/tools\/([^/]+)\/$/.exec(key);
  if (tool) return toolTranslationIndexable(lang, tool[1]);
  return true;
}
