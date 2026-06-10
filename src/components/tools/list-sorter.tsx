// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function ListSorter() {
  const process = (input: string) => {
    const lines=input.split("\n").filter(Boolean); return "Ascending A-Z:\n"+lines.slice().sort().join("\n")+"\n\nDescending Z-A:\n"+lines.slice().sort((a,b)=>b.localeCompare(a)).join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
