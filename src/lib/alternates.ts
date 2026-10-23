import { LOCALES } from "./locales";

/**
 * 页面在 16 个语言版本间的 hreflang 映射。
 * @param path 英文规范路径（不带语言前缀），如 "/" "/tools/" "/about/" "/blog/<slug>/"
 */
export function languageAlternates(path: string): Record<string, string> {
  // x-default 指向英文根路径：搜索引擎对无法匹配任何 hreflang 的访客展示英文版
  const map: Record<string, string> = { en: path, "x-default": path };
  for (const l of LOCALES) {
    if (l.code !== "en") map[l.hreflang] = `/${l.code}${path}`;
  }
  return map;
}
