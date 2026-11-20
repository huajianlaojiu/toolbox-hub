"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Crop, Download, FileVideo, Loader2, Pause, Play, RotateCcw, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import {
  CROP_ASPECTS,
  aspectRatio,
  centeredCrop,
  cropFilter,
  dragCrop,
  normalizeCrop,
  type CropAspectId,
  type CropHandle,
  type CropRect,
} from "@/lib/video-geometry";

const LIMIT =
  "Processing stays on this device. Nothing is uploaded. Large or long videos can be slow, and a phone may run out of memory. The first run downloads the ffmpeg engine (about 25 MB).";

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

export default function VideoCropper() {
  const { L, tl } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dragRef = useRef<{ handle: CropHandle; start: CropRect; originX: number; originY: number } | null>(null);
  const metaKey = useRef("");

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [aspect, setAspect] = useState<CropAspectId>("free");
  const [customW, setCustomW] = useState("");
  const [customH, setCustomH] = useState("");
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);
  const [resultSize, setResultSize] = useState({ width: 0, height: 0 });

  const ratio = aspectRatio(aspect, Number(customW), Number(customH));
  const frame = { width: sourceW, height: sourceH };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const chooseFile = (next: File) => {
    setFile(next);
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(next);
    });
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    metaKey.current = "";
    setSourceW(0);
    setSourceH(0);
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setAspect("free");
    setError("");
    setPlaying(false);
    setResultSize({ width: 0, height: 0 });
  };

  const onMetadata = (video: HTMLVideoElement) => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;
    const key = `${videoUrl}:${width}x${height}`;
    if (metaKey.current === key) return;
    metaKey.current = key;
    setSourceW(width);
    setSourceH(height);
    setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    setAspect("free");
    setCrop(centeredCrop({ width, height }, null, 0.8));
  };

  const selectAspect = (id: CropAspectId) => {
    setAspect(id);
    if (!sourceW) return;
    const nextRatio = aspectRatio(id, Number(customW), Number(customH));
    setCrop(centeredCrop(frame, nextRatio, id === "free" ? 0.8 : 1));
    setResult(null);
  };

  const editCustomRatio = (which: "w" | "h", text: string) => {
    const nextW = which === "w" ? text : customW;
    const nextH = which === "h" ? text : customH;
    if (which === "w") setCustomW(text);
    else setCustomH(text);
    const nextRatio = aspectRatio("custom", Number(nextW), Number(nextH));
    if (aspect === "custom" && nextRatio && sourceW) {
      setCrop(centeredCrop(frame, nextRatio, 1));
    }
  };

  const toVideo = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width < 1 || rect.height < 1 || !sourceW) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * sourceW,
      y: ((clientY - rect.top) / rect.height) * sourceH,
    };
  };

  const startDrag = (event: ReactPointerEvent, handle: CropHandle) => {
    event.preventDefault();
    event.stopPropagation();
    const point = toVideo(event.clientX, event.clientY);
    if (!point) return;
    stageRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = { handle, start: crop, originX: point.x, originY: point.y };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || !sourceW) return;
    const point = toVideo(event.clientX, event.clientY);
    if (!point) return;
    setCrop(dragCrop(drag.start, point.x - drag.originX, point.y - drag.originY, drag.handle, frame, ratio));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const editCrop = (key: keyof CropRect, text: string) => {
    const value = Number(text);
    if (!Number.isFinite(value) || !sourceW) return;
    if (key === "height" && ratio) {
      setCrop(normalizeCrop({ ...crop, width: value * ratio, height: value }, frame, ratio));
      return;
    }
    if (key === "x" || key === "y") {
      setCrop(normalizeCrop({ ...crop, [key]: value }, frame, null));
      return;
    }
    setCrop(normalizeCrop({ ...crop, [key]: value }, frame, ratio));
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const run = async () => {
    if (!file || !sourceW || crop.width < 2 || crop.height < 2) return;
    const exact = normalizeCrop(crop, frame, ratio);
    setCrop(exact);
    setProcessing(true);
    setProgress(0);
    setError("");
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setResultSize({ width: 0, height: 0 });
    try {
      const { transcodeVideo } = await import("@/lib/video-encode");
      const blob = await transcodeVideo(file, cropFilter(exact), setProgress);
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(L("Crop failed: ") + message);
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setVideoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setSourceW(0);
    setSourceH(0);
    setError("");
  };

  const ready = sourceW > 0 && crop.width > 0;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-all hover:border-primary hover:bg-muted/30">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop a video or click to select")}</p>
          <input
            id="crop-video-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) chooseFile(next);
            }}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <FileVideo className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">{file.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
          </div>

          <div
            className="mx-auto w-full overflow-hidden rounded-lg border bg-black"
            style={{ maxWidth: ready && sourceH > sourceW ? 420 : undefined }}
          >
            <div
              ref={stageRef}
              data-testid="crop-stage"
              className={ready ? "relative w-full touch-none" : "relative w-full"}
              style={ready ? { aspectRatio: `${sourceW} / ${sourceH}` } : undefined}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                playsInline
                muted
                preload="auto"
                className={ready ? "absolute inset-0 h-full w-full" : "max-h-64 w-full"}
                style={ready ? { objectFit: "fill" } : undefined}
                onLoadedMetadata={(event) => onMetadata(event.currentTarget)}
                onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
              {ready && (
                <div
                  data-testid="crop-box"
                  data-x={crop.x}
                  data-y={crop.y}
                  data-w={crop.width}
                  data-h={crop.height}
                  className="absolute outline outline-2 outline-white"
                  style={{
                    left: `${(crop.x / sourceW) * 100}%`,
                    top: `${(crop.y / sourceH) * 100}%`,
                    width: `${(crop.width / sourceW) * 100}%`,
                    height: `${(crop.height / sourceH) * 100}%`,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
                    cursor: "move",
                  }}
                  onPointerDown={(event) => startDrag(event, "move")}
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 left-1/3 h-full w-px bg-white/60" />
                    <div className="absolute top-0 left-2/3 h-full w-px bg-white/60" />
                    <div className="absolute top-1/3 left-0 h-px w-full bg-white/60" />
                    <div className="absolute top-2/3 left-0 h-px w-full bg-white/60" />
                  </div>
                  <span className="pointer-events-none absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    {crop.width}×{crop.height}
                  </span>
                  {HANDLES.map((handle) => (
                    <button
                      key={handle.id}
                      type="button"
                      aria-label={handle.id}
                      className={`absolute h-4 w-4 rounded-sm border border-black/50 bg-white ${handle.className}`}
                      onPointerDown={(event) => startDrag(event, handle.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          {ready && (
            <p className="text-sm text-muted-foreground">
              {L("The preview is muted. The exported MP4 keeps the soundtrack when the file has one.")}
            </p>
          )}

          {ready && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={togglePlay} className="tool-btn tool-btn-secondary">
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? L("Pause") : L("Play preview")}
              </button>
              {duration > 0 && (
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.01}
                  value={Math.min(time, duration)}
                  aria-label={L("Preview time")}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setTime(next);
                    if (videoRef.current) videoRef.current.currentTime = next;
                  }}
                  className="h-11 min-w-0 flex-1"
                />
              )}
            </div>
          )}

          {sourceW > 0 && (
            <p className="text-sm text-muted-foreground">
              {tl("Source: {w}×{h}", { w: String(sourceW), h: String(sourceH) })}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {CROP_ASPECTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectAspect(item.id)}
                className={`tool-btn ${aspect === item.id ? "tool-btn-primary" : "tool-btn-secondary"}`}
              >
                {L(item.label)}
              </button>
            ))}
          </div>

          {aspect === "custom" && (
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              <label className="block text-sm text-muted-foreground">
                {L("Ratio width")}
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={customW}
                  onChange={(event) => editCustomRatio("w", event.target.value)}
                  className="tool-input tool-input-sm mt-1"
                  data-testid="crop-ratio-w"
                />
              </label>
              <label className="block text-sm text-muted-foreground">
                {L("Ratio height")}
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={customH}
                  onChange={(event) => editCustomRatio("h", event.target.value)}
                  className="tool-input tool-input-sm mt-1"
                  data-testid="crop-ratio-h"
                />
              </label>
            </div>
          )}

          {ready && (
            <>
              <p className="text-sm text-foreground" data-testid="crop-readout">
                {tl("Keeping {w}×{h} starting at {x}, {y}. That rectangle is the MP4.", {
                  w: String(crop.width),
                  h: String(crop.height),
                  x: String(crop.x),
                  y: String(crop.y),
                })}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumberField label={L("X")} value={crop.x} testId="crop-x" onChange={(text) => editCrop("x", text)} />
                <NumberField label={L("Y")} value={crop.y} testId="crop-y" onChange={(text) => editCrop("y", text)} />
                <NumberField label={L("Width")} value={crop.width} testId="crop-w" onChange={(text) => editCrop("width", text)} />
                <NumberField label={L("Height")} value={crop.height} testId="crop-h" onChange={(text) => editCrop("height", text)} />
              </div>
            </>
          )}

          {processing && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">
                {L("Cropping in your browser...")} {progress}%
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={run} disabled={processing || !ready} className="tool-btn tool-btn-primary" data-testid="crop-run">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}
              {L("Crop & export")}
            </button>
            <button type="button" onClick={reset} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />
              {L("Reset")}
            </button>
          </div>

          {result && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium">
                {L("Done — ")}
                {formatBytes(result.size)}
                {resultSize.width > 0 ? ` · ${resultSize.width}×${resultSize.height}` : ""}
              </p>
              <video
                src={result.url}
                controls
                data-testid="crop-result"
                className="max-h-64 w-full rounded-lg border"
                onLoadedMetadata={(event) =>
                  setResultSize({ width: event.currentTarget.videoWidth, height: event.currentTarget.videoHeight })
                }
              />
              <button
                type="button"
                onClick={() => downloadBlob(result.blob, `cropped-${file.name.replace(/\.[^.]+$/, "")}.mp4`, "video/mp4")}
                className="tool-btn tool-btn-primary"
              >
                <Download className="h-4 w-4" />
                {L("Download MP4")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  testId,
  onChange,
}: {
  label: string;
  value: number;
  testId: string;
  onChange: (text: string) => void;
}) {
  return (
    <label className="block text-sm text-muted-foreground">
      {label}
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        data-testid={testId}
        onChange={(event) => onChange(event.target.value)}
        className="tool-input tool-input-sm mt-1"
      />
    </label>
  );
}
