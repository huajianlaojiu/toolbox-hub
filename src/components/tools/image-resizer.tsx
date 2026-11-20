"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, Scaling, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import {
  IMAGE_WIDTH_PRESETS,
  decodeImage,
  drawBitmap,
  encodeCanvas,
  extensionFor,
  fileStem,
  planImageSize,
  rasterKind,
  resizeEncoding,
  sizeForWidth,
} from "@/lib/image-raster";

const LIMIT =
  "The picture stays on this device. Nothing is uploaded. A very large photo can be slow or run out of memory, especially on a phone. Making it larger does not add real detail.";

export default function ImageResizer() {
  const { L, tl } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [widthText, setWidthText] = useState("");
  const [heightText, setHeightText] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [preset, setPreset] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number; width: number; height: number } | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const requestedW = Number(widthText);
  const requestedH = Number(heightText);
  const plan =
    sourceW > 0
      ? planImageSize(
          { width: sourceW, height: sourceH },
          {
            width: Number.isFinite(requestedW) && requestedW > 0 ? requestedW : sourceW,
            height: Number.isFinite(requestedH) && requestedH > 0 ? requestedH : sourceH,
          },
          keepAspect,
        )
      : null;
  const encoding = file && plan ? resizeEncoding(rasterKind(file), plan.width, plan.height) : null;

  const clearResult = () =>
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });

  const choose = async (next: File) => {
    setFile(next);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(next);
    });
    clearResult();
    setError("");
    setPreset("");
    try {
      const bitmap = await decodeImage(next);
      setSourceW(bitmap.width);
      setSourceH(bitmap.height);
      setWidthText(String(bitmap.width));
      setHeightText(String(bitmap.height));
      bitmap.close();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(message);
      setSourceW(0);
      setSourceH(0);
    }
  };

  const applyPreset = (width: number) => {
    if (!sourceW) return;
    const next = sizeForWidth({ width: sourceW, height: sourceH }, width, keepAspect, Number(heightText) || sourceH);
    setWidthText(String(next.width));
    setHeightText(String(next.height));
    setPreset(width);
    clearResult();
  };

  const editWidth = (text: string) => {
    setPreset("");
    setWidthText(text);
    const width = Number(text);
    if (keepAspect && sourceW > 0 && width > 0) setHeightText(String(Math.max(1, Math.round((width * sourceH) / sourceW))));
    clearResult();
  };

  const editHeight = (text: string) => {
    setPreset("");
    setHeightText(text);
    const height = Number(text);
    if (keepAspect && sourceH > 0 && height > 0) setWidthText(String(Math.max(1, Math.round((height * sourceW) / sourceH))));
    clearResult();
  };

  const run = async () => {
    if (!file || !plan || !encoding) return;
    setBusy(true);
    setError("");
    clearResult();
    try {
      const bitmap = await decodeImage(file);
      const opaque = encoding.output === "jpeg" || encoding.output === "bmp";
      const canvas = drawBitmap(bitmap, plan.width, plan.height, opaque);
      bitmap.close();
      const quality = encoding.output === "jpeg" || encoding.output === "webp" ? 92 : 100;
      const blob = await encodeCanvas(canvas, encoding.output, quality);
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size, width: plan.width, height: plan.height });
      recordJob("image-resizer", `Resized an image to ${plan.width}×${plan.height}`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(L("Could not resize that image: ") + message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all hover:border-primary hover:bg-muted/30">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop an image or click to select")}</p>
          <input id="resize-image-input" type="file" accept="image/*" className="hidden" onChange={(event) => { const next = event.target.files?.[0]; if (next) void choose(next); }} />
        </label>
      ) : (
        <div className="space-y-4">
          {previewUrl ? <img src={previewUrl} alt="" className="max-h-64 w-full rounded-lg border object-contain" /> : null}
          <p className="text-sm text-muted-foreground" data-testid="resize-source">
            {file.name} · {formatBytes(file.size)}
            {sourceW > 0 ? ` · ${tl("Source: {w}×{h}", { w: String(sourceW), h: String(sourceH) })}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {IMAGE_WIDTH_PRESETS.map((width) => (
              <button key={width} type="button" onClick={() => applyPreset(width)} className={`tool-btn ${preset === width ? "tool-btn-primary" : "tool-btn-secondary"}`}>
                {width}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <label className="block text-sm text-muted-foreground">
              {L("Width")}
              <input type="number" min={1} value={widthText} onChange={(event) => editWidth(event.target.value)} className="tool-input tool-input-sm mt-1" data-testid="resize-width" />
            </label>
            <label className="block text-sm text-muted-foreground">
              {L("Height")}
              <input type="number" min={1} value={heightText} onChange={(event) => editHeight(event.target.value)} className="tool-input tool-input-sm mt-1" data-testid="resize-height" />
            </label>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={keepAspect} onChange={(event) => setKeepAspect(event.target.checked)} data-testid="resize-aspect" />
            {L("Keep aspect ratio")}
          </label>
          {plan && (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground" data-testid="resize-output-size">
                {tl("Output: {w}×{h}", { w: String(plan.width), h: String(plan.height) })}
              </p>
              {encoding?.note ? <p className="text-muted-foreground">{L(encoding.note)}</p> : null}
              {plan.upscaling && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-foreground" data-testid="resize-upscale">
                  {L("This size is larger than the original. Upscaling will not add real detail.")}
                </p>
              )}
            </div>
          )}
          <button type="button" onClick={run} disabled={busy || !plan} className="tool-btn tool-btn-primary" data-testid="resize-run">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scaling className="h-4 w-4" />}
            {L("Resize & download")}
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {file && result && encoding && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">{result.width}×{result.height} · {formatBytes(result.size)}</p>
          <img src={result.url} alt="" data-testid="resize-result" className="max-h-64 w-full rounded-lg border object-contain" />
          <button type="button" className="tool-btn tool-btn-primary" onClick={() => downloadBlob(result.blob, `${fileStem(file.name)}-${result.width}x${result.height}.${extensionFor(encoding.output)}`, result.blob.type)}>
            <Download className="h-4 w-4" />
            {L("Download")}
          </button>
        </div>
      )}
    </div>
  );
}
