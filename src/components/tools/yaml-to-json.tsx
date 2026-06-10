// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function YamlToJson() {
  const process = (input: string) => {
    try { const lines=input.split("\n"); const r={}; for(const l of lines){ if(!l.trim()||l.trim().startsWith("#"))continue; const m=l.match(/^(s*)([^:]+):s*(.*)$/); if(m){ r[m[2].trim()]=m[3].trim(); } } return JSON.stringify(r,null,2); } catch(e) { return "Invalid YAML"; }
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
