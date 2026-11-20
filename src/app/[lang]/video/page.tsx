export { default } from "../../(public)/video/page";
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
    "/video/",
    "Video Tools: Merge, Trim, Convert, and Compress",
    "Merge, trim, convert, and compress video in the browser, plus the other video tools on Toolbox Hub. Files stay on your device."
  );
}
