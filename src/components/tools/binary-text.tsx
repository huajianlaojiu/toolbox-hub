// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function BinaryText() {
  const process = (input: string) => {
    try{if(/^[01\s]+$/.test(input.trim()))return input.trim().split(" ").map(b=>String.fromCharCode(parseInt(b,2))).join("");return input.split("").map(c=>c.charCodeAt(0).toString(2).padStart(8,"0")).join(" ");}catch{return "Conversion error";}
  };
  return <SimpleTool label="Input" placeholder="Hello, or 01001000 01100101" hint="Input made only of 0, 1 and spaces is decoded. Anything else is encoded." process={process} />;
}
