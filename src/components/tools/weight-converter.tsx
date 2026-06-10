// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function WeightConverter() {
  const units = {
    kg: { name: "Kilograms", toBase: (v: number) => v, fromBase: (v: number) => v },
    g: { name: "Grams", toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
    mg: { name: "Milligrams", toBase: (v: number) => v / 1e6, fromBase: (v: number) => v * 1e6 },
    ton: { name: "Metric Tons", toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
    lb: { name: "Pounds", toBase: (v: number) => v * 0.453592, fromBase: (v: number) => v / 0.453592 },
    oz: { name: "Ounces", toBase: (v: number) => v * 0.0283495, fromBase: (v: number) => v / 0.0283495 },
    stone: { name: "Stone", toBase: (v: number) => v * 6.35029, fromBase: (v: number) => v / 6.35029 },
  };
  return <UnitConverter units={units} defaultFrom="kg" defaultTo="lb" />;
}