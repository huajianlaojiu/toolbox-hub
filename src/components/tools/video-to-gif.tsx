"use client";
import { useState } from "react";
import { Upload, Download, Loader2, Film, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

export default function VideoToGif() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [clipDuration, setClipDuration] = useState(3);
  const [fps, setFps] = useState(15);
  const [width, setWidth] = useState(480);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setDuration(0);
    setStartTime(0);
  };

  const run = async () => {
    if (!file) return;
    if (clipDuration > 30) {
      alert(L("Keep the GIF clip under 30 seconds.", "GIF 片段建议不超过 30 秒"));
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

      // 两步法生成高质量 GIF：调色板 + paletteuse
      await ffmpeg.exec([
        "-ss", startTime.toString(),
        "-t", clipDuration.toString(),
        "-i", inputName,
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        "-y", "palette.png",
      ]);
      await ffmpeg.exec([
        "-ss", startTime.toString(),
        "-t", clipDuration.toString(),
        "-i", inputName,
        "-i", "palette.png",
        "-lavfi", `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        "-y", "output.gif",
      ]);

      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([data], { type: "image/gif" });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("output.gif");
      await ffmpeg.deleteFile("palette.png");
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("GIF conversion failed: ", "GIF 转换失败：") + (e?.message || e));
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
            <Film className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}</span>
          </div>

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-56" onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDuration(d); setClipDuration(Math.min(3, d)); }} />

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">{L("Start (s)", "起始时间（秒）")}</span>
              <input type="number" min={0} max={Math.max(0, duration - 0.5)} step={0.1} value={startTime} onChange={(e) => setStartTime(Math.max(0, Number(e.target.value)))} className="tool-input" />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">{L("Length (s)", "片段长度（秒）")}</span>
              <input type="number" min={0.5} max={30} step={0.5} value={clipDuration} onChange={(e) => setClipDuration(Math.min(30, Math.max(0.5, Number(e.target.value))))} className="tool-input" />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">FPS</span>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className="tool-input">
                {[10, 12, 15, 20, 24, 25, 30].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>

          <label className="text-sm block">
            <span className="text-muted-foreground block mb-1">{L("Width", "宽度（px）")}</span>
            <div className="flex items-center gap-3">
              <input type="range" min={200} max={800} step={20} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-48" />
              <span className="font-mono text-sm">{width}px</span>
              <span className="text-xs text-muted-foreground">{L("height auto", "高度自动")}</span>
            </div>
          </label>

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Rendering GIF...", "正在渲染 GIF...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={run} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
              {L("Convert to GIF", "转换为 GIF")}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.size)}</p>
              <img src={result.url} alt="GIF result" className="max-w-full rounded-lg border max-h-64" />
              <button onClick={() => downloadBlob(result.blob, `${file.name.replace(/\.[^.]+$/, "")}.gif`, "image/gif")} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L("Download GIF", "下载 GIF")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
