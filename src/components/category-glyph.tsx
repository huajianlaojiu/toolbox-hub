import type { ReactNode } from "react";

function Glyph({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      {children}
    </svg>
  );
}

const PATHS: Record<string, ReactNode> = {
  "pdf-merge": (
    <>
      <path d="M8 7h8M8 12h8M8 17h5" />
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
    </>
  ),
  "pdf-split": <path d="M8 4h8v6H8V4Zm0 10h8v6H8v-6Z" />,
  "pdf-compress": <path d="M5 16V8l7-4 7 4v8l-7 4-7-4Z" />,
  "pdf-images": (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 15l2.5-3 2 2 2.5-3 3 4" />
    </>
  ),
  "pdf-to-images": (
    <>
      <rect x="3" y="5" width="10" height="14" rx="1.5" />
      <rect x="15" y="8" width="6" height="8" rx="1" />
    </>
  ),
  "pdf-rotate": (
    <>
      <path d="M6 6h12v12H6z" />
      <path d="M9 12h6" />
    </>
  ),
  "pdf-organize": <path d="M7 5h10v4H7V5Zm-2 6h14v8H5v-8Z" />,
  "pdf-watermark": (
    <>
      <path d="M5 19 19 5" />
      <circle cx="8" cy="8" r="2.2" />
      <circle cx="16" cy="16" r="2.2" />
    </>
  ),
  "pdf-numbers": (
    <>
      <path d="M7 5h10v14H7z" />
      <path d="M9 16h6" />
    </>
  ),
  "pdf-protect": (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
    </>
  ),
  "pdf-text": <path d="M6 6h12M6 10h10M6 14h12M6 18h8" />,
  "pdf-file": (
    <>
      <path d="M7 3.5h6l4 4V20.5H7V3.5Z" />
      <path d="M13 3.5V7.5h4" />
    </>
  ),
  "img-compress": (
    <>
      <path d="M4 16V8h16v8" />
      <path d="M8 16 12 9l4 7" />
    </>
  ),
  "img-resize": <path d="M6 18V6h8l4 4v8H6Z" />,
  "img-crop": (
    <>
      <path d="M6 6h8v8H6z" />
      <path d="M10 18h8V10" />
    </>
  ),
  "img-rotate": (
    <>
      <path d="M7 8h10v10H7z" />
      <path d="M7 8a5 5 0 0 1 8-3" />
    </>
  ),
  "img-convert": (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 15h16" />
    </>
  ),
  "img-photo": (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.4" />
      <path d="M7 16l3.5-3.5L14 16l2-2 3 3" />
    </>
  ),
  "img-text": (
    <>
      <circle cx="10" cy="10" r="5" />
      <path d="M14 14 20 20" />
      <path d="M8 10h4" />
    </>
  ),
  "vid-merge": (
    <>
      <rect x="3" y="7" width="8" height="10" rx="1.5" />
      <rect x="13" y="7" width="8" height="10" rx="1.5" />
    </>
  ),
  "vid-trim": (
    <>
      <rect x="3.5" y="7" width="17" height="10" rx="2" />
      <path d="M9 7v10M15 7v10" />
    </>
  ),
  "vid-subs": (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M8 16h8M10 13h4" />
    </>
  ),
  "vid-convert": (
    <>
      <path d="M5 8h14M5 16h14" />
      <path d="M9 8v8M15 8v8" />
    </>
  ),
  "vid-all": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  "vid-play": (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M10 10.2v3.6L13.6 12 10 10.2Z" fill="currentColor" stroke="none" />
    </>
  ),
};

export function CategoryGlyph({ name, className }: { name: string; className?: string }) {
  return <Glyph className={className}>{PATHS[name] ?? PATHS["pdf-file"]}</Glyph>;
}

export function BrandMark() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#1e3a8a] text-white">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4" aria-hidden>
        <path d="M4 2.5h5.2L12 5.3V13.5H4V2.5Z" />
        <path d="M9.1 2.5V5.3H12" />
      </svg>
    </span>
  );
}

const PDF_GLYPH: Record<string, string> = {
  merge: "pdf-merge",
  split: "pdf-split",
  "/tools/compress-pdf/": "pdf-compress",
  img2pdf: "pdf-images",
  pdf2img: "pdf-to-images",
  "/tools/rotate-pdf/": "pdf-rotate",
  "/tools/organize-pdf/": "pdf-organize",
  "/tools/watermark-pdf/": "pdf-watermark",
  "/tools/pdf-page-numbers/": "pdf-numbers",
  "/tools/protect-pdf/": "pdf-protect",
  pdf2text: "pdf-text",
};

const SLUG_GLYPH: Record<string, string> = {
  "image-compressor": "img-compress",
  "image-resizer": "img-resize",
  "image-cropper": "img-crop",
  "image-rotator": "img-rotate",
  "image-format-converter": "img-convert",
  "image-watermark": "pdf-watermark",
  "image-to-text": "img-text",
  "video-merger": "vid-merge",
  "video-trimmer": "vid-trim",
  "video-compressor": "pdf-compress",
  "video-resizer": "img-resize",
  "video-cropper": "img-crop",
  "add-subtitles": "vid-subs",
  "video-converter": "vid-convert",
};

export function pdfGlyph(id: string): string {
  return PDF_GLYPH[id] ?? "pdf-file";
}

export function slugGlyph(slug: string): string | undefined {
  return SLUG_GLYPH[slug];
}
