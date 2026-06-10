// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function FactorialCalculator() {
  const process = (input: string) => {
    const n=parseInt(input,10); if(!n||n<0) return "Enter a positive integer"; if(n>170) return "Too large (max 170)"; let r=1n; for(let i=2n;i<=BigInt(n);i++)r*=i; return n+"! = "+r.toString();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
