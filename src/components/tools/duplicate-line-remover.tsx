// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DuplicateLineRemover() {
  const process = (input: string) => {
    return [...new Set(input.split("\n"))].join("\n");
  };
  return <SimpleTool label="List" placeholder={"apple\nbanana\napple"} hint="One item per line. Duplicates are dropped and the first occurrence keeps its position." process={process} />;
}
