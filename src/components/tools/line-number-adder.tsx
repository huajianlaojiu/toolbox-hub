// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function LineNumberAdder() {
  const process = (input: string) => {
    return input.split("\n").map((l,i)=>(i+1)+". "+l).join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
