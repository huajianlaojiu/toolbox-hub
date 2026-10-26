import { LOCALES, isPublished } from "./locales";

/**
 * 页面在已发布语言版本间的 hreflang 映射（未发布语言被排除，
 * 否则会把 noindex 的英文壳页声明为某语言的“官方版本”，与 robots 冲突）。
 * @param path 英文规范路径（不带语言前缀），如 "/" "/tools/" "/about/" "/blog/<slug>/"
 */
export function languageAlternates(path: string): Record<string, string> {
  // x-default 指向英文根路径：搜索引擎对无法匹配任何 hreflang 的访客展示英文版
  const map: Record<string, string> = { en: path, "x-default": path };
  for (const l of LOCALES) {
    if (l.code === "en") continue;
    if (!isPublished(l.code)) continue; // 未发布语言不当作 hreflang 目标
    map[l.hreflang] = `/${l.code}${path}`;
  }
  return map;
}
