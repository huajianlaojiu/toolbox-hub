"use client";
import { useState, useRef, useCallback } from "react";
import { Download } from "lucide-react";
import QRCode from "qrcode";

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [size, setSize] = useState(256);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(async () => {
    if (!text.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await QRCode.toCanvas(canvas, text, { width: size, margin: 2, color: { dark: "#171717", light: "#ffffff" } });
      setQrDataUrl(canvas.toDataURL("image/png"));
    } catch { /* ignore invalid input */ }
  }, [text, size]);

  const download = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">Text or URL</label>
          <input className="tool-input tool-input-sm font-sans" value={text} onChange={(e) => setText(e.target.value)} placeholder="https://example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Size</label>
          <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="tool-input tool-input-sm font-sans w-24">
            <option value={128}>128</option>
            <option value={256}>256</option>
            <option value={512}>512</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={generate} className="tool-btn tool-btn-primary">Generate QR Code</button>
        <button onClick={() => { setText(""); setQrDataUrl(""); }} className="tool-btn tool-btn-secondary">Clear</button>
      </div>
      <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-lg">
        <canvas ref={canvasRef} className="hidden" />
        {qrDataUrl ? (
          <>
            <img src={qrDataUrl} alt="QR Code" className="rounded-lg shadow-sm" style={{ width: size, height: size }} />
            <button onClick={download} className="tool-btn tool-btn-secondary"><Download className="h-4 w-4" />Download PNG</button>
          </>
        ) : (
          <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm">
            {size} x {size} preview
          </div>
        )}
      </div>
    </div>
  );
}