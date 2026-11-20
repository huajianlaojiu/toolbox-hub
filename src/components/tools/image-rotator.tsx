"use client";

import { useEffect, useState } from "react";
import { Download, FlipHorizontal2, FlipVertical2, RotateCw, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import {
  decodeImage,
  drawTurn,
  encodeCanvas,
  extensionFor,
  fileStem,
  rasterKind,
  resizeEncoding,
  turnedSize,
} from "@/lib/image-raster";

const LIMIT =
  "The picture stays on this device. Nothing is uploaded. Rotation is in 90° steps, plus a horizontal or vertical flip. One picture at a time. JPEG, PNG, WebP, and BMP keep their format when the browser can write it.";

export default function ImageRotator() {
  const { L, tl } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [turns, setTurns] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const output = file && sourceW ? turnedSize(sourceW, sourceH, turns) : null;
  const encoding = file && output ? resizeEncoding(rasterKind(file), output.width, output.height) : null;

  const render = async (nextFile: File, nextTurns: number, nextFlipH: boolean, nextFlipV: boolean) => {
    const bitmap = await decodeImage(nextFile);
    const width = bitmap.width;
    const height = bitmap.height;
    const plan = resizeEncoding(rasterKind(nextFile), turnedSize(width, height, nextTurns).width, turnedSize(width, height, nextTurns).height);
    const opaque = plan.output === "jpeg" || plan.output === "bmp";
    const canvas = drawTurn(bitmap, nextTurns, nextFlipH, nextFlipV, opaque);
    bitmap.close();
    const quality = plan.output === "jpeg" || plan.output === "webp" ? 92 : 100;
    const encoded = await encodeCanvas(canvas, plan.output, quality);
    setBlob(encoded);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(encoded);
    });
    setSourceW(width);
    setSourceH(height);
  };

  const choose = async (next: File) => {
    setFile(next);
    setTurns(0);
    setFlipH(false);
    setFlipV(false);
    setError("");
    try {
      await render(next, 0, false, false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setSourceW(0);
      setSourceH(0);
    }
  };

  const update = async (nextTurns: number, nextFlipH: boolean, nextFlipV: boolean) => {
    if (!file) return;
    setTurns(nextTurns);
    setFlipH(nextFlipH);
    setFlipV(nextFlipV);
    setError("");
    try {
      await render(file, nextTurns, nextFlipH, nextFlipV);
    } catch (cause) {
      setError(L("Could not rotate that image: ") + (cause instanceof Error ? cause.message : String(cause)));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all hover:border-primary hover:bg-muted/30">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop an image or click to select")}</p>
          <input id="rotate-image-input" type="file" accept="image/*" className="hidden" onChange={(event) => { const next = event.target.files?.[0]; if (next) void choose(next); }} />
        </label>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{file.name} · {formatBytes(file.size)}</p>
          {previewUrl ? <img src={previewUrl} alt="" data-testid="rotate-result" className="max-h-80 w-full rounded-lg border object-contain bg-muted/40" /> : null}
          {output && (
            <p className="text-sm font-medium" data-testid="rotate-size">
              {tl("Output: {w}×{h}", { w: String(output.width), h: String(output.height) })}
            </p>
          )}
          {encoding?.note ? <p className="text-sm text-muted-foreground">{L(encoding.note)}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="tool-btn tool-btn-secondary" data-testid="rotate-left" onClick={() => void update((turns + 3) % 4, flipH, flipV)}>
              <RotateCw className="h-4 w-4 -scale-x-100" />
              {L("Rotate left")}
            </button>
            <button type="button" className="tool-btn tool-btn-secondary" data-testid="rotate-right" onClick={() => void update((turns + 1) % 4, flipH, flipV)}>
              <RotateCw className="h-4 w-4" />
              {L("Rotate right")}
            </button>
            <button type="button" className={`tool-btn ${flipH ? "tool-btn-primary" : "tool-btn-secondary"}`} data-testid="flip-horizontal" onClick={() => void update(turns, !flipH, flipV)}>
              <FlipHorizontal2 className="h-4 w-4" />
              {L("Flip horizontal")}
            </button>
            <button type="button" className={`tool-btn ${flipV ? "tool-btn-primary" : "tool-btn-secondary"}`} data-testid="flip-vertical" onClick={() => void update(turns, flipH, !flipV)}>
              <FlipVertical2 className="h-4 w-4" />
              {L("Flip vertical")}
            </button>
          </div>
          {blob && encoding && (
            <button
              type="button"
              className="tool-btn tool-btn-primary"
              data-testid="rotate-download"
              onClick={() => {
                downloadBlob(blob, `${fileStem(file.name)}-rotated.${extensionFor(encoding.output)}`, blob.type);
                recordJob("image-rotator", "Rotated an image");
              }}
            >
              <Download className="h-4 w-4" />
              {L("Download")}
            </button>
          )}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
