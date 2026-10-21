// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";
export default function JsonValidator() {
  const process = (input: string) => {
    try {
      const v = JSON.parse(input);
      const kind = Array.isArray(v) ? "Array with " + v.length + " items" : typeof v === "object" ? "Object with " + Object.keys(v).length + " keys" : typeof v;
      const size = (new TextEncoder().encode(input)).length;
      return "Valid JSON\nType: " + kind + "\nSize: " + (size < 1024 ? size + " B" : (size/1024).toFixed(1) + " KB");
    } catch(e) {
      return "Invalid JSON: " + e.message;
    }
  };
  return <SimpleTool label="JSON" placeholder='{"key": "value"}' hint="Paste a document to check. Valid input reports its type, item or key count and byte size; invalid input reports the parse error." process={process} />;
}