// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function CssMinifier() {
  const process = (input: string) => {
    let o = input;
    o = o.replace(/\/\*[\s\S]*?\*\//g, "");
    o = o.replace(/\s+/g, " ");
    o = o.replace(/;\s*}/g, "}");
    o = o.replace(/\s*{\s*/g, "{");
    o = o.replace(/:\s+/g, ":");
    o = o.replace(/,\s+/g, ",");
    return o.trim();
  };
  return <SimpleTool label="Input" placeholder="Paste CSS..." process={process} />;
}