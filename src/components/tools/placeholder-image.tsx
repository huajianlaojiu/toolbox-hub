// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function PlaceholderImage() {
  const process = (input: string) => {
    return "https://placehold.co/"+(input||"600x400")+"/EEE/999?text=Placeholder";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
