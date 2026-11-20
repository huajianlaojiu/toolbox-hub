"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Crop, Download, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import {
  cropBitmap,
  decodeImage,
  encodeCanvas,
  extensionFor,
  fileStem,
  rasterKind,
  resizeEncoding,
} from "@/lib/image-raster";
import {
  CROP_ASPECTS,
  aspectRatio,
  centeredCrop,
  dragCrop,
  normalizeCrop,
  type CropAspectId,
  type CropHandle,
  type CropRect,
} from "@/lib/video-geometry";

const LIMIT =
  "The picture stays on this device. Nothing is uploaded. The box on the preview is the crop that downloads, in pixels. A very large photo can run out of memory on a phone.";

const HANDLES: { id: CropHandle; className: string }[] = [
  { id: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
  { id: "n", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize" },
  { id: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
  { id: "e", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize" },
  { id: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize" },
  { id: "s", className: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize" },
  { id: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" },
  { id: "w", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize" },
];

export default function ImageCropper() {
  const { L, tl } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ handle: CropHandle; start: CropRect; originX: number; originY: number } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [aspect, setAspect] = useState<CropAspectId>("free");
  const [customW, setCustomW] = useState("4");
  const [customH, setCustomH] = useState("3");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; width: number; height: number } | null>(null);

  const ratio = aspectRatio(aspect, Number(customW), Number(customH));
  const frame = { width: sourceW, height: sourceH };
  const ready = sourceW > 0 && crop.width > 0;
  const encoding = file ? resizeEncoding(rasterKind(file), crop.width, crop.height) : null;

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const clearResult = () => setResult((prev) => { if (prev) URL.revokeObjectURL(prev.url); return null; });

  const choose = async (next: File) => {
    setFile(next);
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(next); });
    clearResult();
    setError("");
    setAspect("free");
    try {
      const bitmap = await decodeImage(next);
      setSourceW(bitmap.width);
      setSourceH(bitmap.height);
      setCrop(centeredCrop({ width: bitmap.width, height: bitmap.height }, null, 0.8));
      bitmap.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setSourceW(0);
      setSourceH(0);
    }
  };

  const selectAspect = (id: CropAspectId) => {
    setAspect(id);
    clearResult();
    if (!sourceW) return;
    const nextRatio = aspectRatio(id, Number(customW), Number(customH));
    setCrop(centeredCrop(frame, nextRatio, id === "free" ? 0.8 : 1));
  };

  const toImage = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width < 1 || !sourceW) return null;
    return { x: ((clientX - rect.left) / rect.width) * sourceW, y: ((clientY - rect.top) / rect.height) * sourceH };
  };

  const startDrag = (event: ReactPointerEvent, handle: CropHandle) => {
    event.preventDefault();
    event.stopPropagation();
    const point = toImage(event.clientX, event.clientY);
    if (!point) return;
    stageRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = { handle, start: crop, originX: point.x, originY: point.y };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !sourceW) return;
    const point = toImage(event.clientX, event.clientY);
    if (!point) return;
    setCrop(dragCrop(drag.start, point.x - drag.originX, point.y - drag.originY, drag.handle, frame, ratio));
    clearResult();
  };

  const editCrop = (key: keyof CropRect, text: string) => {
    const value = Number(text);
    if (!Number.isFinite(value) || !sourceW) return;
    setCrop(normalizeCrop({ ...crop, [key]: value }, frame, key === "x" || key === "y" ? null : ratio));
    clearResult();
  };

  const run = async () => {
    if (!file || !sourceW || !encoding) return;
    const exact = normalizeCrop(crop, frame, ratio);
    setCrop(exact);
    setBusy(true);
    setError("");
    clearResult();
    try {
      const bitmap = await decodeImage(file);
      const opaque = encoding.output === "jpeg" || encoding.output === "bmp";
      const canvas = cropBitmap(bitmap, exact, opaque);
      bitmap.close();
      const quality = encoding.output === "jpeg" || encoding.output === "webp" ? 92 : 100;
      const blob = await encodeCanvas(canvas, encoding.output, quality);
      setResult({ url: URL.createObjectURL(blob), blob, width: exact.width, height: exact.height });
      recordJob("image-cropper", `Cropped an image to ${exact.width}×${exact.height}`);
    } catch (cause) {
      setError(L("Could not crop that image: ") + (cause instanceof Error ? cause.message : String(cause)));
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
          <input id="crop-image-input" type="file" accept="image/*" className="hidden" onChange={(event) => { const next = event.target.files?.[0]; if (next) void choose(next); }} />
        </label>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{file.name} · {formatBytes(file.size)}{sourceW ? ` · ${sourceW}×${sourceH}` : ""}</p>
          {ready && previewUrl && (
            <div ref={stageRef} data-testid="image-crop-stage" className="relative mx-auto w-full max-w-3xl touch-none overflow-hidden rounded-lg border bg-black" style={{ aspectRatio: `${sourceW} / ${sourceH}` }} onPointerMove={onPointerMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
              <img src={previewUrl} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
              <div
                data-testid="image-crop-box"
                data-x={crop.x}
                data-y={crop.y}
                data-w={crop.width}
                data-h={crop.height}
                className="absolute outline outline-2 outline-white"
                style={{ left: `${(crop.x / sourceW) * 100}%`, top: `${(crop.y / sourceH) * 100}%`, width: `${(crop.width / sourceW) * 100}%`, height: `${(crop.height / sourceH) * 100}%`, boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)", cursor: "move" }}
                onPointerDown={(event) => startDrag(event, "move")}
              >
                <span className="pointer-events-none absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">{crop.width}×{crop.height}</span>
                {HANDLES.map((handle) => (
                  <button key={handle.id} type="button" aria-label={handle.id} className={`absolute h-4 w-4 rounded-sm border border-black/50 bg-white ${handle.className}`} onPointerDown={(event) => startDrag(event, handle.id)} />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {CROP_ASPECTS.map((item) => (
              <button key={item.id} type="button" onClick={() => selectAspect(item.id)} className={`tool-btn ${aspect === item.id ? "tool-btn-primary" : "tool-btn-secondary"}`} data-testid={`image-crop-aspect-${item.id}`}>
                {L(item.label)}
              </button>
            ))}
          </div>
          {aspect === "custom" && (
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <label className="block text-sm text-muted-foreground">{L("Ratio width")}<input type="number" min={1} value={customW} onChange={(event) => { setCustomW(event.target.value); if (sourceW) setCrop(centeredCrop(frame, aspectRatio("custom", Number(event.target.value), Number(customH)), 1)); }} className="tool-input tool-input-sm mt-1" data-testid="image-crop-ratio-w" /></label>
              <label className="block text-sm text-muted-foreground">{L("Ratio height")}<input type="number" min={1} value={customH} onChange={(event) => { setCustomH(event.target.value); if (sourceW) setCrop(centeredCrop(frame, aspectRatio("custom", Number(customW), Number(event.target.value)), 1)); }} className="tool-input tool-input-sm mt-1" data-testid="image-crop-ratio-h" /></label>
            </div>
          )}
          {ready && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:max-w-2xl">
              {(["x", "y", "width", "height"] as const).map((key) => (
                <label key={key} className="block text-sm text-muted-foreground">
                  {L(key === "x" ? "X" : key === "y" ? "Y" : key === "width" ? "Width" : "Height")}
                  <input type="number" value={crop[key]} onChange={(event) => editCrop(key, event.target.value)} className="tool-input tool-input-sm mt-1" data-testid={`image-crop-${key}`} />
                </label>
              ))}
            </div>
          )}
          {ready && (
            <p className="text-sm font-medium" data-testid="image-crop-size">
              {tl("Output: {w}×{h}", { w: String(crop.width), h: String(crop.height) })}
            </p>
          )}
          {encoding?.note ? <p className="text-sm text-muted-foreground">{L(encoding.note)}</p> : null}
          <button type="button" onClick={run} disabled={busy || !ready} className="tool-btn tool-btn-primary" data-testid="image-crop-run">
            <Crop className="h-4 w-4" />
            {L("Crop & download")}
          </button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {file && result && encoding && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <img src={result.url} alt="" data-testid="image-crop-result" className="max-h-64 rounded-lg border object-contain" />
          <button type="button" className="tool-btn tool-btn-primary" onClick={() => downloadBlob(result.blob, `${fileStem(file.name)}-cropped.${extensionFor(encoding.output)}`, result.blob.type)}>
            <Download className="h-4 w-4" />
            {L("Download")}
          </button>
        </div>
      )}
    </div>
  );
}
