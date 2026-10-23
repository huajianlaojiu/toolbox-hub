"use client";
import { useState } from "react";
import { Upload, Download, Loader2, FileVideo, Repeat, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

interface Target { id: string; label: string; ext: string; mime: string }

const TARGETS: Target[] = [
  { id: "mp4", label: "MP4", ext: "mp4", mime: "video/mp4" },
  { id: "webm", label: "WebM", ext: "webm", mime: "video/webm" },
  { id: "mov", label: "MOV", ext: "mov", mime: "video/quicktime" },
  { id: "mkv", label: "MKV", ext: "mkv", mime: "video/x-matroska" },
  { id: "avi", label: "AVI", ext: "avi", mime: "video/x-msvideo" },
];

export default function VideoConverter() {
  const { L } = useI18n();

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [target, setTarget] = useState<Target>(TARGETS[0]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setResult(null);
    try {
      const { ffmpeg, fetchFile } = await loadFFmpeg();
      const onProg = ({ progress: p }: { progress: number }) => setProgress(Math.min(99, Math.round(p * 100)));
      ffmpeg.on("progress", onProg);

      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `input.${ext}`;
      const outName = `output.${target.ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args = ["-i", inputName];
      if (target.ext === "webm") {
        args.push("-c:v", "libvpx-vp9", "-b:v", "1M", "-c:a", "libopus");
      } else if (target.ext === "mp4" || target.ext === "mov") {
        args.push("-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac");
      } else {
        // MKV / AVI：视频流直接拷贝，音频按容器兼容性选择
        args.push("-c:v", "copy");
        args.push("-c:a", target.ext === "mkv" ? "copy" : "libmp3lame");
      }
      args.push("-y", outName);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outName);
      const blob = new Blob([data], { type: target.mime });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outName);
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("Conversion failed: ") + (e?.message || e));
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
            <span className="text-sm text-foreground truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatBytes(file.size)}</span>
          </div>

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-56" />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{L("Convert to:")}</span>
            {TARGETS.map((t) => (
              <button key={t.id} onClick={() => setTarget(t)} className={`tool-btn ${target.id === t.id ? "tool-btn-primary" : "tool-btn-secondary"}`}>{t.label}</button>
            ))}
          </div>

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Converting in your browser...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={convert} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
              {L(`Convert to ${target.label}`)}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ")}{formatBytes(file.size)} → {formatBytes(result.size)}</p>
              <button onClick={() => downloadBlob(result.blob, `${file.name.replace(/\.[^.]+$/, "")}.${target.ext}`, target.mime)} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L(`Download .${target.ext}`)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
