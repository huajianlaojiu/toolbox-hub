// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function LetterCounter() {
  const process = (input: string) => {
    const m={}; const total=input.length; for(const c of input.toLowerCase()){if(/[a-z]/.test(c)){ m[c]=(m[c]||0)+1; }} return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+": "+v+" ("+((v/total*100).toFixed(1))+"%)").join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
