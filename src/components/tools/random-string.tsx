// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function RandomString() {
  const process = (input: string) => {
    const len=Math.min(parseInt(input,10)||12,1000); const c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; let r=""; for(let i=0;i<len;i++) r+=c[Math.floor(Math.random()*c.length)]; return r;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
