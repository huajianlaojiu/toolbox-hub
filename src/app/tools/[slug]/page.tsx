import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTool, tools } from "@/lib/tools-data";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ToolCard from "@/components/tool-card";
import JsonFormatter from "@/components/tools/json-formatter";
import Base64Encoder from "@/components/tools/base64-encoder";
import UrlEncoder from "@/components/tools/url-encoder";
import QrCodeGenerator from "@/components/tools/qr-code-generator";
import UuidGenerator from "@/components/tools/uuid-generator";
import PasswordGenerator from "@/components/tools/password-generator";
import TimestampConverter from "@/components/tools/timestamp-converter";
import Md5Generator from "@/components/tools/md5-generator";
import WordCounter from "@/components/tools/word-counter";
import ColorConverter from "@/components/tools/color-converter";
import TextToSlug from "@/components/tools/text-to-slug";
import HtmlEntityEncoder from "@/components/tools/html-entity-encoder";
import FileSizeConverter from "@/components/tools/file-size-converter";
import MarkdownPreview from "@/components/tools/markdown-preview";
import ImageCompressor from "@/components/tools/image-compressor";

interface ToolPageProps { params: Promise<{ slug: string }> }
export function generateStaticParams() { return tools.map((tool) => ({ slug: tool.slug })) }
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params; const tool = getTool(slug); if (!tool) return {};
  return { title: tool.title, description: tool.description, keywords: tool.keywords }
}
export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params; const tool = getTool(slug); if (!tool) notFound();
  const relatedTools = tools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"><ChevronLeft className="h-4 w-4" />All Tools</Link>
      <div className="mb-8"><h1 className="text-2xl font-bold">{tool.title}</h1><p className="mt-2 text-sm text-muted-foreground">{tool.description}</p></div>
      <div className="rounded-xl border bg-card p-6">
        {slug === "json-formatter" && <JsonFormatter />}
        {slug === "base64-encoder" && <Base64Encoder />}
        {slug === "url-encoder" && <UrlEncoder />}
        {slug === "qr-code-generator" && <QrCodeGenerator />}
        {slug === "uuid-generator" && <UuidGenerator />}
        {slug === "password-generator" && <PasswordGenerator />}
        {slug === "timestamp-converter" && <TimestampConverter />}
        {slug === "md5-generator" && <Md5Generator />}
        {slug === "word-counter" && <WordCounter />}
        {slug === "color-converter" && <ColorConverter />}
        {slug === "text-to-slug" && <TextToSlug />}
        {slug === "html-entity-encoder" && <HtmlEntityEncoder />}
        {slug === "file-size-converter" && <FileSizeConverter />}
        {slug === "markdown-preview" && <MarkdownPreview />}
        {slug === "image-compressor" && <ImageCompressor />}
      </div>
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border"><p className="text-sm text-muted-foreground">{tool.description} All processing happens in your browser.</p></div>
      {relatedTools.length > 0 && (<section className="mt-12"><h2 className="text-lg font-semibold mb-4">Related Tools</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{relatedTools.map((t) => (<ToolCard key={t.slug} tool={t} />))}</div></section>)}
    </div>
  )
}