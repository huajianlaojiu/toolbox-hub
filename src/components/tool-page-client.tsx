"use client";

import dynamic from "next/dynamic";
import type { ToolMeta } from "@/lib/tools-data";
import { tools } from "@/lib/tools-data";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ToolCard from "@/components/tool-card";

const toolComponents: Record<string, React.ComponentType> = {
  "json-formatter": dynamic(() => import("@/components/tools/json-formatter"), { ssr: true }),
  "base64-encoder": dynamic(() => import("@/components/tools/base64-encoder"), { ssr: true }),
  "url-encoder": dynamic(() => import("@/components/tools/url-encoder"), { ssr: true }),
  "qr-code-generator": dynamic(() => import("@/components/tools/qr-code-generator"), { ssr: true }),
  "uuid-generator": dynamic(() => import("@/components/tools/uuid-generator"), { ssr: true }),
  "password-generator": dynamic(() => import("@/components/tools/password-generator"), { ssr: true }),
  "timestamp-converter": dynamic(() => import("@/components/tools/timestamp-converter"), { ssr: true }),
  "md5-generator": dynamic(() => import("@/components/tools/md5-generator"), { ssr: true }),
  "word-counter": dynamic(() => import("@/components/tools/word-counter"), { ssr: true }),
  "color-converter": dynamic(() => import("@/components/tools/color-converter"), { ssr: true }),
  "text-to-slug": dynamic(() => import("@/components/tools/text-to-slug"), { ssr: true }),
  "html-entity-encoder": dynamic(() => import("@/components/tools/html-entity-encoder"), { ssr: true }),
  "file-size-converter": dynamic(() => import("@/components/tools/file-size-converter"), { ssr: true }),
  "markdown-preview": dynamic(() => import("@/components/tools/markdown-preview"), { ssr: true }),
  "image-compressor": dynamic(() => import("@/components/tools/image-compressor"), { ssr: true }),
};

export default function ToolPageClient({ tool }: { tool: ToolMeta }) {
  const ToolComponent = toolComponents[tool.slug];

  const relatedTools = tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        All Tools
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{tool.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
      </div>

      <div className="rounded-xl border bg-card p-6 animate-fade-in">
        {ToolComponent ? <ToolComponent /> : <p>Tool not found.</p>}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
        <h2 className="text-sm font-semibold text-foreground mb-2">About this tool</h2>
        <p className="text-sm text-muted-foreground">{tool.description} All processing happens in your browser — no data is ever uploaded to our servers.</p>
      </div>

      {relatedTools.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}