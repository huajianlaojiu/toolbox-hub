export { default } from "../../(public)/about/page";
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
    "/about/",
    "About Toolbox Hub",
    "Toolbox Hub is a free collection of browser-based utilities for developers, designers and everyday tasks. Learn who builds it and how it works."
  );
}
