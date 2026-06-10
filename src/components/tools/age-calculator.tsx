// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function AgeCalculator() {
  const process = (input: string) => {
    const birth=new Date(input); if(isNaN(birth.getTime())) return "Enter your birth date (YYYY-MM-DD)"; const now=new Date(); let years=now.getFullYear()-birth.getFullYear(); const m=now.getMonth()-birth.getMonth(); if(m<0||(m===0&&now.getDate()<birth.getDate())) years--; const days=Math.floor((Number(now.getTime())-Number(birth.getTime()))/86400000); return "Age: "+years+" years\nTotal days: "+days+" days\nNext birthday: "+Math.ceil(365-((Number(now.getTime())-Number(birth.getTime()))%31536000000/86400000))+" days away";
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
