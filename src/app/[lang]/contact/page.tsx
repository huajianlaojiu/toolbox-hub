export { default } from "../../(public)/contact/page";
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
    "/contact/",
    "Contact Toolbox Hub",
    "Email hello@toolbox-hub.io to report a bug, request a tool, or send a correction. Include the tool name and your browser."
  );
}
