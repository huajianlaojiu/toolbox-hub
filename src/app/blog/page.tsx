import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { posts } from "@/lib/posts";
import { tools } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: "Blog — Guides for Using Free Browser Tools",
  description:
    "Practical guides on using free browser-based tools for development, writing and everyday calculations. No installs, no accounts, nothing uploaded.",
  alternates: { canonical: "/blog/" },
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

      <a
        href="/tools/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        All Tools
      </a>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Toolbox Hub Blog</h1>
        <p className="mt-3 text-muted-foreground leading-7">
          Practical guides on getting real work done with browser-based tools.
          Every guide below is written around tools that run locally — no
          software to install, no account to create, and nothing you type sent
          anywhere.
        </p>
      </header>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                {post.category}
              </span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span aria-hidden>·</span>
              <span>{post.readingTime}</span>
            </div>

            <h2 className="mt-3 text-xl font-semibold leading-snug">
              <Link
                href={`/blog/${post.slug}/`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </h2>

            <p className="mt-2 text-sm text-muted-foreground leading-7">
              {post.description}
            </p>

            <Link
              href={`/blog/${post.slug}/`}
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Read the guide →
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-12 rounded-lg border bg-muted/40 p-6">
        <h2 className="text-lg font-semibold">Looking for a specific tool?</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-7">
          The blog covers strategy; the tools themselves live in the directory.
          Use the search box in the header, or{" "}
          <Link href="/tools/" className="text-primary hover:underline">
            browse all {tools.length} tools
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
