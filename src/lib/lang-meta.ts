import type { Metadata } from "next";
import { languageAlternates } from "./alternates";
import { MESSAGES } from "@/i18n/messages";

/** 服务端取译文：key 是英文原文，查不到回退英文（永远可渲染） */
export function st(lang: string, en: string): string {
  return (MESSAGES[lang] as Record<string, string> | undefined)?.[en] ?? en;
}

/**
 * [lang] 静态页 metadata：标题/描述走译文，hreflang 覆盖全部语言版本。
 * 英文根路由的 metadata 仍由各 (public) 页面的 export const metadata 提供。
 */
export function langPageMeta(lang: string, path: string, title: string, description: string): Metadata {
  const t = st(lang, title);
  const d = st(lang, description);
  return {
    title: t,
    description: d,
    alternates: { languages: languageAlternates(path) },
    openGraph: { title: t, description: d, url: path, type: "website" },
  };
}
