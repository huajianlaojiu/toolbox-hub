"use client";
import { useI18n, localizePath, intlLocale } from "@/lib/i18n";
import { ChevronLeft, Clock, Calendar } from "lucide-react";
import type { ReactNode } from "react";
import type { Post } from "@/lib/posts";
import { posts as allPosts } from "@/lib/posts";
import { getPostI18n } from "@/i18n/posts";
import AdUnit from "@/components/shared/ad-unit";
import { I18nText, ReadingTime } from "@/components/i18n-text";

/** 渲染段落：处理 **bold** 与 [[slug|Title]] 内链 */
function RichText({ text }: { text: string }) {
  const { lang } = useI18n();
  const paragraphs = text.split("\n\n");
  return (
    <>
      {paragraphs.map((para, pi) => {
        const parts: ReactNode[] = [];
        const segments = parseLinks(para);
        segments.forEach((seg) => {
          if (seg.href) {
            parts.push(
              <a key={parts.length} href={localizePath(seg.href, lang)} className="font-medium text-primary hover:underline">
                {seg.text}
              </a>
            );
            return;
          }
          const pieces = seg.text.split("**");
          pieces.forEach((piece, i) => {
            if (i % 2 === 1) {
              parts.push(
                <strong key={parts.length} className="font-semibold text-foreground">
                  {piece}
                </strong>
              );
            } else if (piece) {
              parts.push(<span key={parts.length}>{piece}</span>);
            }
          });
        });

        return (
          <p key={pi} className="text-sm leading-7 text-muted-foreground">
            {parts}
          </p>
        );
      })}
    </>
  );
}

/** 单行渲染（列表项/提示框）：**bold** + [[slug|Title]] */
function RichTextInline({ text }: { text: string }) {
  const { lang } = useI18n();
  const segments = parseLinks(text);
  return (
    <>
      {segments.map((seg, si) => {
        if (seg.href) {
          return (
            <a key={si} href={localizePath(seg.href, lang)} className="font-medium text-primary hover:underline">
              {seg.text}
            </a>
          );
        }
        const pieces = seg.text.split("**");
        return pieces.map((piece, i) => {
          if (i % 2 === 1) {
            return (
              <strong key={`${si}-${i}`} className="font-semibold text-foreground">
                {piece}
              </strong>
            );
          }
          return <span key={`${si}-${i}`}>{piece}</span>;
        });
      })}
    </>
  );
}

/** [[slug|Title]] 渲染前拆分 */
function parseLinks(text: string): { text: string; href?: string }[] {
  const out: { text: string; href?: string }[] = [];
  const re = /\[\[([a-z0-9-]+)\|([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[2], href: `/tools/${m[1]}/` });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export function PostArticle({ slug }: { slug: string }) {
  const { lang } = useI18n();
  const base = allPosts.find((p) => p.slug === slug);
  const post = (base && getPostI18n(lang, slug)) || base;
  if (!post) return null;

  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2);
  const headings = post.blocks.filter((b) => b.h).map((b) => b.h) as string[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <a href={localizePath("/", lang)} className="hover:text-foreground transition-colors">
          <I18nText id="Home" />
        </a>
        <span aria-hidden>/</span>
        <a href={localizePath("/blog/", lang)} className="hover:text-foreground transition-colors">
          <I18nText id="Blog" />
        </a>
        <span aria-hidden>/</span>
        <span className="text-foreground truncate max-w-[50%]">{post.category}</span>
      </nav>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{post.category}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(intlLocale(lang), {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <ReadingTime value={post.readingTime} />
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight leading-tight">{post.title}</h1>
          <p className="mt-3 text-base text-muted-foreground leading-7">{post.description}</p>
        </header>

        {headings.length > 2 && (
          <div className="mb-10 rounded-lg border bg-muted/40 p-5">
            <h2 className="text-sm font-semibold mb-3"><I18nText id="What this guide covers" /></h2>
            <ul className="space-y-1.5">
              {headings.map((h, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {i + 1}. {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-10">
          {post.blocks.map((block, i) => {
            if (block.h) {
              return (
                <h2
                  key={i}
                  id={block.h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                  className="text-xl font-semibold scroll-mt-20"
                >
                  {block.h}
                </h2>
              );
            }
            if (block.p) {
              return (
                <div key={i} className="space-y-4">
                  <RichText text={block.p} />
                </div>
              );
            }
            if (block.s) {
              return (
                <h3 key={i} className="text-base font-semibold">
                  {block.s}
                </h3>
              );
            }
            if (block.l) {
              return (
                <ul key={i} className="space-y-3">
                  {block.l.map((item, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span className="text-sm leading-7 text-muted-foreground">
                        <RichTextInline text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }
            if (block.b) {
              return (
                <aside key={i} className="rounded-lg border-l-4 border-primary bg-primary/5 p-5">
                  <p className="text-sm font-medium leading-7 text-primary">
                    <RichTextInline text={block.b} />
                  </p>
                </aside>
              );
            }
            return null;
          })}
        </div>

        <section className="mt-14 rounded-xl border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold"><I18nText id="All tools are free and private" /></h2>
          <p className="mt-2 text-sm text-muted-foreground leading-7">
            <I18nText id="Every tool referenced in this guide runs entirely in your browser. Nothing you type or paste is uploaded, no account is required, and there is no usage limit." />{" "}
            <a href={localizePath("/", lang)} className="text-primary hover:underline">
              <I18nText id="Browse the full toolbox →" />
            </a>
          </p>
        </section>
      </article>

      <div className="mt-10 max-w-3xl">
        <AdUnit />
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold mb-4"><I18nText id="More from the blog" /></h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((p) => {
              const rp = getPostI18n(lang, p.slug) ?? p;
              return (
                <a
                  key={p.slug}
                  href={localizePath(`/blog/${p.slug}/`, lang)}
                  className="block rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <span className="text-xs text-muted-foreground">{rp.category}</span>
                  <h3 className="mt-1 font-semibold text-sm leading-snug">{rp.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{rp.description}</p>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-10">
        <a
          href={localizePath("/blog/", lang)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <I18nText id="All articles" />
        </a>
      </div>
    </div>
  );
}
