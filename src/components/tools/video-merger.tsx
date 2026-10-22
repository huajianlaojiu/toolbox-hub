"use client";
import { useState } from "react";
import { Upload, Download, Loader2, Combine, X, RotateCcw } from "lucide-react";
import { loadFFmpeg, downloadBlob, formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

export default function VideoMerger() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const vids = Array.from(list).filter((f) => f.type.startsWith("video/"));
    setFiles((prev) => [...prev, ...vids].slice(0, 10));
    setResult(null);
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...files];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setFiles(next);
  };

  const merge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setResult(null);
    setStatus(L("Loading engine...", "正在加载转码引擎…"));
    try {
      const { ffmpeg, fetchFile } = await loadFFmpeg();
      const names = files.map((_, i) => `in${i}.mp4`);
      for (let i = 0; i < files.length; i++) {
        setStatus(L(`Reading ${i + 1}/${files.length}...`, `正在读取第 ${i + 1}/${files.length} 个视频…`));
        await ffmpeg.writeFile(names[i], await fetchFile(files[i]));
      }

      let filter = "";
      for (let i = 0; i < files.length; i++) filter += `[${i}:v][${i}:a]`;
      filter += `concat=n=${files.length}:v=1:a=1[outv][outa]`;

      const args: string[] = [];
      for (const n of names) args.push("-i", n);
      args.push(
        "-filter_complex", filter,
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac",
        "-y", "merged.mp4",
      );

      setStatus(L("Merging...", "正在合并…"));
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile("merged.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      setResult({ blob, size: blob.size });

      for (const n of names) await ffmpeg.deleteFile(n).catch(() => {});
      await ffmpeg.deleteFile("merged.mp4").catch(() => {});
    } catch (e: any) {
      alert(L("Merge failed. Videos must share the same resolution/codec: ", "合并失败，请确认各视频分辨率与编码一致：") + (e?.message || e));
    } finally {
      setProcessing(false);
      setStatus("");
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{L("Add videos (2-10, same resolution recommended)", "添加视频（2~10 个，建议分辨率一致）")}</p>
        <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="text-sm font-m text-muted-foreground w-6 text-center">{i + 1}</span>
              <span className="text-sm truncate flex-1">{f.name}</span>
              <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 px-1">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 px-1">↓</button>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {processing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />{status}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={merge} disabled={processing || files.length < 2} className="tool-btn tool-btn-primary">
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Combine className="h-4 w-4" />}
          {L(`Merge ${files.length} videos`, `合并 ${files.length} 个视频`)}
        </button>
        <button onClick={() => { setFiles([]); setResult(null); }} className="tool-btn tool-btn-secondary">
          <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.size)}</p>
          <button onClick={() => downloadBlob(result.blob, "merged.mp4", "video/mp4")} className="tool-btn tool-btn-primary">
            <Download className="h-4 w-4" />{L("Download merged MP4", "下载合并后的 MP4")}
          </button>
        </div>
      )}
    </div>
  );
}
