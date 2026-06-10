// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function HexText() {
  const process = (input: string) => {
    try{if(/^[0-9a-fA-F\s]+$/.test(input.trim()))return input.trim().split(" ").map(h=>String.fromCharCode(parseInt(h,16))).join("");return input.split("").map(c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ");}catch{return "Conversion error";}
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
