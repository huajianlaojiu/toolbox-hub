// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function RandomNumber() {
  const process = (input: string) => {
    const parts=input.split(","); const min=parseInt(parts[0],10)||1; const max=parseInt(parts[1],10)||(min===1?100:min+10); return String(Math.floor(Math.random()*(max-min+1))+min);
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
