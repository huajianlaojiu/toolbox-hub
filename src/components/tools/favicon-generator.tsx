// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import { Upload, Download } from "lucide-react";
export default function FaviconGenerator() {
  const [img, setImg] = useState<string|null>(null);
  const [result, setResult] = useState<string|null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handle = (f: File) => {
    const u = URL.createObjectURL(f);
    const i = new Image(); i.onload = () => {
      setImg(u); const c = canvasRef.current; if(!c) return;
      const s = Math.min(i.width,i.height); c.width=64;c.height=64;
      const x = (i.width-s)/2, y = (i.height-s)/2;
      c.getContext("2d")!.drawImage(i,x,y,s,s,0,0,64,64);
      setResult(c.toDataURL("image/x-icon"));
    }; i.src = u;
  };
  const dl = () => { if(!result)return; const a=document.createElement("a"); a.href=result; a.download="favicon.ico"; a.click(); };
  return (
    <div className="space-y-4">
      {!img?(
        <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary"><Upload className="h-8 w-8 text-muted-foreground"/><p className="text-sm text-muted-foreground">Upload an image to generate 64x64 favicon.ico</p><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handle(f)}} className="hidden"/></label>
      ):(
        <div className="space-y-4">
          <div className="flex gap-4 items-start"><img src={img} className="max-h-48 rounded border"/><div className="text-center"><img src={result!} className="w-16 h-16 rounded border mx-auto"/><p className="text-xs text-muted-foreground mt-1">64x64 ICO</p></div></div>
          <button onClick={dl} className="tool-btn tool-btn-primary"><Download className="h-4 w-4"/>Download favicon.ico</button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"/>
    </div>
  );
}