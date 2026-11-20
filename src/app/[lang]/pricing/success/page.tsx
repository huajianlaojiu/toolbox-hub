export { default } from "../../../(public)/pricing/success/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    ...langPageMeta(
      lang,
      "/pricing/success/",
      "Checkout return",
      "Return page after a Toolbox Hub Pro checkout. Payment is completed on the merchant page, not here."
    ),
    robots: { index: false, follow: true },
  };
}
