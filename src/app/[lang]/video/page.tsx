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
    "Video Tools: Merge, Trim, Resize, Crop, Compress, and Subtitles",
    "Merge, trim, resize, crop, convert, compress, or burn subtitles into a video in the browser. Files stay on your device. Large videos can be slow or run out of memory."
  );
}
