"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CopyButton from "@/components/copy-button";

export interface UnitDef {
  name: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface UnitConverterProps {
  units: Record<string, UnitDef>;
  defaultFrom?: string;
  defaultTo?: string;
  precision?: number;
}

export default function UnitConverter({ units, defaultFrom, defaultTo, precision = 6 }: UnitConverterProps) {
  const keys = Object.keys(units);
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState(defaultFrom || keys[0]);
  const [to, setTo] = useState(defaultTo || keys[1] || keys[0]);
  const [result, setResult] = useState("");

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult(""); return; }
    const base = units[from].toBase(v);
    const out = units[to].fromBase(base);
    setResult(out % 1 === 0 ? out.toString() : out.toFixed(precision).replace(/0+$/, "").replace(/\.$/, ""));
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
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="tool-input tool-input-sm font-sans w-28">
            {keys.map((k) => <option key={k} value={k}>{units[k].name}</option>)}
          </select>
        </div>
        <div className="flex items-center pb-2"><ArrowRight className="h-5 w-5 text-muted-foreground" /></div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="tool-input tool-input-sm font-sans w-28">
            {keys.map((k) => <option key={k} value={k}>{units[k].name}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="tool-btn tool-btn-primary">Convert</button>
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">Result</label>
            <CopyButton text={`${result} ${units[to].name}`} />
          </div>
          <div className="tool-result font-mono text-lg font-medium">{value} {units[from].name} = {result} {units[to].name}</div>
        </div>
      )}
    </div>
  );
}