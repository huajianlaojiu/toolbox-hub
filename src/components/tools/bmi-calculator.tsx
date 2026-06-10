// @ts-nocheck
"use client";
import SimpleTool from "@/components/shared/simple-tool";

export default function BmiCalculator() {
  const process = (input: string) => {
    const parts=input.split(","); const kg=parseFloat(parts[0]); const m=parseFloat(parts[1]); if(isNaN(kg)||isNaN(m)) return "Enter weight(kg),height(m) e.g. 70,1.75"; const bmi=kg/(m*m); let cat="Underweight"; if(bmi>=25) cat="Overweight"; else if(bmi>=18.5) cat="Normal weight"; if(bmi>=30) cat="Obese"; return "BMI: "+bmi.toFixed(1)+"\nCategory: "+cat;
  };
  return <SimpleTool label="Input" placeholder="Enter text..." process={process} />;
}
