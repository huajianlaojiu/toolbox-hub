// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DateDifference() {
  const process = (input: string) => {
    const parts=input.split(","); const d1=new Date(parts[0]); const d2=new Date(parts[1]); if(isNaN(d1.getTime())||isNaN(d2.getTime())) return "Enter two dates (YYYY-MM-DD,YYYY-MM-DD)"; const diff=Math.abs(Number(d2)-Number(d1)); const days=Math.floor(diff/86400000); const weeks=(days/7).toFixed(1); const months=(days/30.44).toFixed(1); return "Days: "+days+"\nWeeks: "+weeks+"\nMonths: "+months+"\nHours: "+Math.floor(diff/3600000);
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
