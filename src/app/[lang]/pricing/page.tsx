export { default } from "../../(public)/pricing/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";
import { pricingDescription, pricingTitle } from "@/lib/billing";

const TITLE = pricingTitle();
const DESCRIPTION = pricingDescription();

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return langPageMeta(lang, "/pricing/", TITLE, DESCRIPTION);
}
