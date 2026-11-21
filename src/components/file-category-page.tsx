import { CategoryGlyph, pdfGlyph, slugGlyph } from "@/components/category-glyph";
import I18nLink from "@/components/i18n-link";
import { I18nText } from "@/components/i18n-text";
import { pageWrap } from "@/components/page-wrap";
import ToolTile from "@/components/tool-tile";
import { getIcon } from "@/lib/icon-map";
import {
  homeLabel,
  imageTools,
  orderedPdfListings,
  tileDescription,
  tileLabel,
  videoTools,
  type HomeTone,
} from "@/lib/file-catalog";
import type { ToolMeta } from "@/lib/tools-data";

export type FileCategory = "pdf" | "images" | "video";

const COPY: Record<FileCategory, { title: string; countLine: string; note: string; tone: HomeTone }> = {
  pdf: {
    title: "PDF tools",
    countLine: "{count} tools. Merge, compress, or protect a file in your browser.",
    note: "Merge, split, images, and text open the PDF toolkit. Compress, rotate, organize, watermark, page numbers, and password protection each have their own page.",
    tone: "pdf",
  },
  images: {
    title: "Image tools",
    countLine: "{count} tools. Compress, crop, or convert a picture on your device.",
    note: "Image to Base64 is listed here as well. Compress, resize, crop, rotate, and watermark each have their own page.",
    tone: "image",
  },
  video: {
    title: "Video tools",
    countLine: "{count} tools. Trim, compress, or add subtitles without uploading.",
    note: "The full set is below. Files stay on your device.",
    tone: "video",
  },
};

const GRID: Record<FileCategory, string> = {
  pdf: "grid-cols-2 min-[720px]:grid-cols-3 min-[1100px]:grid-cols-6",
  images: "grid-cols-2 min-[720px]:grid-cols-3 min-[1100px]:grid-cols-4",
  video: "grid-cols-2 min-[1100px]:grid-cols-4",
};

function toolIcon(tool: ToolMeta) {
  const glyph = slugGlyph(tool.slug);
  if (glyph) return <CategoryGlyph name={glyph} />;
  const Icon = getIcon(tool.icon);
  return <Icon className="h-5 w-5" aria-hidden />;
}

export default function FileCategoryPage({ category }: { category: FileCategory }) {
  const copy = COPY[category];
  const pdf = category === "pdf" ? orderedPdfListings() : [];
  const tools = category === "images" ? imageTools() : category === "video" ? videoTools() : [];
  const count = category === "pdf" ? pdf.length : tools.length;

  return (
    <div className={`${pageWrap} py-10`}>
      <p className="text-sm text-muted-foreground">
        <I18nLink href="/" className="hover:text-foreground">
          <I18nText id="Home" />
        </I18nLink>
        <span aria-hidden> / </span>
        <span>
          <I18nText id={copy.title} />
        </span>
      </p>
      <h1 className="mt-4 text-[32px] font-extrabold tracking-[-0.04em] text-foreground">
        <I18nText id={copy.title} />
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <I18nText id={copy.countLine} vars={{ count: String(count) }} />
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        <I18nText id={copy.note} />
      </p>

      <div className={`mt-6 grid gap-2.5 ${GRID[category]}`}>
        {category === "pdf"
          ? pdf.map((action) => (
              <ToolTile
                key={action.id}
                href={action.href}
                hash={action.hash}
                tone="pdf"
                label={tileLabel(action.id, action.label)}
                description={tileDescription(action.id, action.description)}
                icon={<CategoryGlyph name={pdfGlyph(action.id)} />}
              />
            ))
          : tools.map((tool) => (
              <ToolTile
                key={tool.slug}
                href={`/tools/${tool.slug}/`}
                tone={copy.tone}
                label={tileLabel(tool.slug, homeLabel(tool.slug, tool.title))}
                description={tileDescription(tool.slug, tool.description)}
                icon={toolIcon(tool)}
              />
            ))}
      </div>
    </div>
  );
}
