"use client";
import { useEffect, useRef, useState } from "react";
import { Upload, Download, Loader2, Scissors, Play, Square, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

function floatToInt16(f: Float32Array): Int16Array {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function encodeWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numCh * 2;
  const view = new DataView(new ArrayBuffer(44 + length));
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, length, true);
  let off = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}

async function encodeMp3(buffer: AudioBuffer, kbps = 192): Promise<Blob> {
  await loadScript("https://unpkg.com/lamejs@1.2.1/lame.min.js");
  const lamejs = (window as any).lamejs;
  const channels = buffer.numberOfChannels;
  const enc = new lamejs.Mp3Encoder(channels, buffer.sampleRate, kbps);
  const blockSize = 1152;
  const left = floatToInt16(buffer.getChannelData(0));
  const right = channels > 1 ? floatToInt16(buffer.getChannelData(1)) : null;
  const parts: Uint8Array[] = [];
  for (let i = 0; i < left.length; i += blockSize) {
    const l = left.subarray(i, i + blockSize);
    const r = right ? right.subarray(i, i + blockSize) : null;
    const chunk = r ? enc.encodeBuffer(l, r) : enc.encodeBuffer(l);
    if (chunk.length > 0) parts.push(new Uint8Array(chunk));
  }
  const end = enc.flush();
  if (end.length > 0) parts.push(new Uint8Array(end));
  return new Blob(parts as BlobPart[], { type: "audio/mpeg" });
}

function trimBuffer(src: AudioBuffer, start: number, end: number): AudioBuffer {
  const sr = src.sampleRate;
  const startS = Math.floor(start * sr);
  const endS = Math.floor(end * sr);
  const len = Math.max(1, endS - startS);
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const out = ctx.createBuffer(src.numberOfChannels, len, sr);
  for (let c = 0; c < src.numberOfChannels; c++) {
    out.copyToChannel(src.getChannelData(c).subarray(startS, endS), c);
  }
  return out;
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${sec.padStart(4, "0")}`;
}

export default function AudioTrimmer() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [outFmt, setOutFmt] = useState<"wav" | "mp3">("mp3");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [playing, setPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleFile = async (f: File) => {
    setFile(f);
    setResult(null);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const buf = await ctx.decodeAudioData(await f.arrayBuffer());
      setBuffer(buf);
      setDuration(buf.duration);
      setStart(0);
      setEnd(buf.duration);
    } catch {
      alert(L("Could not decode this audio file.", "无法解码该音频文件"));
      setFile(null);
    }
  };

  // 波形绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const data = buffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / W));
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() || "#2563eb";
    for (let x = 0; x < W; x++) {
      let min = 1, max = -1;
      for (let i = 0; i < step; i++) {
        const v = data[x * step + i] ?? 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const y1 = ((1 - max) / 2) * H;
      const y2 = ((1 - min) / 2) * H;
      ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
    }
  }, [buffer, result]);

  const preview = () => {
    if (!buffer || playing) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const src = ctx.createBufferSource();
    src.buffer = trimBuffer(buffer, start, end);
    src.connect(ctx.destination);
    src.onended = () => setPlaying(false);
    src.start();
    sourceRef.current = src;
    setPlaying(true);
  };

  const stop = () => {
    sourceRef.current?.stop();
    setPlaying(false);
  };

  const run = async () => {
    if (!buffer || !file) return;
    setProcessing(true);
    setResult(null);
    try {
      const trimmed = trimBuffer(buffer, start, end);
      const blob = outFmt === "wav" ? encodeWav(trimmed) : await encodeMp3(trimmed, 192);
      setResult({ url: URL.createObjectURL(blob), blob });
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
          <p className="text-sm text-muted-foreground">{L("Drop an audio file or click to select", "点击或拖拽音频文件到此处")}</p>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}{duration > 0 && ` · ${duration.toFixed(1)}s`}</span>
          </div>

          <canvas ref={canvasRef} width={800} height={80} className="w-full rounded-lg border bg-card" />

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{L("Start", "开始")}: <b className="text-foreground font-mono">{fmtTime(start)}</b></span>
              <span className="font-mono text-primary">{(end - start).toFixed(1)}s</span>
              <span>{L("End", "结束")}: <b className="text-foreground font-mono">{fmtTime(end)}</b></span>
            </div>
            <input type="range" min={0} max={duration} step={0.05} value={start} onChange={(e) => setStart(Math.min(Number(e.target.value), end - 0.1))} className="w-full" />
            <input type="range" min={0} max={duration} step={0.05} value={end} onChange={(e) => setEnd(Math.max(Number(e.target.value), start + 0.1))} className="w-full" />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={playing ? stop : preview} className="tool-btn tool-btn-secondary">
              {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? L("Stop", "停止") : L("Preview clip", "试听片段")}
            </button>
            <select value={outFmt} onChange={(e) => setOutFmt(e.target.value as any)} className="tool-input w-auto">
              <option value="mp3">MP3 192kbps</option>
              <option value="wav">WAV 无损</option>
            </select>
            <button onClick={run} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              {L("Trim & export", "裁剪并导出")}
            </button>
            <button onClick={() => { stop(); setFile(null); setBuffer(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.blob.size)}</p>
              <audio src={result.url} controls className="w-full" />
              <button onClick={() => {
                const a = document.createElement("a");
                a.href = result.url;
                a.download = `${file!.name.replace(/\.[^.]+$/, "")}-trimmed.${outFmt}`;
                a.click();
              }} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L(`Download .${outFmt.toUpperCase()}`, `下载 .${outFmt.toUpperCase()}`)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
