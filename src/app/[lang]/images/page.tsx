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
    "Image Tools: Compress, Resize, Crop, Rotate, and Watermark",
    "Compress, resize, crop, rotate, watermark, or convert a picture, or read text from a photo. PNG compression is often modest. Files stay in your browser."
  );
}
