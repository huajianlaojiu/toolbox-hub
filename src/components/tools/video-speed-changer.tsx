"use client";
import { useState } from "react";
import { Upload, Download, Loader2, Gauge, FileVideo, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

/** 把倍速拆成 atempo 链（单次 0.5~2.0） */
function buildAtempo(speed: number): string[] {
  const parts: string[] = [];
  let rest = speed;
  while (rest > 2.0) { parts.push("atempo=2.0"); rest /= 2.0; }
  while (rest < 0.5) { parts.push("atempo=0.5"); rest /= 0.5; }
  if (Math.abs(rest - 1) > 0.001) parts.push(`atempo=${rest.toFixed(3)}`);
  return parts;
}

const PRESETS = [0.25, 0.5, 0.75, 1.5, 2, 3, 4];

export default function VideoSpeedChanger() {
  const { L } = useI18n();

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(2);
  const [keepAudio, setKeepAudio] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setDuration(0);
  };

  const run = async () => {
    if (!file) return;
    if (Math.abs(speed - 1) < 0.001) {
      alert(L("Speed is already 1x."));
      return;
    }
    setProcessing(true);
    setProgress(0);
    setResult(null);
    try {
      const { ffmpeg, fetchFile } = await loadFFmpeg();
      const onProg = ({ progress: p }: { progress: number }) => setProgress(Math.min(99, Math.round(p * 100)));
      ffmpeg.on("progress", onProg);

      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `input.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args: string[] = ["-i", inputName, "-vf", `setpts=PTS/${speed}`];
      if (keepAudio) {
        const chain = buildAtempo(speed);
        if (chain.length) args.push("-af", chain.join(","));
        args.push("-c:a", "aac");
      } else {
        args.push("-an");
      }
      args.push("-c:v", "libx264", "-preset", "veryfast", "-y", "output.mp4");
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("output.mp4");
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("Failed: ") + (e?.message || e));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop a video or click to select")}</p>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileVideo className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}{duration > 0 && ` · ${duration.toFixed(1)}s`}</span>
          </div>

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-56" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{L("Speed:")}</span>
            {PRESETS.map((s) => (
              <button key={s} onClick={() => setSpeed(s)} className={`tool-btn ${speed === s ? "tool-btn-primary" : "tool-btn-secondary"}`}>{s}x</button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={keepAudio} onChange={(e) => setKeepAudio(e.target.checked)} />
            <span className="text-muted-foreground">{L("Keep audio (pitch preserved)")}</span>
          </label>

          {duration > 0 && speed !== 1 && (
            <p className="text-xs text-muted-foreground">{L(`New duration: ${(duration / speed).toFixed(1)}s`)}</p>
          )}

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Processing...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={run} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}
              {L(`Apply ${speed}x`)}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ")}{formatBytes(result.size)}</p>
              <video src={result.url} controls className="w-full rounded-lg border max-h-48" />
              <button onClick={() => downloadBlob(result.blob, `speed-${speed}x-${file.name.replace(/\.[^.]+$/, "")}.mp4`, "video/mp4")} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L("Download MP4")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
