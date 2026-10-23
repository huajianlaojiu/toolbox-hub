import { LOCALES } from "./locales";

/**
 * 页面在 16 个语言版本间的 hreflang 映射。
 * @param path 英文规范路径（不带语言前缀），如 "/" "/tools/" "/about/" "/blog/<slug>/"
 */
export function languageAlternates(path: string): Record<string, string> {
  const map: Record<string, string> = { en: path };
  for (const l of LOCALES) {
    if (l.code !== "en") map[l.hreflang] = `/${l.code}${path}`;
  }
  return map;
}
