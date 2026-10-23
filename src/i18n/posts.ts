// 博客文章译文读取：key 为 slug，缺译文回退英文。
// 数据是构建期固化的纯 JSON，Server / Client 组件都可直接 import。
import type { Post, Block } from "@/lib/posts";
import { posts as allPosts } from "@/lib/posts";
import { POSTS } from "./posts/index";

const baseMap = new Map(allPosts.map((p) => [p.slug, p]));

/** 取某语言下的文章（标题/描述/分类/正文块），缺译文回退英文 */
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
