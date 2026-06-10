// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function UrlParser() {
  const process = (input: string) => {
    try{const u=new URL(input); return "Protocol: "+u.protocol+"\nHost: "+u.hostname+"\nPort: "+u.port+"\nPath: "+u.pathname+"\nQuery: "+u.search+"\nHash: "+u.hash;}catch{return "Invalid URL. Include http:// or https://";}
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
