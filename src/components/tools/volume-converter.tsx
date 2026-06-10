// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function VolumeConverter() {
  const units = {
    liter: { name: "Liters", toBase: (v: number) => v, fromBase: (v: number) => v },
    ml: { name: "Milliliters", toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
    cubic_m: { name: "Cubic Meters", toBase: (v: number) => v * 1000, fromBase: (v: number) => v / 1000 },
    gallon_us: { name: "Gallons (US)", toBase: (v: number) => v * 3.78541, fromBase: (v: number) => v / 3.78541 },
    gallon_uk: { name: "Gallons (UK)", toBase: (v: number) => v * 4.54609, fromBase: (v: number) => v / 4.54609 },
    quart: { name: "Quarts", toBase: (v: number) => v * 0.946353, fromBase: (v: number) => v / 0.946353 },
    pint: { name: "Pints", toBase: (v: number) => v * 0.473176, fromBase: (v: number) => v / 0.473176 },
    cup: { name: "Cups", toBase: (v: number) => v * 0.236588, fromBase: (v: number) => v / 0.236588 },
    fl_oz: { name: "Fluid Ounces", toBase: (v: number) => v * 0.0295735, fromBase: (v: number) => v / 0.0295735 },
    tbsp: { name: "Tablespoons", toBase: (v: number) => v * 0.0147868, fromBase: (v: number) => v / 0.0147868 },
  };
  return <UnitConverter units={units} defaultFrom="liter" defaultTo="gallon_us" />;
}