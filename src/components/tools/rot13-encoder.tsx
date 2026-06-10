// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function Rot13Encoder() {
  const process = (input: string) => {
    let r=""; for(const c of input){if(/[a-z]/.test(c))r+=String.fromCharCode((c.charCodeAt(0)-97+13)%26+97);else if(/[A-Z]/.test(c))r+=String.fromCharCode((c.charCodeAt(0)-65+13)%26+65);else r+=c;} return r;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
