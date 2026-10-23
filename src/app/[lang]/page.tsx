export { default } from "../(public)/page";
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
    "/",
    "Toolbox Hub - Free Online Tools",
    "Free online tools for developers, designers, and everyday tasks. JSON formatter, Base64 encoder, QR code generator, password generator, and more. No sign-up required."
  );
}
