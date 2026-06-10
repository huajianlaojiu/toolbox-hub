// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function JsMinifier() {
  const process = (input: string) => {
    let o = input;
    o = o.replace(/\/\*[\s\S]*?\*\//g, "");
    o = o.replace(/\/\/.*/g, "");
    o = o.replace(/\n\s+/g, "\n");
    return o.trim();
  };
  return <SimpleTool label="Input" placeholder="Paste JavaScript..." process={process} />;
}