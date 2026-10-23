export { default } from "../../(public)/privacy/page";
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
    "/privacy/",
    "Privacy Policy - Toolbox Hub",
    "How Toolbox Hub handles data: browser-based processing, advertising cookies, third-party vendors, and your rights."
  );
}
