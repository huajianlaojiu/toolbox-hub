import ToolPageBody, { generateToolMetadata, generateLangToolStaticParams } from "@/components/tool-page-body";

export function generateStaticParams() {
  return generateLangToolStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  return generateToolMetadata(lang, slug);
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  return <ToolPageBody lang={lang} slug={slug} />;
}
