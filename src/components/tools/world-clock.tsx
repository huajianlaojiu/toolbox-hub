// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function WorldClock() {
  const process = (input: string) => {
    const now=new Date(); return "Local: "+now.toLocaleString()+"\nUTC: "+now.toISOString().slice(0,19)+"Z\nNew York: "+(new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"}))).toLocaleString()+"\nLondon: "+(new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/London"}))).toLocaleString()+"\nTokyo: "+(new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Tokyo"}))).toLocaleString();
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
