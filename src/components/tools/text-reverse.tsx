// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextReverse() {
  const process = (input: string) => {
    return input.split("").reverse().join("");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
