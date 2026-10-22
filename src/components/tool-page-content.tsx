"use client";
import type { ToolMeta } from "@/lib/tools-data";
import type { ToolContent } from "@/lib/tool-content";
import { useI18n } from "@/lib/i18n";

/**
 * 工具页语言相关部分。静态导出站不能用 searchParams 做 SSR 语言变体，
 * SSR 始终输出英文，中文由客户端切换（useI18n）实时替换。
 */
export function ToolPageHeader({ tool }: { tool: ToolMeta }) {
  const { lang } = useI18n();
  const zh = lang === "zh";
  const title = zh && tool.titleZh ? tool.titleZh : tool.title;
  const desc = zh && tool.descriptionZh ? tool.descriptionZh : tool.description;
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function ToolPageSeo({ tool, content }: { tool: ToolMeta; content: ToolContent }) {
  const { lang, t } = useI18n();
  const zh = lang === "zh";

  const title = zh && tool.titleZh ? tool.titleZh : tool.title;
  const desc = zh && tool.descriptionZh ? tool.descriptionZh : tool.description;
  const intro = zh ? content.introZh ?? content.intro : content.intro;
  const howTo = zh ? content.howToZh ?? content.howTo : content.howTo;
  const faq = zh ? content.faqZh ?? content.faq : content.faq;
  const useCases = zh ? content.useCasesZh ?? content.useCases : content.useCases;
  const tips = zh ? content.tipsZh ?? content.tips : content.tips;

  return (
    <>
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">{desc} {t("tool.local")}</p>
      </div>

      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">{zh ? `关于${title}` : `About the ${tool.title}`}</h2>
        <div className="space-y-4">
          {intro.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm leading-7 text-muted-foreground">{para}</p>
          ))}
        </div>
      </section>

      {useCases && useCases.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-3">{zh ? "适用场景" : `Where people use the ${tool.title}`}</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-6">
            {useCases.map((u, i) => (<li key={i}>{u}</li>))}
          </ul>
        </section>
      )}

      <section className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">{zh ? "使用方法" : `How to use the ${tool.title}`}</h2>
        <ol className="space-y-4">
          {howTo.map((h, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">{i + 1}</span>
              <div>
                <p className="font-medium text-sm">{h.step}</p>
                <p className="text-sm text-muted-foreground leading-6 mt-1">{h.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {tips && tips.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-3">{zh ? "使用技巧" : "Tips and best practices"}</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-6">
            {tips.map((tp, i) => (<li key={i}>{tp}</li>))}
          </ul>
        </section>
      )}

      <section className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">{zh ? "常见问题" : "Frequently asked questions"}</h2>
        <div className="space-y-5">
          {faq.map((f, i) => (
            <div key={i}>
              <h3 className="font-semibold text-sm">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-6 mt-1.5">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default ToolPageSeo;
