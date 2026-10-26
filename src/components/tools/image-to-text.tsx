"use client";
import { useState } from "react";
import { Upload, Copy, Download, Loader2, Check, X } from "lucide-react";

/** 语言代码遵循 tessdata 命名规范 */
const LANGS = [
  { code: "eng", label: "English" },
  { code: "chi_sim", label: "简体中文 (Chinese Simplified)" },
  { code: "chi_tra", label: "繁體中文 (Chinese Traditional)" },
  { code: "jpn", label: "日本語 (Japanese)" },
  { code: "kor", label: "한국어 (Korean)" },
  { code: "spa", label: "Español (Spanish)" },
  { code: "fra", label: "Français (French)" },
  { code: "deu", label: "Deutsch (German)" },
  { code: "ita", label: "Italiano (Italian)" },
  { code: "por", label: "Português (Portuguese)" },
  { code: "rus", label: "Русский (Russian)" },
  { code: "ara", label: "العربية (Arabic)" },
];

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ImageToText() {
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPendingFile(f);
    setFileName(f.name);
    setText("");
    setPreview(URL.createObjectURL(f));
  };

  const run = async () => {
    if (!pendingFile) return;
    setBusy(true);
    setText("");
    setProgress(0);
    setStatus("Loading OCR engine…");
    const url = URL.createObjectURL(pendingFile);
    try {
      // 动态导入：OCR 引擎体积较大，避免进入首屏 bundle，也不触碰 SSG 阶段
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(lang, 1, {
        logger: (m: { status?: string; progress?: number }) => {
          if (m.status) setStatus(m.status);
          if (typeof m.progress === "number") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(url);
      setText((data?.text ?? "").trim());
      await worker.terminate();
      setStatus("");
    } catch (e: any) {
      setStatus("Error: " + (e?.message || String(e)));
    } finally {
      URL.revokeObjectURL(url);
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* 剪贴板不可用时静默降级 */
    }
  };

  return (
    <div className="space-y-5">
      <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Select an image with text (PNG, JPG, WEBP)
        </p>
        <input type="file" accept="image/*" className="hidden" onChange={pick} />
      </label>

      {preview && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm text-muted-foreground">{fileName}</span>
              <button onClick={() => { setPreview(""); setPendingFile(null); setText(""); setStatus(""); }} className="tool-btn tool-btn-secondary py-1">
                <X className="h-3.5 w-3.5" />Remove
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected image" className="max-h-72 w-full rounded-lg border object-contain" />
            <div className="flex flex-wrap items-center gap-3">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="tool-input w-56">
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <button disabled={busy} onClick={run} className="tool-btn tool-btn-primary">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Extract text
              </button>
            </div>
            {busy && (
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: progress + "%" }} />
                </div>
                <p className="text-xs text-muted-foreground">{status || progress + "%"}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              placeholder="Recognized text will appear here — you can edit it before copying."
              className="tool-input w-full resize-y text-xs leading-relaxed"
            />
            <div className="flex flex-wrap gap-2">
              <button disabled={!text} onClick={copy} className="tool-btn tool-btn-primary">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button disabled={!text} onClick={() => downloadText(text, "extracted-text.txt")} className="tool-btn tool-btn-secondary">
                <Download className="h-4 w-4" />Download .txt
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Powered by Tesseract.js (Apache-2.0). Recognition runs entirely on your device — your image is
        never uploaded. The engine and selected language model download once (a few MB) and are then
        cached by your browser, so later runs work offline.
      </p>
    </div>
  );
}
