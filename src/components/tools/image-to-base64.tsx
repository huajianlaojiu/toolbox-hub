// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function ImageToBase64() {
  const process = (input: string) => {
    return "Upload an image to convert to Base64. Future feature.";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
