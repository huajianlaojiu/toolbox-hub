import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { PdfToolError, assertPages, loadPdf } from "./pdf-load";

export type WatermarkInput = {
  text: string;
  imageBytes?: Uint8Array;
  imageKind?: "png" | "jpg";
  anchor: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  opacity: number;
  rotation: number;
  fontSize: number;
  imageWidthRatio: number;
};

export type PageNumberInput = {
  anchor: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
  fontSize: number;
  start: number;
  format: "n" | "page" | "of";
  font: "helvetica" | "times" | "courier";
};

const FONTS = {
  helvetica: StandardFonts.Helvetica,
  times: StandardFonts.TimesRoman,
  courier: StandardFonts.Courier,
} as const;

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function quarterTurn(angle: number): number {
  const turns = Math.round(((((angle % 360) + 360) % 360) / 90));
  return (turns * 90) % 360;
}

/** 1-based page numbers from a range such as "1-3, 5". Invalid pieces are ignored. */
export function parsePageSelection(spec: string, total: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(/[,\s]+/).filter(Boolean)) {
    if (part.includes("-")) {
      const [rawStart, rawEnd] = part.split("-");
      const start = Number.parseInt(rawStart, 10);
      const end = Number.parseInt(rawEnd, 10);
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
      const from = Math.max(1, Math.min(start, end));
      const to = Math.min(total, Math.max(start, end));
      for (let page = from; page <= to; page++) out.add(page);
    } else {
      const page = Number.parseInt(part, 10);
      if (page >= 1 && page <= total) out.add(page);
    }
  }
  return [...out].sort((a, b) => a - b);
}

export async function rotatePdf(bytes: Uint8Array, delta: 90 | 180 | 270, pages: "all" | number[]): Promise<Uint8Array> {
  const doc = await loadPdf(bytes);
  const total = doc.getPageCount();
  assertPages(total);
  const selected = pages === "all" ? doc.getPages().map((_, index) => index) : pages.map((page) => page - 1);
  const unique = [...new Set(selected)].filter((index) => index >= 0 && index < total);
  if (unique.length === 0) throw new PdfToolError("Select at least one page.");
  for (const index of unique) {
    const page = doc.getPage(index);
    const next = quarterTurn(page.getRotation().angle + delta);
    page.setRotation(degrees(next));
  }
  return doc.save({ updateFieldAppearances: false });
}

/** `order` is the source page indexes to keep, in the new order. */
export async function organizePdf(bytes: Uint8Array, order: number[]): Promise<Uint8Array> {
  const src = await loadPdf(bytes);
  const total = src.getPageCount();
  assertPages(total);
  if (order.length === 0) throw new PdfToolError("Keep at least one page.");
  const seen = new Set<number>();
  for (const index of order) {
    if (!Number.isInteger(index) || index < 0 || index >= total || seen.has(index)) {
      throw new PdfToolError("The new page order is not valid.");
    }
    seen.add(index);
  }
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, order);
  pages.forEach((page) => out.addPage(page));
  return out.save({ updateFieldAppearances: false });
}

function stampCenter(
  anchor: WatermarkInput["anchor"],
  pageWidth: number,
  pageHeight: number,
  boxWidth: number,
  boxHeight: number,
  margin: number,
): { cx: number; cy: number } {
  const halfW = boxWidth / 2;
  const halfH = boxHeight / 2;
  if (anchor === "top-left") return { cx: margin + halfW, cy: pageHeight - margin - halfH };
  if (anchor === "top-right") return { cx: pageWidth - margin - halfW, cy: pageHeight - margin - halfH };
  if (anchor === "bottom-left") return { cx: margin + halfW, cy: margin + halfH };
  if (anchor === "bottom-right") return { cx: pageWidth - margin - halfW, cy: margin + halfH };
  return { cx: pageWidth / 2, cy: pageHeight / 2 };
}

/** pdf-lib rotates around the draw point. Shift that point so the stamp center stays put. */
function originForCenter(cx: number, cy: number, width: number, height: number, rotation: number): { x: number; y: number } {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = width / 2;
  const dy = height / 2;
  return { x: cx - (dx * cos - dy * sin), y: cy - (dx * sin + dy * cos) };
}

function drawStamp(
  page: PDFPage,
  input: WatermarkInput,
  font: PDFFont | null,
  image: PDFImage | null,
): void {
  const opacity = clamp(input.opacity, 0.05, 1);
  const rotation = clamp(input.rotation, -180, 180);
  const margin = 36;
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  if (image) {
    const ratio = clamp(input.imageWidthRatio, 0.08, 0.9);
    let width = pageWidth * ratio;
    let height = width * (image.height / image.width);
    const maxHeight = pageHeight * 0.8;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * (image.width / image.height);
    }
    const center = stampCenter(input.anchor, pageWidth, pageHeight, width, height, margin);
    const origin = originForCenter(center.cx, center.cy, width, height, rotation);
    page.drawImage(image, { x: origin.x, y: origin.y, width, height, opacity, rotate: degrees(rotation) });
  }

  const text = input.text.trim();
  if (text && font) {
    const size = clamp(input.fontSize, 8, 160);
    const width = font.widthOfTextAtSize(text, size);
    const center = stampCenter(input.anchor, pageWidth, pageHeight, width, size, margin);
    const origin = originForCenter(center.cx, center.cy, width, size * 0.7, rotation);
    page.drawText(text, {
      x: origin.x,
      y: origin.y,
      size,
      font,
      color: rgb(0.25, 0.25, 0.25),
      opacity,
      rotate: degrees(rotation),
    });
  }
}

export async function watermarkPdf(bytes: Uint8Array, input: WatermarkInput): Promise<Uint8Array> {
  const text = input.text.trim();
  if (!text && !input.imageBytes) throw new PdfToolError("Enter watermark text or choose a PNG or JPG.");
  if (input.imageBytes && input.imageKind !== "png" && input.imageKind !== "jpg") {
    throw new PdfToolError("The watermark image needs to be a PNG or JPG.");
  }
  const doc = await loadPdf(bytes);
  assertPages(doc.getPageCount());
  const font = text ? await doc.embedFont(FONTS.helvetica) : null;
  let image: PDFImage | null = null;
  if (input.imageBytes && input.imageKind === "png") image = await doc.embedPng(input.imageBytes);
  if (input.imageBytes && input.imageKind === "jpg") image = await doc.embedJpg(input.imageBytes);
  for (const page of doc.getPages()) drawStamp(page, input, font, image);
  return doc.save({ updateFieldAppearances: false });
}

function pageLabel(format: PageNumberInput["format"], n: number, last: number): string {
  if (format === "page") return `Page ${n}`;
  if (format === "of") return `${n} of ${last}`;
  return String(n);
}

export async function numberPdf(bytes: Uint8Array, input: PageNumberInput): Promise<Uint8Array> {
  const doc = await loadPdf(bytes);
  const total = doc.getPageCount();
  assertPages(total);
  const start = Number.isFinite(input.start) ? Math.round(input.start) : 1;
  const size = clamp(input.fontSize, 6, 72);
  const font = await doc.embedFont(FONTS[input.font]);
  const last = start + total - 1;
  const margin = 36;
  doc.getPages().forEach((page, index) => {
    const label = pageLabel(input.format, start + index, last);
    const width = font.widthOfTextAtSize(label, size);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    let x = margin;
    if (input.anchor.endsWith("right")) x = pageWidth - margin - width;
    if (input.anchor.endsWith("center")) x = (pageWidth - width) / 2;
    const y = input.anchor.startsWith("top") ? pageHeight - margin - size : margin;
    page.drawText(label, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
  });
  return doc.save({ updateFieldAppearances: false });
}
