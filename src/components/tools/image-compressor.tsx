"use client";

import { useEffect, useState } from "react";
import { Download, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import {
  compressEncoding,
  decodeImage,
  drawBitmap,
  encodeCanvas,
  extensionFor,
  fileStem,
  qualityApplies,
  rasterKind,
  type CompressChoice,
  type RasterKind,
} from "@/lib/image-raster";

const LIMIT =
  "The picture stays on this device. Nothing is uploaded. A very large photo can be slow or run out of memory, especially on a phone. This is the browser's encoder, not TinyPNG or pngquant.";

type Choice = CompressChoice | "";

function savingsLabel(original: number, next: number): string {
  if (next < original && original > 0) return `${Math.round((1 - next / original) * 100)}% smaller`;
  if (next === original) return "Same size";
  return `${formatBytes(next - original)} larger`;
}

export default function ImageCompressor() {
  const { L } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<RasterKind>("other");
  const [previewUrl, setPreviewUrl] = useState("");
  const [choice, setChoice] = useState<Choice>("same");
  const [quality, setQuality] = useState(75);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

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

  const plan = file && choice ? compressEncoding(kind, choice) : null;
  const needsChoice = kind === "gif" || kind === "other";

  const choose = (next: File) => {
    const detected = rasterKind(next);
    setFile(next);
    setKind(detected);
    setChoice(detected === "gif" || detected === "other" ? "" : "same");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(next);
    });
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setError("");
  };

  const run = async () => {
    if (!file || !plan) return;
    setBusy(true);
    setError("");
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    try {
      const bitmap = await decodeImage(file);
      const opaque = plan.output === "jpeg" || plan.output === "bmp";
      const canvas = drawBitmap(bitmap, bitmap.width, bitmap.height, opaque);
      bitmap.close();
      const blob = await encodeCanvas(canvas, plan.output, quality);
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      recordJob("image-compressor", blob.size < file.size ? "Compressed an image" : "An image did not get smaller");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(L("Could not compress that image: ") + message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all hover:border-primary hover:bg-muted/30">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-center text-sm text-muted-foreground">{L("Drop a JPEG, PNG, WebP, BMP, or GIF")}</p>
        <input
          id="compress-image-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const next = event.target.files?.[0];
            if (next) choose(next);
          }}
        />
      </label>

      {file && previewUrl && (
        <div className="space-y-4">
          <img src={previewUrl} alt="" className="max-h-64 w-full rounded-lg border object-contain" />
          <p className="text-sm text-muted-foreground">
            {file.name} · {formatBytes(file.size)}
          </p>
          <label className="block text-sm text-muted-foreground">
            {L("Output")}
            <select
              value={choice}
              onChange={(event) => {
                setChoice(event.target.value as Choice);
                setResult(null);
              }}
              className="tool-input mt-1"
              data-testid="compress-output"
            >
              {needsChoice ? <option value="">{L("Choose an output")}</option> : null}
              {!needsChoice ? <option value="same">{L("Keep original format")}</option> : null}
              <option value="jpeg">{L("JPEG (usually smaller, no transparency)")}</option>
              <option value="webp">{L("WebP (usually smaller)")}</option>
              {needsChoice ? <option value="png">{L("PNG still frame")}</option> : null}
            </select>
          </label>
          {needsChoice && (
            <p className="text-sm text-muted-foreground">
              {kind === "gif"
                ? L("GIF animation cannot be recompressed here. Pick JPEG, WebP, or a PNG of the first frame. The format change is the option you select.")
                : L("This browser can read the picture, but it cannot write the original format back. Pick JPEG, WebP, or PNG.")}
            </p>
          )}
          {plan?.note ? <p className="text-sm text-muted-foreground">{L(plan.note)}</p> : null}
          {plan && qualityApplies(plan.output) && (
            <label className="block text-sm text-muted-foreground">
              {L("Quality")}: {quality}
              <input
                type="range"
                min={40}
                max={95}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-2 w-full"
                data-testid="compress-quality"
              />
            </label>
          )}
          <button type="button" onClick={run} disabled={busy || !plan} className="tool-btn tool-btn-primary" data-testid="compress-run">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            {L("Compress")}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {file && result && plan && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4" data-testid="compress-result">
          <dl className="grid grid-cols-3 gap-3">
            <div>
              <dt className="text-xs text-muted-foreground">{L("Original")}</dt>
              <dd className="mt-1 text-lg font-semibold" data-testid="compress-original">
                {formatBytes(file.size)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{L("New")}</dt>
              <dd className="mt-1 text-lg font-semibold" data-testid="compress-new">
                {formatBytes(result.size)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{L("Change")}</dt>
              <dd className="mt-1 text-lg font-semibold" data-testid="compress-saved">
                {savingsLabel(file.size, result.size)}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground" data-testid="compress-note">
            {result.size >= file.size
              ? L("The new file is not smaller. Photos usually shrink as JPEG or WebP at a lower quality. A PNG that is already compressed often stays about the same size, or grows, because this page does not use a PNG quantizer.")
              : plan.note
                ? L(plan.note)
                : L("Dimensions are unchanged. Only the encoding changed.")}
          </p>
          <img src={result.url} alt="" className="max-h-64 w-full rounded-lg border object-contain" />
          <button
            type="button"
            className="tool-btn tool-btn-primary"
            onClick={() => downloadBlob(result.blob, `${fileStem(file.name)}-compressed.${extensionFor(plan.output)}`, result.blob.type)}
          >
            <Download className="h-4 w-4" />
            {L("Download")}
          </button>
        </div>
      )}
    </div>
  );
}
