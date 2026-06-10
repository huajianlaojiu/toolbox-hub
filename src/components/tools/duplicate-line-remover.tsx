// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DuplicateLineRemover() {
  const process = (input: string) => {
    return [...new Set(input.split("\n"))].join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
