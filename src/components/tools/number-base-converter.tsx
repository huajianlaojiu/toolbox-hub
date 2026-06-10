// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function NumberBaseConverter() {
  const process = (input: string) => {
    const n=parseInt(input,10); if(isNaN(n)) return "Enter a number"; return "Decimal: "+n+"\nBinary: "+n.toString(2)+"\nOctal: "+n.toString(8)+"\nHex: "+n.toString(16).toUpperCase();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
