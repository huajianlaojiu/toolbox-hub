import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  decodePDFRawStream,
} from "pdf-lib";
import { assertPages, loadPdf } from "./pdf-load";

export type CompressLevel = "regular" | "strong";

export type CompressResult = {
  bytes: Uint8Array;
  originalSize: number;
  newSize: number;
  imagesRecompressed: number;
  imagesAlreadySmall: number;
  imagesSkipped: number;
  keptOriginal: boolean;
};

const LEVELS: Record<CompressLevel, { quality: number; maxEdge: number }> = {
  regular: { quality: 0.72, maxEdge: 2000 },
  strong: { quality: 0.42, maxEdge: 1200 },
};

const MAX_PIXELS = 16_000_000;

type ImageJob = { ref: PDFRef; stream: PDFRawStream };

function singleFilter(dict: PDFDict): "DCTDecode" | "FlateDecode" | null {
  const filter = dict.lookup(PDFName.of("Filter"));
  if (filter === PDFName.of("DCTDecode")) return "DCTDecode";
  if (filter === PDFName.of("FlateDecode")) return "FlateDecode";
  if (filter instanceof PDFArray && filter.size() === 1) {
    const only = filter.get(0);
    if (only === PDFName.of("DCTDecode")) return "DCTDecode";
    if (only === PDFName.of("FlateDecode")) return "FlateDecode";
  }
  return null;
}

function numberOf(dict: PDFDict, key: string): number | null {
  const value = dict.lookup(PDFName.of(key));
  return value instanceof PDFNumber ? value.asNumber() : null;
}

function parms(dict: PDFDict): { predictor: number; columns: number | null; colors: number | null } {
  const raw = dict.lookup(PDFName.of("DecodeParms"));
  if (!(raw instanceof PDFDict)) return { predictor: 1, columns: null, colors: null };
  return {
    predictor: numberOf(raw, "Predictor") ?? 1,
    columns: numberOf(raw, "Columns"),
    colors: numberOf(raw, "Colors"),
  };
}

/** PNG predictors 10–15, the form PDF uses for many Flate images. */
export function unfilterPng(data: Uint8Array, columns: number, rows: number, colors: number): Uint8Array | null {
  if (columns < 1 || rows < 1 || colors < 1) return null;
  const rowSize = columns * colors;
  if (data.length < (rowSize + 1) * rows) return null;
  const out = new Uint8Array(rowSize * rows);
  for (let y = 0; y < rows; y++) {
    const filter = data[y * (rowSize + 1)];
    const src = y * (rowSize + 1) + 1;
    const dst = y * rowSize;
    const prior = y > 0 ? dst - rowSize : -1;
    for (let x = 0; x < rowSize; x++) {
      const raw = data[src + x];
      const left = x >= colors ? out[dst + x - colors] : 0;
      const up = prior >= 0 ? out[prior + x] : 0;
      const upLeft = prior >= 0 && x >= colors ? out[prior + x - colors] : 0;
      let value = raw;
      if (filter === 1) value = (raw + left) & 255;
      else if (filter === 2) value = (raw + up) & 255;
      else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        value = (raw + pred) & 255;
      } else if (filter !== 0) return null;
      out[dst + x] = value;
    }
  }
  return out;
}

function samplesFromFlate(stream: PDFRawStream, width: number, height: number, colors: number): Uint8Array | null {
  let decoded: Uint8Array;
  try {
    decoded = decodePDFRawStream(stream).decode();
  } catch {
    return null;
  }
  const info = parms(stream.dict);
  const columns = info.columns ?? width;
  const sampleColors = info.colors ?? colors;
  if (info.predictor >= 10 && info.predictor <= 15) return unfilterPng(decoded, columns, height, sampleColors);
  if (info.predictor === 1) {
    const expected = columns * height * sampleColors;
    if (decoded.length < expected) return null;
    return decoded.subarray(0, expected);
  }
  return null;
}

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

async function canvasJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array | null> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((value) => resolve(value), "image/jpeg", quality));
  return blob ? blobBytes(blob) : null;
}

async function jpegFromBitmap(source: Blob | ImageBitmap, width: number, height: number, quality: number, maxEdge: number): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  const edge = Math.max(width, height);
  const scale = edge > maxEdge ? maxEdge / edge : 1;
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const bitmap =
    source instanceof Blob
      ? await createImageBitmap(source, { resizeWidth: w, resizeHeight: h, resizeQuality: "medium" })
      : source;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width || w;
    canvas.height = bitmap.height || h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const bytes = await canvasJpeg(canvas, quality);
    if (!bytes) return null;
    return { bytes, width: canvas.width, height: canvas.height };
  } finally {
    if (typeof bitmap.close === "function") bitmap.close();
  }
}

async function jpegFromSamples(
  samples: Uint8Array,
  width: number,
  height: number,
  colors: number,
  quality: number,
  maxEdge: number,
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  const edge = Math.max(width, height);
  const scale = edge > maxEdge ? maxEdge / edge : 1;
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(height - 1, Math.round(y / scale));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, Math.round(x / scale));
      const src = (sy * width + sx) * colors;
      const dst = (y * w + x) * 4;
      if (colors === 1) {
        image.data[dst] = samples[src];
        image.data[dst + 1] = samples[src];
        image.data[dst + 2] = samples[src];
      } else {
        image.data[dst] = samples[src];
        image.data[dst + 1] = samples[src + 1];
        image.data[dst + 2] = samples[src + 2];
      }
      image.data[dst + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const bytes = await canvasJpeg(canvas, quality);
  return bytes ? { bytes, width: w, height: h } : null;
}

function colorCount(dict: PDFDict): number | null {
  const space = dict.lookup(PDFName.of("ColorSpace"));
  if (space === PDFName.of("DeviceRGB")) return 3;
  if (space === PDFName.of("DeviceGray")) return 1;
  return null;
}

/**
 * Recompress embedded images inside the PDF. Text, fonts, and images this
 * browser cannot decode (fax, JPEG 2000, CMYK) are left untouched.
 * If the rewritten file is not smaller, the original bytes are returned.
 */
export async function compressPdf(
  bytes: Uint8Array,
  level: CompressLevel,
  onProgress?: (done: number, total: number) => void,
): Promise<CompressResult> {
  if (typeof document === "undefined") throw new Error("Compress PDF runs in the browser.");
  const original = new Uint8Array(bytes);
  const doc = await loadPdf(original);
  assertPages(doc.getPageCount());
  const settings = LEVELS[level];
  const jobs: ImageJob[] = [];
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFRawStream)) continue;
    if (object.dict.lookup(PDFName.of("Subtype")) !== PDFName.of("Image")) continue;
    jobs.push({ ref, stream: object });
  }

  let imagesRecompressed = 0;
  let imagesAlreadySmall = 0;
  let imagesSkipped = 0;

  for (let index = 0; index < jobs.length; index++) {
    onProgress?.(index, jobs.length);
    const { ref, stream } = jobs[index];
    const dict = stream.dict;
    const width = numberOf(dict, "Width");
    const height = numberOf(dict, "Height");
    const bits = numberOf(dict, "BitsPerComponent") ?? 8;
    const filter = singleFilter(dict);
    const colors = colorCount(dict);
    if (!width || !height || bits !== 8 || !filter || (filter === "FlateDecode" && !colors)) {
      imagesSkipped += 1;
      continue;
    }
    if (width * height > MAX_PIXELS) {
      imagesSkipped += 1;
      continue;
    }
    // A soft mask has to stay the same size as the image, so only the quality changes.
    const maxEdge = dict.has(PDFName.of("SMask")) ? Math.max(width, height) : settings.maxEdge;
    let encoded: { bytes: Uint8Array; width: number; height: number } | null = null;
    try {
      if (filter === "DCTDecode") {
        const jpegBytes = new Uint8Array(stream.contents.byteLength);
        jpegBytes.set(stream.contents);
        encoded = await jpegFromBitmap(new Blob([jpegBytes.buffer]), width, height, settings.quality, maxEdge);
      } else if (colors) {
        const samples = samplesFromFlate(stream, width, height, colors);
        if (!samples) {
          imagesSkipped += 1;
          continue;
        }
        encoded = await jpegFromSamples(samples, width, height, colors, settings.quality, maxEdge);
      }
    } catch {
      encoded = null;
    }
    if (!encoded || encoded.bytes.length >= stream.contents.length) {
      if (encoded) imagesAlreadySmall += 1;
      else imagesSkipped += 1;
      continue;
    }
    dict.set(PDFName.of("Width"), PDFNumber.of(encoded.width));
    dict.set(PDFName.of("Height"), PDFNumber.of(encoded.height));
    dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
    dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
    dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
    dict.delete(PDFName.of("DecodeParms"));
    dict.delete(PDFName.of("Decode"));
    if (encoded.width !== width || encoded.height !== height) dict.delete(PDFName.of("SMask"));
    doc.context.assign(ref, PDFRawStream.of(dict, encoded.bytes));
    imagesRecompressed += 1;
  }
  onProgress?.(jobs.length, jobs.length);

  if (imagesRecompressed === 0) {
    return {
      bytes: original,
      originalSize: original.length,
      newSize: original.length,
      imagesRecompressed,
      imagesAlreadySmall,
      imagesSkipped,
      keptOriginal: true,
    };
  }

  const saved = await doc.save({ useObjectStreams: true, updateFieldAppearances: false });
  if (saved.length >= original.length) {
    return {
      bytes: original,
      originalSize: original.length,
      newSize: original.length,
      imagesRecompressed,
      imagesAlreadySmall,
      imagesSkipped,
      keptOriginal: true,
    };
  }
  return {
    bytes: saved,
    originalSize: original.length,
    newSize: saved.length,
    imagesRecompressed,
    imagesAlreadySmall,
    imagesSkipped,
    keptOriginal: false,
  };
}
