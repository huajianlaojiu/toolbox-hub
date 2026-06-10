// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function SpeedConverter() {
  const units = {
    ms: { name: "m/s", toBase: (v: number) => v, fromBase: (v: number) => v },
    kmh: { name: "km/h", toBase: (v: number) => v / 3.6, fromBase: (v: number) => v * 3.6 },
    mph: { name: "mph", toBase: (v: number) => v * 0.44704, fromBase: (v: number) => v / 0.44704 },
    knot: { name: "Knots", toBase: (v: number) => v * 0.514444, fromBase: (v: number) => v / 0.514444 },
    mach: { name: "Mach", toBase: (v: number) => v * 343, fromBase: (v: number) => v / 343 },
  };
  return <UnitConverter units={units} defaultFrom="kmh" defaultTo="mph" />;
}