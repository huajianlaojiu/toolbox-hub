// @ts-nocheck
"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import CopyButton from "@/components/copy-button";
export default function ImageToBase64() {
  const [result, setResult] = useState("");
  const handle = (f: File) => {
    const r = new FileReader();
    r.onload = () => setResult(r.result as string);
    r.readAsDataURL(f);
  };
  return (
    <div className="space-y-4">
      <label className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 cursor-pointer hover:border-primary"><Upload className="h-8 w-8 text-muted-foreground"/><p className="text-sm text-muted-foreground">Upload an image to convert to Base64</p><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)handle(f)}} className="hidden"/></label>
      {result && <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Base64 String ({result.length} chars)</label><CopyButton text={result}/></div><textarea className="tool-input font-mono text-xs" value={result} readOnly rows={6}/></div>}
    </div>
  );
}