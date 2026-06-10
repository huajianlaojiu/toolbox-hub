// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TextShadowGenerator() {
  const process = (input: string) => {
    return "text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\n\nCopy the CSS above.";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
