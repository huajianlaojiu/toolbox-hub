// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextSorter() {
  const process = (input: string) => {
    return input.split("\n").filter(Boolean).sort().join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
