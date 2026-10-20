import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, Calendar } from "lucide-react";
import type { ReactNode } from "react";
import AdUnit from "@/components/shared/ad-unit";
import { getPost, posts, parseLinks } from "@/lib/posts";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.metaTitle,
    description: post.description,
    keywords: post.title.toLowerCase(),
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      title: post.metaTitle,
      description: post.description,
      url: `/blog/${post.slug}/`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
}

/** 渲染段落：处理 **bold** 与 [[slug|Title]] 内链 */
function RichText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <>
      {paragraphs.map((para, pi) => {
        const parts: ReactNode[] = [];
        let rest = para;
        let key = 0;

        const segments = parseLinks(rest);
        segments.forEach((seg) => {
          if (seg.href) {
            parts.push(
              <Link
                key={key++}
                href={seg.href}
                className="font-medium text-primary hover:underline"
              >
                {seg.text}
              </Link>
            );
            return;
          }
          // 处理 **bold**
          const pieces = seg.text.split("**");
          pieces.forEach((piece, i) => {
            if (i % 2 === 1) {
              parts.push(
                <strong key={key++} className="font-semibold text-foreground">
                  {piece}
                </strong>
              );
            } else if (piece) {
              parts.push(<span key={key++}>{piece}</span>);
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

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter((p) => p.slug !== slug).slice(0, 2);

  const headings = post.blocks.filter((b) => b.h).map((b) => b.h) as string[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.updated,
        articleSection: post.category,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://toolbox-hub.io/blog/${post.slug}/`,
        },
        publisher: { "@type": "Organization", name: "Toolbox Hub" },
        url: `https://toolbox-hub.io/blog/${post.slug}/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://toolbox-hub.io/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://toolbox-hub.io/blog/" },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `https://toolbox-hub.io/blog/${post.slug}/`,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-foreground transition-colors">
          Home
        </a>
        <span aria-hidden>/</span>
        <a href="/blog/" className="hover:text-foreground transition-colors">
          Blog
        </a>
        <span aria-hidden>/</span>
        <span className="text-foreground truncate max-w-[50%]">{post.category}</span>
      </nav>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-7">
            {post.description}
          </p>
        </header>

        {headings.length > 2 && (
          <div className="mb-10 rounded-lg border bg-muted/40 p-5">
            <h2 className="text-sm font-semibold mb-3">What this guide covers</h2>
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
                <aside
                  key={i}
                  className="rounded-lg border-l-4 border-primary bg-primary/5 p-5"
                >
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
          <h2 className="text-lg font-semibold">All tools are free and private</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-7">
            Every tool referenced in this guide runs entirely in your browser.
            Nothing you type or paste is uploaded, no account is required, and
            there is no usage limit.{" "}
            <Link href="/" className="text-primary hover:underline">
              Browse the full toolbox →
            </Link>
          </p>
        </section>
      </article>

      <div className="mt-10 max-w-3xl">
      <AdUnit />
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-semibold mb-4">More from the blog</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="block rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <span className="text-xs text-muted-foreground">{p.category}</span>
                <h3 className="mt-1 font-semibold text-sm leading-snug">{p.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <a
          href="/blog/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          All articles
        </a>
      </div>
    </div>
  );
}

/** 单行渲染（列表项/提示框）：**bold** + [[slug|Title]] */
function RichTextInline({ text }: { text: string }) {
  const segments = parseLinks(text);
  return (
    <>
      {segments.map((seg, si) => {
        if (seg.href) {
          return (
            <Link
              key={si}
              href={seg.href}
              className="font-medium text-primary hover:underline"
            >
              {seg.text}
            </Link>
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
