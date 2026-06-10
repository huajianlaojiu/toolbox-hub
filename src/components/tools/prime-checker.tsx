// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function PrimeChecker() {
  const process = (input: string) => {
    const n=parseInt(input,10); if(!n||n<2) return "Enter a number >= 2"; for(let i=2;i<=Math.sqrt(n);i++){if(n%i===0) return n+" is NOT prime (divisible by "+i+")";} return n+" IS prime!";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
