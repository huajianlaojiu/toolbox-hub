// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function BoxShadowGenerator() {
  const process = (input: string) => {
    return "box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);\n\nCopy the CSS above.";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
