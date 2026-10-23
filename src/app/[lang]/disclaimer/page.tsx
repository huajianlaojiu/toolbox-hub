export { default } from "../../(public)/disclaimer/page";
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
    "/disclaimer/",
    "Disclaimer - Toolbox Hub",
    "Important limitations on the results produced by the Toolbox Hub free online tools."
  );
}
