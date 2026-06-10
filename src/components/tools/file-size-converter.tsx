"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

const units = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

export default function FileSizeConverter() {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("MB");
  const [to, setTo] = useState("GB");
  const [result, setResult] = useState("");

  const convert = () => {
    const bytes = parseFloat(value) * Math.pow(1024, units.indexOf(from));
    const out = bytes / Math.pow(1024, units.indexOf(to));
    setResult(out % 1 === 0 ? out.toString() : out.toFixed(6).replace(/0+$/, "").replace(/\.$/, ""));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Value</label>
          <input className="tool-input tool-input-sm font-mono w-32" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="tool-input tool-input-sm font-sans w-24">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div><span className="block mb-2">&nbsp;</span><ArrowRight className="h-5 w-5 text-muted-foreground" /></div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="tool-input tool-input-sm font-sans w-24">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="tool-btn tool-btn-primary">Convert</button>
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            <CopyButton text={`${result} ${to}`} />
          </div>
          <div className="tool-result font-mono text-lg font-medium">{result} {to}</div>
        </div>
      )}
    </div>
  );
}