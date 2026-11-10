import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/posts";
import { PostArticle } from "@/components/post-article";
import { languageAlternates } from "@/lib/alternates";
import { LOCALES } from "@/lib/locales";
import { isPostTranslated } from "@/i18n/posts";

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
  const path = `/blog/${post.slug}/`;
  // 只把「真的有译文」的语言列为 hreflang 目标。新增的原创英文指南刻意不机翻，
  // 其余语言页是英文壳且 noindex；若仍在这里声明，等于把 noindex 页指成官方版本。
  // x-default 由 languageAlternates 指向英文，保留不动。
  const blogAlts = languageAlternates(path);
  for (const l of LOCALES) {
    if (l.code !== "en" && !isPostTranslated(l.code, slug)) delete blogAlts[l.hreflang];
  }
  return {
    title: post.metaTitle,
    description: post.description,
    keywords: post.title.toLowerCase(),
    alternates: { canonical: path, languages: blogAlts },
    openGraph: {
      title: post.metaTitle,
      description: post.description,
      url: path,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostArticle slug={slug} />
    </>
  );
}
