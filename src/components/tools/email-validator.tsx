// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function EmailValidator() {
  const process = (input: string) => {
    const re=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; const emails=input.split(/[,\n\s]+/).filter(Boolean); return emails.map(e=>e+": "+(re.test(e)?"VALID":"INVALID")).join("\n");
  };
  return <SimpleTool label="Input" placeholder="name@example.com" hint="Separate several addresses with commas, spaces or new lines." process={process} />;
}
