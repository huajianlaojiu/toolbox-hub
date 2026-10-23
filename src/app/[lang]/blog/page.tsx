export { default } from "../../(public)/blog/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return langPageMeta(
    lang,
    "/blog/",
    "Blog — Guides for Using Free Browser Tools",
    "Practical guides on using free browser-based tools for development, writing and everyday calculations. No installs, no accounts, nothing uploaded."
  );
}
