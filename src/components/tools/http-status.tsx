// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function HttpStatus() {
  const process = (input: string) => {
    const codes={"100":"Continue","200":"OK","201":"Created","301":"Moved Permanently","302":"Found","304":"Not Modified","400":"Bad Request","401":"Unauthorized","403":"Forbidden","404":"Not Found","405":"Method Not Allowed","500":"Internal Server Error","502":"Bad Gateway","503":"Service Unavailable"}; const c=input.trim(); return codes[c]?c+": "+codes[c]:"Status code not found. Try: 200, 301, 404, 500";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
