// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function DiscountCalculator() {
  const process = (input: string) => {
    const parts=input.split(","); const price=parseFloat(parts[0]); const discount=parseFloat(parts[1]); if(isNaN(price)) return "Enter price, then discount% (e.g., 100,20)"; const save=price*discount/100; return "Original: $"+price.toFixed(2)+"\nDiscount: "+discount+"%\nYou save: $"+save.toFixed(2)+"\nFinal price: $"+(price-save).toFixed(2);
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
