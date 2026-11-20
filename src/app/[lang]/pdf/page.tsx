export { default } from "../../(public)/pdf/page";
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
    "/pdf/",
    "PDF Tools: Merge, Split, and Convert",
    "Merge PDFs, split out a page range, turn images into a PDF, or export pages as images and text. The work stays in your browser."
  );
}
