// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function CsvToJson() {
  const process = (input: string) => {
    try { const lines=input.trim().split("\n").filter(Boolean); const h=lines[0].split(",").map(s=>s.trim()); const rows=lines.slice(1).map(l=>{ const v=l.split(",").map(s=>s.trim()); const o: Record<string, string> = {}; h.forEach((k,i)=>o[k]=v[i]||""); return o; }); return JSON.stringify(rows,null,2); } catch(e) { return "Invalid CSV"; }
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
