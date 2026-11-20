export { default } from "../../(public)/pdf/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { PDF_PAGE_DESCRIPTION, PDF_PAGE_TITLE } from "@/lib/file-catalog";
import { langPageMeta } from "@/lib/lang-meta";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return langPageMeta(
    lang,
    "/pdf/",
    PDF_PAGE_TITLE,
    PDF_PAGE_DESCRIPTION
  );
}
