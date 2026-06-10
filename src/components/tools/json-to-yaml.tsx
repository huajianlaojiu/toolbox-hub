// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function JsonToYaml() {
  const process = (input: string) => {
    try { const o=JSON.parse(input); const y=(function yml(v,d) { if(v===null)return"null"; if(typeof v!=="object")return String(v); if(Array.isArray(v)) return v.map(i=>"  ".repeat(d)+"- "+yml(i,d+1)).join("\n"); return Object.entries(v).map(([k,v])=>"  ".repeat(d)+k+": "+(typeof v==="object"?"\n":"")+yml(v,d+1)).join("\n"); })(o,0); return y; } catch(e) { return "Invalid JSON"; }
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
