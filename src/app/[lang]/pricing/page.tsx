export { default } from "../../(public)/pricing/page";
import type { Metadata } from "next";
import { LOCALES } from "@/lib/locales";
import { langPageMeta } from "@/lib/lang-meta";

const TITLE = "Toolbox Hub Pro — $6/month or $48/year";
const DESCRIPTION =
  "Optional Pro plan for larger file batches, a JSON export of the job list kept in this browser, and no ads. Single-job use of every tool stays free.";

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return langPageMeta(lang, "/pricing/", TITLE, DESCRIPTION);
}
