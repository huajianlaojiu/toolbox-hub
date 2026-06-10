// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function RegexTester() {
  const process = (input: string) => {
    try { new RegExp(input,"g"); return "Regex is valid. Enter text to test against this pattern (future feature)."; } catch(e) { return "Invalid regex: "+e.message; }
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
