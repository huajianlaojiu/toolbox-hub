import type { Metadata } from "next";
import HomePage from "@/components/home-page";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return langPageMeta(
    lang,
    "/",
    "Merge a PDF, convert an image, or trim a video",
    "PDF, image, and video tools that run in your browser. Files are not uploaded, and no account is required."
  );
}

export default function Page() {
  return <HomePage />;
}
