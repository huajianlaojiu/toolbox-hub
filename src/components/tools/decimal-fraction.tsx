// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DecimalFraction() {
  const process = (input: string) => {
    const n=parseFloat(input); if(isNaN(n)) return "Enter a decimal"; if(Number.isInteger(n)) return n+" = "+n+"/1"; const d=Math.pow(10,(input.split(".")[1]||"").length); const g=(a,b)=>b?g(b,a%b):a; const gcd=g(Math.round(Math.abs(n*d)),d); return n+" ≈ "+Math.round(Math.abs(n*d))/gcd+"/"+d/gcd;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
