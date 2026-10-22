"use client";
import { useState } from "react";
import { Upload, Download, Loader2, Music, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

interface AudioFormat { id: string; label: string; ext: string; mime: string; codec: string }

const FORMATS: AudioFormat[] = [
  { id: "mp3", label: "MP3", ext: "mp3", mime: "audio/mpeg", codec: "libmp3lame" },
  { id: "aac", label: "AAC / M4A", ext: "m4a", mime: "audio/mp4", codec: "aac" },
  { id: "wav", label: "WAV", ext: "wav", mime: "audio/wav", codec: "pcm_s16le" },
  { id: "ogg", label: "OGG", ext: "ogg", mime: "audio/ogg", codec: "libvorbis" },
  { id: "opus", label: "Opus", ext: "opus", mime: "audio/ogg", codec: "libopus" },
  { id: "flac", label: "FLAC", ext: "flac", mime: "audio/flac", codec: "flac" },
];

export default function VideoToAudio() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [format, setFormat] = useState<AudioFormat>(FORMATS[0]);
  const [bitrate, setBitrate] = useState(192);
  const [trimStart, setTrimStart] = useState(0);
  const [trimDuration, setTrimDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; blob: Blob; size: number } | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setResult(null);
    setDuration(0);
    setTrimStart(0);
    setTrimDuration(0);
  };

  const run = async () => {
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
      const outName = `output.${format.ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args: string[] = ["-i", inputName, "-vn"];
      if (trimStart > 0) args.push("-ss", String(trimStart));
      if (trimDuration > 0) args.push("-t", String(trimDuration));
      if (format.codec !== "pcm_s16le" && format.codec !== "flac") {
        args.push("-acodec", format.codec, "-b:a", `${bitrate}k`);
      } else {
        args.push("-acodec", format.codec);
      }
      args.push("-y", outName);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outName);
      const blob = new Blob([data], { type: format.mime });
      setResult({ url: URL.createObjectURL(blob), blob, size: blob.size });
      setProgress(100);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outName);
      ffmpeg.off("progress", onProg);
    } catch (e: any) {
      alert(L("Extraction failed: ", "提取失败：") + (e?.message || e));
    } finally {
      setProcessing(false);
    }
  };

  const lossless = format.codec === "pcm_s16le" || format.codec === "flac";

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
            <Music className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}</span>
          </div>

          <video src={videoUrl} controls className="w-full rounded-lg border max-h-48" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{L("Format:", "格式：")}</span>
            {FORMATS.map((f) => (
              <button key={f.id} onClick={() => setFormat(f)} className={`tool-btn ${format.id === f.id ? "tool-btn-primary" : "tool-btn-secondary"}`}>{f.label}</button>
            ))}
          </div>

          {!lossless && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground whitespace-nowrap">{L("Bitrate:", "码率：")}</span>
              <input type="range" min={64} max={320} step={32} value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} className="w-48" />
              <span className="text-sm font-mono">{bitrate} kbps</span>
            </div>
          )}

          {duration > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-muted-foreground block mb-1">{L("Start (s, 0 = beginning)", "起始秒（0 = 从头）")}</span>
                <input type="number" min={0} max={duration} step={0.1} value={trimStart} onChange={(e) => setTrimStart(Math.max(0, Number(e.target.value)))} className="tool-input" />
              </label>
              <label className="text-sm">
                <span className="text-muted-foreground block mb-1">{L("Length (s, 0 = to end)", "长度秒（0 = 到结尾）")}</span>
                <input type="number" min={0} step={0.1} value={trimDuration} onChange={(e) => setTrimDuration(Math.max(0, Number(e.target.value)))} className="tool-input" />
              </label>
            </div>
          )}

          {processing && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{L("Extracting audio...", "正在提取音频...")} {progress}%</p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={run} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
              {L(`Extract ${format.label}`, `提取 ${format.label}`)}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.size)}</p>
              <audio src={result.url} controls className="w-full" />
              <button onClick={() => downloadBlob(result.blob, `${file.name.replace(/\.[^.]+$/, "")}.${format.ext}`, format.mime)} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L(`Download .${format.ext}`, `下载 .${format.ext}`)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
