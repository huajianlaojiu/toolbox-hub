// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function LoremIpsum() {
  const process = (input: string) => {
    const p=parseInt(input,10)||3; const txt="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."; return Array(Math.min(p,50)).fill(txt).join("\n\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
