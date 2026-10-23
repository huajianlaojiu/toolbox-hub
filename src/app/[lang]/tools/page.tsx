export { default } from "../../(public)/tools/page";
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
    "/tools/",
    "All Tools — 96 Free Browser-Based Tools",
    "The full Toolbox Hub directory: 96 free tools grouped by what they do — developer, text, design, image, video, audio, unit converters, calculators, web, math and everyday utilities. No sign-up, nothing uploaded."
  );
}
