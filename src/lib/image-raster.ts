/** Browser image decode/encode shared by Compress Image and Resize Image. */

export const IMAGE_WIDTH_PRESETS = [1920, 1280, 1080, 800, 640] as const;
export type ImageWidthPreset = (typeof IMAGE_WIDTH_PRESETS)[number];

export type RasterKind = "jpeg" | "png" | "webp" | "bmp" | "gif" | "ico" | "other";
export type EncodedKind = "jpeg" | "png" | "webp" | "bmp" | "ico";
export type CompressChoice = "same" | "jpeg" | "webp" | "png";

export interface ImageSizePlan {
  width: number;
  height: number;
  upscaling: boolean;
  clamped: boolean;
}

const MAX_SIDE = 8192;

export function rasterKind(file: { name: string; type: string }): RasterKind {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg" || /\.jpe?g$/.test(name)) return "jpeg";
  if (type === "image/png" || name.endsWith(".png")) return "png";
  if (type === "image/webp" || name.endsWith(".webp")) return "webp";
  if (type === "image/bmp" || type === "image/x-ms-bmp" || name.endsWith(".bmp")) return "bmp";
  if (type === "image/gif" || name.endsWith(".gif")) return "gif";
  if (type === "image/x-icon" || type === "image/vnd.microsoft.icon" || /\.ico$/.test(name)) return "ico";
  return "other";
}

export function extensionFor(kind: EncodedKind): string {
  return kind === "jpeg" ? "jpg" : kind;
}

export function fileStem(name: string): string {
  const stem = name.replace(/\.[^.]+$/, "").trim();
  return stem || "image";
}

export function planImageSize(
  source: { width: number; height: number },
  requested: { width: number; height: number },
  keepAspect: boolean,
): ImageSizePlan {
  const srcW = Math.max(1, Math.round(source.width));
  const srcH = Math.max(1, Math.round(source.height));
  const cap = Math.max(MAX_SIDE, srcW, srcH);
  let width = Math.round(requested.width);
  let height = Math.round(requested.height);
  if (!Number.isFinite(width) || width < 1) width = srcW;
  if (!Number.isFinite(height) || height < 1) height = srcH;

  if (keepAspect) {
    const scale = Math.min(width / srcW, height / srcH);
    width = Math.max(1, Math.round(srcW * scale));
    height = Math.max(1, Math.round(srcH * scale));
  }

  const requestedW = width;
  const requestedH = height;
  const clamped = width > cap || height > cap;
  if (clamped) {
    const scale = Math.min(cap / width, cap / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  return {
    width,
    height,
    upscaling: requestedW > srcW || requestedH > srcH,
    clamped,
  };
}

export function sizeForWidth(
  source: { width: number; height: number },
  targetWidth: number,
  keepAspect: boolean,
  currentHeight: number,
): { width: number; height: number } {
  const srcW = Math.max(1, source.width);
  const srcH = Math.max(1, source.height);
  const width = Math.max(1, Math.round(targetWidth));
  const height = keepAspect
    ? Math.max(1, Math.round((width * srcH) / srcW))
    : Math.max(1, Math.round(currentHeight) || srcH);
  return { width, height };
}

export interface EncodePlan {
  output: EncodedKind;
  /** Shown before the user runs the tool, so a format change is never a surprise. */
  note: string;
}

export function resizeEncoding(kind: RasterKind, width: number, height: number): EncodePlan {
  if (kind === "jpeg") return { output: "jpeg", note: "" };
  if (kind === "png") return { output: "png", note: "" };
  if (kind === "webp") return { output: "webp", note: "" };
  if (kind === "bmp") return { output: "bmp", note: "" };
  if (kind === "gif") {
    return {
      output: "png",
      note: "Animated GIF is not kept. The download is a still PNG of the first frame.",
    };
  }
  if (kind === "ico") {
    if (width <= 256 && height <= 256) return { output: "ico", note: "" };
    return {
      output: "png",
      note: "ICO cannot store a side longer than 256 pixels, so this download is PNG.",
    };
  }
  return { output: "png", note: "This format cannot be written back, so the download is PNG." };
}

export function compressEncoding(kind: RasterKind, choice: CompressChoice): EncodePlan | null {
  if (choice === "jpeg") {
    const transparent = kind === "png" || kind === "webp" || kind === "gif" || kind === "ico";
    const gif = kind === "gif" ? "This is the first frame. Animation is not kept. " : "";
    const alpha = transparent ? "JPEG has no transparency, so transparent pixels are filled white." : "";
    return { output: "jpeg", note: `${gif}${alpha}`.trim() };
  }
  if (choice === "webp") {
    return {
      output: "webp",
      note: kind === "gif" ? "This is the first frame as WebP. Animation is not kept." : "",
    };
  }
  if (choice === "png") {
    return {
      output: "png",
      note: kind === "gif" ? "This is the first frame as PNG. Animation is not kept." : "",
    };
  }
  if (kind === "jpeg" || kind === "png" || kind === "webp" || kind === "bmp" || kind === "ico") {
    if (kind === "png") {
      return {
        output: "png",
        note: "PNG stays lossless. This browser encoder often saves little or nothing, and the file can grow. It is not TinyPNG or pngquant. Choose JPEG or WebP for a smaller file.",
      };
    }
    if (kind === "bmp") {
      return {
        output: "bmp",
        note: "BMP stays uncompressed, so keeping it will not shrink the file. Choose JPEG or WebP to make it smaller.",
      };
    }
    if (kind === "ico") {
      return { output: "ico", note: "Keeping ICO rarely shrinks the file. JPEG or WebP is the way to a smaller download." };
    }
    return { output: kind, note: "" };
  }
  return null;
}

export function qualityApplies(kind: EncodedKind): boolean {
  return kind === "jpeg" || kind === "webp";
}

export async function decodeImage(file: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Could not read that image. Use JPEG, PNG, WebP, BMP, or GIF.");
  }
}

export function drawBitmap(bitmap: ImageBitmap, width: number, height: number, opaque: boolean): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  if (opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else if (type === "image/webp") reject(new Error("This browser could not encode WebP. Try JPEG."));
        else reject(new Error("Could not encode the image."));
      },
      type,
      quality,
    );
  });
}

function canvasToBmp(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  const width = canvas.width;
  const height = canvas.height;
  const data = ctx.getImageData(0, 0, width, height).data;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelArraySize, true);
  view.setUint32(38, 2835, true);
  view.setUint32(42, 2835, true);
  for (let y = 0; y < height; y += 1) {
    const dest = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      view.setUint8(dest + x * 3, data[i + 2]);
      view.setUint8(dest + x * 3 + 1, data[i + 1]);
      view.setUint8(dest + x * 3 + 2, data[i]);
    }
  }
  return new Blob([buffer], { type: "image/bmp" });
}

async function canvasToIco(canvas: HTMLCanvasElement): Promise<Blob> {
  const png = await canvasToBlob(canvas, "image/png");
  const pngBytes = new Uint8Array(await png.arrayBuffer());
  const out = new Uint8Array(22 + pngBytes.length);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  view.setUint8(6, canvas.width >= 256 ? 0 : canvas.width);
  view.setUint8(7, canvas.height >= 256 ? 0 : canvas.height);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, pngBytes.length, true);
  view.setUint32(18, 22, true);
  out.set(pngBytes, 22);
  return new Blob([out], { type: "image/x-icon" });
}

export async function encodeCanvas(canvas: HTMLCanvasElement, kind: EncodedKind, qualityPercent: number): Promise<Blob> {
  if (kind === "bmp") return canvasToBmp(canvas);
  if (kind === "ico") return canvasToIco(canvas);
  const quality = Math.min(1, Math.max(0.05, qualityPercent / 100));
  if (kind === "jpeg") return canvasToBlob(canvas, "image/jpeg", quality);
  if (kind === "webp") return canvasToBlob(canvas, "image/webp", quality);
  return canvasToBlob(canvas, "image/png");
}

export function turnedSize(width: number, height: number, quarterTurns: number): { width: number; height: number } {
  const turns = ((quarterTurns % 4) + 4) % 4;
  if (turns % 2 === 1) return { width: Math.max(1, height), height: Math.max(1, width) };
  return { width: Math.max(1, width), height: Math.max(1, height) };
}

/** Rotate in 90° steps, then flip. The same canvas is what the download encodes. */
export function drawTurn(
  bitmap: ImageBitmap,
  quarterTurns: number,
  flipH: boolean,
  flipV: boolean,
  opaque: boolean,
): HTMLCanvasElement {
  const size = turnedSize(bitmap.width, bitmap.height, quarterTurns);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  if (opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const turns = ((quarterTurns % 4) + 4) % 4;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  return canvas;
}

export function cropBitmap(
  bitmap: ImageBitmap,
  rect: { x: number; y: number; width: number; height: number },
  opaque: boolean,
): HTMLCanvasElement {
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  if (opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, rect.x, rect.y, rect.width, rect.height, 0, 0, width, height);
  return canvas;
}

export const STAMP_ANCHORS = ["center", "top-left", "top-right", "bottom-left", "bottom-right"] as const;
export type StampAnchor = (typeof STAMP_ANCHORS)[number];

/** Top-left of an unrotated stamp box. Rotation happens around the box center. */
export function stampBox(
  anchor: StampAnchor,
  frameW: number,
  frameH: number,
  boxW: number,
  boxH: number,
  margin: number,
): { x: number; y: number } {
  const m = Math.max(0, margin);
  if (anchor === "top-left") return { x: m, y: m };
  if (anchor === "top-right") return { x: Math.max(m, frameW - m - boxW), y: m };
  if (anchor === "bottom-left") return { x: m, y: Math.max(m, frameH - m - boxH) };
  if (anchor === "bottom-right") return { x: Math.max(m, frameW - m - boxW), y: Math.max(m, frameH - m - boxH) };
  return { x: (frameW - boxW) / 2, y: (frameH - boxH) / 2 };
}

export interface WatermarkDrawOptions {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  anchor: StampAnchor;
  rotation: number;
  fontFamily: string;
  mark: ImageBitmap | null;
  markWidthRatio: number;
  opaque: boolean;
}

export function drawWatermark(bitmap: ImageBitmap, options: WatermarkDrawOptions): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  if (options.opaque) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);

  const opacity = Math.min(1, Math.max(0.05, options.opacity));
  const margin = Math.round(Math.min(canvas.width, canvas.height) * 0.04);
  const rotation = Number.isFinite(options.rotation) ? options.rotation : 0;
  const paint = (boxW: number, boxH: number, draw: (x: number, y: number) => void) => {
    const box = stampBox(options.anchor, canvas.width, canvas.height, boxW, boxH, margin);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(box.x + boxW / 2, box.y + boxH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    draw(-boxW / 2, -boxH / 2);
    ctx.restore();
  };

  if (options.mark && options.mark.width > 0 && options.mark.height > 0) {
    const ratio = Math.min(0.8, Math.max(0.08, options.markWidthRatio));
    let boxW = canvas.width * ratio;
    let boxH = boxW * (options.mark.height / options.mark.width);
    const maxH = canvas.height * 0.8;
    if (boxH > maxH) {
      boxH = maxH;
      boxW = boxH * (options.mark.width / options.mark.height);
    }
    const mark = options.mark;
    paint(boxW, boxH, (x, y) => ctx.drawImage(mark, x, y, boxW, boxH));
  }

  const text = options.text.replace(/\s+/g, " ").trim();
  if (text) {
    const family = options.fontFamily || "sans-serif";
    let size = Math.min(160, Math.max(8, Math.round(options.fontSize) || 48));
    ctx.font = `${size}px ${family}`;
    let width = ctx.measureText(text).width;
    const maxW = canvas.width * 0.9;
    if (width > maxW && width > 0) {
      size = Math.max(8, Math.floor((size * maxW) / width));
      ctx.font = `${size}px ${family}`;
      width = ctx.measureText(text).width;
    }
    const color = /^#[0-9a-fA-F]{6}$/.test(options.color) ? options.color : "#ffffff";
    paint(Math.max(1, width), size, (x, y) => {
      ctx.font = `${size}px ${family}`;
      ctx.textBaseline = "top";
      ctx.lineWidth = Math.max(1, size / 16);
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    });
  }
  return canvas;
}
