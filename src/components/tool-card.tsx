"use client";
import type { ToolMeta } from "@/lib/tools-data";
import { getIcon } from "@/lib/icon-map";
import { useI18n, localizePath } from "@/lib/i18n";
import { CONTENT } from "@/i18n/content/index";

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  const { lang } = useI18n();
  const Icon = getIcon(tool.icon);
  // 构建期固化的译文：15 种语言全覆盖，缺译文回退英文
  const m = lang !== "en" ? CONTENT[lang]?.meta?.[tool.slug] : undefined;
  const title = m?.title ?? tool.title;
  const desc = m?.description ?? tool.description;
  return (
    <a href={localizePath(`/tools/${tool.slug}/`, lang)} data-cat={tool.category}
      className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{desc}</p>
      </div>
    </a>
  );
}
