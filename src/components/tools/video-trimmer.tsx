"use client";
import { useState } from "react";
import { Upload, Download, Loader2, Scissors, FileVideo, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${sec.padStart(4, "0")}`;
}

export default function VideoTrimmer() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setDuration(0);
    setStart(0);
    setEnd(0);
  };

  const run = async () => {
    if (!file || duration <= 0 || end - start < 0.1) return;
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

      const args = [
        "-ss", String(start),
        "-to", String(end),
        "-i", inputName,
        "-c", "copy",
        "-y", "output.mp4",
      ];
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("output.mp4");
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("Trim failed: ", "裁剪失败：") + (e?.message || e));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop a video or click to select", "点击或拖拽视频到此处")}</p>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileVideo className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}</span>
          </div>

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-56" onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDuration(d); setStart(0); setEnd(d); }} />

          {duration > 0 && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{L("Start", "开始")}: <b className="text-foreground font-mono">{fmtTime(start)}</b></span>
                  <span>{L("End", "结束")}: <b className="text-foreground font-mono">{fmtTime(end)}</b></span>
                </div>
                <input type="range" min={0} max={duration} step={0.1} value={start} onChange={(e) => { const v = Number(e.target.value); setStart(Math.min(v, end - 0.1)); }} className="w-full" />
                <input type="range" min={0} max={duration} step={0.1} value={end} onChange={(e) => { const v = Number(e.target.value); setEnd(Math.max(v, start + 0.1)); }} className="w-full mt-1" />
              </div>
              <p className="text-xs text-muted-foreground">{L(`Clip length: ${(end - start).toFixed(1)}s`, `片段长度：${(end - start).toFixed(1)} 秒`)}</p>
              <p className="text-xs text-muted-foreground">{L("Stream copy mode: instant, no quality loss. If the output is unplayable, use Video Converter to re-encode.", "流拷贝模式：瞬间完成、无画质损失。如播放异常请用格式转换工具重编码。")}</p>
            </div>
          )}

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Trimming...", "裁剪中...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={run} disabled={processing || duration <= 0} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              {L("Trim & export", "裁剪并导出")}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.size)}</p>
              <video src={result.url} controls className="w-full rounded-lg border max-h-48" />
              <button onClick={() => downloadBlob(result.blob, `trimmed-${file.name.replace(/\.[^.]+$/, "")}.mp4`, "video/mp4")} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L("Download MP4", "下载 MP4")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
