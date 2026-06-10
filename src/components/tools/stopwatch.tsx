// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function Stopwatch() {
  const process = (input: string) => {
    return "Online Stopwatch\n\n00:00:00\n\n[Interactive stopwatch - future feature]\nUse your device clock for now: "+new Date().toLocaleTimeString();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
