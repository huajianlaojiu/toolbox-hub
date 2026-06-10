// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function TipCalculator() {
  const process = (input: string) => {
    const parts=input.split(","); const bill=parseFloat(parts[0]); const tip=parseFloat(parts[1])||15; const people=parseInt(parts[2],10)||1; if(isNaN(bill)) return "Enter bill amount, tip%, people (e.g., 50,15,2)"; const tipAmt=bill*tip/100; const total=bill+tipAmt; return "Bill: $"+bill.toFixed(2)+"\nTip ("+tip+"%): $"+tipAmt.toFixed(2)+"\nTotal: $"+total.toFixed(2)+"\nPer person ("+people+"): $"+((total/people).toFixed(2));
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
