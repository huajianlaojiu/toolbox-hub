"use client";

import { useEffect, useState } from "react";
import { Download, FileVideo, Loader2, RotateCcw, Scaling, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { useI18n } from "@/lib/i18n";
import { RESIZE_PRESETS, planResize, presetPlan, scaleFilter, type ResizePresetId } from "@/lib/video-geometry";

const LIMIT =
  "Processing stays on this device. Nothing is uploaded. Large or long videos can be slow, and a phone may run out of memory. The first run downloads the ffmpeg engine (about 25 MB).";

export default function VideoResizer() {
  const { L, tl } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [widthText, setWidthText] = useState("");
  const [heightText, setHeightText] = useState("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [presetId, setPresetId] = useState<ResizePresetId | "">("");
  const [portraitFrame, setPortraitFrame] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);
  const [resultSize, setResultSize] = useState({ width: 0, height: 0 });

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

  const requestedW = Number(widthText);
  const requestedH = Number(heightText);
  const plan =
    sourceW > 0 && sourceH > 0
      ? planResize(
          { width: sourceW, height: sourceH },
          {
            width: Number.isFinite(requestedW) && requestedW > 0 ? requestedW : sourceW,
            height: Number.isFinite(requestedH) && requestedH > 0 ? requestedH : sourceH,
          },
          keepAspect,
        )
      : null;

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
    setSourceW(0);
    setSourceH(0);
    setWidthText("");
    setHeightText("");
    setPresetId("");
    setPortraitFrame(false);
    setError("");
    setResultSize({ width: 0, height: 0 });
  };

  const onMetadata = (video: HTMLVideoElement) => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;
    setSourceW(width);
    setSourceH(height);
    const fitted = planResize({ width, height }, { width, height }, true);
    setWidthText(String(fitted.width));
    setHeightText(String(fitted.height));
    setPresetId("");
    setPortraitFrame(false);
  };

  const applyPreset = (id: ResizePresetId) => {
    const preset = RESIZE_PRESETS.find((item) => item.id === id);
    if (!preset || !sourceW) return;
    const next = presetPlan({ width: sourceW, height: sourceH }, preset, keepAspect);
    setWidthText(String(next.width));
    setHeightText(String(next.height));
    setPresetId(id);
    setPortraitFrame(next.portraitFrame);
    setResult(null);
    setError("");
  };

  const editWidth = (text: string) => {
    setPresetId("");
    setPortraitFrame(false);
    setWidthText(text);
    const width = Number(text);
    if (keepAspect && sourceW > 0 && sourceH > 0 && width > 0) {
      setHeightText(String(Math.max(2, Math.round((width * sourceH) / sourceW))));
    }
  };

  const editHeight = (text: string) => {
    setPresetId("");
    setPortraitFrame(false);
    setHeightText(text);
    const height = Number(text);
    if (keepAspect && sourceW > 0 && sourceH > 0 && height > 0) {
      setWidthText(String(Math.max(2, Math.round((height * sourceW) / sourceH))));
    }
  };

  const toggleAspect = (next: boolean) => {
    setKeepAspect(next);
    if (!sourceW) return;
    if (presetId) {
      const preset = RESIZE_PRESETS.find((item) => item.id === presetId);
      if (preset) {
        const planNext = presetPlan({ width: sourceW, height: sourceH }, preset, next);
        setWidthText(String(planNext.width));
        setHeightText(String(planNext.height));
        setPortraitFrame(planNext.portraitFrame);
      }
      return;
    }
    setPortraitFrame(false);
    if (next) {
      const width = Number(widthText) || sourceW;
      setHeightText(String(Math.max(2, Math.round((width * sourceH) / sourceW))));
    }
  };

  const run = async () => {
    if (!file || !plan) return;
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
      const blob = await transcodeVideo(file, scaleFilter(plan.width, plan.height), setProgress);
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(L("Resize failed: ") + message);
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
    setPresetId("");
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      {!file ? (
        <label className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-all hover:border-primary hover:bg-muted/30">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop a video or click to select")}</p>
          <input
            id="resize-video-input"
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

          <video
            src={videoUrl}
            controls
            className="max-h-64 w-full rounded-lg border"
            onLoadedMetadata={(event) => onMetadata(event.currentTarget)}
          />

          {sourceW > 0 && (
            <p className="text-sm text-muted-foreground" data-testid="resize-source">
              {tl("Source: {w}×{h}", { w: String(sourceW), h: String(sourceH) })}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {RESIZE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`tool-btn ${presetId === preset.id ? "tool-btn-primary" : "tool-btn-secondary"}`}
              >
                {preset.label}
                <span className="text-xs opacity-80">
                  {preset.width}×{preset.height}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <label className="block text-sm text-muted-foreground">
              {L("Width")}
              <input
                type="number"
                min={2}
                inputMode="numeric"
                value={widthText}
                onChange={(event) => editWidth(event.target.value)}
                className="tool-input tool-input-sm mt-1"
                data-testid="resize-width"
              />
            </label>
            <label className="block text-sm text-muted-foreground">
              {L("Height")}
              <input
                type="number"
                min={2}
                inputMode="numeric"
                value={heightText}
                onChange={(event) => editHeight(event.target.value)}
                className="tool-input tool-input-sm mt-1"
                data-testid="resize-height"
              />
            </label>
          </div>

          <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(event) => toggleAspect(event.target.checked)}
              data-testid="resize-aspect"
            />
            {L("Keep aspect ratio")}
          </label>

          {plan && (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground" data-testid="resize-output-size">
                {tl("Output MP4: {w}×{h}", { w: String(plan.width), h: String(plan.height) })}
              </p>
              <p className="text-muted-foreground">
                {L("The encoder uses even width and height. The size above is the file you will get.")}
              </p>
              {!keepAspect && (
                <p className="text-muted-foreground">
                  {L("Aspect lock is off, so the picture is stretched to this exact size.")}
                </p>
              )}
              {portraitFrame && (
                <p className="text-muted-foreground">
                  {L("This clip is portrait, so the preset uses a portrait frame.")}
                </p>
              )}
              {plan.upscaling && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-foreground" data-testid="resize-upscale">
                  {L("This size is larger than the original. Upscaling will not add real detail.")}
                </p>
              )}
              {plan.clamped && (
                <p className="text-muted-foreground">
                  {tl("The long side is capped at {max} pixels so this tab is less likely to run out of memory.", {
                    max: String(Math.max(4096, sourceW, sourceH)),
                  })}
                </p>
              )}
            </div>
          )}

          {processing && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">
                {L("Resizing in your browser...")} {progress}%
              </p>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={run} disabled={processing || !plan} className="tool-btn tool-btn-primary" data-testid="resize-run">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scaling className="h-4 w-4" />}
              {L("Resize & export")}
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
                data-testid="resize-result"
                className="max-h-64 w-full rounded-lg border"
                onLoadedMetadata={(event) =>
                  setResultSize({ width: event.currentTarget.videoWidth, height: event.currentTarget.videoHeight })
                }
              />
              <button
                type="button"
                onClick={() => downloadBlob(result.blob, `resized-${file.name.replace(/\.[^.]+$/, "")}.mp4`, "video/mp4")}
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
