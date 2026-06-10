// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function JsonToCsv() {
  const process = (input: string) => {
    try { const d=JSON.parse(input); if(!Array.isArray(d)) return "Expected JSON array"; const keys=Object.keys(d[0]||{}); return [keys.join(","), ...d.map(r=>keys.map(k=>JSON.stringify(r[k]??"")).join(","))].join("\n"); } catch(e) { return "Invalid JSON"; }
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
