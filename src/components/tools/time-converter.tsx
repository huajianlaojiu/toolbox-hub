// @ts-nocheck
"use client";
import UnitConverter from "@/components/shared/unit-converter";

export default function TimeConverter() {
  const units = {
    second: { name: "Seconds", toBase: (v: number) => v, fromBase: (v: number) => v },
    minute: { name: "Minutes", toBase: (v: number) => v * 60, fromBase: (v: number) => v / 60 },
    hour: { name: "Hours", toBase: (v: number) => v * 3600, fromBase: (v: number) => v / 3600 },
    day: { name: "Days", toBase: (v: number) => v * 86400, fromBase: (v: number) => v / 86400 },
    week: { name: "Weeks", toBase: (v: number) => v * 604800, fromBase: (v: number) => v / 604800 },
    month: { name: "Months (30d)", toBase: (v: number) => v * 2592000, fromBase: (v: number) => v / 2592000 },
    year: { name: "Years (365d)", toBase: (v: number) => v * 31536000, fromBase: (v: number) => v / 31536000 },
    millisecond: { name: "Milliseconds", toBase: (v: number) => v / 1000, fromBase: (v: number) => v * 1000 },
    microsecond: { name: "Microseconds", toBase: (v: number) => v / 1e6, fromBase: (v: number) => v * 1e6 },
  };
  return <UnitConverter units={units} defaultFrom="hour" defaultTo="minute" />;
}