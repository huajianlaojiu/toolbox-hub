// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function GradientGenerator() {
  const process = (input: string) => {
    return "CSS Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n\nCopy the CSS above.";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
