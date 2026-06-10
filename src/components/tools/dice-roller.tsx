// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DiceRoller() {
  const process = (input: string) => {
    const n=parseInt(input,10)||1; let r=[]; for(let i=0;i<Math.min(n,100);i++) r.push(Math.floor(Math.random()*6)+1); return r.join(", ")+(n>1?"\nTotal: "+r.reduce((a,b)=>a+b,0):"");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
