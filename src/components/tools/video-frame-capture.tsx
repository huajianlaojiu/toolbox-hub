"use client";
import { useRef, useState } from "react";
import { Upload, Download, Loader2, Camera, Images, Package, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

interface Frame { time: number; url: string; blob: Blob }

export default function VideoFrameCapture() {
  const { L } = useI18n();

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [fmt, setFmt] = useState<"image/jpeg" | "image/png">("image/jpeg");
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [batchCount, setBatchCount] = useState(6);
  const [frames, setFrames] = useState<Frame[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setFrames([]);
    setDuration(0);
  };

  const seekTo = (t: number) =>
    new Promise<void>((resolve) => {
      const v = videoRef.current;
      if (!v) return resolve();
      const onSeeked = () => { v.removeEventListener("seeked", onSeeked); resolve(); };
      v.addEventListener("seeked", onSeeked);
      v.currentTime = t;
    });

  const grab = async (): Promise<Blob | null> => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return null;
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), fmt, 0.92));
  };

  const captureSingle = async () => {
    if (!file || duration <= 0) return;
    setProcessing(true);
    try {
      await seekTo(time);
      const blob = await grab();
      if (blob) {
        setFrames([{ time, url: URL.createObjectURL(blob), blob }]);
      }
    } finally {
      setProcessing(false);
    }
  };

  const captureBatch = async () => {
    if (!file || duration <= 0) return;
    setProcessing(true);
    setFrames([]);
    try {
      const n = Math.max(1, Math.min(30, batchCount));
      const list: Frame[] = [];
      for (let i = 0; i < n; i++) {
        const t = (duration * (i + 0.5)) / n;
        await seekTo(t);
        const blob = await grab();
        if (blob) list.push({ time: t, url: URL.createObjectURL(blob), blob });
      }
      setFrames(list);
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (frames.length === 0) return;
    setZipping(true);
    try {
      await loadScript("https://unpkg.com/jszip@3.10.1/dist/jszip.min.js");
      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      const ext = fmt.split("/")[1] === "jpeg" ? "jpg" : "png";
      frames.forEach((f, i) => {
        zip.file(`frame_${String(i + 1).padStart(2, "0")}_${f.time.toFixed(1)}s.${ext}`, f.blob);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(/\.[^.]+$/, "") ?? "video"}-frames.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
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
            <Camera className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}</span>
          </div>

          <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg border max-h-64" onLoadedMetadata={(e) => { const v = e.currentTarget; setDuration(v.duration); setTime(Math.min(v.duration * 0.1, v.duration)); }} />

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{L("Pick a timestamp")}</span>
              <span className="font-mono font-semibold text-primary">{time.toFixed(2)}s / {duration.toFixed(1)}s</span>
            </div>
            <input type="range" min={0} max={duration || 0} step={0.01} value={time} onChange={(e) => { const v = Number(e.target.value); setTime(v); if (videoRef.current) videoRef.current.currentTime = v; }} className="w-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={captureSingle} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {L("Capture this frame")}
            </button>
            <select value={fmt} onChange={(e) => setFmt(e.target.value as any)} className="tool-input w-auto">
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{L("Batch:")}</span>
              <input type="number" min={1} max={30} value={batchCount} onChange={(e) => setBatchCount(Number(e.target.value))} className="tool-input w-16" />
              <button onClick={captureBatch} disabled={processing} className="tool-btn tool-btn-secondary">
                <Images className="h-4 w-4" />{L("Capture N frames").replace("N", String(batchCount))}
              </button>
            </div>
            <button onClick={() => { setFile(null); setFrames([]); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset")}
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {frames.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {frames.map((f, i) => (
                  <div key={i} className="rounded-lg border overflow-hidden">
                    <img src={f.url} alt={`frame ${i + 1}`} className="w-full" />
                    <div className="flex items-center justify-between p-2 text-xs">
                      <span className="font-mono text-muted-foreground">{f.time.toFixed(1)}s</span>
                      <a href={f.url} download={`frame_${i + 1}_${f.time.toFixed(1)}s.${fmt === "image/jpeg" ? "jpg" : "png"}`} className="text-primary hover:underline inline-flex items-center gap-1">
                        <Download className="h-3 w-3" />{L("Save")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={downloadAll} disabled={zipping} className="tool-btn tool-btn-primary">
                {zipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                {L("Download all as ZIP")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 按需从 CDN 加载 UMD 脚本（仅 unpkg，国内可达） */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script load failed: " + src));
    document.head.appendChild(s);
  });
}
