// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function TemperatureConverter() {
  const units = {
    celsius: { name: "Celsius", toBase: (v: number) => v, fromBase: (v: number) => v },
    fahrenheit: { name: "Fahrenheit", toBase: (v: number) => (v - 32) * 5/9, fromBase: (v: number) => v * 9/5 + 32 },
    kelvin: { name: "Kelvin", toBase: (v: number) => v - 273.15, fromBase: (v: number) => v + 273.15 },
  };
  return <UnitConverter units={units} defaultFrom="celsius" defaultTo="fahrenheit" />;
}
