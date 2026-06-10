// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function ContrastChecker() {
  const process = (input: string) => {
    const parts=input.split(","); if(!parts[0]||!parts[1]) return "Enter two hex colors (e.g., #fff,#000)"; return "Colors: "+parts[0]+" + "+parts[1]+"\nCheck contrast manually at webaim.org";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
