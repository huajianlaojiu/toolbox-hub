import type { Metadata } from "next";
import { languageAlternates } from "./alternates";
import { MESSAGES } from "@/i18n/messages";
import { isPublished } from "./locales";

/** 服务端取译文：key 是英文原文，查不到回退英文（永远可渲染） */
export function st(lang: string, en: string): string {
  return (MESSAGES[lang] as Record<string, string> | undefined)?.[en] ?? en;
}

/**
 * [lang] 静态页 metadata：标题/描述走译文，hreflang 覆盖已发布语言版本。
 * 英文根路由的 metadata 仍由各 (public) 页面的 export const metadata 提供。
 */
export function langPageMeta(lang: string, path: string, title: string, description: string): Metadata {
  const t = st(lang, title);
  const d = st(lang, description);
  // 自指 canonical：每个语言版本的 canonical 指向自己（多语言 SEO 最佳实践），
  // 不能用英文版的——否则 /zh/ 会被当成 / 的重复页而不收录。
  const selfPath = lang === "en" ? path : `/${lang}${path}`;
  const meta: Metadata = {
    title: t,
    description: d,
    alternates: { canonical: selfPath, languages: languageAlternates(path) },
    openGraph: { title: t, description: d, url: selfPath, type: "website" },
  };
  // 未发布语言（译文仍是英文壳）不当作独立语言版本被收录，避免近重复页稀释 SEO。
  // 仍保留 follow + 自指 canonical，语言选择器可直达、内部链接不破。
  if (!isPublished(lang)) {
    meta.robots = { index: false, follow: true };
  }
  return meta;
}
