export { default } from "../../../(public)/blog/[slug]/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { posts, getPost } from "@/lib/posts";
import { languageAlternates } from "@/lib/alternates";
import { st } from "@/lib/lang-meta";

export function generateStaticParams() {
  const langs = LOCALES.filter((l) => l.code !== "en").map((l) => l.code);
  const out: { lang: string; slug: string }[] = [];
  for (const lang of langs) {
    for (const p of posts) {
      out.push({ lang, slug: p.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const path = `/blog/${post.slug}/`;
  const title = st(lang, post.metaTitle);
  const description = st(lang, post.description);
  return {
    title,
    description,
    alternates: { languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url: path,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
    },
  };
}
