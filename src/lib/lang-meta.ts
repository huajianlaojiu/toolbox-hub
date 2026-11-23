import type { Metadata } from "next";
import { languageAlternates } from "./alternates";
import { MESSAGES } from "@/i18n/messages";
import { localePathIndexable } from "./locale-index";
import { isPublished } from "./locales";
import { OG_IMAGE, pageTitle } from "./site-meta";

/** 服务端取译文：key 是英文原文，查不到回退英文（永远可渲染） */
export function st(lang: string, en: string): string {
  return (MESSAGES[lang] as Record<string, string> | undefined)?.[en] ?? en;
}

function fill(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
}

/** 把数字与 {var} 占位符视作同一个符号，用于兼容「数值被写进 key」的历史译文 */
function normalize(s: string): string {
  return s.replace(/\{\w+\}|\d+/g, "\u0000");
}

/**
 * 变量感知的服务端译文查找。
 *
 * 背景：目录页曾把工具数直接拼进英文源串，而字典的 key 就是英文源串，
 * 于是「96 → 97」会让 15 语言译文全部失效。现在改成稳定模板 + vars：
 *   1. 优先查稳定模板 key（新字典 / 下次翻译会话的产物）；
 *   2. 兼容历史 key：归一化后完全相同才命中，并把译文里的旧数值换成当前值。
 *      —— 只有文案本身没变才会命中。若文案已改（例如隐私宣称修正），
 *      归一化后不相等，自动回退英文，绝不复活过时的旧译文；
 *   3. 最后回退插值后的英文，保证永远可渲染。
 */
function stv(lang: string, template: string, vars?: Record<string, string>): string {
  const en = fill(template, vars);
  const dict = MESSAGES[lang] as Record<string, string> | undefined;
  if (!vars || Object.keys(vars).length === 0) return st(lang, en);
  if (!dict) return en;
  if (dict[template]) return fill(dict[template], vars);

  const target = normalize(template);
  for (const [key, translated] of Object.entries(dict)) {
    if (normalize(key) !== target) continue;
    const oldNumbers = key.match(/\d+/g) ?? [];
    const names: string[] = [];
    template.replace(/\{(\w+)\}/g, (whole, name: string) => {
      names.push(name);
      return whole;
    });
    let i = 0;
    // 只替换「与旧 key 中数值一致」的译文字串，避免误伤译文里的其他数字
    return translated.replace(/\d+/g, (num) => {
      const old = oldNumbers[i] ?? num;
      const next = vars[names[i]] ?? num;
      i++;
      return num === old ? next : num;
    });
  }
  return en;
}

/**
 * [lang] 静态页 metadata：标题/描述走译文，hreflang 覆盖已发布语言版本。
 * 英文根路由的 metadata 仍由各 (public) 页面的 export const metadata 提供。
 * 第五个参数 vars 可选：含 {count} 之类动态值时传入，避免数值被编进翻译 key。
 */
export function langPageMeta(
  lang: string,
  path: string,
  title: string,
  description: string,
  vars?: Record<string, string>
): Metadata {
  const t = stv(lang, title, vars);
  const d = stv(lang, description, vars);
  // 自指 canonical：每个语言版本的 canonical 指向自己（多语言 SEO 最佳实践），
  // 不能用英文版的——否则 /zh/ 会被当成 / 的重复页而不收录。
  const indexable = localePathIndexable(lang, path);
  // 没有完整译文的语言页指向英文，避免把英文重复页或中英混排页标成该语言的规范地址。
  const selfPath = indexable ? (lang === "en" ? path : `/${lang}${path}`) : path;
  const meta: Metadata = {
    title: pageTitle(t),
    description: d,
    alternates: { canonical: selfPath, languages: languageAlternates(path) },
    openGraph: { title: t, description: d, url: selfPath, type: "website", images: [OG_IMAGE] },
  };
  // 未发布语言，以及译文对不上当前英文的页面，都不收录。
  // 路由仍在，follow 保留，语言选择器可以打开。
  if (!isPublished(lang) || !indexable) {
    meta.robots = { index: false, follow: true };
  }
  return meta;
}
