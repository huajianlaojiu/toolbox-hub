"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { Upload, Loader2, Merge, Scissors, Image as ImageIcon, Type, FileDown } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

// pdf.js 仅在浏览器端按需加载，避免 SSR 预渲染时在 Node 环境中求值（其依赖 Node 22+ 全局 Iterator）
async function loadPdfjs() {
  const mod = await import("pdfjs-dist");
  mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return mod;
}

type Mode = "merge" | "split" | "img2pdf" | "pdf2img" | "pdf2text";

function fmtBytes(n: number): string {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(2) + " MB";
}

function parsePages(spec: string, total: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(/[,\s]+/).filter(Boolean)) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((x) => parseInt(x, 10));
      if (!isNaN(a) && !isNaN(b)) for (let i = Math.max(1, a); i <= Math.min(total, b); i++) out.add(i);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= total) out.add(n);
    }
  }
  return [...out].sort((x, y) => x - y);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

const MODES: { id: Mode; label: string; icon: ReactNode }[] = [
  { id: "merge", label: "Merge", icon: <Merge className="h-4 w-4" /> },
  { id: "split", label: "Split", icon: <Scissors className="h-4 w-4" /> },
  { id: "img2pdf", label: "Images → PDF", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "pdf2img", label: "PDF → Images", icon: <FileDown className="h-4 w-4" /> },
  { id: "pdf2text", label: "PDF → Text", icon: <Type className="h-4 w-4" /> },
];

export default function PdfToolkit() {
  const [mode, setMode] = useState<Mode>("merge");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [text, setText] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg("");
    try {
      await fn();
    } catch (e: any) {
      setMsg("Error: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const merge = (files: File[]) =>
    run(async () => {
      if (files.length < 2) return setMsg("Select at least two PDF files.");
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "merged.pdf");
      setMsg(`Merged ${files.length} files → merged.pdf (${fmtBytes(bytes.length)})`);
    });

  const split = (file: File, spec: string, allSeparate: boolean) =>
    run(async () => {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const total = src.getPageCount();
      if (allSeparate) {
        const zip = new JSZip();
        for (let i = 1; i <= total; i++) {
          const d = await PDFDocument.create();
          const [p] = await d.copyPages(src, [i - 1]);
          d.addPage(p);
          zip.file(`page-${i}.pdf`, await d.save());
        }
        downloadBlob(await zip.generateAsync({ type: "blob" }), "split-pages.zip");
        setMsg(`Split into ${total} separate pages.`);
      } else {
        const idx = parsePages(spec, total).map((n) => n - 1);
        if (idx.length === 0) return setMsg("No valid pages selected.");
        const d = await PDFDocument.create();
        const ps = await d.copyPages(src, idx);
        ps.forEach((p) => d.addPage(p));
        const bytes = await d.save();
        downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "split.pdf");
        setMsg(`Extracted ${idx.length} page(s) → split.pdf`);
      }
    });

  const img2pdf = (files: File[], maxW: number) =>
    run(async () => {
      if (files.length === 0) return setMsg("Select image files.");
      const doc = await PDFDocument.create();
      for (const f of files) {
        const bytes = await f.arrayBuffer();
        let img;
        if (f.type === "image/png") img = await doc.embedPng(bytes);
        else img = await doc.embedJpg(bytes);
        let { width, height } = img;
        if (maxW > 0 && width > maxW) {
          height = (height * maxW) / width;
          width = maxW;
        }
        const page = doc.addPage([width, height]);
        page.drawImage(img, { x: 0, y: 0, width, height });
      }
      const out = await doc.save();
      downloadBlob(new Blob([new Uint8Array(out)], { type: "application/pdf" }), "images.pdf");
      setMsg(`Combined ${files.length} image(s) → images.pdf (${fmtBytes(out.length)})`);
    });

  const pdf2img = (file: File, scale: number) =>
    run(async () => {
      const pdfjsLib = await loadPdfjs();
      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      const zip = new JSZip();
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        await page.render({ canvas, viewport: vp }).promise;
        const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
        zip.file(`page-${i}.png`, blob);
      }
      downloadBlob(await zip.generateAsync({ type: "blob" }), "pdf-pages.zip");
      setMsg(`Rendered ${doc.numPages} page(s) to PNG → pdf-pages.zip`);
    });

  const pdf2text = (file: File) =>
    run(async () => {
      const pdfjsLib = await loadPdfjs();
      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      let full = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const tc = await page.getTextContent();
        full += tc.items.map((it: any) => it.str).join(" ") + "\n\n";
      }
      setText(full);
      downloadBlob(new Blob([full], { type: "text/plain;charset=utf-8" }), "extracted.txt");
      setMsg(`Extracted text from ${doc.numPages} page(s).`);
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`tool-btn ${mode === m.id ? "tool-btn-primary" : "tool-btn-secondary"}`}>
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      {mode === "merge" && <MergePanel busy={busy} onRun={merge} />}
      {mode === "split" && <SplitPanel busy={busy} onRun={split} />}
      {mode === "img2pdf" && <Img2PdfPanel busy={busy} onRun={img2pdf} />}
      {mode === "pdf2img" && <Pdf2ImgPanel busy={busy} onRun={pdf2img} />}
      {mode === "pdf2text" && <Pdf2TextPanel busy={busy} onRun={pdf2text} />}

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      {mode === "pdf2text" && text && (
        <textarea readOnly value={text} className="tool-input w-full h-64" />
      )}
    </div>
  );
}

/* ── 子面板 ── */
function FileDrop({ accept, multiple, onFiles, label }: { accept: string; multiple: boolean; onFiles: (f: File[]) => void; label: string }) {
  const [names, setNames] = useState<string[]>([]);
  return (
    <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">{label}</p>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const fs = Array.from(e.target.files || []);
          setNames(fs.map((f) => f.name));
          onFiles(fs);
        }}
      />
      {names.length > 0 && <p className="text-xs text-muted-foreground truncate max-w-full">{names.join(", ")}</p>}
    </label>
  );
}

function MergePanel({ busy, onRun }: { busy: boolean; onRun: (f: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="space-y-3">
      <FileDrop accept="application/pdf" multiple label="Select two or more PDF files to merge" onFiles={setFiles} />
      <button disabled={busy} onClick={() => onRun(files)} className="tool-btn tool-btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Merge className="h-4 w-4" />}Merge {files.length} PDFs
      </button>
    </div>
  );
}

function SplitPanel({ busy, onRun }: { busy: boolean; onRun: (f: File, spec: string, all: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [spec, setSpec] = useState("1-3");
  const [all, setAll] = useState(false);
  return (
    <div className="space-y-3">
      <FileDrop accept="application/pdf" multiple={false} label="Select a PDF to split" onFiles={(f) => setFile(f[0] || null)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Split every page into a separate file
      </label>
      {!all && (
        <div>
          <label className="text-xs text-muted-foreground">Page range (e.g. 1-3, 5, 8-10)</label>
          <input value={spec} onChange={(e) => setSpec(e.target.value)} className="tool-input w-full" />
        </div>
      )}
      <button disabled={busy || !file} onClick={() => file && onRun(file, spec, all)} className="tool-btn tool-btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}Split PDF
      </button>
    </div>
  );
}

function Img2PdfPanel({ busy, onRun }: { busy: boolean; onRun: (f: File[], maxW: number) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [maxW, setMaxW] = useState(1600);
  return (
    <div className="space-y-3">
      <FileDrop accept="image/*" multiple label="Select images to combine into a PDF" onFiles={setFiles} />
      <div>
        <label className="text-xs text-muted-foreground">Max width (px, for compression; 0 = original)</label>
        <input type="number" value={maxW} onChange={(e) => setMaxW(+e.target.value)} className="tool-input w-full" />
      </div>
      <button disabled={busy} onClick={() => onRun(files, maxW)} className="tool-btn tool-btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}Build PDF from {files.length} image(s)
      </button>
    </div>
  );
}

function Pdf2ImgPanel({ busy, onRun }: { busy: boolean; onRun: (f: File, scale: number) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  return (
    <div className="space-y-3">
      <FileDrop accept="application/pdf" multiple={false} label="Select a PDF to render to images" onFiles={(f) => setFile(f[0] || null)} />
      <div>
        <label className="text-xs text-muted-foreground">Resolution scale: {scale}x</label>
        <input type="range" min={1} max={3} step={0.5} value={scale} onChange={(e) => setScale(+e.target.value)} className="w-full" />
      </div>
      <button disabled={busy || !file} onClick={() => file && onRun(file, scale)} className="tool-btn tool-btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}Render pages to PNG (ZIP)
      </button>
    </div>
  );
}

function Pdf2TextPanel({ busy, onRun }: { busy: boolean; onRun: (f: File) => void }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="space-y-3">
      <FileDrop accept="application/pdf" multiple={false} label="Select a PDF to extract text from" onFiles={(f) => setFile(f[0] || null)} />
      <button disabled={busy || !file} onClick={() => file && onRun(file)} className="tool-btn tool-btn-primary">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Type className="h-4 w-4" />}Extract text
      </button>
    </div>
  );
}
