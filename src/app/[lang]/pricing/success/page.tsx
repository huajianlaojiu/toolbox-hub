export { default } from "../../../(public)/pricing/success/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";
import { purchaseAvailable } from "@/lib/billing";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    ...langPageMeta(
      lang,
      "/pricing/success/",
      purchaseAvailable() ? "Checkout return" : "Plans",
      purchaseAvailable()
        ? "Return page after a Toolbox Hub Pro checkout. Payment is completed on the merchant page, not here."
        : "Purchase of Toolbox Hub Pro is not available yet. This page does not take payment."
    ),
    robots: { index: false, follow: true },
  };
}
