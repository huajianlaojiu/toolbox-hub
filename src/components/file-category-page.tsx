import I18nLink from "@/components/i18n-link";
import { I18nText } from "@/components/i18n-text";
import ToolCard from "@/components/tool-card";
import { FileText } from "lucide-react";
import {
  IMAGE_BLURB,
  PDF_BLURB,
  PDF_LISTINGS,
  VIDEO_BLURB,
  imageTools,
  videoTools,
} from "@/lib/file-catalog";

export type FileCategory = "pdf" | "images" | "video";

const COPY: Record<
  FileCategory,
  { title: string; blurb: string; note: string }
> = {
  pdf: {
    title: "PDF Tools",
    blurb: PDF_BLURB,
    note: "Merge, split, images, and text open the PDF toolkit. Compress, rotate, organize, watermark, page numbers, and password protection each have their own page.",
  },
  images: {
    title: "Image Tools",
    blurb: IMAGE_BLURB,
    note: "Image to Base64 is listed here as well.",
  },
  video: {
    title: "Video Tools",
    blurb: VIDEO_BLURB,
    note: "The full set is below. Files stay on your device.",
  },
};

export default function FileCategoryPage({ category }: { category: FileCategory }) {
  const copy = COPY[category];
  const images = category === "images" ? imageTools() : [];
  const videos = category === "video" ? videoTools() : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">
          <I18nLink href="/" className="hover:text-foreground">
            <I18nText id="Home" />
          </I18nLink>
          <span aria-hidden> / </span>
          <span>
            <I18nText id={copy.title} />
          </span>
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          <I18nText id={copy.title} />
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          <I18nText id={copy.blurb} /> <I18nText id={copy.note} />
        </p>
        <p className="mt-4">
          <I18nLink href="/tools/" className="text-sm font-medium text-primary hover:underline">
            <I18nText id="All Tools" />
          </I18nLink>
        </p>
      </header>

      {category === "pdf" ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PDF_LISTINGS.map((action) => (
            <li key={action.id}>
              <I18nLink
                href={action.href}
                hash={action.hash}
                className="group flex h-full items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-card-foreground transition-colors group-hover:text-primary">
                    <I18nText id={action.label} />
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    <I18nText id={action.description} />
                  </span>
                </span>
              </I18nLink>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(category === "images" ? images : videos).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
