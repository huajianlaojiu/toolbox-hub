import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTool, tools } from "@/lib/tools-data";
import ToolRedirect from "@/components/tools/tool-redirect";
import { toolTranslationIndexable } from "@/lib/locale-index";
import { LOCALES, isPublished } from "@/lib/locales";
import { languageAlternates } from "@/lib/alternates";
import { getMeta, getContent } from "@/i18n/content";
import { getToolSeoOverride } from "@/lib/tool-seo";
import { getRelatedGuides } from "@/lib/related-guides";
import ToolPageContent from "@/components/tool-page-content";
import ToolWidget from "@/components/tools/tool-widget";
import { OG_IMAGE } from "@/lib/site-meta";

import AdUnit from "@/components/shared/ad-unit";
import Breadcrumb from "@/components/breadcrumb";
import ToolCard from "@/components/tool-card";
import { I18nText } from "@/components/i18n-text";
import { pageWrap } from "@/components/page-wrap";

function hreflangAlternates(slug: string) {
  // 与各语言页共用单一来源：languageAlternates 内含 x-default
  return languageAlternates(`/tools/${slug}/`);
}

export function generateToolStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export function generateLangToolStaticParams() {
  const out: { lang: string; slug: string }[] = [];
  for (const l of LOCALES) {
    if (l.code === "en") continue;
    for (const t of tools) out.push({ lang: l.code, slug: t.slug });
  }
  return out;
}

export function generateToolMetadata(lang: string, slug: string): Metadata {
  const tool = getTool(slug);
  if (!tool) return {};
  // 被收编的旧工具：不索引自身，canonical 指向统一工具箱，权重转移过去
  if (tool.redirect) {
    const targetUrl = lang === "en" ? `/tools/${tool.redirect}/` : `/${lang}/tools/${tool.redirect}/`;
    return {
      title: `${tool.title} - Free Online Tool`,
      robots: { index: false, follow: true },
      alternates: { canonical: targetUrl },
    };
  }
  const meta = getMeta(lang, slug);
  const content = getContent(lang, slug);
  // 高曝光页（GSC 实证「有展示、零点击」）用定制的绝对 title / description：
  // 绕开根布局 template，去掉通用英文后缀，并把具体收益写进 SERP 摘要。
  // 未覆盖的 1700+ 页完全走原逻辑，不触发全站重爬。
  const indexable = lang === "en" || (isPublished(lang) && toolTranslationIndexable(lang, slug));
  const seoForPage = getToolSeoOverride(indexable ? lang : "en", slug);
  const descForPage = seoForPage?.description ?? content.intro.slice(0, 158);
  const url = indexable && lang !== "en" ? `/${lang}/tools/${slug}/` : `/tools/${slug}/`;
  const m: Metadata = {
    title: seoForPage ? { absolute: seoForPage.title } : `${meta.title} - Free Online Tool`,
    description: descForPage,
    keywords: meta.keywords,
    alternates: { canonical: url, languages: hreflangAlternates(slug) },
    openGraph: {
      title: seoForPage?.title ?? `${meta.title} - Free Online Tool | Toolbox Hub`,
      description: descForPage,
      url,
      type: "article",
      images: [OG_IMAGE],
    },
  };
  // 未发布语言，以及译文对不上当前英文的工具页，都不收录。英文规范地址仍可索引。
  if (!indexable) m.robots = { index: false, follow: true };
  return m;
}

export default async function ToolPageBody({ lang, slug }: { lang: string; slug: string }) {
  const tool = getTool(slug);
  if (!tool) notFound();
  // 被收编的旧工具：渲染中转页（自动跳转 + 可见链接），不渲染旧组件
  if (tool.redirect) {
    const target = getTool(tool.redirect);
    return (
      <div className={`${pageWrap} py-8`}>
        <a href={lang === "en" ? "/tools/" : `/${lang}/tools/`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <span aria-hidden>‹</span> All Tools
        </a>
        <ToolRedirect target={tool.redirect} targetTitle={target?.title ?? tool.redirect} lang={lang} />
      </div>
    );
  }
  const relatedTools = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug && !t.redirect).slice(0, 3);
  // English-only: the in-depth guides are not translated, and English cards on
  // a localised page would be mixed-language filler.
  const relatedGuides = lang === "en" ? getRelatedGuides(slug) : [];
  const meta = getMeta(lang, slug);
  const content = getContent(lang, slug);
  const url = lang === "en" ? `/tools/${slug}/` : `/${lang}/tools/${slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: meta.title,
        description: content.intro.slice(0, 300),
        url: `https://toolbox-hub.io${url}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: `How to use the ${meta.title}`,
        description: content.intro.slice(0, 200),
        totalTime: "PT1M",
        step: content.howTo.map((h, i) => ({ "@type": "HowToStep", position: i + 1, name: h.step, text: h.detail })),
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <div className={`${pageWrap} py-4 sm:py-8`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="mb-1 sm:mb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "All Tools", href: "/tools/" },
            { label: meta.title, href: url, translate: false },
          ]}
        />
      </div>
      {/* 传译文 meta（getMeta），不是英文 tool：否则 15 语言版 H1/副标题恒为英文，与 <title> 语言相反 */}
      <ToolPageContent meta={meta} content={content}>
        <div className="mt-3 rounded-[18px] border bg-card p-4 shadow-[0_1px_2px_rgba(16,18,28,0.04),0_8px_24px_rgba(16,18,28,0.04)] sm:mt-6 sm:p-6">
          <ToolWidget slug={slug} />
        </div>
        <div className="mt-8"><AdUnit placement="tool" /></div>
      </ToolPageContent>

      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-4"><I18nText id="Related Tools" /></h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedTools.map((t) => (<ToolCard key={t.slug} tool={t} />))}
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Related guides</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedGuides.map((guide) => (
              <li key={guide.slug}>
                <a
                  href={`/blog/${guide.slug}/`}
                  className="group block h-full rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/40"
                >
                  <span className="block text-sm font-medium leading-6 group-hover:text-primary">
                    {guide.title}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    {guide.description.length > 118
                      ? `${guide.description.slice(0, 115)}...`
                      : guide.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
