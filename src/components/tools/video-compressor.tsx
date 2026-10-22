"use client";
import { useCallback, useRef, useState } from "react";
import { Upload, Download, Loader2, FileVideo, Minimize2, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

type Mode = "quality" | "bitrate" | "size";

export default function VideoCompressor() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<Mode>("quality");
  const [crf, setCrf] = useState(28);
  const [bitrate, setBitrate] = useState(2);
  const [targetMB, setTargetMB] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setDuration(0);
  };

  const compress = async () => {
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
      const outputName = "output.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args: string[] = ["-i", inputName];
      if (mode === "quality") {
        args.push("-c:v", "libx264", "-crf", String(crf), "-preset", "medium", "-c:a", "aac", "-b:a", "128k");
      } else if (mode === "bitrate") {
        args.push("-c:v", "libx264", "-b:v", `${bitrate}M`, "-preset", "medium", "-c:a", "aac", "-b:a", "128k");
      } else {
        // 目标大小模式：用视频真实时长计算码率（修复了按 60s 估算的偏差）
        const dur = duration > 0 ? duration : 60;
        const totalKbps = Math.round((targetMB * 8 * 1024) / dur);
        const vKbps = Math.max(100, totalKbps - 96);
        args.push("-c:v", "libx264", "-b:v", `${vKbps}k`, "-preset", "medium", "-c:a", "aac", "-b:a", "96k");
      }
      args.push("-y", outputName);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("Compression failed: ", "压缩失败：") + (e?.message || e));
    } finally {
      setProcessing(false);
    }
  };

  const savedPercent = file && result ? Math.max(0, Math.round((1 - result.size / file.size) * 100)) : 0;

  return (
    <div className="space-y-4">
      {!file ? (
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop a video or click to select (MP4, MOV, WebM, MKV)", "点击或拖拽视频到此处（MP4 / MOV / WebM / MKV）")}</p>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileVideo className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto shrink-0">{formatBytes(file.size)}{duration > 0 && ` · ${duration.toFixed(1)}s`}</span>
          </div>

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-64" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{L("Mode:", "模式：")}</span>
            {([
              ["quality", L("Quality (CRF)", "质量（CRF）")],
              ["bitrate", L("Bitrate", "指定码率")],
              ["size", L("Target size", "目标大小")],
            ] as [Mode, string][]).map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} className={`tool-btn ${mode === m ? "tool-btn-primary" : "tool-btn-secondary"}`}>{label}</button>
            ))}
          </div>

          {mode === "quality" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">CRF:</span>
              <input type="range" min={18} max={32} value={crf} onChange={(e) => setCrf(Number(e.target.value))} className="w-48" />
              <span className="text-sm font-mono">{crf}</span>
              <span className="text-xs text-muted-foreground">{L("lower = better quality, bigger file", "越小越清晰，文件越大")}</span>
            </div>
          )}
          {mode === "bitrate" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{L("Bitrate:", "码率：")}</span>
              <input type="range" min={0.5} max={10} step={0.5} value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} className="w-48" />
              <span className="text-sm font-mono">{bitrate} Mbps</span>
            </div>
          )}
          {mode === "size" && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{L("Target size:", "目标大小：")}</span>
              <input type="number" min={1} max={500} value={targetMB} onChange={(e) => setTargetMB(Number(e.target.value))} className="tool-input w-24" />
              <span className="text-sm text-muted-foreground">MB</span>
              {duration > 0 && <span className="text-xs text-muted-foreground">{L(`≈ ${Math.round((targetMB * 8 * 1024) / duration)} kbps total`, `≈ 总码率 ${Math.round((targetMB * 8 * 1024) / duration)} kbps`)}</span>}
            </div>
          )}

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Compressing in your browser...", "浏览器本地压缩中...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={compress} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minimize2 className="h-4 w-4" />}
              {L("Compress", "开始压缩")}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">
                {L("Done — ", "完成 — ")}{formatBytes(file.size)} → {formatBytes(result.size)}
                <span className="text-primary ml-2">(-{savedPercent}%)</span>
              </p>
              <video src={result.url} controls className="w-full rounded-lg border max-h-48" />
              <button onClick={() => downloadBlob(result.blob, `compressed-${file.name.replace(/\.[^.]+$/, "")}.mp4`, "video/mp4")} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L("Download MP4", "下载 MP4")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
