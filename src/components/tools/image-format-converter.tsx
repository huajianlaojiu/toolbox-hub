"use client";
import { useState, useRef } from "react";
import { Upload, Download, Image as ImageIcon, Loader2, X } from "lucide-react";

type Fmt = "png" | "jpeg" | "webp" | "bmp" | "ico";

interface Item {
  id: number;
  name: string;
  url: string;
  result?: { url: string; blob: Blob; size: number };
  error?: string;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Cannot decode image"));
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), type, quality);
  });
}

// 24-bit BMP encoder (bottom-up, BGR, 4-byte row padding)
function canvasToBMP(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  const data = ctx.getImageData(0, 0, w, h).data;
  const rowSize = Math.floor((24 * w + 31) / 32) * 4;
  const pixelArraySize = rowSize * h;
  const fileSize = 54 + pixelArraySize;
  const buf = new ArrayBuffer(fileSize);
  const v = new DataView(buf);
  v.setUint8(0, 0x42); v.setUint8(1, 0x4d); // 'BM'
  v.setUint32(2, fileSize, true);
  v.setUint32(10, 54, true);
  v.setUint32(14, 40, true);
  v.setInt32(18, w, true);
  v.setInt32(22, h, true);
  v.setUint16(26, 1, true);
  v.setUint16(28, 24, true);
  v.setUint32(34, pixelArraySize, true);
  v.setUint32(38, 2835, true);
  v.setUint32(42, 2835, true);
  for (let y = 0; y < h; y++) {
    const dest = 54 + (h - 1 - y) * rowSize;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      v.setUint8(dest + x * 3, data[i + 2]);
      v.setUint8(dest + x * 3 + 1, data[i + 1]);
      v.setUint8(dest + x * 3 + 2, data[i]);
    }
  }
  return new Blob([buf], { type: "image/bmp" });
}

// ICO container wrapping a PNG (works in all modern browsers)
async function canvasToICO(canvas: HTMLCanvasElement): Promise<Blob> {
  const png = await canvasToBlob(canvas, "image/png");
  const pngBytes = new Uint8Array(await png.arrayBuffer());
  const w = canvas.width;
  const h = canvas.height;
  const out = new Uint8Array(22 + pngBytes.length);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, 0, true); dv.setUint16(2, 1, true); dv.setUint16(4, 1, true);
  dv.setUint8(6, w >= 256 ? 0 : w); dv.setUint8(7, h >= 256 ? 0 : h);
  dv.setUint16(10, 1, true); dv.setUint16(12, 32, true);
  dv.setUint32(14, pngBytes.length, true); dv.setUint32(18, 22, true);
  out.set(pngBytes, 22);
  return new Blob([out], { type: "image/x-icon" });
}

export default function ImageFormatConverter() {
  const [items, setItems] = useState<Item[]>([]);
  const [fmt, setFmt] = useState<Fmt>("png");
  const [quality, setQuality] = useState(92);
  const [maxWidth, setMaxWidth] = useState<number | "">("");
  const [rotate, setRotate] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [busy, setBusy] = useState(false);
  const idRef = useRef(0);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Item[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      next.push({ id: idRef.current++, name: f.name, url: URL.createObjectURL(f) });
    }
    setItems((prev) => [...prev, ...next]);
  };

  const remove = (id: number) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const convert = async () => {
    if (items.length === 0) return;
    setBusy(true);
    const updated = await Promise.all(
      items.map(async (it) => {
        try {
          const img = await loadImage(new File([await (await fetch(it.url)).blob()], it.name));
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (maxWidth !== "" && maxWidth > 0 && w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          const swap = rotate === 90 || rotate === 270;
          const cw = swap ? h : w;
          const ch = swap ? w : h;
          const canvas = document.createElement("canvas");
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext("2d")!;
          if (grayscale) ctx.filter = "grayscale(1)";
          ctx.translate(cw / 2, ch / 2);
          ctx.rotate((rotate * Math.PI) / 180);
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
          let blob: Blob;
          if (fmt === "bmp") blob = canvasToBMP(canvas);
          else if (fmt === "ico") blob = await canvasToICO(canvas);
          else if (fmt === "jpeg") blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
          else if (fmt === "webp") blob = await canvasToBlob(canvas, "image/webp", quality / 100);
          else blob = await canvasToBlob(canvas, "image/png");
          const base = it.name.replace(/\.[^.]+$/, "");
          const outUrl = URL.createObjectURL(blob);
          return { ...it, result: { url: outUrl, blob, size: blob.size } };
        } catch (e: any) {
          return { ...it, error: e?.message || "failed" };
        }
      })
    );
    setItems(updated);
    setBusy(false);
  };

  const ext = fmt;
  const fmtLabel = (n: string) => n.replace(/\.[^.]+$/, "") + "." + ext;

  return (
    <div className="space-y-5">
      <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">Drop images or click to select (batch supported)</p>
        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="text-xs text-muted-foreground">Target format</label>
          <select value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)} className="tool-input w-full">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
            <option value="bmp">BMP</option>
            <option value="ico">ICO</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max width (px, empty = original)</label>
          <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(e.target.value === "" ? "" : +e.target.value)} className="tool-input w-full" placeholder="e.g. 1200" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Rotate</label>
          <select value={rotate} onChange={(e) => setRotate(+e.target.value)} className="tool-input w-full">
            <option value={0}>No rotation</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Grayscale</label>
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} /> Convert to grayscale
          </label>
        </div>
        {(fmt === "jpeg" || fmt === "webp") && (
          <div>
            <label className="text-xs text-muted-foreground">Quality: {quality}%</label>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-full" />
          </div>
        )}
      </div>

      <button onClick={convert} disabled={busy || items.length === 0} className="tool-btn tool-btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        Convert {items.length} image{items.length === 1 ? "" : "s"}
      </button>

      {items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.id} className="rounded-lg border p-3 flex gap-3 items-center">
              <img src={it.url} alt="" className="h-16 w-16 object-cover rounded border shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{it.name}</p>
                {it.result ? (
                  <a href={it.result.url} download={fmtLabel(it.name)} className="tool-btn tool-btn-secondary mt-1 inline-flex">
                    <Download className="h-3.5 w-3.5" />{(it.result.size / 1024).toFixed(0)} KB · {fmt.toUpperCase()}
                  </a>
                ) : it.error ? (
                  <p className="text-xs text-destructive mt-1">{it.error}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Pending</p>
                )}
              </div>
              <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Formats: JPG / PNG / WEBP (browser native) + BMP / ICO (encoded locally). All conversion runs in your browser — files never leave your device.
      </p>
    </div>
  );
}
