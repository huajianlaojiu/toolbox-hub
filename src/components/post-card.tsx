"use client";
import { useI18n, localizePath } from "@/lib/i18n";
import type { Post } from "@/lib/posts";
import { getPostI18n } from "@/i18n/posts";
import { I18nText } from "@/components/i18n-text";

export function PostCard({ post }: { post: Post }) {
  const { lang } = useI18n();
  const p = getPostI18n(lang, post.slug) ?? post;
  return (
    <article className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/40">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{p.category}</span>
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
        <a href={localizePath(`/blog/${post.slug}/`, lang)} className="hover:text-primary transition-colors">
          {p.title}
        </a>
      </h2>

      <p className="mt-2 text-sm text-muted-foreground leading-7">{p.description}</p>

      <a
        href={localizePath(`/blog/${post.slug}/`, lang)}
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        <I18nText id="Read the guide →" />
      </a>
    </article>
  );
}
