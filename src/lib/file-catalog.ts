import type { PdfModeId } from "@/lib/pdf-modes";
import { visibleTools, type ToolMeta } from "@/lib/tools-data";

/** 英文文案是 i18n 的 key。其他语言缺译文时回退这句英文。 */
export interface PdfAction {
  id: PdfModeId;
  label: string;
  description: string;
}

export const PDF_TOOL_PATH = "/tools/pdf-toolkit/";

export const PDF_ACTIONS: PdfAction[] = [
  {
    id: "merge",
    label: "Merge PDF",
    description: "Combine PDFs in the order you add them, in your browser.",
  },
  {
    id: "split",
    label: "Split PDF",
    description: "Pull out a page range and download it as a new file.",
  },
  {
    id: "img2pdf",
    label: "Images to PDF",
    description: "Turn JPG or PNG files into one PDF, in the order you add them.",
  },
  {
    id: "pdf2img",
    label: "PDF to Images",
    description: "Save every page as a PNG, packed in a ZIP.",
  },
  {
    id: "pdf2text",
    label: "PDF to Text",
    description: "Extract the text from a PDF and download a .txt file.",
  },
];

export const PDF_BLURB =
  "Merge, split, compress, rotate, reorder, watermark, number, or password-protect a PDF. The file stays in your browser.";

export const PDF_PAGE_TITLE = "PDF Tools Online: Merge, Compress, Rotate, Protect";
export const PDF_PAGE_DESCRIPTION =
  "Merge, split, compress, rotate, reorder, watermark, number, or password-protect a PDF. The file stays in your browser and is not uploaded.";

/** Standalone PDF jobs. Each one is a real tool with its own page. */
export const PDF_STANDALONE: HomeLink[] = [
  {
    label: "Compress PDF",
    description: "Recompress embedded images and show the original size, the new size, and what you saved.",
    href: `/tools/${toolOrThrow("compress-pdf").slug}/`,
  },
  {
    label: "Rotate PDF",
    description: "Turn every page, or only the pages you pick, by 90, 180, or 270 degrees.",
    href: `/tools/${toolOrThrow("rotate-pdf").slug}/`,
  },
  {
    label: "Organize PDF",
    description: "Reorder pages, delete the ones you do not need, and download the new document.",
    href: `/tools/${toolOrThrow("organize-pdf").slug}/`,
  },
  {
    label: "Watermark PDF",
    description: "Stamp text or an image on each page, with position, opacity, and rotation.",
    href: `/tools/${toolOrThrow("watermark-pdf").slug}/`,
  },
  {
    label: "Page Numbers",
    description: "Add page numbers with a position, a font size, and a starting number.",
    href: `/tools/${toolOrThrow("pdf-page-numbers").slug}/`,
  },
  {
    label: "Protect PDF",
    description: "Require a password to open a PDF. Standard protection, not a claim that it cannot be broken.",
    href: `/tools/${toolOrThrow("protect-pdf").slug}/`,
  },
];

export interface PdfListing {
  id: string;
  label: string;
  description: string;
  href: string;
  hash?: string;
}

/** Every PDF job that actually runs. Toolkit tabs keep their hash links. */
export const PDF_LISTINGS: PdfListing[] = [
  ...PDF_ACTIONS.map((action) => ({
    id: action.id,
    label: action.label,
    description: action.description,
    href: PDF_TOOL_PATH,
    hash: action.id,
  })),
  ...PDF_STANDALONE.map((item) => ({
    id: item.href,
    label: item.label,
    description: item.description ?? "",
    href: item.href,
  })),
];
export const IMAGE_BLURB =
  "Convert, compress, resize, crop, rotate, or watermark a picture, or read text from a photo. Files stay on your device.";
export const VIDEO_BLURB =
  "Merge, trim, resize, crop, convert, compress, or burn subtitles into a video. The file stays on your device.";

/** 首页图片区按预览稿的顺序排这 7 个日常工具。Image to Base64 仍在图片分类页和总目录里。 */
export const IMAGE_FEATURED_SLUGS = [
  "image-compressor",
  "image-resizer",
  "image-cropper",
  "image-rotator",
  "image-format-converter",
  "image-watermark",
  "image-to-text",
] as const;

/** 首页视频区展示的高频工具，顺序跟预览稿一致。分类页仍列出全部视频工具。 */
export const VIDEO_FEATURED_SLUGS = [
  "video-merger",
  "video-trimmer",
  "video-compressor",
  "video-resizer",
  "video-cropper",
  "add-subtitles",
  "video-converter",
] as const;

/** 首页和分类页磁贴用的短句。更长的说明仍留在工具页。 */
const TILE_LABELS: Record<string, string> = {
  "image-to-text": "Image to Text",
};

const TILE_DESCRIPTIONS: Record<string, string> = {
  merge: "Join files into one PDF",
  split: "Cut out the pages you need",
  "/tools/compress-pdf/": "Shrink the file, keep the pages",
  img2pdf: "Turn pictures into a document",
  pdf2img: "Save each page as a picture",
  "/tools/rotate-pdf/": "Turn pages the right way",
  "/tools/organize-pdf/": "Reorder or drop pages",
  "/tools/watermark-pdf/": "Stamp text across the pages",
  "/tools/pdf-page-numbers/": "Add numbers where you want",
  "/tools/protect-pdf/": "Lock a file with a password",
  pdf2text: "Extract the words from a file",
  "image-compressor": "Make a smaller file",
  "image-resizer": "Change the width and height",
  "image-cropper": "Keep only the part you want",
  "image-rotator": "Turn or flip a picture",
  "image-format-converter": "JPG, PNG, WebP, BMP, ICO",
  "image-watermark": "Stamp text or a logo",
  "image-to-text": "Read text out of a photo",
  "video-merger": "Join clips into one MP4",
  "video-trimmer": "Keep a start and end time",
  "video-compressor": "Shrink a file, still an MP4",
  "video-resizer": "Change the resolution",
  "video-cropper": "Cut to a frame you choose",
  "add-subtitles": "Burn captions into the video",
  "video-converter": "MP4, WebM, MOV, MKV, AVI",
};

const PDF_TILE_ORDER = [
  "merge",
  "split",
  "/tools/compress-pdf/",
  "img2pdf",
  "pdf2img",
  "/tools/rotate-pdf/",
  "/tools/organize-pdf/",
  "/tools/watermark-pdf/",
  "/tools/pdf-page-numbers/",
  "/tools/protect-pdf/",
  "pdf2text",
] as const;

export function tileLabel(key: string, fallback: string): string {
  return TILE_LABELS[key] ?? fallback;
}

export function tileDescription(key: string, fallback: string): string {
  return TILE_DESCRIPTIONS[key] ?? fallback;
}

/** 预览稿的 PDF 顺序。漏掉或写错一个工具会在构建时直接抛错。 */
export function orderedPdfListings(): PdfListing[] {
  const byId = new Map(PDF_LISTINGS.map((item) => [item.id, item]));
  const ordered = PDF_TILE_ORDER.map((id) => {
    const item = byId.get(id);
    if (!item) throw new Error(`PDF tile order names a missing listing: ${id}`);
    return item;
  });
  if (ordered.length !== PDF_LISTINGS.length) {
    throw new Error("PDF tile order does not cover every PDF listing");
  }
  return ordered;
}

const HOME_LABELS: Record<string, string> = {
  "image-format-converter": "Image Converter",
  "image-compressor": "Compress Image",
  "image-resizer": "Resize Image",
  "image-cropper": "Crop Image",
  "image-rotator": "Rotate Image",
  "image-watermark": "Watermark Image",
  "image-to-text": "Image to Text OCR",
  "video-merger": "Video Merger",
  "video-trimmer": "Video Trimmer",
  "video-converter": "Video Converter",
  "video-compressor": "Video Compressor",
  "video-resizer": "Resize Video",
  "video-cropper": "Crop Video",
  "add-subtitles": "Add Subtitles",
  "data-converter": "JSON Formatter",
  "qr-code-generator": "QR Code Generator",
  "password-generator": "Password Generator",
  "archive-tool": "ZIP Archive",
  "excel-converter": "Excel Converter",
  "audio-converter": "Audio Converter",
};

const HOME_DESCRIPTIONS: Record<string, string> = {
  "image-format-converter": "Convert between JPG, PNG, WebP, BMP, and ICO, and resize or rotate.",
  "image-compressor": "Shrink a JPEG, PNG, or WebP and compare the sizes. PNG savings are often modest.",
  "image-resizer": "Change the width and height. Upscaling does not add real detail.",
  "image-cropper": "Crop to 1:1, 4:5, 16:9, 9:16, or the box you drag.",
  "image-rotator": "Rotate in 90° steps or flip, then download.",
  "image-watermark": "Stamp text or a picture, with size, opacity, and position.",
  "add-subtitles": "Burn captions into the picture and download an MP4.",
  "video-merger": "Join two to ten clips into one MP4, in the order you add them.",
  "video-trimmer": "Cut a clip to a start and end time, then keep only that part.",
  "video-compressor": "Shrink a video into a smaller MP4 file.",
  "video-resizer": "Change the resolution. Upscaling does not add real detail.",
  "video-cropper": "Crop the region shown on the preview and download an MP4.",
};

export type StartIcon = "file-text" | "image" | "combine" | "clock" | "minimize";

export interface HomeLink {
  label: string;
  description?: string;
  icon?: StartIcon;
  href: string;
  hash?: string;
}

function toolOrThrow(slug: string): ToolMeta {
  const tool = visibleTools.find((item) => item.slug === slug);
  if (!tool) throw new Error(`Homepage link points at a missing tool: ${slug}`);
  return tool;
}

function orderTools(slugs: readonly string[], category: string): ToolMeta[] {
  const featured = slugs.map((slug) => toolOrThrow(slug));
  const featuredSet = new Set<string>(slugs);
  const rest = visibleTools.filter((tool) => tool.category === category && !featuredSet.has(tool.slug));
  return [...featured, ...rest];
}

export function imageTools(): ToolMeta[] {
  return orderTools(IMAGE_FEATURED_SLUGS, "Image");
}

export function videoTools(): ToolMeta[] {
  return orderTools(VIDEO_FEATURED_SLUGS, "Video");
}

export function homeLabel(slug: string, fallback: string): string {
  return HOME_LABELS[slug] ?? fallback;
}

export function featuredImageLinks(): HomeLink[] {
  return IMAGE_FEATURED_SLUGS.map((slug) => {
    const tool = toolOrThrow(slug);
    return {
      label: homeLabel(slug, tool.title),
      description: HOME_DESCRIPTIONS[slug] ?? tool.description,
      href: `/tools/${slug}/`,
    };
  });
}

export function featuredVideoLinks(): HomeLink[] {
  return VIDEO_FEATURED_SLUGS.map((slug) => {
    const tool = toolOrThrow(slug);
    return {
      label: homeLabel(slug, tool.title),
      description: HOME_DESCRIPTIONS[slug] ?? tool.description,
      href: `/tools/${slug}/`,
    };
  });
}

export type HomeTone = "pdf" | "image" | "video";

/** 首屏三个快捷入口，都指向已经上线的工具。 */
export const HOME_SHORTCUTS: { label: string; href: string; tone: HomeTone; glyph: string }[] = [
  {
    label: "Compress PDF",
    href: `/tools/${toolOrThrow("compress-pdf").slug}/`,
    tone: "pdf",
    glyph: "pdf-file",
  },
  {
    label: "Compress Image",
    href: `/tools/${toolOrThrow("image-compressor").slug}/`,
    tone: "image",
    glyph: "img-photo",
  },
  {
    label: "Trim a video",
    href: `/tools/${toolOrThrow("video-trimmer").slug}/`,
    tone: "video",
    glyph: "vid-play",
  },
];

export const START_ITEMS: HomeLink[] = [
  {
    label: "Compress PDF",
    description: "Recompress embedded images and show the original size, the new size, and what you saved.",
    icon: "minimize",
    href: `/tools/${toolOrThrow("compress-pdf").slug}/`,
  },
  {
    label: "Merge PDF",
    description: "Combine PDFs in the order you add them, in your browser.",
    icon: "file-text",
    href: PDF_TOOL_PATH,
    hash: "merge",
  },
  {
    label: "Split PDF",
    description: "Pull out a page range and download it as a new file.",
    icon: "file-text",
    href: PDF_TOOL_PATH,
    hash: "split",
  },
  {
    label: "Image Converter",
    description: "Convert between JPG, PNG, WebP, BMP, and ICO, and resize or rotate.",
    icon: "image",
    href: `/tools/${toolOrThrow("image-format-converter").slug}/`,
  },
  {
    label: "Video Merger",
    description: "Join two to ten clips into one MP4, in the order you add them.",
    icon: "combine",
    href: `/tools/${toolOrThrow("video-merger").slug}/`,
  },
  {
    label: "Video Trimmer",
    description: "Cut a clip to a start and end time, then keep only that part.",
    icon: "clock",
    href: `/tools/${toolOrThrow("video-trimmer").slug}/`,
  },
  {
    label: "Video Compressor",
    description: "Shrink a video into a smaller MP4 file.",
    icon: "minimize",
    href: `/tools/${toolOrThrow("video-compressor").slug}/`,
  },
];

/** 首页底部只留文件相关的常用工具，计算器和随机工具仍在完整目录里。 */
export const MORE_LINKS: HomeLink[] = [
  "data-converter",
  "qr-code-generator",
  "password-generator",
  "archive-tool",
  "excel-converter",
  "audio-converter",
].map((slug) => {
  const tool = toolOrThrow(slug);
  return { label: homeLabel(slug, tool.title), href: `/tools/${slug}/` };
});
