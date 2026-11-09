// 博客文章译文读取：key 为 slug，缺译文回退英文。
// 数据是构建期固化的纯 JSON，Server / Client 组件都可直接 import。
import type { Post, Block } from "@/lib/posts";
import { posts as allPosts } from "@/lib/posts";
import { POSTS } from "./posts/index";

const baseMap = new Map(allPosts.map((p) => [p.slug, p]));

/** 取某语言下的文章（标题/描述/分类/正文块），缺译文回退英文 */
/**
 * 该语言下的这篇文章是否真的有译文。
 *
 * 背景：2026-10 补翻时 CI 回写漏了 src/i18n/posts 目录，导致 ar/ja/ko/pl/pt/
 * ru/tr/vi 八种语言的 6 篇博文 title/category/正文块全部仍是英文源串（仅部分
 * description 被翻过）。这些「外语 URL + 全英文正文」页不能当作独立语言版本
 * 收录，也不该出现在 hreflang / sitemap 里。
 *
 * 判定依据用正文块而非 description：那 8 种语言有 4 篇描述译过，但正文 0%
 * 翻译。要求 >=50% 的正文块字符串与英文源串不同，可干净区分（实测 0% vs 100%）。
 */
export function isPostTranslated(lang: string, slug: string): boolean {
  if (lang === "en") return true;
  const base = baseMap.get(slug);
  const t = POSTS[lang]?.[slug];
  if (!base || !t || !Array.isArray(t.blocks)) return false;
  let total = 0;
  let different = 0;
  const blocks = t.blocks as unknown as Record<string, unknown>[];
  blocks.forEach((block, i) => {
    const src = (base.blocks[i] ?? {}) as unknown as Record<string, unknown>;
    for (const [k, v] of Object.entries(block ?? {})) {
      if (!["h", "p", "b", "s"].includes(k)) continue;
      if (typeof v !== "string" || !v.trim()) continue;
      total++;
      if (src[k] !== v) different++;
    }
  });
  return total > 0 && different / total >= 0.5;
}

export function getPostI18n(lang: string, slug: string): Post | undefined {
  const base = baseMap.get(slug);
  if (!base) return undefined;
  if (lang === "en" || !POSTS[lang]) return base;
  const t = POSTS[lang]?.[slug];
  if (!t) return base;
  const blocks: Block[] = (t.blocks ?? base.blocks).map((b: Block, i: number) => {
    const src = base.blocks[i] ?? {};
    return {
      ...(b.h ? { h: b.h } : src.h ? { h: src.h } : {}),
      ...(b.p ? { p: b.p } : src.p ? { p: src.p } : {}),
      ...(b.b ? { b: b.b } : src.b ? { b: src.b } : {}),
      ...(b.s ? { s: b.s } : src.s ? { s: src.s } : {}),
      ...(b.l || src.l ? { l: b.l ?? src.l } : {}),
    };
  });
  return {
    ...base,
    title: t.title ?? base.title,
    description: t.description ?? base.description,
    category: t.category ?? base.category,
    blocks,
  };
}
