import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import zlib from "node:zlib";
import { PDFDocument, PDFRawStream, StandardFonts, decodePDFRawStream } from "pdf-lib";
import { md5, rc4 } from "./pdf-crypto.ts";
import { numberPdf, organizePdf, parsePageSelection, rotatePdf, watermarkPdf } from "./pdf-edit.ts";
import { unfilterPng } from "./pdf-compress.ts";
import { protectPdf } from "./pdf-protect.ts";

const require = createRequire(import.meta.url);

function hex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (~crc) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type), data]);
  const header = Buffer.alloc(4);
  header.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([header, body, crc]);
}

function solidPng(width: number, height: number, rgba: [number, number, number, number]): Uint8Array {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const start = y * (width * 4 + 1);
    raw[start] = 0;
    for (let x = 0; x < width; x++) raw.set(rgba, start + 1 + x * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
  return new Uint8Array(png);
}

function decodeHexStrings(value: string): string {
  return value.replace(/<([0-9A-Fa-f]+)>/g, (_, hex: string) => {
    let text = "";
    for (let i = 0; i + 1 < hex.length; i += 2) text += String.fromCharCode(Number.parseInt(hex.slice(i, i + 2), 16));
    return text;
  });
}

async function streamText(bytes: Uint8Array): Promise<string> {
  const doc = await PDFDocument.load(bytes);
  let text = "";
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (object instanceof PDFRawStream) {
      try {
        text += decodeHexStrings(Buffer.from(decodePDFRawStream(object).decode()).toString("latin1"));
        text += "\n";
      } catch {
        // Images and other encodings are not text streams.
      }
    } else {
      text += `${object.toString()}\n`;
    }
  }
  return text;
}

async function textPdf(labels: string[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const label of labels) {
    const page = doc.addPage([400, 500]);
    page.drawText(label, { x: 48, y: 420, size: 28, font });
  }
  return doc.save();
}

test("md5 matches the empty-string and abc vectors", () => {
  assert.equal(hex(md5(new Uint8Array())), "d41d8cd98f00b204e9800998ecf8427e");
  assert.equal(hex(md5(new TextEncoder().encode("abc"))), "900150983cd24fb0d6963f7d28e17f72");
});

test("rc4 matches a known key and plaintext", () => {
  const cipher = rc4(new TextEncoder().encode("Key"), new TextEncoder().encode("Plaintext"));
  assert.equal(hex(cipher), "bbf316e8d940af0ad3");
});

test("png unfilter reverses a Sub row", () => {
  const columns = 2;
  const colors = 1;
  const data = new Uint8Array([1, 10, 5, 1, 1, 1]);
  const samples = unfilterPng(data, columns, 2, colors);
  assert.deepEqual([...(samples ?? [])], [10, 15, 1, 2]);
});

test("page selection accepts ranges and ignores junk", () => {
  assert.deepEqual(parsePageSelection("1-3, 5, 8-10, no", 9), [1, 2, 3, 5, 8, 9]);
  assert.deepEqual(parsePageSelection("4", 3), []);
});

test("rotate turns only the selected pages", async () => {
  const src = await textPdf(["ONE", "TWO"]);
  const rotated = await rotatePdf(src, 90, [1]);
  const doc = await PDFDocument.load(rotated);
  assert.equal(doc.getPage(0).getRotation().angle, 90);
  assert.equal(doc.getPage(1).getRotation().angle, 0);
  const again = await rotatePdf(rotated, 90, "all");
  const second = await PDFDocument.load(again);
  assert.equal(second.getPage(0).getRotation().angle, 180);
  assert.equal(second.getPage(1).getRotation().angle, 90);
});

test("organize deletes and reorders pages", async () => {
  const src = await textPdf(["ONE", "TWO", "THREE"]);
  const next = await organizePdf(src, [2, 0]);
  const doc = await PDFDocument.load(next);
  assert.equal(doc.getPageCount(), 2);
  const raw = await streamText(next);
  assert.ok(raw.indexOf("THREE") < raw.indexOf("ONE"));
  assert.equal(raw.includes("TWO"), false);
});

test("watermark writes the text, rotation, and opacity", async () => {
  const src = await textPdf(["Body"]);
  const stamped = await watermarkPdf(src, {
    text: "DRAFT",
    anchor: "center",
    opacity: 0.35,
    rotation: 45,
    fontSize: 48,
    imageWidthRatio: 0.3,
  });
  const raw = await streamText(stamped);
  assert.ok(raw.includes("DRAFT"));
  assert.ok(raw.includes("0.35"));
  assert.match(raw, /0\.7071/);
});

test("watermark can stamp a png", async () => {
  const src = await textPdf(["Body"]);
  const stamped = await watermarkPdf(src, {
    text: "",
    imageBytes: solidPng(8, 4, [200, 10, 10, 255]),
    imageKind: "png",
    anchor: "bottom-right",
    opacity: 0.5,
    rotation: 0,
    fontSize: 24,
    imageWidthRatio: 0.25,
  });
  const doc = await PDFDocument.load(stamped);
  assert.equal(doc.getPageCount(), 1);
  assert.ok(Buffer.from(stamped).includes(Buffer.from("/Subtype /Image")));
});

test("page numbers use the start, format, and size", async () => {
  const src = await textPdf(["A", "B"]);
  const numbered = await numberPdf(src, {
    anchor: "bottom-center",
    fontSize: 14,
    start: 5,
    format: "page",
    font: "times",
  });
  const raw = await streamText(numbered);
  assert.ok(raw.includes("Page 5"));
  assert.ok(raw.includes("Page 6"));
  assert.equal(raw.includes("(Page 1)"), false);
});

test("protect requires the password and keeps the text", async () => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs")).href;
  const src = await textPdf(["Secret marker 1842"]);
  const locked = new Uint8Array(await protectPdf(src, "correct-horse"));
  assert.ok(Buffer.from(locked).includes(Buffer.from("/Encrypt")));

  const open = (password?: string) => pdfjs.getDocument({ data: new Uint8Array(locked), password }).promise;
  await assert.rejects(open(), /password/i);
  await assert.rejects(open("nope"), /password/i);

  const opened = await open("correct-horse");
  const page = await opened.getPage(1);
  const content = await page.getTextContent();
  const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
  assert.match(text, /Secret marker 1842/);
});
