// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";
export default function UnicodeConverter() {
  const process = (input: string) => {
    try {
      if (/^[\\u0-9a-fA-F\s]+$/.test(input.trim())) {
        return input.replace(/\\u([0-9a-fA-F]{4})/g, (_,h) => String.fromCharCode(parseInt(h,16)));
      }
      return input.split("").map(c => "\\u" + c.charCodeAt(0).toString(16).padStart(4,"0")).join("");
    } catch { return "Conversion error"; }
  };
  return <SimpleTool label="Text or Unicode" placeholder="Hello or \\u0048\\u0065\\u006c\\u006c\\u006f" hint="Input containing \\u escapes is decoded to text. Anything else is encoded into escapes." process={process} />;
}