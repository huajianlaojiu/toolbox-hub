// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function LoanCalculator() {
  const process = (input: string) => {
    const parts=input.split(","); const amt=parseFloat(parts[0]); const rate=parseFloat(parts[1])||5; const yrs=parseInt(parts[2],10)||30; if(isNaN(amt)) return "Enter amount,rate%,years (e.g., 200000,5,30)"; const r=rate/100/12; const n=yrs*12; const pmt=amt*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1); const total=pmt*n; return "Monthly: $"+pmt.toFixed(2)+"\nTotal paid: $"+total.toFixed(2)+"\nInterest: $"+(total-amt).toFixed(2);
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
