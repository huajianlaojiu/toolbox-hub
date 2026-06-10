// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function ScientificNotation() {
  const process = (input: string) => {
    const n=parseFloat(input); return isNaN(n)?"Invalid number":n.toExponential(6)+"\n\nStandard: "+n.toLocaleString("fullwide",{useGrouping:false});
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
