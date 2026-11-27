import Breadcrumb from "@/components/breadcrumb";
import { CategoryGlyph, pdfGlyph, slugGlyph } from "@/components/category-glyph";
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

const COPY: Record<
  FileCategory,
  { title: string; countLine: string; lead: string[]; sections: { title: string; paragraphs: string[] }[]; tone: HomeTone }
> = {
  pdf: {
    title: "PDF tools",
    countLine: "{count} tools. Merge, compress, or protect a file in your browser.",
    lead: [
      "These pages do a specific PDF job in your browser. You choose a file on this device, the page builds the download, and the PDF is not uploaded to Toolbox Hub. No account is required.",
      "The tiles are the whole PDF inventory. Merge, split, images to PDF, PDF to images, and PDF to text are tabs in one toolkit. Compress, rotate, organize, watermark, page numbers, and password protection each have their own page. There is no PDF-to-Word conversion, no tool that removes a password, and no editor for rewriting the words already on a page.",
    ],
    sections: [
      {
        title: "What each PDF job is for",
        paragraphs: [
          "Merge joins PDFs in the order you select them. Split keeps a page range such as 1-3, 5, or writes every page as its own file in a zip. Images to PDF stacks JPG or PNG files into one PDF, with an optional maximum width. PDF to images renders each page as a PNG. PDF to text reads the existing text layer and downloads a .txt file. A scan that was never recognized has nothing to extract.",
          "Compress recompresses embedded images and shows the original size, the new size, and the savings. A text-only PDF often barely shrinks. Rotate turns every page, or only the pages you pick, by 90, 180, or 270 degrees. Organize reorders pages and deletes the ones you do not want. Watermark stamps text or a PNG or JPG. Page numbers write a number, the words Page 5, or 5 of 12 in a margin you choose.",
          "Protect PDF encrypts the file so a normal viewer asks for a password before it opens. The handler is standard PDF security, revision 3, 128-bit RC4. Only the first 32 characters are stored. That stops casual opening. It is not a promise that the file cannot be attacked, and this site cannot unlock a PDF or recover a password you forget.",
        ],
      },
      {
        title: "Where the file goes",
        paragraphs: [
          "The PDF stays in this browser tab. Closing or refreshing the page drops it from the tool. A very large file can still run out of memory, especially on a phone, because the work uses this device rather than a server.",
          "If you select more than three PDFs to merge, or more than three images for a PDF, the button uses the first three. A higher batch is described on the pricing page. Purchase is not available yet, and the three-file run stays on the page.",
        ],
      },
    ],
    tone: "pdf",
  },
  images: {
    title: "Image tools",
    countLine: "{count} tools. Compress, crop, or convert a picture on your device.",
    lead: [
      "These pages change one picture at a time in your browser: convert the format, recompress it, resize it, crop it, rotate it, stamp a watermark, or read the text in a photo. Image to Base64 is listed here as well, for a data URI you can paste into HTML or CSS. The picture is not uploaded, and no account is required.",
      "A few limits are part of the tools, not fine print. Keeping a PNG often saves little or nothing and can make the file larger. GIF animation is not preserved; you get a still of the first frame. A larger pixel size does not add real detail. Image to Text is OCR, so a clean screenshot reads better than handwriting or tiny type.",
    ],
    sections: [
      {
        title: "What each image job is for",
        paragraphs: [
          "Image Converter writes JPG, PNG, WebP, BMP, or ICO, and can cap the width, turn the picture by a right angle, or make it grayscale. The quality slider applies to JPG and WebP only. JPG has no transparency, so a PNG with a transparent background needs to stay PNG if that background matters.",
          "Compress Image shows the original size next to the new size. JPEG and WebP have a quality control. It is not a PNG quantizer. Resize Image changes the pixel size, with common widths and a locked aspect ratio unless you turn the lock off. Crop Image keeps the rectangle on the preview: 1:1, 4:5, 16:9, 9:16, or the box you drag. Rotate Image turns in 90° steps or flips the picture. It does not offer a free angle.",
          "Watermark Image stamps text, another picture, or both. They share one position, so they overlap when you use both. Characters render only if this device already has a font for them. Image to Text runs Tesseract in the browser. The image stays here; the OCR engine and the language data are downloaded from a third-party CDN the first time you use a language. Image to Base64 encodes the file as a data URI on this device. The string is about a third larger than the file, which is why it suits a small icon more than a photograph.",
        ],
      },
      {
        title: "Where the picture goes",
        paragraphs: [
          "Encoding uses a canvas in this browser. The download is the file the preview produced. A very large photo can be slow or run out of memory on a phone. Nothing on this page sends the picture to a Toolbox Hub server.",
        ],
      },
    ],
    tone: "image",
  },
  video: {
    title: "Video tools",
    countLine: "{count} tools. Trim, compress, or add subtitles without uploading.",
    lead: [
      "These pages trim, join, resize, crop, convert, compress, or caption a video in your browser. The file stays on this device. It is not uploaded, and no account is required. The first video job downloads an ffmpeg engine from a third-party CDN and later jobs reuse that download. A long video, or a phone with little free memory, can be slow or fail.",
      "The tiles are the video inventory that exists today. There is no downloader for YouTube, TikTok, or any other site. Frame capture and the frame studio save stills from a file you already have. The script workshop writes a template, not a finished video.",
    ],
    sections: [
      {
        title: "What each video job is for",
        paragraphs: [
          "Video Merger joins two to ten clips into one MP4 and re-encodes them. If you add more than three, the free run uses the first three. Clips that share a resolution and frame rate are the reliable case. Video Trimmer keeps the span between two times and copies the streams instead of re-encoding, so the cut lands on a keyframe and can be a fraction of a second off the slider. Video Converter writes MP4, WebM, MOV, MKV, or AVI. MP4, MOV, and WebM are re-encoded. MKV and AVI copy the video stream when they can.",
          "Video Compressor offers a quality slider, a bitrate, or a target file size, and the download is an MP4. Smaller usually means softer. Resize Video uses 1080p, 720p, 480p, 360p, or a size you type. A larger frame does not recover detail, and the encoder needs even width and height. Crop Video keeps the rectangle on the muted preview — 16:9, 9:16, 1:1, 4:5, or a custom box — and the MP4 still includes the soundtrack when the file has one.",
          "Video to GIF builds a palette from the clip you chose. Clips longer than 30 seconds are refused because GIF files grow quickly. Video to Audio saves the soundtrack as MP3, AAC, WAV, OGG, Opus, or FLAC, with an optional start and length. Frame Capture grabs stills the browser can play. Video Frame Studio adds scene stills, a contact sheet, and frames at subtitle timestamps. Flip, rotate, and reverse run in one encode. Speed runs from 0.25× to 4× and retimes the audio without shifting its pitch; it only stretches frames that already exist.",
          "Subtitle Editor changes an SRT, VTT, ASS, SSA, or SBV file. It does not burn words into the picture. Add Subtitles does that and downloads an MP4. The burned-in font is Noto Sans Regular: Latin, common accented European letters, Greek, and Cyrillic. Chinese, Japanese, Korean, Arabic, Hebrew, Thai, and emoji are not in that font, even if the preview shows them from a font on your device. The teleprompter scrolls a script on this device. The script workshop fills a hook, a shot list, and caption lines from templates. It does not call a model, and the 9:16 frame is a reading preview, not an exported video. OpenReel is a timeline editor in the browser. It is a larger app than the single-purpose tools, and it relies on WebCodecs, so a current Chromium browser is the comfortable case.",
        ],
      },
      {
        title: "Where the video goes",
        paragraphs: [
          "ffmpeg, when a tool needs it, runs in this tab. The engine download is the network request. The video you selected is not sent to a Toolbox Hub server. Keep the tab open until the result appears. Re-encoding always spends some quality; a trim that copies streams does not, but it also cannot cut on an arbitrary frame.",
        ],
      },
    ],
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
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: copy.title, href: `/${category}/` },
        ]}
      />
      <h1 className="mt-4 text-[32px] font-extrabold tracking-[-0.04em] text-foreground">
        <I18nText id={copy.title} />
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        <I18nText id={copy.countLine} vars={{ count: String(count) }} />
      </p>
      <div className="mt-4 max-w-3xl space-y-4">
        {copy.lead.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
            <I18nText id={paragraph} />
          </p>
        ))}
      </div>

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

      {copy.sections.map((section) => (
        <section key={section.title} className="mt-10 max-w-3xl">
          <h2 className="text-xl font-semibold text-foreground">
            <I18nText id={section.title} />
          </h2>
          <div className="mt-3 space-y-4">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                <I18nText id={paragraph} />
              </p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
