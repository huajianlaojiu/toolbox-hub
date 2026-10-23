import ToolPageBody, { generateToolMetadata, generateToolStaticParams } from "@/components/tool-page-body";

export function generateStaticParams() {
  return generateToolStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateToolMetadata("en", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ToolPageBody lang="en" slug={slug} />;
}
