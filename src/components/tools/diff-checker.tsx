// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DiffChecker() {
  const process = (input: string) => {
    const parts=input.split("---"); if(parts.length<2) return "Enter two texts separated by --- on its own line"; const a=parts[0].trim().split("\n"); const b=parts[1].trim().split("\n"); const r=[]; for(let i=0;i<Math.max(a.length,b.length);i++){ const l=a[i]||""; const rl=b[i]||""; if(l!==rl) r.push((i+1)+": - "+l+"\n"+(i+1)+": + "+rl); } return r.length?r.join("\n\n"):"Texts are identical!";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
