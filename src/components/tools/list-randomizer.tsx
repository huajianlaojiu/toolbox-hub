// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function ListRandomizer() {
  const process = (input: string) => {
    const a=input.split("\n").filter(Boolean); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a.join("\n");
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
