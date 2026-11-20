export { default } from "../../(public)/images/page";
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
    "/images/",
    "Image Tools: Convert, Resize, and OCR",
    "Convert, resize, or rotate a picture, read text from a photo, or encode an image as Base64. The work stays in your browser."
  );
}
