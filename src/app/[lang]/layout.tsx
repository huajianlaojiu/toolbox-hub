import "../globals.css";
import { notFound } from "next/navigation";
import Document from "@/components/document";
import SiteShell from "@/components/site-shell";
import { LOCALES, getLocale } from "@/lib/locales";
import { MESSAGES } from "@/i18n/messages";
import { siteMetadata } from "@/lib/site-meta";
import type { Messages } from "@/lib/i18n";

const LANGS = new Set(LOCALES.map((l) => l.code));

export const metadata = siteMetadata;

export function generateStaticParams() {
  return LOCALES.filter((l) => l.code !== "en").map((l) => ({ lang: l.code }));
}

/** 多语言站根布局：lang/dir 跟随实际语言（阿拉伯语 rtl），URL 带 /<lang>/ 前缀 */
export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!LANGS.has(lang)) notFound();
  const dict: Messages = MESSAGES[lang] ?? {};
  return (
    <Document lang={lang} dir={getLocale(lang).rtl ? "rtl" : "ltr"}>
      <SiteShell lang={lang} dict={dict}>{children}</SiteShell>
    </Document>
  );
}
