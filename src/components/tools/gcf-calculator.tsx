// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function GcfCalculator() {
  const process = (input: string) => {
    const nums=input.split(",").map(Number).filter(n=>!isNaN(n)); if(nums.length<2) return "Enter at least 2 numbers (e.g., 12,18)"; const gc=(a,b)=>b?gc(b,a%b):a; const gcf=nums.reduce(gc); let lcm=nums[0]; for(let i=1;i<nums.length;i++) lcm=lcm*nums[i]/gc(lcm,nums[i]); return "Numbers: "+nums.join(", ")+"\nGCF: "+gcf+"\nLCM: "+lcm;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
