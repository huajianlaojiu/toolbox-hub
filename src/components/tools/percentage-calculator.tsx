// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function PercentageCalculator() {
  const process = (input: string) => {
    const parts=input.split(","); const num=parseFloat(parts[0]); const pct=parseFloat(parts[1]); if(isNaN(num)) return "Enter a number to calculate percentage"; if(!isNaN(pct)) return pct+"% of "+num+" = "+(num*pct/100)+"\n"+num+" is "+(100*pct/num).toFixed(2)+"% of "+(pct*num?100*num/pct:0); return "Format: number,percentage (e.g., 200,15)";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
