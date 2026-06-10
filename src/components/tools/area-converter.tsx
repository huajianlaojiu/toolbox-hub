// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function AreaConverter() {
  const units = {
    sqm: { name: "Square Meters", toBase: (v: number) => v, fromBase: (v: number) => v },
    sqkm: { name: "Square Kilometers", toBase: (v: number) => v * 1e6, fromBase: (v: number) => v / 1e6 },
    sqcm: { name: "Square Centimeters", toBase: (v: number) => v / 10000, fromBase: (v: number) => v * 10000 },
    sqft: { name: "Square Feet", toBase: (v: number) => v * 0.092903, fromBase: (v: number) => v / 0.092903 },
    sqyd: { name: "Square Yards", toBase: (v: number) => v * 0.836127, fromBase: (v: number) => v / 0.836127 },
    acre: { name: "Acres", toBase: (v: number) => v * 4046.86, fromBase: (v: number) => v / 4046.86 },
    hectare: { name: "Hectares", toBase: (v: number) => v * 10000, fromBase: (v: number) => v / 10000 },
    sqinch: { name: "Square Inches", toBase: (v: number) => v * 0.00064516, fromBase: (v: number) => v / 0.00064516 },
  };
  return <UnitConverter units={units} defaultFrom="sqm" defaultTo="sqft" />;
}