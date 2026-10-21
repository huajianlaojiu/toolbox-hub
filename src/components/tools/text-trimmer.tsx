// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextTrimmer() {
  const process = (input: string) => {
    return input.split("\n").map(l=>l.trim()).join("\n").replace(/\n{3,}/g,"\n\n").trim();
  };
  return <SimpleTool label="Text" placeholder="Paste text with stray spaces or blank lines..." hint="Trims each line, collapses runs of blank lines to one, and trims the ends." process={process} />;
}
