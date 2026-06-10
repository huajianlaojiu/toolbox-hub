// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DaysUntil() {
  const process = (input: string) => {
    const target=new Date(input); if(isNaN(target.getTime())) return "Enter a target date (YYYY-MM-DD)"; const now=new Date(); const diff=Number(target)-Number(now); const days=Math.ceil(diff/86400000); return days>0?days+" days until "+input+"\n("+(days/7).toFixed(1)+" weeks)":days===0?"Today is the day!":Math.abs(days)+" days since "+input;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
