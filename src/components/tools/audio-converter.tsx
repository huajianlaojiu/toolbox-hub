"use client";
import { useState } from "react";
import { Upload, Download, Loader2, Repeat, FileAudio, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/ffmpeg";
import { useI18n } from "@/lib/i18n";

type OutFormat = "wav" | "mp3" | "m4a" | "ogg";

const FORMATS: { id: OutFormat; label: string; ext: string; mime: string }[] = [
  { id: "wav", label: "WAV", ext: "wav", mime: "audio/wav" },
  { id: "mp3", label: "MP3", ext: "mp3", mime: "audio/mpeg" },
  { id: "m4a", label: "M4A", ext: "m4a", mime: "audio/mp4" },
  { id: "ogg", label: "OGG", ext: "ogg", mime: "audio/ogg" },
];

function floatToInt16(f: Float32Array): Int16Array {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** AudioBuffer → WAV（16bit PCM） */
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

/** AudioBuffer → MP3（lamejs，按需 CDN） */
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

/** AudioBuffer → M4A/OGG（MediaRecorder 实时录制） */
function encodeViaRecorder(buffer: AudioBuffer, mime: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported(mime)) {
      reject(new Error("Browser does not support this format. Use WAV or MP3."));
      return;
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const dest = ctx.createMediaStreamDestination();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(dest);
    const rec = new MediaRecorder(dest.stream, { mimeType: mime });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    rec.onstop = () => { resolve(new Blob(chunks, { type: mime.split(";")[0] })); ctx.close().catch(() => {}); };
    rec.onerror = () => { reject(new Error("Recording failed")); ctx.close().catch(() => {}); };
    rec.start();
    src.start();
    src.onended = () => setTimeout(() => rec.stop(), 150);
  });
}

/** 重采样到目标采样率 */
async function resample(buffer: AudioBuffer, targetRate: number): Promise<AudioBuffer> {
  if (buffer.sampleRate === targetRate) return buffer;
  const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
  const off = new OfflineCtx(buffer.numberOfChannels, Math.ceil(buffer.duration * targetRate), targetRate);
  const src = off.createBufferSource();
  src.buffer = buffer;
  src.connect(off.destination);
  src.start();
  return off.startRendering();
}

export default function AudioConverter() {
  const { lang } = useI18n();
  const L = (en: string, zh: string) => (lang === "zh" ? zh : en);

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutFormat>("mp3");
  const [bitrate, setBitrate] = useState(192);
  const [sampleRate, setSampleRate] = useState(44100);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);

  const run = async () => {
    if (!file) return;
    setProcessing(true);
    setResult(null);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const raw = await file.arrayBuffer();
      let buffer: AudioBuffer = await new AudioCtx().decodeAudioData(raw);
      buffer = await resample(buffer, sampleRate);

      let blob: Blob;
      if (format === "wav") blob = encodeWav(buffer);
      else if (format === "mp3") blob = await encodeMp3(buffer, bitrate);
      else blob = await encodeViaRecorder(buffer, format === "m4a" ? "audio/mp4" : "audio/ogg; codecs=opus");

      setResult({ url: URL.createObjectURL(blob), blob });
    } catch (e: any) {
      alert(L("Conversion failed: ", "转换失败：") + (e?.message || e));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{L("Drop an audio file or click to select (MP3, WAV, OGG, M4A, FLAC...)", "点击或拖拽音频文件（MP3 / WAV / OGG / M4A / FLAC）")}</p>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setResult(null); } }} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileAudio className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{formatBytes(file.size)}</span>
          </div>

          <audio src={URL.createObjectURL(file)} controls className="w-full" />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">{L("Convert to:", "转换为：")}</span>
            {FORMATS.map((f) => (
              <button key={f.id} onClick={() => setFormat(f.id)} className={`tool-btn ${format === f.id ? "tool-btn-primary" : "tool-btn-secondary"}`}>{f.label}</button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{L("Sample rate:", "采样率：")}</span>
              <select value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value))} className="tool-input w-auto">
                {[44100, 48000, 22050, 16000].map((r) => <option key={r} value={r}>{r / 1000} kHz</option>)}
              </select>
            </label>
            {format === "mp3" && (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{L("Bitrate:", "码率：")}</span>
                <select value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} className="tool-input w-auto">
                  {[96, 128, 192, 256, 320].map((b) => <option key={b} value={b}>{b} kbps</option>)}
                </select>
              </label>
            )}
          </div>

          {processing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />{L("Converting in your browser...", "浏览器本地转换中...")}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={run} disabled={processing} className="tool-btn tool-btn-primary">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
              {L("Convert", "开始转换")}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="tool-btn tool-btn-secondary">
              <RotateCcw className="h-4 w-4" />{L("Reset", "重置")}
            </button>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">{L("Done — ", "完成 — ")}{formatBytes(result.blob.size)}</p>
              <audio src={result.url} controls className="w-full" />
              <button onClick={() => {
                const f = FORMATS.find((x) => x.id === format)!;
                const a = document.createElement("a");
                a.href = result.url;
                a.download = `${file!.name.replace(/\.[^.]+$/, "")}.${f.ext}`;
                a.click();
              }} className="tool-btn tool-btn-primary">
                <Download className="h-4 w-4" />{L("Download", "下载")}
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
