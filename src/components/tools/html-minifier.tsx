// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function HtmlMinifier() {
  const process = (input: string) => {
    let o = input;
    o = o.replace(/<!--[\s\S]*?-->/g, "");
    o = o.replace(/>\s+</g, "><");
    o = o.replace(/\s{2,}/g, " ");
    return o.trim();
  };
  return <SimpleTool label="Input" placeholder="Paste HTML..." process={process} />;
}