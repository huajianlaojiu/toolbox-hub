// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function CaesarCipher() {
  const process = (input: string) => {
    const parts=input.split("|"); const text=parts[0]||input; const shift=parseInt(parts[1],10)||3; let r=""; for(const c of text){if(/[a-z]/.test(c))r+=String.fromCharCode((c.charCodeAt(0)-97+shift)%26+97);else if(/[A-Z]/.test(c))r+=String.fromCharCode((c.charCodeAt(0)-65+shift)%26+65);else r+=c;} return "Shift "+shift+":\n"+r;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
