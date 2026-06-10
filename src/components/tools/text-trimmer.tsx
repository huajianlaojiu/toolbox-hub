// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextTrimmer() {
  const process = (input: string) => {
    return input.split("\n").map(l=>l.trim()).join("\n").replace(/\n{3,}/g,"\n\n").trim();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
