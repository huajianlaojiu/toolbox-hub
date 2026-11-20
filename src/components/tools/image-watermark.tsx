"use client";

import { useEffect, useState } from "react";
import { Download, Stamp, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import {
  STAMP_ANCHORS,
  decodeImage,
  drawWatermark,
  encodeCanvas,
  extensionFor,
  fileStem,
  rasterKind,
  resizeEncoding,
  type EncodedKind,
  type StampAnchor,
} from "@/lib/image-raster";

const LIMIT =
  "The picture stays on this device. Nothing is uploaded. Text uses a font already on this device, so a character that font cannot draw will be missing. A long line is scaled down to stay on the picture. Text and an image stamp share one position, so they overlap when you use both. The preview is the file you download.";

const ANCHOR_LABELS: Record<StampAnchor, string> = {
  center: "Center",
  "top-left": "Top left",
  "top-right": "Top right",
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
};

export default function ImageWatermark() {
  const { L } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [markFile, setMarkFile] = useState<File | null>(null);
  const [text, setText] = useState("DRAFT");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [opacity, setOpacity] = useState(45);
  const [rotation, setRotation] = useState(0);
  const [anchor, setAnchor] = useState<StampAnchor>("center");
  const [markWidth, setMarkWidth] = useState(30);
  const [previewUrl, setPreviewUrl] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const encoding = file ? resizeEncoding(rasterKind(file), sourceW || 1, sourceH || 1) : null;
  const outputKind = encoding?.output ?? "";
  const canStamp = Boolean(text.trim() || markFile);

  useEffect(() => {
    if (!file || !outputKind || !canStamp) return;
    let cancelled = false;
    let baseBitmap: ImageBitmap | null = null;
    let markBitmap: ImageBitmap | null = null;
    const kind = outputKind as EncodedKind;
    (async () => {
      try {
        baseBitmap = await decodeImage(file);
        if (markFile) markBitmap = await decodeImage(markFile);
        if (cancelled || !baseBitmap) return;
        setSourceW(baseBitmap.width);
        setSourceH(baseBitmap.height);
        const canvas = drawWatermark(baseBitmap, {
          text,
          fontSize,
          color,
          opacity: opacity / 100,
          anchor,
          rotation,
          fontFamily,
          mark: markBitmap,
          markWidthRatio: markWidth / 100,
          opaque: kind === "jpeg" || kind === "bmp",
        });
        const quality = kind === "jpeg" || kind === "webp" ? 92 : 100;
        const next = await encodeCanvas(canvas, kind, quality);
        if (cancelled) return;
        setBlob(next);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(next);
        });
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        baseBitmap?.close();
        markBitmap?.close();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, markFile, outputKind, canStamp, text, fontSize, color, opacity, anchor, rotation, fontFamily, markWidth]);

  const choose = (next: File) => {
    setError("");
    setFile(next);
  };

  const chooseMark = (next: File | null) => {
    setError("");
    setMarkFile(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all hover:border-primary hover:bg-muted/30">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{file ? file.name : L("Drop an image or click to select")}</p>
        {file ? <p className="text-xs text-muted-foreground">{formatBytes(file.size)}{sourceW ? ` · ${sourceW}×${sourceH}` : ""}</p> : null}
        <input id="watermark-image-input" type="file" accept="image/*" className="hidden" onChange={(event) => { const next = event.target.files?.[0]; if (next) void choose(next); }} />
      </label>
      <label className="block text-sm text-muted-foreground">
        {L("Watermark text")}
        <input value={text} onChange={(event) => setText(event.target.value)} className="tool-input tool-input-sm mt-1" data-testid="watermark-text" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-muted-foreground">
          {L("Font")}
          <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} className="tool-input mt-1" data-testid="watermark-font">
            <option value="sans-serif">{L("Sans")}</option>
            <option value="serif">{L("Serif")}</option>
            <option value="monospace">{L("Mono")}</option>
          </select>
        </label>
        <label className="block text-sm text-muted-foreground">
          {L("Color")}
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="mt-1 h-11 w-full cursor-pointer rounded-md border bg-background" data-testid="watermark-color" />
        </label>
        <label className="block text-sm text-muted-foreground">
          {L("Font size")}: {fontSize}
          <input type="range" min={12} max={160} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-2 w-full" data-testid="watermark-size" />
        </label>
        <label className="block text-sm text-muted-foreground">
          {L("Opacity")}: {opacity}%
          <input type="range" min={5} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="mt-2 w-full" data-testid="watermark-opacity" />
        </label>
        <label className="block text-sm text-muted-foreground">
          {L("Rotation")}: {rotation}°
          <input type="range" min={-180} max={180} value={rotation} onChange={(event) => setRotation(Number(event.target.value))} className="mt-2 w-full" data-testid="watermark-rotation" />
        </label>
        <label className="block text-sm text-muted-foreground">
          {L("Position")}
          <select value={anchor} onChange={(event) => setAnchor(event.target.value as StampAnchor)} className="tool-input mt-1" data-testid="watermark-position">
            {STAMP_ANCHORS.map((id) => (
              <option key={id} value={id}>{L(ANCHOR_LABELS[id])}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-muted-foreground">
        {L("Image stamp, optional PNG, JPEG, or WebP")}
        <input type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" className="mt-1 block text-sm" data-testid="watermark-mark" onChange={(event) => void chooseMark(event.target.files?.[0] ?? null)} />
        {markFile ? <span className="mt-1 block text-xs">{markFile.name}</span> : null}
      </label>
      {markFile && (
        <label className="block text-sm text-muted-foreground">
          {L("Image width")}: {markWidth}%
          <input type="range" min={8} max={80} value={markWidth} onChange={(event) => setMarkWidth(Number(event.target.value))} className="mt-2 w-full" />
        </label>
      )}
      {encoding?.note ? <p className="text-sm text-muted-foreground">{L(encoding.note)}</p> : null}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {previewUrl && canStamp && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <img src={previewUrl} alt="" data-testid="watermark-result" className="max-h-80 w-full rounded-lg border object-contain" />
          {file && blob && encoding && (
            <button
              type="button"
              className="tool-btn tool-btn-primary"
              data-testid="watermark-download"
              onClick={() => {
                downloadBlob(blob, `${fileStem(file.name)}-watermarked.${extensionFor(encoding.output)}`, blob.type);
                recordJob("image-watermark", markFile ? "Stamped text and an image" : "Stamped text on an image");
              }}
            >
              <Stamp className="h-4 w-4" />
              <Download className="h-4 w-4" />
              {L("Download")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
