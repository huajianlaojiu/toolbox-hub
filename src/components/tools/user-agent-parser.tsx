// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function UserAgentParser() {
  const process = (input: string) => {
    return "Your User Agent:\n"+(input||"No input provided. Your browser UA is:\n"+navigator.userAgent);
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
