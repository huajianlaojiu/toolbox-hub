// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function JwtDecoder() {
  const process = (input: string) => {
    try { const p=input.split("."); if(p.length!==3) return "Invalid JWT"; const d=(s)=>{ try{ return JSON.stringify(JSON.parse(Buffer.from(s,"base64url").toString()),null,2); }catch{return Buffer.from(s,"base64url").toString();} }; return "Header:\n"+d(p[0])+"\n\nPayload:\n"+d(p[1])+"\n\nSignature:\n"+p[2]; } catch(e) { return "Invalid JWT"; }
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
