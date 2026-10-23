"use client";
import type { ReactNode } from "react";
import type { ToolMeta } from "@/lib/tools-data";
import type { ToolContent } from "@/lib/tool-content";
import { useI18n } from "@/lib/i18n";

/**
 * 工具页整体骨架：标题 → 工具主体 → SEO 文案。
 *
 * 工具站的核心价值是工具本身。曾经把 SEO 文案（About/Where/How/Tips/FAQ）
 * 全排在工具前面，用户点进工具页第一屏是几千像素的说明文字，工具主体在
 * 老下面——滚不到、找不到，体感就是「点开了却操作不了」。
 * 所以顺序固定为：工具主体紧跟标题首屏可见，SEO 文案全部退到工具之后
 * （内容一页不少，只调顺序，不影响收录）。
 */
export function ToolPageContent({
  meta,
  content,
  children,
}: {
  meta: ToolMeta;
  content: ToolContent;
  children?: ReactNode;
}) {
  return (
    <>
      <ToolPageHeader meta={meta} />
      {children}
      <ToolPageSeo content={content} />
    </>
  );
}

/**
 * 工具页语言相关部分（客户端）。
 * meta / content 已由服务端按目标语言翻译并插值后传入；
 * 这里只负责把“版式标题”这类固定文案用 t()/tl() 翻译。
 *
 * 结构分两段是有意的：
 * - ToolPageHeader：标题 + 副标题 + 本地运行提示（首屏，紧跟工具主体）
 * - ToolPageSeo：About / Where / How / Tips / FAQ（工具之后，服务 SEO）
 * 工具站的核心价值是工具本身，不能把交互区埋在长篇文案下面——
 * 用户点进工具页第一屏就必须能看到并操作工具。
 */
export function ToolPageHeader({ meta }: { meta: ToolMeta }) {
  const { t } = useI18n();
  const title = meta.title;
  const desc = meta.description;

  return (
    <>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <p className="text-sm text-muted-foreground">{desc} {t("Runs locally in your browser")}</p>
      </div>
    </>
  );
}

export function ToolPageSeo({ content }: { content: ToolContent }) {
  const { t, tl } = useI18n();

  return (
    <>
      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">{tl("About the {title}", { title: "" })}</h2>
        <div className="space-y-4">
          {content.intro.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm leading-7 text-muted-foreground">{para}</p>
          ))}
        </div>
      </section>

      {content.useCases && content.useCases.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-3">{tl("Where people use the {title}", { title: "" })}</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-6">
            {content.useCases.map((u, i) => (<li key={i}>{u}</li>))}
          </ul>
        </section>
      )}

      <section className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">{tl("How to use the {title}", { title: "" })}</h2>
        <ol className="space-y-4">
          {content.howTo.map((h, i) => (
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

      {content.tips && content.tips.length > 0 && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-3">{t("Tips and best practices")}</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground leading-6">
            {content.tips.map((tp, i) => (<li key={i}>{tp}</li>))}
          </ul>
        </section>
      )}

      <section className="mt-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-3">{t("Frequently asked questions")}</h2>
        <div className="space-y-5">
          {content.faq.map((f, i) => (
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

export default ToolPageContent;
