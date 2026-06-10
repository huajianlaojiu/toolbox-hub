// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function IpLookup() {
  const process = (input: string) => {
    return "Your IP info: Use an API service.\n\nBrowser reports:\nUser Agent: "+navigator.userAgent+"\nLanguage: "+navigator.language+"\nPlatform: "+navigator.platform;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
