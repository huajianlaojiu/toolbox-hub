// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function XmlFormatter() {
  const process = (input: string) => {
    let x = input.replace(/>\s*</g, "><").trim();
    let indent = 0;
    let out = "";
    const tokens = x.match(/<\/?[^>]+>|[^<]+/g) || [];
    for (const s of tokens) {
      if (s.startsWith("</")) indent -= 2;
      out += "  ".repeat(Math.max(0, indent)) + s + "\n";
      if (s.startsWith("<") && !s.startsWith("</") && !s.endsWith("/>")) indent += 2;
    }
    return out.trim();
  };
  return <SimpleTool label="XML" placeholder='<root><item id="1">One</item></root>' hint="Re-indents tags with two spaces per level. It does not validate against a schema." process={process} />;
}