"use client";
import { useState, useRef } from "react";
import { Image, Upload, Download } from "lucide-react";

export default function ImageCompressor() {
  const [original, setOriginal] = useState<{ file: File; url: string } | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [sizes, setSizes] = useState({ orig: 0, comp: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setOriginal({ file, url });
    setCompressed(null);
    setSizes({ orig: file.size, comp: 0 });
  };

  const compress = () => {
    if (!original) return;
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          setCompressed(URL.createObjectURL(blob));
          setSizes((s) => ({ ...s, comp: blob.size }));
        },
        "image/jpeg",
        quality / 100
      );
    };
    img.src = original.url;
  };

  const download = () => {
    if (!compressed) return;
    const a = document.createElement("a");
    a.href = compressed;
    a.download = "compressed.jpg";
    a.click();
  };

  return (
    <div className="space-y-4">
      {!original ? (
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drop an image or click to select (JPG, PNG, WebP)</p>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground">Quality:</span>
            <input type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-40" />
            <span className="text-sm font-mono font-medium">{quality}%</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Original — {formatSize(sizes.orig)}</p>
              <img src={original.url} alt="Original" className="w-full rounded-lg border object-contain max-h-64" />
            </div>
            {compressed ? (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Compressed — {formatSize(sizes.comp)} ({(100 - (sizes.comp / sizes.orig) * 100).toFixed(0)}% smaller)
                </p>
                <img src={compressed} alt="Compressed" className="w-full rounded-lg border object-contain max-h-64" />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed h-64 text-muted-foreground text-sm">
                Click compress to preview
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={compress} className="tool-btn tool-btn-primary"><Image className="h-4 w-4" />Compress</button>
            {compressed && <button onClick={download} className="tool-btn tool-btn-secondary"><Download className="h-4 w-4" />Download</button>}
            <button onClick={() => { setOriginal(null); setCompressed(null); }} className="tool-btn tool-btn-secondary">Reset</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}