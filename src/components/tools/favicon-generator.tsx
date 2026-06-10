// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function FaviconGenerator() {
  const process = (input: string) => {
    return "Upload an image to generate a favicon. Future feature.";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
