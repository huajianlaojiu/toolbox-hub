// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function LengthConverter() {
  const m = 1;
  const units = {
    meter: { name: "Meters", toBase: (v: number) => v, fromBase: (v: number) => v },
    km: { name: "Kilometers", toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
    cm: { name: "Centimeters", toBase: (v: number) => v / 100, fromBase: (v: number) => v * 100 },
    mm: { name: "Millimeters", toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
    mile: { name: "Miles", toBase: (v: number) => v * 1609.344, fromBase: (v: number) => v / 1609.344 },
    yard: { name: "Yards", toBase: (v: number) => v * 0.9144, fromBase: (v: number) => v / 0.9144 },
    foot: { name: "Feet", toBase: (v: number) => v * 0.3048, fromBase: (v: number) => v / 0.3048 },
    inch: { name: "Inches", toBase: (v: number) => v * 0.0254, fromBase: (v: number) => v / 0.0254 },
    nautical_mile: { name: "Nautical Miles", toBase: (v: number) => v * 1852, fromBase: (v: number) => v / 1852 },
  };
  return <UnitConverter units={units} defaultFrom="meter" defaultTo="foot" />;
}