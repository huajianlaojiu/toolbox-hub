"use client";

import { useEffect, useState } from "react";
import { Captions, Download, FileVideo, Loader2, RotateCcw, Upload } from "lucide-react";
import { downloadBlob, formatBytes } from "@/lib/bytes";
import { unsupportedCaptionGlyphs } from "@/lib/caption-font";
import { useI18n, localizePath } from "@/lib/i18n";
import { recordJob } from "@/lib/job-history";
import { parseSubtitles, type CaptionPosition, type Cue } from "@/lib/subtitles";

const LIMIT =
  "Processing stays on this device. Nothing is uploaded. The first run downloads the ffmpeg engine (about 25 MB). Large or long videos can be slow, and a phone may run out of memory. Styling is basic and will not match a professional captioning suite.";

const FONT_LIMIT =
  "The download uses the bundled Noto Sans font. Latin, common accented European letters, Greek, and Cyrillic are covered. Chinese, Japanese, Korean, Arabic, Hebrew, Thai, and emoji are not in that font. The preview can still show them with your device fonts, but those characters will be missing or drawn as boxes in the MP4.";

const POSITIONS: { id: CaptionPosition; label: string }[] = [
  { id: "bottom", label: "Bottom" },
  { id: "center", label: "Center" },
  { id: "top", label: "Top" },
];

function clock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function AddSubtitles() {
  const { L, tl, lang } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [sourceW, setSourceW] = useState(0);
  const [sourceH, setSourceH] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [cues, setCues] = useState<Cue[]>([]);
  const [subtitleName, setSubtitleName] = useState("");
  const [subtitleError, setSubtitleError] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState("#FFFFFF");
  const [position, setPosition] = useState<CaptionPosition>("bottom");
  const [active, setActive] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  useEffect(() => {
    const face = new FontFace("Noto Sans Caption", "url(/fonts/NotoSans-Regular.ttf)");
    let cancelled = false;
    face
      .load()
      .then((loaded) => {
        if (!cancelled) document.fonts.add(loaded);
      })
      .catch(() => {
        /* Preview falls back to a device font. The export still uses the file. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const missing = unsupportedCaptionGlyphs(cues.map((cue) => cue.text).join("\n"));
  const previewSize = sourceW > 0 && boxWidth > 0 ? Math.max(12, (fontSize * boxWidth) / sourceW) : 16;

  const chooseVideo = (next: File) => {
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
    setError("");
  };

  const chooseSubtitles = (next: File) => {
    setSubtitleName(next.name);
    setSubtitleError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseSubtitles(String(reader.result ?? ""));
      setCues(parsed);
      if (parsed.length === 0) {
        setSubtitleError(L("No subtitle cues were found. Use SRT, VTT, ASS, SSA, or SBV."));
      }
    };
    reader.onerror = () => setSubtitleError(L("Could not read that subtitle file."));
    reader.readAsText(next);
  };

  const onTime = (video: HTMLVideoElement) => {
    const ms = video.currentTime * 1000;
    const cue = cues.find((item) => ms >= item.start && ms <= item.end);
    setActive(cue?.text ?? "");
    setBoxWidth(video.clientWidth);
  };

  const run = async () => {
    if (!file || cues.length === 0 || sourceW < 2 || sourceH < 2) return;
    setProcessing(true);
    setProgress(0);
    setError("");
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    try {
      const { burnSubtitles } = await import("@/lib/subtitle-burn");
      const blob = await burnSubtitles(
        file,
        cues,
        { fontSize, color, position },
        { width: sourceW, height: sourceH },
        setProgress,
      );
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      recordJob("add-subtitles", `Burned ${cues.length} cues into a video`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(L("Could not burn subtitles: ") + message);
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
    setCues([]);
    setSubtitleName("");
    setSubtitleError("");
    setActive("");
    setError("");
    setSourceW(0);
    setSourceH(0);
  };

  const positionClass =
    position === "top" ? "top-3" : position === "center" ? "top-1/2 -translate-y-1/2" : "bottom-3";

  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">{L(LIMIT)}</p>
      <p className="text-sm leading-6 text-muted-foreground">{L(FONT_LIMIT)}</p>
      <p className="text-sm leading-6 text-muted-foreground">
        {L("This burns the words into the picture. The download is an MP4, not a sidecar subtitle file. To edit cues first, use")}{" "}
        <a href={localizePath("/tools/subtitle-editor/", lang)} className="font-medium text-primary hover:underline">
          {L("Subtitle Editor")}
        </a>
        .
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all hover:border-primary hover:bg-muted/30">
          <Upload className="h-7 w-7 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">{L("Video")}</p>
          <p className="max-w-full truncate text-xs text-foreground">{file ? file.name : L("Choose a video")}</p>
          <input
            id="subtitle-video-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) chooseVideo(next);
            }}
          />
        </label>
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-all hover:border-primary hover:bg-muted/30">
          <Captions className="h-7 w-7 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">{L("Subtitles (SRT, VTT, ASS, SSA, or SBV)")}</p>
          <p className="max-w-full truncate text-xs text-foreground">{subtitleName || L("Choose a subtitle file")}</p>
          <input
            id="subtitle-file-input"
            type="file"
            accept=".srt,.vtt,.ass,.ssa,.sbv,text/vtt,text/plain"
            className="hidden"
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) chooseSubtitles(next);
            }}
          />
        </label>
      </div>

      {file && (
        <p className="text-xs text-muted-foreground">
          <FileVideo className="mr-1 inline h-3.5 w-3.5" />
          {file.name} · {formatBytes(file.size)}
          {file.size > 150 * 1024 * 1024 ? ` · ${L("A file this large may run out of memory, especially on a phone.")}` : ""}
        </p>
      )}
      {subtitleError && (
        <p role="alert" className="text-sm text-red-600">
          {subtitleError}
        </p>
      )}
      {cues.length > 0 && (
        <p className="text-sm text-muted-foreground" data-testid="subtitle-cues">
          {tl("{count} cues, first at {time}", { count: String(cues.length), time: clock(cues[0].start) })}
        </p>
      )}
      {missing.length > 0 && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground" data-testid="subtitle-font-warning">
          {L("These characters are not in the bundled font, so the exported video will not draw them:")}{" "}
          <span className="font-medium">{missing.join(" ")}</span>
        </p>
      )}

      {videoUrl && (
        <div className="relative">
          <video
            src={videoUrl}
            controls
            className="max-h-80 w-full rounded-lg border bg-black"
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              setSourceW(video.videoWidth);
              setSourceH(video.videoHeight);
              setBoxWidth(video.clientWidth);
            }}
            onTimeUpdate={(event) => onTime(event.currentTarget)}
          />
          {active && (
            <div
              data-testid="subtitle-preview"
              className={`pointer-events-none absolute inset-x-3 text-center ${positionClass}`}
              style={{
                color,
                fontSize: `${previewSize}px`,
                fontFamily: '"Noto Sans Caption", sans-serif',
                lineHeight: 1.25,
                textShadow: "0 1px 2px #000, 0 0 4px #000",
                whiteSpace: "pre-wrap",
              }}
            >
              {active}
            </div>
          )}
        </div>
      )}
      <p className="text-sm text-muted-foreground" data-testid="subtitle-active">
        {active
          ? active
          : L("Play the preview to see roughly when each caption appears. The preview is a guide, not a frame-accurate copy of the export.")}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm text-muted-foreground">
          {L("Font size")} ({fontSize})
          <input
            type="range"
            min={16}
            max={72}
            value={fontSize}
            onChange={(event) => setFontSize(Number(event.target.value))}
            className="mt-2 w-full"
            data-testid="subtitle-font-size"
          />
        </label>
        <label className="block text-sm text-muted-foreground">
          {L("Color")}
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-2 h-11 w-full cursor-pointer rounded-md border bg-background"
            data-testid="subtitle-color"
          />
        </label>
        <div className="text-sm text-muted-foreground">
          {L("Position")}
          <div className="mt-2 flex flex-wrap gap-2">
            {POSITIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPosition(item.id)}
                className={`tool-btn ${position === item.id ? "tool-btn-primary" : "tool-btn-secondary"}`}
                data-testid={`subtitle-position-${item.id}`}
              >
                {L(item.label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {processing && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {L("Burning subtitles in your browser...")} {progress}%
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={run}
          disabled={processing || !file || cues.length === 0 || sourceW < 2}
          className="tool-btn tool-btn-primary"
          data-testid="subtitle-run"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Captions className="h-4 w-4" />}
          {L("Burn subtitles & export")}
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
          </p>
          <video src={result.url} controls data-testid="subtitle-result" className="max-h-80 w-full rounded-lg border bg-black" />
          <button
            type="button"
            onClick={() => downloadBlob(result.blob, `subtitled-${file?.name.replace(/\.[^.]+$/, "") || "video"}.mp4`, "video/mp4")}
            className="tool-btn tool-btn-primary"
          >
            <Download className="h-4 w-4" />
            {L("Download MP4")}
          </button>
        </div>
      )}
    </div>
  );
}
