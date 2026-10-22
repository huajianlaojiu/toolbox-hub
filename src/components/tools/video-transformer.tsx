"use client";
import { useState } from "react";
import { Upload, Download, Loader2, FlipHorizontal2, FileVideo, RotateCcw, Rewind } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

interface Options { hflip: boolean; vflip: boolean; rotate: number; reverse: boolean }

export default function VideoTransformer() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [opts, setOpts] = useState<Options>({ hflip: false, vflip: false, rotate: 0, reverse: false });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const hasAny = opts.hflip || opts.vflip || opts.rotate !== 0 || opts.reverse;

  const run = async () => {
    if (!file || !hasAny) return;
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

      const vfilters: string[] = [];
      if (opts.hflip) vfilters.push("hflip");
      if (opts.vflip) vfilters.push("vflip");
      if (opts.rotate === 90) vfilters.push("transpose=1");
      else if (opts.rotate === 180) vfilters.push("transpose=1,transpose=1");
      else if (opts.rotate === 270) vfilters.push("transpose=2");
      if (opts.reverse) vfilters.push("reverse");

      const args: string[] = ["-i", inputName];
      if (vfilters.length) args.push("-vf", vfilters.join(","));
      if (opts.reverse) args.push("-af", "areverse");
      args.push("-c:v", "libx264", "-preset", "veryfast", "-c:a", opts.reverse ? "aac" : "copy", "-y", "output.mp4");
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("output.mp4");
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("Failed: ", "处理失败：") + (e?.message || e));
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

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-56" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={() => setOpts({ ...opts, hflip: !opts.hflip })} className={`tool-btn ${opts.hflip ? "tool-btn-primary" : "tool-btn-secondary"}`}>
              <FlipHorizontal2 className="h-4 w-4" />{L("Flip H", "水平镜像")}
            </button>
            <button onClick={() => setOpts(setOptts(opts, "vflip"))} className={`tool-btn ${opts.vflip ? "tool-btn-primary" : "tool-btn-secondary"}`}>
              <FlipHorizontal2 className="h-4 w-4 rotate-90" />{L("Flip V", "垂直镜像")}
            </button>
            <button onClick={() => setOpts(setOptts(opts, "rotate"))} className={`tool-btn ${opts.rotate ? "tool-btn-primary" : "tool-btn-secondary"}`}>
              <RotateCcw className="h-4 w-4" />{L(`Rotate ${opts.rotate ? opts.rotate + "°" : ""}`, `旋转 ${opts.rotate ? opts.rotate + "°" : ""}`).trim()}
            </button>
            <button onClick={() => setOpts(setOptts(opts, "reverse"))} className={`tool-btn ${opts.reverse ? "tool-btn-primary" : "tool-btn-secondary"}`}>
              <Rewind className="h-4 w-4" />{L("Reverse", "倒放")}
            </button>
          </div>

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Processing...", "处理中...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={run} disabled={processing || !hasAny} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlipHorizontal2 className="h-4 w-4" />}
              {L("Apply & export", "应用并导出")}
            </button>
            <button onClick={() => { setFile(null); setResult(null); setOptts({ hflip: false, vflip: false, rotate: 0, reverse: false }); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.size)}</p>
              <video src={result.url} controls className="w-full rounded-lg border max-h-48" />
              <button onClick={() => downloadBlob(result.blob, `transformed-${file.name.replace(/\.[^.]+$/, "")}.mp4`, "video/mp4")} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L("Download MP4", "下载 MP4")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 选项切换辅助 */
function setOptts(opts: Options, key: keyof Options) {
  if (key === "rotate") return { ...opts, rotate: (opts.rotate + 90) % 360 };
  return { ...opts, [key]: !opts[key] };
}
