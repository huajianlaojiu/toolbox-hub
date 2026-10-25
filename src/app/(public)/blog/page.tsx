import type { Metadata } from "next";
import I18nLink from "@/components/i18n-link";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { posts } from "@/lib/posts";
import { visibleTools } from "@/lib/tools-data";
import { I18nText } from "@/components/i18n-text";
import { PostCard } from "@/components/post-card";
import { languageAlternates } from "@/lib/alternates";

export const metadata: Metadata = {
  title: "Blog — Guides for Using Free Browser Tools",
  description:
    "Practical guides on using free browser-based tools for development, writing and everyday calculations. No installs, no accounts, nothing uploaded.",
  alternates: { canonical: "/blog/", languages: languageAlternates("/blog/") },
  openGraph: {
    title: "Blog — Toolbox Hub",
    description:
      "Practical guides on using free browser-based tools for development, writing and everyday calculations.",
    url: "/blog/",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Toolbox Hub Blog",
  description:
    "Practical guides on using free browser-based tools for development, writing and everyday calculations.",
  blogPost: posts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.updated,
    url: `https://toolbox-hub.io/blog/${p.slug}/`,
  })),
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <I18nLink
        href="/tools/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        <I18nText id="All Tools" />
      </I18nLink>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight"><I18nText id="Toolbox Hub Blog" /></h1>
        <p className="mt-3 text-muted-foreground leading-7">
          <I18nText id="Practical guides on getting real work done with browser-based tools. Every guide below is written around tools that run locally — no software to install, no account to create, and nothing you type sent anywhere." />
        </p>
      </header>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      <section className="mt-12 rounded-lg border bg-muted/40 p-6">
        <h2 className="text-lg font-semibold"><I18nText id="Looking for a specific tool?" /></h2>
        <p className="mt-2 text-sm text-muted-foreground leading-7">
          <I18nText id="The blog covers strategy; the tools themselves live in the directory. Use the search box in the header, or" />{" "}
          <I18nLink href="/tools/" className="text-primary hover:underline">
            <I18nText id="browse all {count} tools" vars={{ count: String(visibleTools.length) }} />
          </I18nLink>
          .
        </p>
      </section>
    </div>
  );
}
