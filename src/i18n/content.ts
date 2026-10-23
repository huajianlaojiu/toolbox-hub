// 服务端运行时：按语言读取构建期生成的译文并插值。
// 仅被 Server Component 引入（不进入客户端 bundle 的“全语言内容”）。
import type { ToolContent } from "@/lib/tool-content";
import { getToolContent } from "@/lib/tool-content";
import { tools } from "@/lib/tools-data";
import { CONTENT } from "./content/index";

const toolMap = new Map(tools.map((t) => [t.slug, t]));

function interpolate(s: string, vars: Record<string, string>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
}

function interpolateContent(c: ToolContent, vars: Record<string, string>): ToolContent {
  return {
    intro: c.intro ? interpolate(c.intro, vars) : c.intro,
    howTo: (c.howTo || []).map((h) => ({ step: interpolate(h.step, vars), detail: interpolate(h.detail, vars) })),
    faq: (c.faq || []).map((f) => ({ q: interpolate(f.q, vars), a: interpolate(f.a, vars) })),
    useCases: (c.useCases || []).map((u) => interpolate(u, vars)),
    tips: (c.tips || []).map((t) => interpolate(t, vars)),
  };
}

export interface ToolMetaI18n {
  title: string;
  description: string;
  keywords: string[];
}

/** 取某语言下的工具元数据（标题/描述/关键词），缺译文回退英文 */
export function getMeta(lang: string, slug: string): ToolMetaI18n {
  const base = toolMap.get(slug);
  if (!base) return { title: slug, description: "", keywords: [] };
  if (lang === "en" || !CONTENT[lang]) {
    return { title: base.title, description: base.description, keywords: base.keywords };
  }
  const m = CONTENT[lang]?.meta?.[slug];
  if (!m) return { title: base.title, description: base.description, keywords: base.keywords };
  return {
    title: m.title ?? base.title,
    description: m.description ?? base.description,
    keywords: m.keywords?.length ? m.keywords : base.keywords,
  };
}

/** 取某语言下的工具 SEO 内容（已插值 {title}/{desc}），缺译文回退英文 */
export function getContent(lang: string, slug: string): ToolContent {
  const base = toolMap.get(slug);
  const title = base?.title ?? slug;
  const desc = base?.description ?? "";
  if (lang === "en" || !CONTENT[lang]) {
    return interpolateContent(getToolContent(slug), { title, desc });
  }
  const langContent = CONTENT[lang];
  const override = langContent.overrides?.[slug];
  const tmpl = override ?? langContent.generic;
  const meta = getMeta(lang, slug);
  return interpolateContent(tmpl ?? langContent.generic, { title: meta.title, desc: meta.description });
}
