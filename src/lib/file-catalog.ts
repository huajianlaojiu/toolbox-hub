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

/** 首页主卡片只放真正可用的图片工具。Image to Base64 是开发向工具，不进主卡片。 */
export const IMAGE_FEATURED_SLUGS = [
  "image-format-converter",
  "image-compressor",
  "image-resizer",
  "image-cropper",
  "image-rotator",
  "image-watermark",
  "image-to-text",
] as const;

/** 首页视频卡片展示的高频工具。分类页仍列出全部视频工具。 */
export const VIDEO_FEATURED_SLUGS = [
  "video-merger",
  "video-trimmer",
  "video-converter",
  "video-compressor",
  "video-resizer",
  "video-cropper",
  "add-subtitles",
] as const;

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
