"use client";
import type { ToolMeta } from "@/lib/tools-data";
import { getIcon } from "@/lib/icon-map";
import { useI18n, localizePath } from "@/lib/i18n";

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  const { lang, cards } = useI18n();
  const Icon = getIcon(tool.icon);
  // 译文由服务端按当前语言注入 cards。英文 cards 为空，直接用 tools-data。
  const m = cards[tool.slug];
  const title = m?.title || tool.title;
  const desc = m?.description || tool.description;
  return (
    <a href={localizePath(`/tools/${tool.slug}/`, lang)} data-cat={tool.category}
      className="tool-tile group flex items-start gap-4 rounded-[18px] p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-[-0.02em] text-card-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{desc}</p>
      </div>
    </a>
  );
}
