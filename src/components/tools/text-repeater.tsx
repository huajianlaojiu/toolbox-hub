// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextRepeater() {
  const process = (input: string) => {
    const parts=input.split("|"); const text=parts[0]||input; const count=parseInt(parts[1],10)||3; return Array(Math.min(count,100)).fill(text).join(" ");
  };
  return <SimpleTool label="Input" placeholder="Hello | 5" hint="Text, then repeat count, separated by a vertical bar." process={process} />;
}
