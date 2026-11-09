export { default } from "../../../(public)/blog/[slug]/page";
import type { Metadata } from "next";
import { LOCALES, isPublished } from "@/lib/locales";
import { posts, getPost } from "@/lib/posts";
import { languageAlternates } from "@/lib/alternates";
import { st } from "@/lib/lang-meta";
import { getPostI18n, isPostTranslated } from "@/i18n/posts";

export function generateStaticParams() {
  const langs = LOCALES.filter((l) => l.code !== "en").map((l) => l.code);
  const out: { lang: string; slug: string }[] = [];
  for (const lang of langs) {
    for (const p of posts) {
      out.push({ lang, slug: p.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const path = `/blog/${post.slug}/`;
  // 自指 canonical：翻译版指向自己，否则会被当成英文版的重复页
  const selfPath = lang === "en" ? path : `/${lang}${path}`;
  // 文章译文在 src/i18n/posts/<lang>.json（按 slug），不在 messages 字典里。
  // 之前用 st(lang, post.metaTitle) 查 messages，必然查不到 → 90 个语言博客页
  // 的 title/description/OG 全是英文，正文却是译文。
  const translated = getPostI18n(lang, slug) ?? post;
  const lookedUp = st(lang, post.metaTitle);
  // metaTitle 目前没有单独译文字段：优先字典精确命中，否则用已翻译的文章标题。
  const title = lookedUp !== post.metaTitle ? lookedUp : translated.title;
  // description 暂不采用 posts/<lang>.json 里的译文：那批译文是 2026-10 旧英文
  // 文案的机翻，而英文源串在 11-07/11-09 合规修订后已改（去掉了
  // "nothing uploaded" / "never upload" 这类绝对化宣称）。直接采用会把过时
  // 且与站点实际行为不符的宣称送进 SERP 摘要与 OG 卡片。
  // 改查 messages 字典中「新英文描述」的译文，缺失时回退英文源串。
  // 待一次翻译会话重翻 posts/<lang>.json 并补齐字典后，把本行替换为
  // translated.description 即可恢复本地化描述。
  const description = st(lang, post.description);
  // 8 种语言的 6 篇博文正文仍是英文源串（见 isPostTranslated 注释）：
  // 这些页不该被收录，也不该被 hreflang 声明成该语言的官方版本。
  const postReady = isPostTranslated(lang, slug);
  const blogAlts = languageAlternates(path);
  for (const l of LOCALES) {
    if (l.code !== "en" && !isPostTranslated(l.code, slug)) delete blogAlts[l.hreflang];
  }
  // 英文壳页的 canonical 指向英文原文，配合 noindex 让搜索引擎合并重复内容；
  // 有真实译文的页仍自指 canonical，行为完全不变。
  const canonical = postReady ? selfPath : path;
  const m: Metadata = {
    title,
    description,
    keywords: translated.title.toLowerCase(),
    alternates: { canonical, languages: blogAlts },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
  // 未发布语言（译文仍是英文壳）或该文章未翻译，都不当作独立版本收录
  if (!isPublished(lang) || !postReady) m.robots = { index: false, follow: true };
  return m;
}
