// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function BorderRadiusGenerator() {
  const process = (input: string) => {
    return "border-radius: 12px;\n\nCopy the CSS above.";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
